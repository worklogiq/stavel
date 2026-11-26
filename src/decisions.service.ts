import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { AnswerRecord, AnswersDocument, Inspection, Question, QuestionsResult, Track } from './framework.types.js';
import { contained, digest, fileBytes, readJson, Refused, targetRoot, walkFiles } from './filesystem.service.js';
import { locateDistribution } from './distribution.service.js';

export function loadManifest(root: string): Record<string, unknown> | null {
  const previousNames = ['.constitutional-dev.json', 'constitutional-dev.config.json', '.constitutional-dev', 'constitutional-dev-agents.policy.md', 'AGENTS.constitutional-dev.md'];
  for (const name of previousNames) if (fs.existsSync(contained(root, name))) throw new Refused(`Constitutional Dev installation detected: ${name}. Stavel is a clean restart; use a separate target or explicitly retire the old installation after preserving its files. Automatic legacy migration is not supported.`);
  if (!fs.existsSync(contained(root, '.stavel.json'))) return null;
  const value = readJson<Record<string, unknown>>(contained(root, '.stavel.json'));
  if (!value || Array.isArray(value) || value.format !== 2 || value.product !== 'stavel') throw new Refused('unsupported Stavel manifest; expected product "stavel" and format 2. Legacy installations are not supported.');
  if (typeof value.framework_path !== 'string' || !['greenfield', 'existing', 'research'].includes(String(value.track))) throw new Refused('manifest needs a relative framework_path and a valid track');
  contained(root, value.framework_path);
  if (typeof value.entrypoint !== 'string' || !['AGENTS.md', 'stavel-agents.policy.md'].includes(value.entrypoint)) throw new Refused('manifest has an unsupported entrypoint');
  if (!value.files || typeof value.files !== 'object' || Array.isArray(value.files)) throw new Refused('manifest files must map relative filenames to SHA-256 digests');
  for (const [name, hash] of Object.entries(value.files)) {
    contained(root, name);
    if (typeof hash !== 'string' || !/^[0-9a-f]{64}$/.test(hash)) throw new Refused(`manifest has an invalid digest: ${name}`);
  }
  return value;
}

