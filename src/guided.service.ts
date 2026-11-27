import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import type { Alignment, AnswersDocument, FrameworkConfig, MigrationPlan, Question, Track } from './framework.types.js';
import { assertNoLinks, contained, digest, fileBytes, fileHash, jsonText, readJson, Refused, targetRoot } from './filesystem.service.js';
import { getQuestions, inspectRepository } from './decisions.service.js';
import { locateDistribution } from './distribution.service.js';
import { configurationForAnswers, createPlan, validateAnswers } from './planning.service.js';
import { packagedConfigurationDefinitions, plannedRepositoryConfiguration, resolveRepositoryConfiguration } from './configuration.service.js';
import { augmentInitializationPlan, initializationProduct, initializationReadiness, previewInitializationCompletion, type InitializationReadiness } from './initialization.service.js';

export interface ScopeResult { state: 'selected' | 'ambiguous'; root?: string; candidates: Array<{ path: string; evidence: string[] }> }
export function discoverScope(options: { cwd?: string; target?: string } = {}): ScopeResult {
  if (options.target) { const root = targetRoot(options.target); return { state: 'selected', root, candidates: [{ path: root, evidence: ['explicit --target'] }] }; }
  const cwd = targetRoot(options.cwd ?? process.cwd());
  const candidates: ScopeResult['candidates'] = [];
  let cursor = cwd;
  while (true) {
    const evidence: string[] = [];
    for (const name of ['.stavel.json', 'stavel.config.json', '.stavel-config/stavel.config.json', 'package.json', 'pnpm-workspace.yaml', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'pom.xml', 'build.gradle', 'build.gradle.kts', '.git']) if (fs.existsSync(contained(cursor, name))) evidence.push(name);
    if (evidence.length) candidates.push({ path: cursor, evidence });
    if (evidence.includes('.git') || path.dirname(cursor) === cursor) break;
    cursor = path.dirname(cursor);
  }
  if (candidates.length > 1) return { state: 'ambiguous', candidates };
  const root = candidates[0]?.path ?? cwd;
  return { state: 'selected', root, candidates: candidates.length ? candidates : [{ path: root, evidence: ['current directory; no competing boundary found'] }] };
}

