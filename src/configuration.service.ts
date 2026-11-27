import path from 'node:path';
import type { Distribution, FrameworkConfig, MigrationPlan } from './framework.types.js';
import { contained, digest, fileBytes, jsonText, Refused, relativeName, targetRoot, validateDestinations } from './filesystem.service.js';
import { resolveTestingConfig } from './testing.service.js';

export const CONFIGURATION_ENTRYPOINT = '.stavel-config/stavel.config.json';
export interface ConfigurationOwner { id: string; role: 'product' | 'capability' | 'feature' | 'contract-topic' | 'grouping'; path: string; parent?: string; canonical?: Record<string, string> }
export interface ConfigurationDefinition { id: string; version?: number; required?: boolean; dependencies?: string[]; [key: string]: unknown }
export type ConfigurationCollection = 'artifacts' | 'sections' | 'questions' | 'checks';
export type ConfigurationDefinitions = Partial<Record<ConfigurationCollection, Record<string, ConfigurationDefinition>>>;
export interface ConfigurationAmendment { id: string; collection: ConfigurationCollection; target: string; action: 'add' | 'omit' | 'replace'; value?: ConfigurationDefinition; reason: string; source: string; scope?: string; baseVersion?: number }
export interface ConfigurationDecision { id: string; value: unknown; scope: string; source: string; status: 'accepted' | 'proposed' | 'deferred'; [key: string]: unknown }
export interface ConfigurationScope { id: string; path?: string; configuration: FrameworkConfig; amendments?: ConfigurationAmendment[] }
export interface ConfigurationOrigin { source: string; layer: 'baseline' | 'repository' | 'scope' | 'task' | 'explicit' }
export interface ResolvedRepositoryConfiguration {
  root: string; kind: 'absent' | 'legacy-root' | 'configured-directory' | 'explicit'; config: FrameworkConfig;
  baseline: { id: string; version: number; sha256: string; path?: string; origin?: 'legacy-root' }; baselineProfile: FrameworkConfig;
  provenance: Record<string, ConfigurationOrigin>; inputs: Record<string, string | null>;
  decisions: ConfigurationDecision[]; owners: ConfigurationOwner[]; definitions: ConfigurationDefinitions;
  layout?: { baseline: string; topics: Record<string, string> };
  baselineUpgrade?: { from: ResolvedRepositoryConfiguration['baseline']; to: ResolvedRepositoryConfiguration['baseline']; changes: Array<{ path: string; kind: 'add' | 'remove' | 'update'; before?: unknown; after?: unknown }> };
}
export interface ResolveRepositoryConfigurationOptions { root: string; packagedBaseline: FrameworkConfig; packagedDefinitions?: ConfigurationDefinitions; explicitConfig?: FrameworkConfig; scope?: string; taskAmendments?: ConfigurationAmendment[]; upgradeBaseline?: boolean }
const collections: ConfigurationCollection[] = ['artifacts', 'sections', 'questions', 'checks'];
const profileFields = ['schemaVersion', 'id', 'version', 'documentation', 'source', 'rules', 'testing', 'workflow', 'configuration', 'tooling', 'ignore'];
const topicFields: Record<string, string[]> = { taxonomy: ['documentation'], tooling: ['id', 'version', 'source', 'rules', 'testing', 'tooling', 'ignore', 'configuration'], workflow: ['workflow'], decisions: ['decisions'] };
const object = (value: unknown, source: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Refused(`expected configuration object: ${source}`);
  return value as Record<string, unknown>;
};
const text = (value: unknown, source: string): string => { if (typeof value !== 'string' || !value.trim()) throw new Refused(`expected nonempty configuration text: ${source}`); return value; };
function keys(record: Record<string, unknown>, allowed: string[], source: string): void {
  const unknown = Object.keys(record).filter(key => !allowed.includes(key) || ['__proto__', 'constructor', 'prototype'].includes(key));
  if (unknown.length) throw new Refused(`unsupported configuration fields at ${source}: ${unknown.join(', ')}; explicit mapping is required`);
}
function parsed(bytes: Buffer, source: string): Record<string, unknown> {
  try { return object(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')), source); }
  catch (error) { if (error instanceof Refused) throw error; throw new Refused(`cannot read JSON ${source}: ${(error as Error).message}`); }
}
export function ownConfigurationValue(value: unknown, path: string): { present: boolean; value?: unknown } {
  const pieces = path.split('.'); if (pieces.some(piece => !piece || ['__proto__', 'prototype', 'constructor'].includes(piece))) throw new Refused(`unsafe configuration property path: ${path}`);
  let selected = value;
  for (const piece of pieces) { if (!selected || typeof selected !== 'object' || Array.isArray(selected) || !Object.hasOwn(selected, piece)) return { present: false }; selected = (selected as Record<string, unknown>)[piece]; }
  return { present: true, value: selected };
}
export function configurationDecisionOverrides(decisions: Record<string, unknown>): Partial<FrameworkConfig> {
  const result: Record<string, unknown> = {};
  for (const [id, value] of Object.entries(decisions)) {
    if (!id.startsWith('configuration.') || value === undefined || value && typeof value === 'object' && ['not-applicable', 'deferred'].includes(String((value as { status?: string }).status))) continue;
    const field = id.slice('configuration.'.length); ownConfigurationValue({}, field); const pieces = field.split('.'); let cursor = result;
    for (const key of pieces.slice(0, -1)) { if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) cursor[key] = {}; cursor = cursor[key] as Record<string, unknown>; }
    cursor[pieces.at(-1)!] = structuredClone(value);
  }
  return result;
}
export function mergeConfigurationOverrides(base: FrameworkConfig, override?: Partial<FrameworkConfig>): FrameworkConfig {
  validateProfile(base, 'configuration baseline', false);
  return validateProfile(merge(base, override ?? {}, { source: 'explicit configuration', layer: 'explicit' }, {}) as FrameworkConfig, 'configuration override', false);
}
/** One metadata registry for every adapter; template/body validation stays with artifact rendering. */
export function packagedConfigurationDefinitions(distribution: Distribution): ConfigurationDefinitions {
  const definitions: ConfigurationDefinitions = { artifacts: {}, sections: {}, questions: {} };
  const insert = (collection: 'artifacts' | 'sections' | 'questions', candidate: unknown, source: string, stage?: 'adoption' | 'artifact'): void => {
    const record = object(candidate, source); const id = text(record.id, `${source}.id`);
    if (record.version !== undefined && (!Number.isInteger(record.version) || Number(record.version) < 1) || record.required !== undefined && typeof record.required !== 'boolean') throw new Refused(`invalid packaged definition metadata: ${id}`);
    if (stage) text(record.prompt, `${source}.${id}.prompt`);
    if (stage === 'artifact' && (typeof record.fact !== 'string' || !record.fact.trim() || !Array.isArray(record.requiredFor) || record.requiredFor.some(id => typeof id !== 'string' || !id.trim()))) throw new Refused(`invalid packaged artifact question metadata: ${id}`);
    if (Object.hasOwn(definitions[collection]!, id)) throw new Refused(`duplicate packaged definition: ${collection}.${id} (${source})`);
    definitions[collection]![id] = { ...structuredClone(record), id, version: record.version === undefined ? 1 : record.version as number, ...(stage ? { questionStage: stage } : {}), ...(stage === 'adoption' ? { required: record.required !== false } : {}) };
  };
  const catalogBytes = fileBytes(distribution.root, 'config/artifacts.catalog.json');
  if (catalogBytes) {
    const catalog = parsed(catalogBytes, 'config/artifacts.catalog.json');
    if (catalog.product !== 'stavel' || catalog.schemaVersion !== 1 || !Number.isInteger(catalog.version) || Number(catalog.version) < 1 || !Array.isArray(catalog.artifacts) || !Array.isArray(catalog.sections) || catalog.questions !== undefined && !Array.isArray(catalog.questions)) throw new Refused('unsupported packaged artifact metadata catalog');
    for (const collection of ['artifacts', 'sections', 'questions'] as const) for (const record of catalog[collection] as unknown[] ?? []) insert(collection, record, `config/artifacts.catalog.json#${collection}`, collection === 'questions' ? 'artifact' : undefined);
  }
  for (const question of distribution.questions) insert('questions', question, 'config/decisions.catalog.json#questions', 'adoption');
  // Validate shared identity/version/requirement metadata without importing the
  // artifact service (which depends on planning) or inspecting template bodies.
  return definitionsFor({ schemaVersion: 1, workflow: { definitions } });
}
function mark(value: unknown, prefix: string, origin: ConfigurationOrigin, provenance: Record<string, ConfigurationOrigin>): void {
  provenance[prefix] = origin;
  if (value && typeof value === 'object' && !Array.isArray(value)) for (const [key, child] of Object.entries(value)) mark(child, prefix ? `${prefix}.${key}` : key, origin, provenance);
}
// Object keys are merged only inside the declared profile fields. Arrays replace.
function merge(base: Record<string, unknown>, override: Record<string, unknown>, origin: ConfigurationOrigin, provenance: Record<string, ConfigurationOrigin>, prefix = ''): Record<string, unknown> {
  const result = structuredClone(base);
  for (const [key, value] of Object.entries(override)) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Refused(`unsafe configuration key: ${prefix}.${key}`);
    const name = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) result[key] = merge(result[key] as Record<string, unknown>, value as Record<string, unknown>, origin, provenance, name);
    else { result[key] = structuredClone(value); for (const old of Object.keys(provenance)) if (old.startsWith(`${name}.`)) delete provenance[old]; mark(value, name, origin, provenance); }
  }
  return result;
}
function validateProfile(value: FrameworkConfig, source: string, strict: boolean): FrameworkConfig {
  const record = object(value, source);
  if (record.schemaVersion !== 1) throw new Refused(`unsupported configuration schemaVersion at ${source}; expected 1`);
  if (record.id !== undefined) text(record.id, `${source}.id`);
  if (record.version !== undefined && (!Number.isInteger(record.version) || Number(record.version) < 1)) throw new Refused(`profile version must be a positive integer at ${source}`);
  if (strict) keys(record, profileFields, source);
  for (const field of ['documentation', 'source', 'rules', 'workflow', 'configuration', 'tooling']) if (record[field] !== undefined) object(record[field], `${source}.${field}`);
  const docs = value.documentation;
  if (strict && docs) keys(docs, ['roots', 'naming', 'kinds', 'states', 'audiences', 'defaultAudience', 'metadata', 'archive', 'exceptions', 'templateRoots', 'ownershipRoots', 'owners', 'publication'], `${source}.documentation`);
  if (strict && value.source) keys(value.source, ['roots', 'naming', 'languages', 'roles', 'scopes', 'exceptions', 'maxLines', 'decisions'], `${source}.source`);
  if (strict && value.workflow) keys(value.workflow, ['stories', 'commits', 'review', 'definitions', 'amendments', 'scopes', 'workRegistry', 'work', 'status', 'packets', 'modes', 'phases'], `${source}.workflow`);
  if (docs?.roots !== undefined && (!Array.isArray(docs.roots) || !docs.roots.length || docs.roots.some(root => typeof root !== 'string'))) throw new Refused(`documentation roots must be a nonempty array at ${source}`);
  for (const root of docs?.roots ?? []) relativeName(root);
  if (docs?.naming && (!['plain', 'typed'].includes(docs.naming.shape) || !['camel', 'snake', 'kebab', 'pascal', 'any'].includes(docs.naming.identifierCase))) throw new Refused(`unsupported documentation naming at ${source}`);
  if (value.testing !== undefined) resolveTestingConfig(value.testing);
  const sourceConfig = value.source;
  if (sourceConfig?.roots !== undefined) { if (!Array.isArray(sourceConfig.roots)) throw new Refused(`source roots must be an array at ${source}`); for (const root of sourceConfig.roots) relativeName(root); }
  if (sourceConfig?.scopes !== undefined) for (const [scope, record] of Object.entries(object(sourceConfig.scopes, `${source}.source.scopes`))) { relativeName(scope); const convention = object(record, `${source}.source.scopes.${scope}`); keys(convention, ['language', 'naming', 'roles', 'rules'], `source scope ${scope}`); if (convention.language !== undefined && (typeof convention.language !== 'string' || !/^[a-z][a-z0-9+#-]*$/i.test(convention.language))) throw new Refused(`invalid source scope language: ${scope}`); }
  const stories = value.workflow?.stories;
  if (stories !== undefined) {
    keys(object(stories, `${source}.workflow.stories`), ['generation', 'template'], source);
    if (!['ask', 'always', 'never'].includes(stories.generation) || typeof stories.template !== 'string' || !stories.template.endsWith('.md')) throw new Refused(`invalid story policy at ${source}`);
    relativeName(stories.template);
  }
  const commits = value.workflow?.commits;
  if (commits !== undefined) {
    const record = object(commits, `${source}.workflow.commits`);
    if (!['conventional', 'repository', 'custom', 'none'].includes(String(record.convention))) throw new Refused(`unsupported commit convention at ${source}`);
    if (record.types !== undefined && (!Array.isArray(record.types) || !record.types.length || record.types.some(type => typeof type !== 'string' || !type.trim()))) throw new Refused(`commit types must be nonempty strings at ${source}`);
    if (record.requireScope !== undefined && typeof record.requireScope !== 'boolean') throw new Refused(`commit requireScope must be boolean at ${source}`);
    if (record.format !== undefined && (typeof record.format !== 'string' || !record.format.trim())) throw new Refused(`custom commit format must be text at ${source}`);
  }
  if (value.workflow?.review !== undefined) {
    const review = object(value.workflow.review, `${source}.workflow.review`); keys(review, ['design', 'allowTaskException'], `${source}.workflow.review`);
    if (review.design !== undefined && !['recommended-for-substantial', 'required-for-substantial', 'none'].includes(String(review.design))) throw new Refused(`unsupported design review policy at ${source}`);
    if (review.allowTaskException !== undefined && typeof review.allowTaskException !== 'boolean') throw new Refused(`review allowTaskException must be boolean at ${source}`);
  }
  return structuredClone(value);
}
function ownersFor(config: FrameworkConfig, root: string): ConfigurationOwner[] {
  const candidate = config.documentation?.owners ?? [];
  if (!Array.isArray(candidate)) throw new Refused('documentation.owners must be an array');
  const owners = candidate.map((item, index) => {
    const owner = object(item, `documentation.owners[${index}]`); keys(owner, ['id', 'role', 'path', 'parent', 'canonical'], 'documentation.owners');
    text(owner.id, 'owner.id'); text(owner.path, 'owner.path'); contained(root, owner.path as string);
    if (!['product', 'capability', 'feature', 'contract-topic', 'grouping'].includes(String(owner.role))) throw new Refused(`unsupported owner role: ${owner.id}`);
    if (owner.parent !== undefined) text(owner.parent, 'owner.parent');
    if (owner.canonical !== undefined) for (const [role, reference] of Object.entries(object(owner.canonical, 'owner.canonical'))) { text(role, 'canonical role'); contained(root, text(reference, `owner.canonical.${role}`)); }
    return structuredClone(owner) as unknown as ConfigurationOwner;
  });
  const byId = new Map(owners.map(owner => [owner.id, owner]));
  if (byId.size !== owners.length) throw new Refused('duplicate configuration owner ID');
  for (const owner of owners) {
    const seen = new Set([owner.id]); let parent = owner.parent;
    while (parent) { if (seen.has(parent) || !byId.has(parent)) throw new Refused(`missing or cyclic owner parent: ${owner.id} -> ${parent}`); seen.add(parent); parent = byId.get(parent)!.parent; }
  }
  return owners;
}
function definitionsFor(config: FrameworkConfig): ConfigurationDefinitions {
  const definitions = object(config.workflow?.definitions ?? {}, 'workflow.definitions'); keys(definitions, collections, 'workflow.definitions');
  for (const [collection, records] of Object.entries(definitions)) {
    for (const [id, value] of Object.entries(object(records, `workflow.definitions.${collection}`))) {
      const record = object(value, `${collection}.${id}`);
      if (record.id !== id || !id.trim() || ['__proto__', 'constructor', 'prototype'].includes(id) || record.version !== undefined && (!Number.isInteger(record.version) || Number(record.version) < 1) || record.required !== undefined && typeof record.required !== 'boolean') throw new Refused(`invalid stable definition: ${collection}.${id}`);
      if (record.dependencies !== undefined && (!Array.isArray(record.dependencies) || record.dependencies.some(id => typeof id !== 'string' || !id.trim()))) throw new Refused(`invalid definition dependencies: ${collection}.${id}`);
    }
  }
  return structuredClone(definitions) as ConfigurationDefinitions;
}
function overlayDefinitions(base: ConfigurationDefinitions, selected: ConfigurationDefinitions): ConfigurationDefinitions {
  for (const [collection, records] of Object.entries(selected)) for (const [id, record] of Object.entries(records!)) if (base[collection as ConfigurationCollection]?.[id]?.required && record.required !== true) throw new Refused(`configuration cannot waive required concern: ${collection}.${id}`);
  return merge(base, selected, { source: 'declared definitions', layer: 'repository' }, {}) as ConfigurationDefinitions;
}
function amend(definitions: ConfigurationDefinitions, amendments: unknown, layer: ConfigurationOrigin['layer'], provenance: Record<string, ConfigurationOrigin>, scope?: string): void {
  if (amendments === undefined) return;
  if (!Array.isArray(amendments)) throw new Refused('workflow amendments must be an array');
  const touched = new Set<string>(); const ids = new Set<string>();
  for (const candidate of amendments) {
    const record = object(candidate, 'workflow.amendments'); keys(record, ['id', 'collection', 'target', 'action', 'value', 'reason', 'source', 'scope', 'baseVersion'], 'workflow.amendments');
    const amendment = record as unknown as ConfigurationAmendment;
    text(amendment.id, 'amendment.id'); text(amendment.source, 'amendment.source'); text(amendment.reason, 'amendment.reason'); text(amendment.target, 'amendment.target');
    if (['__proto__', 'constructor', 'prototype'].includes(amendment.target) || amendment.baseVersion !== undefined && (!Number.isInteger(amendment.baseVersion) || amendment.baseVersion < 1)) throw new Refused(`unsafe amendment target or base version: ${amendment.id}`);
    if (!collections.includes(amendment.collection) || !['add', 'omit', 'replace'].includes(amendment.action)) throw new Refused(`unsupported amendment: ${amendment.id}`);
    if (amendment.scope && amendment.scope !== scope) continue;
    const key = `${amendment.collection}.${amendment.target}`;
    if (ids.has(amendment.id) || touched.has(key)) throw new Refused(`conflicting same-scope amendments at ${key}: ${amendment.id}`);
    ids.add(amendment.id); touched.add(key);
    const records = definitions[amendment.collection] ??= {};
    const existing = records[amendment.target];
    if (amendment.action === 'add' ? Boolean(existing) : !existing) throw new Refused(`amendment target ${amendment.action === 'add' ? 'already exists' : 'was removed or is missing'}: ${key}`);
    if (amendment.baseVersion !== undefined && existing?.version !== amendment.baseVersion) throw new Refused(`incompatible amendment base version: ${key}`);
    if (existing?.required && (amendment.action === 'omit' || amendment.value?.required !== true)) throw new Refused(`amendment cannot waive required concern: ${key}`);
    if (amendment.action === 'omit') delete records[amendment.target];
    else { if (!amendment.value || amendment.value.id !== amendment.target) throw new Refused(`amendment value must retain stable target ID: ${key}`); records[amendment.target] = structuredClone(amendment.value); }
    const prefix = `workflow.definitions.${key}`; for (const old of Object.keys(provenance)) if (old.startsWith(`${prefix}.`)) delete provenance[old];
    mark(amendment.action === 'omit' ? undefined : records[amendment.target], prefix, { source: amendment.source, layer }, provenance);
  }
}
function dependencies(definitions: ConfigurationDefinitions): void {
  const ids = new Set(Object.entries(definitions).flatMap(([collection, records]) => Object.keys(records!).map(id => `${collection}.${id}`)));
  const graph = new Map<string, string[]>();
  for (const [collection, records] of Object.entries(definitions)) for (const record of Object.values(records!)) graph.set(`${collection}.${record.id}`, (record.dependencies ?? []).map(dependency => {
    const id = ids.has(`${collection}.${dependency}`) ? `${collection}.${dependency}` : dependency;
    if (!ids.has(id)) throw new Refused(`unmet definition dependency: ${collection}.${record.id} -> ${dependency}`); return id;
  }));
  const done = new Set<string>(); const active = new Set<string>();
  const visit = (id: string): void => { if (active.has(id)) throw new Refused(`cyclic definition dependency: ${id}`); if (done.has(id)) return; active.add(id); for (const dependency of graph.get(id) ?? []) visit(dependency); active.delete(id); done.add(id); };
  for (const id of graph.keys()) visit(id);
}
export function resolveRepositoryConfiguration(options: ResolveRepositoryConfigurationOptions): ResolvedRepositoryConfiguration {
  const root = targetRoot(options.root); const inputs: Record<string, string | null> = {}; const provenance: Record<string, ConfigurationOrigin> = {};
  const read = (name: string, required = false): Buffer | null => { const bytes = fileBytes(root, name); inputs[name] = bytes ? digest(bytes) : null; if (!bytes && required) throw new Refused(`missing configuration input: ${name}`); return bytes; };
  const legacy = read('stavel.config.json'); const entryBytes = read(CONFIGURATION_ENTRYPOINT);
  if (options.upgradeBaseline && (options.explicitConfig || legacy || !entryBytes)) throw new Refused('baseline upgrade requires one configured-directory pin; migrate legacy root configuration first and do not combine an explicit API override');
  let kind: ResolvedRepositoryConfiguration['kind'] = 'absent'; let baselineProfile = structuredClone(options.packagedBaseline); let config: FrameworkConfig; let decisions: ConfigurationDecision[] = [];
  let layout: ResolvedRepositoryConfiguration['layout'];
  let baselineUpgrade: ResolvedRepositoryConfiguration['baselineUpgrade'];
  let baseline: ResolvedRepositoryConfiguration['baseline'] = { id: baselineProfile.id ?? 'default', version: baselineProfile.version ?? 1, sha256: digest(jsonText(baselineProfile)) };
  if (options.explicitConfig) { kind = 'explicit'; config = validateProfile(options.explicitConfig, 'explicit API configuration', false); mark(config, '', { source: 'explicit API configuration', layer: 'explicit' }, provenance); }
  else {
    if (legacy && entryBytes) throw new Refused(`conflicting active configuration homes: stavel.config.json and ${CONFIGURATION_ENTRYPOINT}; use an explicit reviewed migration`);
    if (legacy) { kind = 'legacy-root'; config = validateProfile(parsed(legacy, 'stavel.config.json') as unknown as FrameworkConfig, 'stavel.config.json', false); baselineProfile = structuredClone(config); baseline = { id: config.id ?? 'default', version: config.version ?? 1, sha256: digest(legacy), path: 'stavel.config.json' }; mark(config, '', { source: 'stavel.config.json', layer: 'repository' }, provenance); }
    else if (entryBytes) {
      kind = 'configured-directory'; const entry = parsed(entryBytes, CONFIGURATION_ENTRYPOINT); keys(entry, ['schemaVersion', 'baseline', 'topics'], CONFIGURATION_ENTRYPOINT);
      if (entry.schemaVersion !== 1) throw new Refused('unsupported configuration entrypoint schemaVersion');
      const pinned = object(entry.baseline, 'baseline'); keys(pinned, ['id', 'version', 'path', 'sha256', 'origin'], 'baseline');
      if (pinned.origin !== undefined && pinned.origin !== 'legacy-root') throw new Refused('unsupported pinned baseline origin');
      text(pinned.id, 'baseline.id'); if (!Number.isInteger(pinned.version) || Number(pinned.version) < 1 || typeof pinned.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(pinned.sha256)) throw new Refused('invalid pinned baseline identity or digest');
      const ref = (value: unknown): string => { const local = relativeName(text(value, 'configuration reference')); const name = `${path.posix.dirname(CONFIGURATION_ENTRYPOINT)}/${local}`; contained(root, name); return name; };
      const baselinePath = ref(pinned.path); const bytes = read(baselinePath, true)!;
      if (digest(bytes) !== pinned.sha256) throw new Refused(`pinned baseline checksum mismatch: ${baselinePath}`);
      baselineProfile = validateProfile(parsed(bytes, baselinePath) as unknown as FrameworkConfig, baselinePath, true);
      if ((baselineProfile.id ?? 'default') !== pinned.id || (baselineProfile.version ?? 1) !== pinned.version) throw new Refused(`pinned baseline identity does not match snapshot: ${baselinePath}`);
      baseline = { id: String(pinned.id), version: Number(pinned.version), sha256: pinned.sha256, path: baselinePath, ...(pinned.origin === 'legacy-root' ? { origin: 'legacy-root' as const } : {}) };
      if (options.upgradeBaseline) {
        if (pinned.origin === 'legacy-root') throw new Refused('legacy snapshot has no separable default/override history; review and map its standing choices to a selected baseline before upgrading');
        const previous = baselineProfile; const from = baseline;
        baselineProfile = validateProfile(options.packagedBaseline, 'explicit packaged baseline upgrade', true);
        baseline = { id: baselineProfile.id ?? 'default', version: baselineProfile.version ?? 1, sha256: digest(jsonText(baselineProfile)), path: baselinePath };
        baselineUpgrade = { from, to: baseline, changes: baselineChanges(previous, baselineProfile) };
      }
      config = structuredClone(baselineProfile); mark(config, '', { source: options.upgradeBaseline ? 'explicit packaged baseline upgrade' : baselinePath, layer: 'baseline' }, provenance);
      const topics = object(entry.topics ?? {}, 'topics'); keys(topics, Object.keys(topicFields), 'topics');
      layout = { baseline: String(pinned.path), topics: structuredClone(topics) as Record<string, string> };
      const seen = [baselinePath];
      for (const [topic, reference] of Object.entries(topics)) {
        const name = ref(reference); seen.push(name); const record = parsed(read(name, true)!, name); keys(record, ['schemaVersion', ...topicFields[topic]], name);
        if (record.schemaVersion !== 1) throw new Refused(`unsupported topic schemaVersion: ${name}`);
        if (topic === 'decisions') { if (!Array.isArray(record.decisions)) throw new Refused(`decisions topic requires decisions array: ${name}`); decisions = structuredClone(record.decisions) as ConfigurationDecision[]; }
        else { const { schemaVersion: _schemaVersion, ...fields } = record; config = merge(config, fields, { source: name, layer: 'repository' }, provenance) as FrameworkConfig; }
      }
      validateDestinations(seen); config = validateProfile(config, CONFIGURATION_ENTRYPOINT, true);
    } else { config = validateProfile(baselineProfile, 'packaged baseline', false); mark(config, '', { source: 'packaged baseline', layer: 'baseline' }, provenance); }
  }
  const decisionIds = new Set<string>();
  for (const decision of decisions) { text(decision.id, 'decision.id'); text(decision.scope, 'decision.scope'); text(decision.source, 'decision.source'); if (!['accepted', 'proposed', 'deferred'].includes(decision.status) || decisionIds.has(`${decision.scope}:${decision.id}`)) throw new Refused(`invalid or duplicate configuration decision: ${decision.id}`); decisionIds.add(`${decision.scope}:${decision.id}`); }
  const checkSeeds = Object.fromEntries(Object.entries(config.rules ?? {}).map(([id, value]) => [id, { id, version: 1, ruleId: id, options: value }]));
  let definitions = overlayDefinitions(overlayDefinitions({ checks: checkSeeds }, options.packagedDefinitions ?? {}), definitionsFor(config));
  amend(definitions, config.workflow?.amendments, 'repository', provenance, options.scope);
  const scopes = config.workflow?.scopes ?? [];
  if (!Array.isArray(scopes)) throw new Refused('workflow.scopes must be an array');
  const scopeIds = new Set<string>(); const candidates: ConfigurationScope[] = [];
  for (const value of scopes) { const scope = object(value, 'workflow.scopes') as unknown as ConfigurationScope; keys(scope as unknown as Record<string, unknown>, ['id', 'path', 'configuration', 'amendments'], 'workflow.scopes'); text(scope.id, 'scope.id'); if (scopeIds.has(scope.id)) throw new Refused(`duplicate configuration scope: ${scope.id}`); scopeIds.add(scope.id); if (scope.path) contained(root, scope.path); validateProfile(scope.configuration, `scope ${scope.id}`, true); if (options.scope && (scope.id === options.scope || scope.path && (options.scope === scope.path || options.scope.startsWith(`${scope.path}/`)))) candidates.push(scope); }
  const selected = candidates.sort((a, b) => (b.id === options.scope ? 1e6 : b.path?.length ?? 0) - (a.id === options.scope ? 1e6 : a.path?.length ?? 0));
  if (selected.length > 1 && selected[0].path === selected[1].path) throw new Refused(`ambiguous configuration scope: ${options.scope}`);
  if (selected[0]) { const scope = selected[0]; config = merge(config, scope.configuration, { source: `scope:${scope.id}`, layer: 'scope' }, provenance) as FrameworkConfig; const scopeChecks = Object.fromEntries(Object.entries(scope.configuration.rules ?? {}).map(([id, value]) => [id, { id, version: 1, ruleId: id, options: value }])); definitions = overlayDefinitions(overlayDefinitions(definitions, { checks: scopeChecks }), definitionsFor(scope.configuration)); amend(definitions, scope.amendments, 'scope', provenance, options.scope); }
  amend(definitions, options.taskAmendments, 'task', provenance, options.scope); dependencies(definitions);
  return { root, kind, config, baseline, baselineProfile, provenance, inputs, decisions, owners: ownersFor(config, root), definitions, ...(layout ? { layout } : {}), ...(baselineUpgrade ? { baselineUpgrade } : {}) };
}

function baselineChanges(before: unknown, after: unknown, prefix = ''): NonNullable<ResolvedRepositoryConfiguration['baselineUpgrade']>['changes'] {
  if (jsonText(before) === jsonText(after)) return [];
  const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
  if (isRecord(before) && isRecord(after)) return [...new Set([...Object.keys(before), ...Object.keys(after)])].sort().flatMap(key => baselineChanges(before[key], after[key], prefix ? `${prefix}.${key}` : key));
  return [{ path: prefix, kind: before === undefined ? 'add' : after === undefined ? 'remove' : 'update', ...(before !== undefined ? { before: structuredClone(before) } : {}), ...(after !== undefined ? { after: structuredClone(after) } : {}) }];
}

/** Serialize only policy. Editable template bodies and runtime journals keep their owners. */
function configurationDifference(base: unknown, selected: unknown, declared?: unknown): unknown {
  if (selected === undefined) return declared === undefined ? undefined : structuredClone(declared);
  if (declared === undefined && jsonText(base) === jsonText(selected)) return undefined;
  if (selected && typeof selected === 'object' && !Array.isArray(selected)) {
    const inherited = base && typeof base === 'object' && !Array.isArray(base) ? base as Record<string, unknown> : {};
    const explicit = declared && typeof declared === 'object' && !Array.isArray(declared) ? declared as Record<string, unknown> : {};
    const entries = [...new Set([...Object.keys(selected), ...Object.keys(explicit)])].map(key => [key, configurationDifference(inherited[key], (selected as Record<string, unknown>)[key], explicit[key])] as const).filter(([, value]) => value !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return structuredClone(selected);
}
export function directoryConfigurationFiles(options: { config: FrameworkConfig; baseline: FrameworkConfig; decisions?: ConfigurationDecision[]; previous?: ResolvedRepositoryConfiguration; explicit?: FrameworkConfig }): Record<string, Buffer> {
  const config = validateProfile(options.config, 'directory migration', true); const baseline = validateProfile(options.baseline, 'directory baseline', true);
  const baselinePath = options.previous?.layout?.baseline ?? 'baseline.profile.json';
  const existing = options.previous?.kind === 'configured-directory' ? fileBytes(options.previous.root, `.stavel-config/${relativeName(baselinePath)}`) : null;
  const sameBaseline = Boolean(existing && jsonText(parsed(existing, baselinePath)) === jsonText(baseline));
  const snapshot = existing && sameBaseline ? existing : Buffer.from(jsonText(baseline)); const topics: Record<string, string> = {}; const files: Record<string, Buffer> = { [`.stavel-config/${relativeName(baselinePath)}`]: snapshot };
  const declared: Record<string, unknown> = structuredClone(options.explicit ?? {});
  if (!options.previous || options.previous.kind === 'absent') for (const decision of options.decisions ?? []) {
    if (decision.origin !== 'explicit-answer' || !decision.id.startsWith('configuration.')) continue;
    const pieces = decision.id.slice('configuration.'.length).split('.'); ownConfigurationValue({}, pieces.join('.'));
    let cursor = declared;
    for (const key of pieces.slice(0, -1)) { if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) cursor[key] = {}; cursor = cursor[key] as Record<string, unknown>; }
    cursor[pieces.at(-1)!] ??= structuredClone(decision.declared ?? decision.value);
  }
  for (const [topic, fields] of Object.entries(topicFields)) {
    const priorPath = options.previous?.layout?.topics[topic];
    const priorBytes = priorPath && options.previous ? fileBytes(options.previous.root, `.stavel-config/${relativeName(priorPath)}`) : null;
    const previousFields = priorBytes ? parsed(priorBytes, priorPath!) : {};
    const selectedDeclarations = merge(previousFields, declared, { source: 'declared configuration', layer: 'repository' }, {});
    const records = options.decisions ?? options.previous?.decisions ?? [];
    const values = topic === 'decisions' ? records.length || options.previous?.layout?.topics.decisions ? { decisions: records } : {} : Object.fromEntries(fields.map(field => [field, configurationDifference(baseline[field], config[field], selectedDeclarations[field])] as const).filter(([, value]) => value !== undefined));
    // Retain an already referenced topic as an empty override rather than
    // deleting a repository file as a side effect of compact serialization.
    if (!Object.keys(values).length && !options.previous?.layout?.topics[topic]) continue;
    topics[topic] = relativeName(options.previous?.layout?.topics[topic] ?? `${topic}.config.json`); files[`.stavel-config/${topics[topic]}`] = Buffer.from(jsonText({ schemaVersion: 1, ...values }));
  }
  const legacySnapshot = options.previous?.kind === 'legacy-root' || options.previous?.baseline.origin === 'legacy-root' && sameBaseline;
  files[CONFIGURATION_ENTRYPOINT] = Buffer.from(jsonText({ schemaVersion: 1, baseline: { id: baseline.id ?? 'default', version: baseline.version ?? 1, path: baselinePath, sha256: digest(snapshot), ...(legacySnapshot ? { origin: 'legacy-root' } : {}) }, topics }));
  validateDestinations(Object.keys(files));
  return files;
}

/** Resolve the policy bytes in a preview without applying it or losing final path mappings. */
export function plannedRepositoryConfiguration(plan: MigrationPlan, fallback: FrameworkConfig): FrameworkConfig {
  const bytes = (name: string): Buffer | null => {
    const operation = plan.operations.find(operation => operation.path === name);
    if (!operation) return fileBytes(plan.root, name);
    if (operation.kind === 'delete') return null;
    if (!operation.content) throw new Refused(`configuration operation is missing content: ${name}`);
    const content = Buffer.from(operation.content, 'base64'); if (digest(content) !== operation.afterHash) throw new Refused(`configuration operation content changed: ${name}`); return content;
  };
  const legacy = bytes('stavel.config.json'); if (legacy) return validateProfile(parsed(legacy, 'planned root configuration') as unknown as FrameworkConfig, 'planned root configuration', false);
  const entryBytes = bytes(CONFIGURATION_ENTRYPOINT); if (!entryBytes) return structuredClone(fallback);
  const entry = parsed(entryBytes, CONFIGURATION_ENTRYPOINT); const pinned = object(entry.baseline, 'planned baseline');
  const snapshot = bytes(`.stavel-config/${relativeName(String(pinned.path))}`); if (!snapshot || digest(snapshot) !== pinned.sha256) throw new Refused('planned baseline checksum mismatch');
  let config = parsed(snapshot, 'planned baseline');
  for (const [topic, ref] of Object.entries(object(entry.topics, 'planned topics'))) {
    if (topic === 'decisions') continue;
    const content = bytes(`.stavel-config/${relativeName(String(ref))}`); if (!content) throw new Refused(`planned topic is missing: ${ref}`);
    const { schemaVersion: _version, ...fields } = parsed(content, String(ref)); config = merge(config, fields, { source: `planned:${ref}`, layer: 'repository' }, {});
  }
  return validateProfile(config as FrameworkConfig, 'planned directory configuration', true);
}