export function inspectRepository(options: { root: string; track?: Track }): Inspection {
  const root = targetRoot(options.root);
  const manifest = loadManifest(root);
  const names = walkFiles(root);
  const files = names.map(name => { const bytes = fileBytes(root, name)!; return { path: name, hash: digest(bytes), size: bytes.length }; });
  const languages = new Set<string>();
  const languageExtensions: Record<string, string> = { '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript', '.py': 'python', '.java': 'java', '.go': 'go', '.rs': 'rust', '.cs': 'csharp' };
  for (const name of names) { const language = languageExtensions[path.extname(name)]; if (language) languages.add(language); }
  const packageFile = fileBytes(root, 'package.json');
  let packageScripts: Record<string, string> = {};
  if (packageFile) { try { packageScripts = (JSON.parse(packageFile.toString('utf8')) as { scripts?: Record<string, string> }).scripts ?? {}; } catch { /* The inspection reports package parse trouble without executing code. */ } }
  const instructionFiles = names.filter(name => /(?:^|\/)(?:AGENTS|CLAUDE|GEMINI)\.md$/.test(name));
  const documentRoots = ['docs/internal', 'docs/public', 'docs/development', 'framework', 'docs'].filter(name => fs.existsSync(contained(root, name)));
  const historySources = names.filter(name => /(?:decisions|_archive|archive|recon|history|changelog|CHANGELOG)/.test(name) && /\.(?:md|json)$/.test(name));
  const gitHistory: NonNullable<Inspection['gitHistory']> = { entries: [], limit: 20, note: 'Git history unavailable or this target is not a repository. No Git mutations are performed.' };
  if (fs.existsSync(root)) {
    try {
      const gitRoot = execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (targetRoot(gitRoot) === root) {
        gitHistory.head = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        const log = execFileSync('git', ['-C', root, 'log', '-n', '20', '--format=%H%x09%aI%x09%s', '--', 'docs', 'AGENTS.md', 'README.md', 'CLAUDE.md', 'framework'], { encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
        gitHistory.entries = log.trim().split(/\r?\n/).filter(Boolean).map(line => { const [revision, date, ...subject] = line.split('\t'); return { revision, date, subject: subject.join('\t') }; });
        gitHistory.note = 'At most 20 recent instruction/document changes. Commit subjects are historical observations, not accepted requirements; inspect relevant source records before relying on them.';
      }
    } catch { /* Missing Git, an unborn branch, or inaccessible history is reported as unavailable evidence. */ }
  }
  return { schemaVersion: 1, root, exists: fs.existsSync(root), files, instructionFiles, documentRoots, languages: [...languages].sort(), packageScripts, manifest, historySources, gitHistory, notes: ['Observed code and history are evidence, not acceptance. No target code, Git mutations, or network operations were executed.'] };
}

function answerValue(answer: unknown): unknown {
  if (answer && typeof answer === 'object' && !Array.isArray(answer) && 'value' in answer) return (answer as AnswerRecord).value;
  return answer;
}
function notApplicable(answer: unknown): boolean {
  return Boolean(answer && typeof answer === 'object' && ['not-applicable', 'deferred'].includes(String((answer as AnswerRecord).status)));
}
function applicability(question: Question, inspection: Inspection, answers: Record<string, unknown>, track: Track = 'existing'): boolean {
  const condition = question.applicability;
  if (!condition || condition === 'always' || condition === 'all') return true;
  if (Array.isArray(condition)) return condition.some(item => applicability({ ...question, applicability: item }, inspection, answers, track));
  if (typeof condition === 'object') {
    const rule = condition as Record<string, unknown>;
    if (Array.isArray(rule.tracks)) return rule.tracks.includes(track);
    if (typeof rule.answer === 'string') return answerValue(answers[rule.answer]) === rule.equals;
    if (Array.isArray(rule.languages)) return rule.languages.some(language => inspection.languages.includes(String(language)));
    if (Array.isArray(rule.paths)) return rule.paths.some(prefix => inspection.files.some(file => file.path.startsWith(String(prefix))));
    if (rule.requires) return Boolean(answerValue(answers[String(rule.requires)]));
    if (typeof rule.capability === 'string') {
      const patterns: Record<string, RegExp> = { api: /(?:^|\/)(?:apis?|routes?|controllers?|openapi)(?:\/|\.)/i, persistence: /(?:migration|schema\.prisma|database|postgres|sqlite)/i, 'human-interface': /\.(?:tsx|jsx|vue|svelte|html)$|(?:^|\/)ui\//i, runtime: /\.(?:ts|js|py|java|go|rs|cs)$/i, deployment: /(?:dockerfile|terraform|deploy|\.github\/workflows)/i, 'external-integrations': /(?:integrations?|providers?|adapters?)\//i };
      const pattern = patterns[rule.capability];
      return pattern ? inspection.files.some(file => pattern.test(file.path)) || Object.entries(answers).some(([key, value]) => key.includes('capabilities') && JSON.stringify(answerValue(value)).includes(String(rule.capability))) : true;
    }
    return true;
  }
  const text = String(condition).toLowerCase();
  if (text.includes('frontend')) return inspection.files.some(file => /\.(?:tsx|jsx|vue|svelte|html)$/.test(file.path));
  if (text.includes('database') || text.includes('persistence')) return inspection.files.some(file => /(?:migration|schema\.prisma|database|postgres|sqlite)/i.test(file.path));
  if (text.includes('java') && !text.includes('javascript')) return inspection.languages.includes('java');
  if (text.includes('python')) return inspection.languages.includes('python');
  if (text.includes('typescript') || text.includes('javascript')) return inspection.languages.some(language => ['javascript', 'typescript'].includes(language));
  return true;
}
function validAnswer(question: Question, value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'string' && !value.trim()) return false;
  if (question.type === 'choice') {
    if (typeof value !== 'string') return false;
  } else if (question.type === 'list' && typeof value === 'string') {
    if (!value.split(',').every(item => item.trim())) return false;
  } else if (question.type === 'multi-choice' || question.type === 'list') {
    if (!Array.isArray(value) || !value.length || value.some(item => typeof item !== 'string' || !item.trim())) return false;
  } else if (question.type === 'text' && typeof value !== 'string') return false;
  else if (question.type === 'object' && (!value || typeof value !== 'object' || Array.isArray(value))) return false;
  if (question.options?.length) {
    const allowed = question.options.map(option => typeof option === 'string' ? option : option.value ?? option.id ?? option.label);
    return Array.isArray(value) ? question.type === 'multi-choice' && value.length > 0 && value.every(item => allowed.includes(String(item))) : typeof value === 'string' && allowed.includes(value);
  }
  if (question.type === 'boolean') return typeof value === 'boolean';
  return true;
}

export function expandAnswers(document: Partial<AnswersDocument>): Partial<AnswersDocument> {
  const expanded = structuredClone(document);
  expanded.answers ??= {};
  for (const [id, record] of Object.entries(expanded.answers)) {
    const value = answerValue(record);
    if (id === 'ownership' || id === 'lifecycleMappings') (expanded as Record<string, unknown>)[id] ??= value;
    if (!id.startsWith('configuration.')) continue;
    const pieces = id.split('.').slice(1);
    if (!pieces.length || pieces.some(piece => ['__proto__', 'prototype', 'constructor'].includes(piece))) throw new Refused(`unsafe answer path: ${id}`);
    expanded.configuration ??= { schemaVersion: 1 };
    let cursor = expanded.configuration as Record<string, unknown>;
    for (const piece of pieces.slice(0, -1)) {
      if (!cursor[piece] || typeof cursor[piece] !== 'object' || Array.isArray(cursor[piece])) cursor[piece] = {};
      cursor = cursor[piece] as Record<string, unknown>;
    }
    cursor[pieces.at(-1)!] ??= value;
  }
  return expanded;
}

export function getQuestions(options: { root: string; track?: Track; answers?: Partial<AnswersDocument>; sourceRoot?: string }): QuestionsResult {
  const inspection = inspectRepository(options);
  const distribution = locateDistribution(options.sourceRoot);
  const expanded = expandAnswers(options.answers ?? {});
  const supplied = expanded.answers ?? {};
  const resolved: Record<string, unknown> = {};
  const unanswered: Question[] = [];
  for (const question of distribution.questions) {
    if (!applicability(question, inspection, { ...supplied, ...resolved }, options.track)) continue;
    const answer = supplied[question.id];
    if (notApplicable(answer)) {
      const record = answer as AnswerRecord;
      const justified = Boolean(record.source || record.evidence?.length || record.reason);
      if (record.status === 'deferred' && question.required !== false || record.status === 'not-applicable' && (!question.applicability || !justified) && question.required !== false) unanswered.push(question);
      else resolved[question.id] = answer;
      continue;
    }
    const record = answer && typeof answer === 'object' ? answer as AnswerRecord : undefined;
    if (record && ['proposed-from-observation', 'unanswered', 'conflict'].includes(String(record.status))) { unanswered.push(question); continue; }
    const candidate = answerValue(answer) ?? (expanded.useDefaults ? question.default : undefined);
    if (validAnswer(question, candidate)) resolved[question.id] = candidate;
    else unanswered.push(question);
  }
  const requireConfiguration = (id: string, prompt: string, value: unknown, valid: boolean): void => {
    if (valid) resolved[id] = value;
    else unanswered.push({ id, group: 'configuration', prompt, type: /\.(?:roots|states)$/.test(id) ? 'list' : 'object', required: true, answerPath: id });
  };
  const docs = expanded.configuration?.documentation;
  if (resolved['documentation.taxonomy'] === 'mapped') {
    requireConfiguration('configuration.documentation.roots', 'List the accepted repository-relative documentation roots (internal first, public second when applicable).', docs?.roots, Boolean(Array.isArray(docs?.roots) && docs.roots.length && docs.roots.every(root => typeof root === 'string' && root.trim())));
    requireConfiguration('ownership', 'Map canonical roles to their actual existing documents before using mapped taxonomy.', expanded.ownership, Boolean(expanded.ownership && !Array.isArray(expanded.ownership) && Object.keys(expanded.ownership).length && Object.values(expanded.ownership).every(value => typeof value === 'string' && value.trim())));
  }
  if (resolved['documentation.lifecycle'] === 'mapped-legacy') {
    requireConfiguration('configuration.documentation.states', 'Provide the explicit accepted lifecycle states for this repository.', docs?.states, Boolean(Array.isArray(docs?.states) && docs.states.length && docs.states.every(state => typeof state === 'string' && state.trim())));
    requireConfiguration('lifecycleMappings', 'Map legacy lifecycle labels explicitly; preserve their approval records and archive meaning.', expanded.lifecycleMappings, Boolean(expanded.lifecycleMappings && Object.keys(expanded.lifecycleMappings).length));
  }
  if (resolved['tooling.modules'] === 'custom') requireConfiguration('configuration.rules', 'Select enabled rule modules and their explicit options.', expanded.configuration?.rules, Boolean(expanded.configuration?.rules && Object.keys(expanded.configuration.rules).length));
  if (resolved['tooling.modules'] === 'markdown-and-javascript-typescript') {
    for (const id of ['api-client-usage', 'api-error-codes', 'frontend-i18n-copy', 'frontend-error-surfaces']) {
      const rule = expanded.configuration?.rules?.[id] as Record<string, unknown> | undefined;
      const enabled = rule?.enabled === true;
      const roots = Array.isArray(rule?.roots) && rule.roots.length > 0;
      const valid = Boolean(rule && (enabled ? roots && (id !== 'api-client-usage' || typeof rule.apiClientModule === 'string' && rule.apiClientModule.trim()) : rule.enabled === false && typeof rule.reason === 'string' && rule.reason.trim()));
      requireConfiguration(`configuration.rules.${id}`, `Configure ${id}: enabled with explicit source roots${id === 'api-client-usage' ? ' and the accepted API client module' : ''}, or disabled with a reason when it does not apply.`, rule, valid);
    }
  }
  return { schemaVersion: 1, questions: unanswered, unresolved: unanswered.filter(question => question.required !== false).map(question => question.id), resolved, observations: inspection.notes };
}

export function alignedDecisions(options: { root: string; track?: Track; answers: AnswersDocument; sourceRoot?: string }): Record<string, unknown> {
  if (!options.answers || options.answers.alignment?.confirmed !== true || typeof options.answers.alignment.instruction !== 'string' || !options.answers.alignment.instruction.trim()) throw new Refused('generation requires an alignment record with confirmed=true and the actual user instruction reference; inspect/questions remain read-only');
  const questions = getQuestions(options);
  if (questions.unresolved.length) throw new Refused(`applicable required decisions remain unresolved: ${questions.unresolved.join(', ')}; gather all answers and alignment before generating files`);
  return questions.resolved;
}
