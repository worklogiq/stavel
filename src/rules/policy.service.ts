import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseMetadata, extractMarkdownLinks, planCompose } from '@worklogiq/mdcomposer';
import type { NamingPolicy, PolicyConfig, PolicyDiagnostic, PolicyResult, RuleContext, RuleModule, RuleOptions } from './policy.types.js';
import { collectFiles, diagnostic, inside, matchesAny, posix, stringList } from './shared.service.js';
import { analyzeDocumentationImpact, parseChangesetAttestation, type ImpactMapping } from './documentation-impact.rule.js';
import { findMojibakeInText } from './encoding.rule.js';
import { compareImageReviewManifests, validateBaselineManifest, type ImageManifest } from './image-manifest.rule.js';
import defaultProfile from '../../config/default.profile.json' with { type: 'json' };

export * from './policy.types.js';
export * from './documentation-impact.rule.js';
export * from './encoding.rule.js';
export * from './image-manifest.rule.js';
export { globToRegExp, matchesAny } from './shared.service.js';

const defaultKinds = defaultProfile.documentation.kinds;
const defaultStates = ['draft', 'accepted', 'active', 'complete', 'deprecated'];
const fixedDocNames = new Set(['README.md', 'index.md']);

export function validIdentifier(identifier: string, casing: NamingPolicy['identifierCase'] = 'kebab'): boolean {
  const patterns = {
    camel: /^[a-z][A-Za-z0-9]*$/,
    snake: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/,
    kebab: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    pascal: /^[A-Z][A-Za-z0-9]*$/,
    any: /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
  };
  return patterns[casing].test(identifier);
}

export function validateDocumentFilename(filename: string, naming: NamingPolicy = {}, kinds: string[] = defaultKinds): string[] {
  if (fixedDocNames.has(filename) || naming.allowedNames?.includes(filename)) return [];
  if (!filename.endsWith('.md')) return ['Documentation filename must end in .md.'];
  const stem = filename.slice(0, -3);
  if (naming.shape === 'plain') return validIdentifier(stem, naming.identifierCase) ? [] : [`Identifier must use ${naming.identifierCase ?? 'kebab'} case.`];
  const firstDot = stem.indexOf('.');
  if (firstDot > 0 && naming.typePatterns?.some(pattern => new RegExp(`^(?:${pattern})$`).test(stem.slice(firstDot + 1)))) {
    return validIdentifier(stem.slice(0, firstDot), naming.identifierCase) ? [] : [`Identifier must use ${naming.identifierCase ?? 'kebab'} case.`];
  }
  const allowed = [...kinds, ...(naming.legacyKinds ?? [])].sort((a, b) => b.length - a.length);
  const kind = allowed.find(value => stem.endsWith(`.${value}`));
  if (!kind) {
    return ['Expected <identifier>.<registered-doc-kind>.md; document kinds use kebab-case.'];
  }
  const identifier = stem.slice(0, -kind.length - 1);
  return validIdentifier(identifier, naming.identifierCase) ? [] : [`Identifier must use ${naming.identifierCase ?? 'kebab'} case.`];
}

function ruleOptions(config: PolicyConfig, id: string, fallback = true): RuleOptions | null {
  const entry = config.rules?.[id];
  if (entry === false || (typeof entry === 'object' && entry.enabled === false)) return null;
  if (entry === undefined && !fallback) return null;
  return typeof entry === 'object' ? entry : {};
}

function docFiles(context: RuleContext): string[] {
  const roots = context.inputs ?? context.config.documentation?.roots ?? ['docs/internal', 'docs/public'];
  return collectFiles(context.root, roots, context.config.ignore).filter(file => file.endsWith('.md'));
}

function metadataAt(object: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, object);
}

const namingRule: RuleModule = { id: 'doc-naming', version: 1, applicability: 'Configured Markdown roots', check(context, options) {
  const docs = context.config.documentation;
  return docFiles(context).flatMap(file => validateDocumentFilename(path.basename(file), docs?.naming, docs?.kinds).map(message => diagnostic('doc-naming', path.relative(context.root, file), message, options)));
} };