export function sessionDirectory(): string {
  if (process.platform === 'win32') return path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local'), 'Stavel', 'sessions');
  if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Caches', 'stavel', 'sessions');
  return path.join(process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), '.cache'), 'stavel', 'sessions');
}
interface DecisionSession { schemaVersion: 1; root: string; binding: string; answers: AnswersDocument; updated: string }
export function sessionFile(root: string, cache = sessionDirectory()): string {
  const selectedRoot = targetRoot(root); const selectedCache = targetRoot(cache); const relation = path.relative(selectedRoot, selectedCache);
  if (!relation || relation !== '..' && !relation.startsWith(`..${path.sep}`) && !path.isAbsolute(relation)) throw new Refused('question session cache must stay outside the selected target');
  return contained(selectedCache, `${digest(selectedRoot)}.json`);
}
function loadedSession(root: string, binding: string, file: string): AnswersDocument | undefined {
  if (!fs.existsSync(file)) return;
  const session = readJson<DecisionSession>(file);
  if (!session || typeof session !== 'object' || Array.isArray(session) || Object.keys(session).some(key => !['schemaVersion', 'root', 'binding', 'answers', 'updated'].includes(key)) || session.schemaVersion !== 1 || session.root !== targetRoot(root) || session.binding !== binding || typeof session.updated !== 'string') throw new Refused('saved question session is incompatible or stale; inspect it or explicitly clear the session before restarting');
  validateAnswers(session.answers);
  if (typeof session.answers.alignment?.confirmed !== 'boolean' || typeof session.answers.alignment.instruction !== 'string') throw new Refused('saved question session has invalid alignment');
  return structuredClone(session.answers);
}
export function readDecisionSession(root: string, binding: string, cache?: string): AnswersDocument | undefined {
  const file = sessionFile(root, cache);
  if (fs.existsSync(`${file}.lock`)) throw new Refused('question session has an active or uncertain writer; inspect before reading');
  return loadedSession(root, binding, file);
}
export function clearDecisionSession(root: string, cache?: string): void {
  const file = sessionFile(root, cache);
  if (fs.existsSync(`${file}.lock`)) throw new Refused('question session has an active or uncertain writer; inspect before cleanup');
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
export function saveDecisionSession(root: string, binding: string, answers: AnswersDocument, cache?: string, expectedHash?: string | null): void {
  const file = sessionFile(root, cache);
  validateAnswers(answers);
  if (typeof binding !== 'string' || !binding.trim()) throw new Refused('question session requires a binding');
  if (typeof answers.alignment?.confirmed !== 'boolean' || typeof answers.alignment.instruction !== 'string') throw new Refused('question session requires explicit alignment state');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let lock: number;
  try { lock = fs.openSync(`${file}.lock`, 'wx'); } catch { throw new Refused('question session has a concurrent or uncertain writer'); }
  const temporary = `${file}.${crypto.randomUUID()}.tmp`;
  try {
    if (expectedHash !== undefined && (fs.existsSync(file) ? digest(fs.readFileSync(file)) : null) !== expectedHash) throw new Refused('question session changed while answers were being gathered; inspect before retrying');
    loadedSession(root, binding, file);
    assertNoLinks(temporary);
    fs.writeFileSync(temporary, jsonText({ schemaVersion: 1, root: targetRoot(root), binding, answers, updated: new Date().toISOString() }), { flag: 'wx' });
    fs.renameSync(temporary, file);
  } finally { fs.closeSync(lock); fs.unlinkSync(`${file}.lock`); if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

export type Ask = (prompt: string) => Promise<string>;
export interface GuidedInitOptions { target?: string; cwd?: string; sourceRoot?: string; name?: string; track?: Track; mode?: 'bootstrap' | 'adopt' | 'migrate'; answers?: AnswersDocument; ask?: Ask; cache?: string; resetSession?: boolean; frameworkPath?: string; configurationHome?: 'root' | 'directory'; upgradeBaseline?: boolean; alignment?: Alignment; guardBundlePath?: string }
export interface GuidedInitResult { state: 'input-required' | 'preview' | 'already-initialized' | 'incomplete'; root?: string; questions: Array<{ id: string; prompt: string; options?: unknown[] }>; scope: ScopeResult; plan?: MigrationPlan; session?: string; config?: FrameworkConfig; readiness?: InitializationReadiness; guardActivation?: ReturnType<typeof previewInitializationCompletion>['guardActivation'] }
function parseAnswer(question: Question, text: string): unknown {
  if (question.type === 'boolean') { if (!/^(true|false|yes|no)$/i.test(text)) throw new Refused(`${question.id}: answer yes/no or true/false`); return /^(true|yes)$/i.test(text); }
  if (['object', 'list', 'array', 'multi-choice'].includes(String(question.type))) { try { return JSON.parse(text); } catch { if (question.type !== 'object') return text.split(',').map(value => value.trim()).filter(Boolean); throw new Refused(`${question.id}: expected JSON object`); } }
  return text;
}
export async function prepareGuidedInit(options: GuidedInitOptions = {}): Promise<GuidedInitResult> {
  if (options.mode !== undefined && !['bootstrap', 'adopt', 'migrate'].includes(options.mode)) throw new Refused('explicit initialization mode must be bootstrap, adopt or migrate');
  if (options.upgradeBaseline && options.mode !== undefined && options.mode !== 'migrate') throw new Refused('baseline upgrade requires initialization mode migrate');
  let scope = discoverScope(options);
  if (scope.state === 'ambiguous') {
    if (!options.ask) return { state: 'input-required', scope, questions: [{ id: 'scope', prompt: 'Select the project boundary.', options: scope.candidates.map(candidate => candidate.path) }] };
    const chosen = await options.ask(`Project scope is ambiguous. Enter one exact path:\n${scope.candidates.map(candidate => candidate.path).join('\n')}\n`);
    if (!scope.candidates.some(candidate => candidate.path === chosen.trim())) throw new Refused('scope answer must select an observed project boundary; use --target for another path');
    scope = discoverScope({ target: chosen.trim() });
  }
  const root = scope.root!, distribution = locateDistribution(options.sourceRoot);
  const resolved = resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), upgradeBaseline: options.upgradeBaseline });
  const readiness = initializationReadiness({ root, sourceRoot: options.sourceRoot, guardBundlePath: options.guardBundlePath });
  const reconfigure = options.answers !== undefined || options.name !== undefined || options.track !== undefined || options.mode !== undefined || options.frameworkPath !== undefined || options.configurationHome !== undefined || options.upgradeBaseline;
  // Durable selected setup wins over old pre-apply sessions. A session is only
  // authoritative while the installation itself is still incomplete.
  if (!reconfigure && readiness.state === 'ready') return { state: 'already-initialized', root, scope, questions: [], config: readiness.config, readiness };
  if (!reconfigure && readiness.documentsReady && readiness.state === 'partial') {
    let alignment = options.alignment;
    if (!alignment?.confirmed && options.ask && readiness.guards?.repairable) {
      const recap = jsonText({ root, gaps: readiness.gaps, policy: readiness.guards.policy });
      if ((await options.ask(`Review the selected setup gaps:\n${recap}\nType preview to prepare a preserving guard completion plan: `)).trim() === 'preview') alignment = { confirmed: true, instruction: `terminal:accepted-guard-preview:${digest(recap)}` };
    }
    if (alignment?.confirmed && readiness.guards && ['incomplete', 'pending-git'].includes(readiness.guards.state) && readiness.guards.repairable) {
      const completion = previewInitializationCompletion({ readiness, alignment, sourceRoot: options.sourceRoot, guardBundlePath: options.guardBundlePath });
      return { state: 'preview', root, scope, questions: [], config: readiness.config, readiness, ...completion };
    }
    return { state: 'incomplete', root, scope, questions: readiness.gaps.map(gap => ({ id: gap.id, prompt: gap.message })), config: readiness.config, readiness };
  }
  const inspection = inspectRepository({ root, sourceRoot: options.sourceRoot });
  const track = options.track ?? readiness.track ?? (inspection.files.length ? 'existing' : 'greenfield');
  const requested = { name: options.name ?? null, track: options.track ?? null, mode: options.mode ?? null, frameworkPath: options.frameworkPath ?? null, configurationHome: options.configurationHome ?? null, upgradeBaseline: Boolean(options.upgradeBaseline) };
  const bindingFor = (): string => {
    const source = locateDistribution(options.sourceRoot); const inspected = inspectRepository({ root, sourceRoot: options.sourceRoot });
    const selected = resolveRepositoryConfiguration({ root, packagedBaseline: source.config, packagedDefinitions: packagedConfigurationDefinitions(source), upgradeBaseline: options.upgradeBaseline });
    return digest(jsonText({ root, track, requested, packageVersion: source.version, packagedProfile: digest(jsonText(source.config)), catalog: digest(jsonText(source.catalog)), questions: digest(jsonText(source.questions)), artifacts: fileHash(source.root, 'config/artifacts.catalog.json'), baseline: selected.baseline, inputs: { ...Object.fromEntries(inspected.files.map(file => [file.path, file.hash])), ...selected.inputs } }));
  };
  const binding = bindingFor();
  if (options.resetSession) clearDecisionSession(root, options.cache);
  const saved = options.answers ? undefined : readDecisionSession(root, binding, options.cache);
  if (!reconfigure && readiness.state === 'partial' && !saved) return { state: 'incomplete', root, scope, questions: readiness.gaps.map(gap => ({ id: gap.id, prompt: gap.message })), config: readiness.config, readiness };
  const answers: AnswersDocument = options.answers ? structuredClone(options.answers) : saved ?? { answers: {}, alignment: { confirmed: false, instruction: '' } };
  validateAnswers(answers);
  const persistent = !options.answers;
  const currentSession = sessionFile(root, options.cache);
  let sessionHash = fs.existsSync(currentSession) ? digest(fs.readFileSync(currentSession)) : null;
  const save = (): void => { if (!persistent) return; saveDecisionSession(root, binding, answers, options.cache, sessionHash); sessionHash = digest(fs.readFileSync(currentSession)); };
  const answer = (id: string, value: unknown): void => { answers.answers[id] = { value, source: 'terminal:explicit-response', status: 'resolved-from-user' }; answers.alignment = { confirmed: false, instruction: '' }; save(); };
  if (options.name) {
    const prior = answers.answers['project.name']; const value = prior && typeof prior === 'object' && 'value' in prior ? prior.value : prior;
    if (value !== undefined && value !== options.name) {
      if (options.answers) throw new Refused('--name conflicts with the supplied project.name answer');
      answers.alignment = { confirmed: false, instruction: '' };
    }
    answers.answers['project.name'] = options.name;
  }
  if (options.mode) {
    const prior = answers.answers['workflow.mode']; const value = prior && typeof prior === 'object' && 'value' in prior ? prior.value : prior;
    if (value !== undefined && value !== options.mode) { if (options.answers) throw new Refused('--mode conflicts with the supplied workflow.mode answer'); answers.alignment = { confirmed: false, instruction: '' }; }
    answers.answers['workflow.mode'] = options.mode;
  }
  if (!options.answers && options.ask && answers.useDefaults === undefined) {
    const use = await options.ask('Use the selected repository/profile defaults for unanswered choices? Type yes or no: ');
    if (!/^(yes|no)$/i.test(use.trim())) throw new Refused('default selection requires an explicit yes or no');
    answers.useDefaults = /^yes$/i.test(use.trim()); answers.alignment = { confirmed: false, instruction: '' }; save();
  }
  let questions = getQuestions({ root, track, sourceRoot: options.sourceRoot, answers, upgradeBaseline: options.upgradeBaseline });
  if (options.ask) {
    let iterations = 0;
    while (questions.unresolved.length) {
      if (++iterations > distribution.questions.length + 20) throw new Refused('questions did not converge; inspect answers and applicability');
      const question = questions.questions.find(item => questions.unresolved.includes(item.id))!;
      const reply = await options.ask(`${question.prompt}${question.options ? `\nOptions: ${question.options.map(item => typeof item === 'string' ? item : item.value ?? item.id).join(', ')}` : ''}\n${question.id}: `);
      answer(question.id, parseAnswer(question, reply.trim()));
      questions = getQuestions({ root, track, sourceRoot: options.sourceRoot, answers, upgradeBaseline: options.upgradeBaseline });
    }
  }
  if (questions.unresolved.length) return { state: 'input-required', root, scope, config: resolved.config, questions: questions.questions.filter(question => questions.unresolved.includes(question.id)) };
  const selectedAnswers = (): AnswersDocument => ({ ...answers, answers: { ...questions.resolved, ...answers.answers } });
  const persisted = new Map(resolved.decisions.filter(record => record.scope === 'repository').map(record => [record.id, record]));
  const configurationChoices = options.upgradeBaseline ? Object.fromEntries(Object.entries(questions.resolved).filter(([id]) => Object.hasOwn(answers.answers, id) || persisted.has(id) && persisted.get(id)!.origin !== 'profile-default')) : questions.resolved;
  let effectiveConfig = configurationForAnswers(resolved.config, selectedAnswers(), configurationChoices);
  let product = initializationProduct({ root, config: effectiveConfig, answers: selectedAnswers(), sourceRoot: options.sourceRoot });
  let productAttempts = 0;
  while (!product.ready && options.ask && product.questions.length) {
    if (++productAttempts > 20) throw new Refused('product questions did not converge; inspect the selected template and facts');
    const question = product.questions[0]; const id = `product.${question.fact}`;
    const reply = await options.ask(`${question.prompt}\n${id}: `); answer(id, reply.trim());
    product = initializationProduct({ root, config: effectiveConfig, answers: selectedAnswers(), sourceRoot: options.sourceRoot });
  }
  if (!product.ready) return { state: 'input-required', root, scope, config: effectiveConfig, questions: product.questions.length ? product.questions.map(question => ({ id: `product.${question.fact}`, prompt: question.prompt })) : [{ id: 'product.ownership', prompt: product.unresolved.join('; ') }] };
  if (!answers.alignment?.confirmed && options.ask) {
    const recap = jsonText({ root, track, requested, decisions: { ...questions.resolved, ...Object.fromEntries(Object.entries(answers.answers).filter(([id]) => id.startsWith('product.'))) }, configuration: effectiveConfig, artifacts: product.artifacts.map(artifact => ({ id: artifact.id, path: artifact.path, action: artifact.action })) });
    const response = await options.ask(`Review these complete selected choices:\n${recap}\nType align to accept this configuration and generate a preview: `);
    if (response.trim() === 'align') answers.alignment = { confirmed: true, instruction: `terminal:accepted-recap:${digest(recap)}` };
    save();
  }
  if (!answers.alignment?.confirmed) return { state: 'input-required', root, scope, questions: [{ id: 'alignment', prompt: 'Review the complete selected choices and record explicit alignment.', options: [questions.resolved] }] };
  const name = options.name ?? String(questions.resolved['project.name'] ?? path.basename(root));
  if (bindingFor() !== binding) throw new Refused('repository inputs or selected catalogs changed during questions; review the stale session before restarting');
  const mode = String(questions.resolved['workflow.mode']);
  if (!['bootstrap', 'adopt', 'migrate'].includes(mode)) throw new Refused('selected initialization mode must be bootstrap, adopt or migrate');
  const basePlan = createPlan({ root, name, track, mode: mode as 'bootstrap' | 'adopt' | 'migrate', answers, sourceRoot: options.sourceRoot, configurationHome: options.configurationHome ?? (resolved.kind === 'absent' ? 'directory' : undefined), frameworkPath: options.frameworkPath, upgradeBaseline: options.upgradeBaseline });
  effectiveConfig = plannedRepositoryConfiguration(basePlan, effectiveConfig);
  const plan = augmentInitializationPlan(basePlan, { config: effectiveConfig, answers: selectedAnswers(), sourceRoot: options.sourceRoot, guardBundlePath: options.guardBundlePath, upgradeRuntime: Boolean(options.upgradeBaseline) });
  return { state: 'preview', root, scope, questions: [], plan, config: effectiveConfig, readiness, ...(plan.gitGuardActivation ? { guardActivation: plan.gitGuardActivation } : {}), ...(persistent ? { session: currentSession } : {}) };
}

export { prepareGuidedInit as guidedInit };