const metadataRule: RuleModule = { id: 'doc-metadata', version: 1, applicability: 'Canonical documents excluding fixed indexes and template placeholders', check(context, options) {
  const result: PolicyDiagnostic[] = [];
  const docs = context.config.documentation;
  const required = docs?.metadata?.requiredFields ?? docs?.metadata?.required ?? ['title', 'kind', 'state', 'audience', 'owner', 'updated'];
  for (const file of docFiles(context)) {
    const name = path.basename(file);
    const relative = posix(path.relative(context.root, file));
    if (fixedDocNames.has(name)) continue;
    const parsed = parseMetadata(fs.readFileSync(file, 'utf8'));
    for (const issue of parsed.issues) result.push(diagnostic('doc-metadata', relative, issue, options));
    for (const field of required) {
      const value = metadataAt(parsed.data, field);
      if (value === undefined || value === null || value === '') result.push(diagnostic('doc-metadata', relative, `Missing metadata field: ${field}`, options));
    }
    if (parsed.data.state === 'accepted' && (typeof parsed.data.acceptance !== 'string' || !parsed.data.acceptance.trim())) result.push(diagnostic('doc-metadata', relative, 'Accepted authority must reference an actual acceptance record.', options));
    if (parsed.data.updated && !/^\d{4}-\d{2}-\d{2}$/.test(String(parsed.data.updated)) && !relative.includes('/templates/')) result.push(diagnostic('doc-metadata', relative, 'updated must use YYYY-MM-DD.', options));
  }
  return result;
} };

const statesRule: RuleModule = { id: 'doc-states', version: 1, applicability: 'Documents declaring lifecycle state', check(context, options) {
  const states = context.config.documentation?.states ?? defaultStates;
  return docFiles(context).flatMap(file => {
    const { data } = parseMetadata(fs.readFileSync(file, 'utf8'));
    if (data.state === undefined || typeof data.state === 'string' && data.state.includes('{{')) return [];
    if (typeof data.state !== 'string') return [diagnostic('doc-states', path.relative(context.root, file), 'Document state must be a scalar string.', options)];
    return states.includes(data.state) ? [] : [diagnostic('doc-states', path.relative(context.root, file), `Unknown document state: ${data.state}. Archive is a location, not an approval state.`, options)];
  });
} };

const audienceRule: RuleModule = { id: 'doc-audience', version: 1, applicability: 'Declared audiences and public Markdown references', check(context, options) {
  const result: PolicyDiagnostic[] = [];
  const audienceFor = (file: string): string => {
    const audience = parseMetadata(fs.readFileSync(file, 'utf8')).data.audience ?? 'internal';
    return typeof audience === 'string' ? audience : 'invalid non-scalar audience';
  };
  for (const file of docFiles(context)) {
    const content = fs.readFileSync(file, 'utf8');
    const audience = audienceFor(file);
    if (!(context.config.documentation?.audiences ?? ['public', 'internal']).includes(audience)) result.push(diagnostic('doc-audience', path.relative(context.root, file), `Unknown audience: ${audience}`, options));
    if (audience !== 'public') continue;
    for (const link of extractMarkdownLinks(content)) {
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(link.destination)) continue;
      const local = link.destination.split(/[?#]/)[0];
      let target: string;
      try { target = path.resolve(local.startsWith('/') ? context.root : path.dirname(file), decodeURIComponent(local.startsWith('/') ? `.${local}` : local)); }
      catch { continue; }
      if (inside(context.root, target) && fs.existsSync(target) && !fs.lstatSync(target).isSymbolicLink() && inside(fs.realpathSync(context.root), fs.realpathSync(target)) && fs.statSync(target).isFile() && target.endsWith('.md') && audienceFor(target) !== 'public') {
        result.push(diagnostic('doc-audience', path.relative(context.root, file), `Public document links to internal document: ${posix(path.relative(context.root, target))}`, options, link.line));
      }
    }
  }
  const composition = planCompose({ root: context.root, inputs: docFiles(context).map(file => posix(path.relative(context.root, file))), operations: ['include', 'embed'], config: { roots: context.config.documentation?.roots, publication: context.config.documentation?.publication } });
  result.push(...composition.diagnostics.filter(item => /composition|audience|publication|import|embed|include/.test(item.ruleId)).map(item => ({ ...item, severity: options.severity ?? item.severity })));
  return result;
} };

const archiveRule: RuleModule = { id: 'doc-archive', version: 1, applicability: 'Historical references and execution artifact placement', check(context, options) {
  const result: PolicyDiagnostic[] = [];
  const archive = context.config.documentation?.archive;
  const archiveRoot = path.resolve(context.root, archive?.root ?? 'docs/internal/_archive');
  const allowed = stringList((archive as Record<string, unknown> | undefined)?.allowedStates, ['complete', 'deprecated']);
  const label = archive?.historicalHeading ?? 'Historical context (archived)';
  for (const file of docFiles(context)) {
    const content = fs.readFileSync(file, 'utf8');
    const relative = posix(path.relative(context.root, file));
    const state = parseMetadata(content).data.state;
    if (inside(archiveRoot, file)) {
      if (state && !allowed.includes(String(state))) result.push(diagnostic('doc-archive', relative, `Archived record must retain a supported historical state (${allowed.join(', ')}).`, options));
      const audience = String(parseMetadata(content).data.audience ?? 'internal');
      if (!(archive?.allowedAudiences ?? ['internal']).includes(audience)) result.push(diagnostic('doc-archive', relative, 'Archived records must retain the configured historical audience.', options));
      continue;
    }
    const lines = content.split(/\r?\n/);
    const marker = lines.findIndex(line => /^#{1,6}\s/.test(line) && line.replace(/^#{1,6}\s+/, '').trim() === label);
    for (const link of extractMarkdownLinks(content)) {
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(link.destination)) continue;
      const target = path.resolve(path.dirname(file), link.destination.split(/[?#]/)[0]);
      if (!inside(archiveRoot, target)) continue;
      const between = marker >= 0 ? lines.slice(marker + 1, link.line - 1) : [];
      if (marker < 0 || marker >= link.line || between.some(line => /^#{1,2}\s/.test(line))) result.push(diagnostic('doc-archive', relative, `Historical links must appear under "${label}".`, options, link.line));
    }
    const execution = /\.(?:execution-plan|execution-slices|execution-prompt|macro-execution|project-phase-status|recon|cutover|issues)\.md$/.test(file);
    if (execution && state === 'complete') result.push(diagnostic('doc-archive', relative, 'Completed delivery artifacts belong in the configured archive.', options));
    if (execution && archive?.activeRoots?.length && !archive.activeRoots.some(root => inside(path.resolve(context.root, root), file))) result.push(diagnostic('doc-archive', relative, 'Active delivery artifact must live beside an owning area.', options));
  }
  return result;
} };

const readmeRule: RuleModule = { id: 'readme', version: 1, applicability: 'Configured package README requirements', check(context, options) {
  const result: PolicyDiagnostic[] = [];
  for (const item of stringList(options.files, ['README.md'])) {
    const file = path.resolve(context.root, item);
    if (!inside(context.root, file)) { result.push(diagnostic('readme', item, 'README target leaves repository.', options)); continue; }
    if (!fs.existsSync(file)) { result.push(diagnostic('readme', item, 'README is missing.', options)); continue; }
    const content = fs.readFileSync(file, 'utf8');
    for (const heading of stringList(options.headings, ['What is this?', 'How to run locally', 'Canonical documentation'])) {
      if (!content.split(/\r?\n/).some(line => line.trim() === `## ${heading}`)) result.push(diagnostic('readme', item, `Missing README heading: ${heading}`, options));
    }
  }
  return result;
} };

const encodingRule: RuleModule = { id: 'encoding', version: 1, applicability: 'Configured text files; binary files excluded', check(context, options) {
  const result: PolicyDiagnostic[] = [];
  const files = collectFiles(context.root, stringList(options.roots, context.config.documentation?.roots ?? ['docs']), context.config.ignore);
  for (const file of files) {
    if (!/\.(?:md|json|ya?ml|[cm]?[jt]sx?|txt|html|css|sh|ps1)$/.test(file)) continue;
    const bytes = fs.readFileSync(file);
    if (bytes.includes(0)) continue;
    for (const finding of findMojibakeInText(bytes.toString('utf8'))) result.push({ ...diagnostic('encoding', path.relative(context.root, file), `Possible text corruption: ${finding.code}`, options, finding.line), column: finding.column });
  }
  return result;
} };

const impactRule: RuleModule = { id: 'docs-impact', version: 1, applicability: 'Changed source files with configured documentation owners', check(context, options) {
  const mappings = (Array.isArray(options.mappings) ? options.mappings : []) as ImpactMapping[];
  if (!mappings.length) return [];
  let changedFiles = context.changedFiles ?? stringList(options.files);
  if (!changedFiles.length && options.baseRef) {
    try { changedFiles = execFileSync('git', ['diff', '--name-only', String(options.baseRef), '--'], { cwd: context.root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split(/\r?\n/).filter(Boolean); }
    catch { return [diagnostic('docs-impact', '.', 'Cannot inspect requested Git base; provide changed files or a valid baseRef.', { severity: 'error' })]; }
  }
  const attestations = changedFiles.filter(file => file.startsWith('.changeset/') && file.endsWith('.md')).flatMap(file => {
    const target = path.resolve(context.root, file);
    return inside(context.root, target) && fs.existsSync(target) ? [parseChangesetAttestation(file, fs.readFileSync(target, 'utf8'))] : [];
  });
  const impact = analyzeDocumentationImpact(changedFiles, { mappings, attestations, servedDocs: stringList(options.servedDocs), requireChangesetForServedDocs: options.requireChangesetForServedDocs === true, ignored: stringList(options.ignore) });
  return [...impact.errors.map(message => diagnostic('docs-impact', '.', message, { severity: 'error' })), ...impact.warnings.map(message => diagnostic('docs-impact', '.', message, { severity: options.severity ?? 'warning' }))];
} };

const imageRule: RuleModule = { id: 'image-manifest', version: 1, applicability: 'Explicitly selected screenshot evidence manifests; no browser capture or visual judgment', check(context, options) {
  const readManifest = (name: unknown): ImageManifest => {
    if (typeof name !== 'string') throw new Error('image-manifest requires baseline and generated file paths.');
    const target = path.resolve(context.root, name);
    if (!inside(context.root, target) || fs.lstatSync(target).isSymbolicLink() || !inside(fs.realpathSync(context.root), fs.realpathSync(target))) throw new Error(`Manifest leaves repository: ${name}`);
    return JSON.parse(fs.readFileSync(target, 'utf8')) as ImageManifest;
  };
  const baseline = readManifest(options.baseline);
  const generated = readManifest(options.generated);
  const invalid = validateBaselineManifest(baseline).map(message => diagnostic('image-manifest', String(options.baseline), message, { severity: 'error' }));
  if (invalid.length) return invalid;
  const findings = compareImageReviewManifests(baseline, generated, { requiredVariants: stringList(options.requiredVariants) });
  return findings.map(finding => diagnostic('image-manifest', String(options.generated), `${finding.type}: ${finding.id ?? finding.variant ?? 'link evidence'}`, options));
} };

export const ruleModules: RuleModule[] = [namingRule, metadataRule, statesRule, audienceRule, archiveRule, readmeRule, encodingRule, impactRule, imageRule];

export function listRules(): Array<{ id: string; version: number; applicability: string }> {
  return [...ruleModules.map(({ id, version, applicability }) => ({ id, version, applicability })),
    ...['source-naming', 'file-length', 'api-client-usage', 'api-error-codes', 'frontend-i18n-copy', 'frontend-error-surfaces'].map(id => ({ id, version: 1, applicability: 'Opt-in configured JavaScript/TypeScript source scopes' }))];
}

export async function checkPolicy(input: { root: string; config?: PolicyConfig | Record<string, unknown>; inputs?: string[]; changedFiles?: string[] }): Promise<PolicyResult> {
  const root = path.resolve(input.root);
  const config = (input.config ?? {}) as PolicyConfig;
  const context: RuleContext = { root, config, inputs: input.inputs, changedFiles: input.changedFiles };
  const diagnostics: PolicyDiagnostic[] = [];
  for (const module of ruleModules) {
    const options = ruleOptions(config, module.id, !['readme', 'docs-impact', 'image-manifest'].includes(module.id));
    if (!options) continue;
    try { diagnostics.push(...await module.check(context, options)); }
    catch (error) { diagnostics.push(diagnostic(module.id, '.', error instanceof Error ? error.message : String(error), { severity: 'error' })); }
  }
  if (['source-naming', 'file-length', 'api-client-usage', 'api-error-codes', 'frontend-i18n-copy', 'frontend-error-surfaces'].some(id => ruleOptions(config, id, false))) {
    const { checkTypeScriptRules } = await import('./typescript.rule.js');
    diagnostics.push(...checkTypeScriptRules(context));
  }
  diagnostics.sort((a, b) => (a.path ?? '').localeCompare(b.path ?? '') || (a.line ?? 0) - (b.line ?? 0) || a.ruleId.localeCompare(b.ruleId));
  return { ok: !diagnostics.some(item => item.severity === 'error'), diagnostics };
}
