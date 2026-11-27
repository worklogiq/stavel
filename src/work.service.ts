import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { FrameworkConfig } from './framework.types.js';
import { contained, digest, fileBytes, fileHash, jsonText, posix, Refused, relativeName, targetRoot, validateDestinations } from './filesystem.service.js';

export interface WorkOptions {
  target: string;
  registryFile?: string;
  runtimeDirectory?: string;
  modes?: string[];
  phases?: string[];
  statuses?: string[];
  now?: string;
}
export interface WorkSource { path: string; sha256: string | null; schemaVersion?: number }
export interface WorkItem extends Record<string, unknown> { id: string; title: string; status: string; phase: string; mode: string; implementationStatus: string; record: string; nextAction: string; blockers: string[]; history?: unknown[] }
export interface WorkCapability extends Record<string, unknown> { schemaVersion: number; capabilityId: string; title: string; owner: string; updated: string; items: WorkItem[] }
export interface WorkRegistry { schemaVersion: number; capabilities: Array<{ id: string; statusFile: string }> }
export interface WorkReport {
  state: 'ready' | 'empty' | 'missing' | 'invalid' | 'migration-needed';
  target: string;
  registryFile: string;
  registry?: WorkRegistry;
  capabilities: Array<{ sourceFile: string; record: WorkCapability }>;
  items: Array<{ capabilityId: string; sourceFile: string; item: WorkItem }>;
  sources: WorkSource[];
  issues: string[];
}
export interface WorkChange { path: string; beforeHash: string | null; afterHash: string; content: string }
export interface WorkPlan {
  schemaVersion: 1;
  kind: 'stavel-work-plan';
  id: string;
  target: string;
  registryFile: string;
  runtimeDirectory: string;
  operation: 'create' | 'update' | 'migrate';
  mechanism: 'deterministic';
  warnings: string[];
  sources: WorkSource[];
  changes: WorkChange[];
}
export interface WorkApplyResult { ok: true; changed: number; dryRun: boolean; recovered?: boolean; journal?: string }
export interface WorkCreateInput { capabilityId: string; statusFile: string; title: string; owner: string; item?: WorkItem }
export interface WorkUpdateInput { capabilityId: string; itemId: string; changes: Record<string, unknown>; add?: boolean; closureEvidence?: string[] }
export interface WorkComposition { inputs: Record<string, string | null>; changes: Array<{ path: string; content: string | Buffer; reason: string }> }
type ProjectedWorkFiles = Record<string, string | Buffer>;

const defaultModes = ['IDEA', 'EXPLORE', 'EXPERIMENT', 'DESIGN', 'PLAN', 'EXECUTE', 'VIBE', 'STRICT', 'REVIEW', 'CLOSE'];
const defaultPhases = ['exploration', 'experiment', 'design', 'planning', 'slice-planning', 'implementation', 'verification', 'closure', 'closed'];
const defaultStatuses = ['planned', 'active', 'paused', 'blocked', 'completed', 'cancelled'];
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
function text(value: unknown, label: string): asserts value is string { if (typeof value !== 'string' || !value.trim()) throw new Refused(`${label}: expected nonempty text`); }
function identity(value: unknown, label: string): asserts value is string { text(value, label); if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) throw new Refused(`${label}: invalid stable identity`); }
/** Resolve already-selected repository work policy; explicit vocabulary arrays replace defaults. */
export function workOptionsForConfiguration(target: string, config: FrameworkConfig): WorkOptions {
  const workflow = config.workflow;
  const work = workflow?.work;
  if (work !== undefined && !plain(work)) throw new Refused('workflow.work must be an object');
  const selected = (work ?? {}) as Record<string, unknown>;
  if (Object.keys(selected).some(key => !['registryFile', 'runtimeDirectory', 'modes', 'phases', 'statuses'].includes(key))) throw new Refused('unsupported workflow.work field; explicit mapping is required');
  const currentRegistry = selected.registryFile, legacyRegistry = workflow?.workRegistry;
  if (currentRegistry !== undefined) text(currentRegistry, 'workflow.work.registryFile');
  if (legacyRegistry !== undefined) text(legacyRegistry, 'workflow.workRegistry');
  if (currentRegistry !== undefined && legacyRegistry !== undefined && currentRegistry !== legacyRegistry) throw new Refused('conflicting work registry routes: workflow.work.registryFile and workflow.workRegistry');
  const result: WorkOptions = { target, registryFile: (currentRegistry ?? legacyRegistry ?? `${config.documentation?.roots?.[0] ?? 'docs/internal'}/work-index.json`) as string };
  if (selected.runtimeDirectory !== undefined) { text(selected.runtimeDirectory, 'workflow.work.runtimeDirectory'); result.runtimeDirectory = selected.runtimeDirectory; }
  const vocabulary = (value: unknown, label: string): string[] | undefined => {
    if (value === undefined) return undefined;
    if (!Array.isArray(value) || !value.length || value.some(item => typeof item !== 'string' || !item.trim()) || new Set(value).size !== value.length) throw new Refused(`${label} must be a nonempty array of distinct vocabulary strings`);
    return [...value];
  };
  for (const key of ['modes', 'phases', 'statuses'] as const) {
    const local = vocabulary(selected[key], `workflow.work.${key}`), shared = key === 'statuses' ? undefined : vocabulary(workflow?.[key], `workflow.${key}`);
    if (local && shared && jsonText([...local].sort()) !== jsonText([...shared].sort())) throw new Refused(`conflicting work vocabulary: workflow.work.${key} and workflow.${key}`);
    if (local ?? shared) result[key] = local ?? shared;
  }
  const canonical = settings(result);
  return { ...result, target: canonical.target, registryFile: canonical.registryFile, ...(result.runtimeDirectory ? { runtimeDirectory: canonical.runtimeDirectory } : {}) };
}
function settings(options: WorkOptions) {
  const target = targetRoot(options.target);
  const registryFile = relativeName(options.registryFile ?? 'docs/internal/work-index.json');
  const runtimeDirectory = relativeName(options.runtimeDirectory ?? '.stavel/runtime/work');
  contained(target, registryFile); contained(target, runtimeDirectory);
  if (registryFile === runtimeDirectory || registryFile.startsWith(`${runtimeDirectory}/`) || registryFile.startsWith('.stavel/runtime/')) throw new Refused('work registry must be separate from runtime lock/journal state');
  return { target, registryFile, runtimeDirectory };
}
function resolveReference(target: string, sourceFile: string, reference: string): string {
  return ownerReference(target, sourceFile, reference);
}
function ownerReference(target: string, sourceFile: string, reference: string): string {
  text(reference, `${sourceFile} reference`);
  const file = reference.split('#')[0]!;
  if (!file || path.win32.isAbsolute(file) || /^[\\/]/.test(file) || /[:\0\r\n]/.test(file)) throw new Refused(`${sourceFile}: invalid owning-record reference: ${reference}`);
  const result = posix(path.relative(target, path.resolve(path.dirname(contained(target, sourceFile)), file)));
  contained(target, result); return result;
}
function parse(bytes: Buffer, name: string): Record<string, unknown> {
  try { const value: unknown = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')); if (!plain(value)) throw new Error('expected object'); return value; }
  catch (error) { throw new Refused(`${name}: invalid JSON: ${(error as Error).message}`); }
}
function version(value: Record<string, unknown>, name: string): 1 | 2 {
  if (value.schemaVersion !== 1 && value.schemaVersion !== 2) throw new Refused(`${name}: unsupported work schema version ${String(value.schemaVersion)}`);
  return value.schemaVersion;
}
function registry(value: Record<string, unknown>, name: string): WorkRegistry {
  version(value, name);
  if (Object.keys(value).some(key => !['schemaVersion', 'capabilities'].includes(key))) throw new Refused(`${name}: registry is pointer-only; unsupported cached/unknown field`);
  if (!Array.isArray(value.capabilities)) throw new Refused(`${name}: capabilities must be an array`);
  const ids = new Set<string>(); const files = new Set<string>();
  for (const entry of value.capabilities) {
    if (!plain(entry) || Object.keys(entry).some(key => !['id', 'statusFile'].includes(key))) throw new Refused(`${name}: registration must contain id/statusFile only`);
    identity(entry.id, `${name} capability id`); text(entry.statusFile, `${name} statusFile`);
    const key = entry.id.toLowerCase(); const file = entry.statusFile.normalize('NFC').toLowerCase();
    if (ids.has(key) || files.has(file)) throw new Refused(`${name}: duplicate capability identity or status file`);
    ids.add(key); files.add(file);
  }
  return value as unknown as WorkRegistry;
}
function validateItem(item: unknown, name: string, options: WorkOptions, schemaVersion: number): asserts item is WorkItem {
  if (!plain(item)) throw new Refused(`${name}: work item must be an object`);
  identity(item.id, `${name} item id`);
  for (const field of ['title', 'status', 'phase', 'mode', 'implementationStatus', 'record', 'nextAction']) text(item[field], `${name} ${field}`);
  if (!(options.statuses ?? defaultStatuses).includes(item.status as string)) throw new Refused(`${name}: unconfigured status ${item.status}`);
  if (!(options.phases ?? defaultPhases).includes(item.phase as string)) throw new Refused(`${name}: unconfigured phase ${item.phase}`);
  if (!(options.modes ?? defaultModes).includes(item.mode as string)) throw new Refused(`${name}: unconfigured mode ${item.mode}`);
  if (!Array.isArray(item.blockers) || item.blockers.some(blocker => typeof blocker !== 'string')) throw new Refused(`${name}: blockers must be a text array`);
  if ((schemaVersion === 2 || item.history !== undefined) && !Array.isArray(item.history)) throw new Refused(`${name}: history must be an array`);
  if (item.tracker !== undefined) text(item.tracker, `${name} tracker`);
}
function capability(value: Record<string, unknown>, name: string, id: string, options: WorkOptions): WorkCapability {
  const schemaVersion = version(value, name);
  identity(value.capabilityId, `${name} capabilityId`);
  if (value.capabilityId !== id) throw new Refused(`${name}: capability identity differs from registry: ${id}`);
  for (const field of ['title', 'owner', 'updated']) text(value[field], `${name} ${field}`);
  if (!Array.isArray(value.items)) throw new Refused(`${name}: items must be an array`);
  const ids = new Set<string>();
  for (const item of value.items) {
    validateItem(item, name, options, schemaVersion);
    if (ids.has(item.id.toLowerCase())) throw new Refused(`${name}: duplicate item identity ${item.id}`);
    ids.add(item.id.toLowerCase());
  }
  return value as unknown as WorkCapability;
}

/** Read actual owners; invalid/unavailable sources never become a successful empty list. */
export function readWork(options: WorkOptions): WorkReport {
  const { target, registryFile } = settings(options);
  const report: WorkReport = { state: 'invalid', target, registryFile, capabilities: [], items: [], sources: [], issues: [] };
  try {
    const bytes = fileBytes(target, registryFile);
    report.sources.push({ path: registryFile, sha256: bytes ? digest(bytes) : null });
    if (!bytes) { report.state = 'missing'; report.issues.push(`${registryFile}: work registry is unavailable`); return report; }
    const value = registry(parse(bytes, registryFile), registryFile); report.registry = value;
    report.sources[0]!.schemaVersion = value.schemaVersion;
    const registeredFiles = new Set<string>();
    for (const entry of value.capabilities) {
      const name = resolveReference(target, registryFile, entry.statusFile);
      const key = name.normalize('NFC').toLowerCase();
      if (registeredFiles.has(key)) throw new Refused(`${registryFile}: duplicate resolved capability source: ${name}`);
      registeredFiles.add(key);
      const capBytes = fileBytes(target, name); report.sources.push({ path: name, sha256: capBytes ? digest(capBytes) : null });
      if (!capBytes) throw new Refused(`${name}: registered capability source is unavailable`);
      const record = capability(parse(capBytes, name), name, entry.id, options);
      report.sources.at(-1)!.schemaVersion = record.schemaVersion;
      report.capabilities.push({ sourceFile: name, record });
      for (const item of record.items) {
        for (const field of ['record', 'tracker']) {
          if (item[field] === undefined) continue;
          const reference = ownerReference(target, name, item[field] as string);
          const hash = fileHash(target, reference);
          if (!report.sources.some(source => source.path === reference)) report.sources.push({ path: reference, sha256: hash });
          if (hash === null) throw new Refused(`${name}: ${field} source is unavailable: ${reference}`);
        }
        report.items.push({ capabilityId: entry.id, sourceFile: name, item });
      }
    }
    report.state = value.schemaVersion === 1 || report.capabilities.some(cap => cap.record.schemaVersion === 1) ? 'migration-needed' : report.items.length ? 'ready' : 'empty';
    if (report.state === 'migration-needed') report.issues.push('work schema version 1 requires explicit work migrate preview/apply before mutation');
  } catch (error) { report.issues.push((error as Error).message); report.state = 'invalid'; }
  return report;
}
function readable(options: WorkOptions, old = false): WorkReport {
  const report = readWork(options);
  if (report.state === 'invalid' || report.state === 'missing' || (!old && report.state === 'migration-needed')) throw new Refused(report.issues.join('; '));
  return report;
}
function timestamp(options: WorkOptions): string {
  const value = options.now ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(value))) throw new Refused('work timestamp must be an ISO-compatible date'); return value;
}
function change(target: string, name: string, value: unknown): WorkChange | undefined {
  const content = jsonText(value); const beforeHash = fileHash(target, name); const afterHash = digest(content);
  return beforeHash === afterHash ? undefined : { path: name, beforeHash, afterHash, content };
}
function plan(options: WorkOptions, operation: WorkPlan['operation'], sources: WorkSource[], changes: Array<WorkChange | undefined>): WorkPlan {
  const base = { schemaVersion: 1 as const, kind: 'stavel-work-plan' as const, ...settings(options), operation, mechanism: 'deterministic' as const, warnings: [] as string[], sources, changes: changes.filter((item): item is WorkChange => !!item) };
  validateDestinations(base.changes.map(item => item.path));
  for (const item of base.changes) if (!base.sources.some(source => source.path === item.path)) base.sources.push({ path: item.path, sha256: item.beforeHash });
  for (const entry of base.changes) {
    const value = JSON.parse(entry.content) as Record<string, unknown>;
    if (Array.isArray(value.items)) for (const item of value.items as WorkItem[]) for (const field of ['record', 'tracker']) if (item[field] !== undefined) {
      const name = ownerReference(base.target, entry.path, item[field] as string);
      if (!base.sources.some(source => source.path === name)) base.sources.push({ path: name, sha256: fileHash(base.target, name) });
    }
  }
  return { ...base, id: digest(jsonText(base)) };
}

/** statusFile is relative to the registry, while item record/tracker paths are relative to the capability file. */
export function planWorkCreate(options: WorkOptions, input: WorkCreateInput): WorkPlan {
  return createWorkPlan(options, input);
}
function createWorkPlan(options: WorkOptions, input: WorkCreateInput, projected?: ProjectedWorkFiles): WorkPlan {
  const { target, registryFile, runtimeDirectory } = settings(options);
  identity(input.capabilityId, 'capabilityId'); text(input.title, 'title'); text(input.owner, 'owner');
  const report = readWork(options);
  if (!['missing', 'empty', 'ready'].includes(report.state)) throw new Refused(report.issues.join('; '));
  const current = report.registry ?? { schemaVersion: 2, capabilities: [] };
  const name = resolveReference(target, registryFile, input.statusFile);
  if (name === registryFile || name === runtimeDirectory || name.startsWith(`${runtimeDirectory}/`) || name.startsWith('.stavel/runtime/')) throw new Refused('capability record collides with registry/runtime state');
  const registered = current.capabilities.find(entry => entry.id.toLowerCase() === input.capabilityId.toLowerCase());
  const existing = report.capabilities.find(entry => entry.sourceFile === name);
  if (registered) {
    if (registered.id !== input.capabilityId || registered.statusFile !== input.statusFile || !existing || existing.record.title !== input.title || existing.record.owner !== input.owner) throw new Refused('capability registration conflicts with existing data');
    if (input.item) {
      const existingItem = existing.record.items.find(item => item.id === input.item!.id);
      const { history: _history, ...requested } = input.item;
      if (existingItem && Object.entries(requested).every(([key, value]) => jsonText(existingItem[key]) === jsonText(value))) return plan(options, 'create', report.sources, []);
      if (existingItem) throw new Refused('work item creation conflicts with existing data; use explicit update');
      if (input.item.history?.length) throw new Refused('new work cannot import history through create; use supported migration');
      return updateWorkPlan(options, { capabilityId: input.capabilityId, itemId: input.item.id, changes: requested, add: true }, projected);
    }
    return plan(options, 'create', report.sources, []);
  }
  if (current.capabilities.some(entry => resolveReference(target, registryFile, entry.statusFile).toLowerCase() === name.toLowerCase()) || fileBytes(target, name)) throw new Refused(`capability destination already exists or is registered: ${name}`);
  const record: WorkCapability = { schemaVersion: 2, capabilityId: input.capabilityId, title: input.title, owner: input.owner, updated: timestamp(options), items: [] };
  if (input.item) { const item = structuredClone(input.item); item.history ??= []; validateItem(item, name, options, 2); if (item.status === 'completed') throw new Refused('new work cannot be created completed; use verified closure'); validateReferences(target, name, item, projected); record.items.push(item); }
  const next: WorkRegistry = { schemaVersion: 2, capabilities: [...current.capabilities, { id: input.capabilityId, statusFile: posix(input.statusFile) }] };
  registry(next as unknown as Record<string, unknown>, registryFile);
  return plan(options, 'create', report.sources, [change(target, name, record), change(target, registryFile, next)]);
}
function validateReferences(target: string, sourceFile: string, item: WorkItem, projected?: ProjectedWorkFiles): void {
  for (const field of ['record', 'tracker']) if (item[field] !== undefined) {
    const name = ownerReference(target, sourceFile, item[field] as string);
    if (!projected || !Object.hasOwn(projected, name)) { if (fileHash(target, name) === null) throw new Refused(`${sourceFile}: ${field} source is unavailable`); }
  }
}
export function planWorkUpdate(options: WorkOptions, input: WorkUpdateInput): WorkPlan {
  return updateWorkPlan(options, input);
}
function updateWorkPlan(options: WorkOptions, input: WorkUpdateInput, projected?: ProjectedWorkFiles): WorkPlan {
  const report = readable(options); identity(input.itemId, 'itemId');
  const cap = report.capabilities.find(entry => entry.record.capabilityId === input.capabilityId);
  if (!cap) throw new Refused(`unregistered capability: ${input.capabilityId}`);
  if (!plain(input.changes)) throw new Refused('work changes must be an object');
  for (const key of ['schemaVersion', 'capabilityId', 'history']) if (key in input.changes) throw new Refused(`work update cannot replace ${key}`);
  if ('id' in input.changes && input.changes.id !== input.itemId) throw new Refused('work update cannot change stable item identity');
  const record = structuredClone(cap.record); const existing = record.items.find(item => item.id === input.itemId);
  if (!existing && record.items.some(item => item.id.toLowerCase() === input.itemId.toLowerCase())) throw new Refused(`duplicate case-insensitive work item identity: ${input.itemId}`);
  if (!existing && !input.add) throw new Refused(`unknown work item: ${input.itemId}`);
  const next = { ...(existing ?? { id: input.itemId, history: [] }), ...structuredClone(input.changes) } as WorkItem;
  validateItem(next, cap.sourceFile, options, 2); validateReferences(report.target, cap.sourceFile, next, projected);
  if (jsonText(next) === jsonText(existing)) return plan(options, 'update', report.sources, []);
  if (next.status === 'completed' && existing?.status !== 'completed') {
    if (!input.closureEvidence?.length) throw new Refused('work completion requires explicit verified closure evidence; setting status is not verification');
    for (const reference of input.closureEvidence) if (fileHash(report.target, ownerReference(report.target, cap.sourceFile, reference)) === null) throw new Refused(`closure evidence is unavailable: ${reference}`);
    for (const reference of input.closureEvidence) {
      const name = ownerReference(report.target, cap.sourceFile, reference);
      if (!report.sources.some(source => source.path === name)) report.sources.push({ path: name, sha256: fileHash(report.target, name) });
    }
  }
  const at = timestamp(options);
  next.history = [...(existing?.history ?? []), { at, operation: existing ? 'update' : 'create', changes: structuredClone(input.changes), ...(input.closureEvidence ? { closureEvidence: [...input.closureEvidence], semanticAcceptance: 'caller-reviewed' } : {}) }];
  record.items = existing ? record.items.map(item => item.id === input.itemId ? next : item) : [...record.items, next]; record.updated = at;
  capability(record, cap.sourceFile, input.capabilityId, options);
  return plan(options, 'update', report.sources, [change(report.target, cap.sourceFile, record)]);
}

/** Compose new referenced files and work registration into one outer migration plan; never apply the work subset independently. */
export function composeWorkCreate(options: WorkOptions, input: WorkCreateInput, projectedFiles: ProjectedWorkFiles): WorkComposition {
  if (!plain(projectedFiles)) throw new Refused('projected work files must be a path/content mapping');
  const { target, registryFile, runtimeDirectory } = settings(options);
  const names = Object.keys(projectedFiles); validateDestinations(names);
  for (const name of names) {
    const content = projectedFiles[name]; relativeName(name); contained(target, name);
    if (typeof content !== 'string' && !Buffer.isBuffer(content) || !Buffer.byteLength(content)) throw new Refused(`projected work file must have nonempty text or bytes: ${name}`);
    if (name === registryFile || name === runtimeDirectory || name.startsWith(`${runtimeDirectory}/`) || name.startsWith('.stavel/')) throw new Refused(`projected reference cannot replace work authority/runtime state: ${name}`);
    if (fileHash(target, name) !== null) throw new Refused(`projected work file already exists; explicit update required: ${name}`);
  }
  const value = createWorkPlan(options, input, projectedFiles);
  for (const name of names) if (!value.sources.some(source => source.path === name)) throw new Refused(`projected file is not referenced by the composed work item: ${name}`);
  const changes: WorkComposition['changes'] = [
    ...names.map(name => ({ path: name, content: projectedFiles[name], reason: 'create the explicitly projected work reference in the same checked operation' })),
    ...value.changes.map(entry => ({ path: entry.path, content: entry.content, reason: `compose validated work ${value.operation}` })),
  ];
  validateDestinations(changes.map(entry => entry.path));
  return { inputs: Object.fromEntries(value.sources.map(source => [source.path, source.sha256])), changes };
}

/** The only supported conversion is schema 1 -> 2. It changes no user-selected state or policy. */
export function planWorkMigration(options: WorkOptions): WorkPlan {
  const report = readable(options, true); const changes: Array<WorkChange | undefined> = [];
  if (report.registry!.schemaVersion === 1) changes.push(change(report.target, report.registryFile, { ...report.registry, schemaVersion: 2 }));
  for (const cap of report.capabilities) if (cap.record.schemaVersion === 1) {
    const at = timestamp(options); const record = structuredClone(cap.record); record.schemaVersion = 2;
    record.items = record.items.map(item => ({ ...item, history: [...(item.history ?? []), { at, operation: 'schema-migration', from: 1, to: 2, mechanism: 'deterministic', description: 'Schema-only conversion; existing decisions, state and history preserved.' }] }));
    changes.push(change(report.target, cap.sourceFile, record));
  }
  return plan(options, 'migrate', report.sources, changes);
}

function validatePlan(value: WorkPlan): void {
  if (!plain(value) || value.schemaVersion !== 1 || value.kind !== 'stavel-work-plan' || !Array.isArray(value.sources) || !Array.isArray(value.changes)) throw new Refused('unsupported work plan');
  if (value.mechanism !== 'deterministic') throw new Refused('agent-assisted or nondeterministic changes require a separate warning and semantic review; this deterministic writer cannot apply them');
  const { id, ...body } = value;
  if (digest(jsonText(body)) !== id) throw new Refused('work plan checksum mismatch');
  if (!['create', 'update', 'migrate'].includes(value.operation) || value.warnings.length) throw new Refused('unsupported work plan effects');
  const config = settings({ target: value.target, registryFile: value.registryFile, runtimeDirectory: value.runtimeDirectory });
  if (config.target !== value.target) throw new Refused('work plan target identity changed');
  validateDestinations(value.sources.map(source => source.path)); validateDestinations(value.changes.map(item => item.path));
  for (const item of value.changes) {
    contained(value.target, item.path);
    if (item.path === value.runtimeDirectory || item.path.startsWith(`${value.runtimeDirectory}/`) || item.path.startsWith('.stavel/runtime/')) throw new Refused('work plan cannot overwrite runtime state');
    if (digest(item.content) !== item.afterHash || !value.sources.some(source => source.path === item.path && source.sha256 === item.beforeHash)) throw new Refused(`work plan transition checksum mismatch: ${item.path}`);
  }
}
function preflight(value: WorkPlan, recovery = false): void {
  validatePlan(value);
  for (const source of value.sources) {
    const current = fileHash(value.target, source.path);
    const after = value.changes.find(item => item.path === source.path)?.afterHash;
    if (current !== source.sha256 && !(recovery && after !== undefined && current === after)) throw new Refused(`stale work source; refusing to overwrite intervening changes: ${source.path}`);
  }
}
/** Bind policy/source inputs to the same immutable preview, refusing stale or conflicting read sets. */
export function bindWorkPlanInputs(value: WorkPlan, inputs: Record<string, string | null>): WorkPlan {
  preflight(value);
  if (!plain(inputs)) throw new Refused('work input read set must be an object');
  const copy = structuredClone(value);
  for (const [name, hash] of Object.entries(inputs)) {
    relativeName(name);
    if (hash !== null && (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash))) throw new Refused(`invalid work policy/source hash: ${name}`);
    const prior = copy.sources.find(source => source.path === name);
    if (prior && prior.sha256 !== hash) throw new Refused(`conflicting work input hash: ${name}`);
    if (fileHash(copy.target, name) !== hash) throw new Refused(`stale work policy/source input: ${name}`);
    if (!prior) copy.sources.push({ path: name, sha256: hash });
  }
  const { id: _id, ...body } = copy; copy.id = digest(jsonText(body)); validatePlan(copy);
  return copy;
}
const runtimeNames = (directory: string) => ({ lock: '.stavel/runtime/writer.lock', journal: `${directory}/journal.json` });
function runTransitions(value: WorkPlan, directory: string): number {
  let changed = 0;
  for (const item of value.changes) {
    if (fileHash(value.target, item.path) === item.afterHash) continue;
    if (fileHash(value.target, item.path) !== item.beforeHash) throw new Refused(`work changed during apply: ${item.path}`);
    const destination = contained(value.target, item.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const temporary = contained(value.target, `${directory}/write-${crypto.randomBytes(8).toString('hex')}.tmp`);
    fs.writeFileSync(temporary, item.content, { flag: 'wx' });
    try {
      if (fileHash(value.target, item.path) !== item.beforeHash) throw new Refused(`work changed during apply: ${item.path}`);
      contained(value.target, item.path); fs.renameSync(temporary, destination); changed++;
    } catch (error) { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); throw error; }
  }
  return changed;
}
/** Explicitly apply an immutable preview. Failures retain lock + journal for explicit recovery. */
export function applyWorkPlan(value: WorkPlan, options: { dryRun?: boolean } = {}): WorkApplyResult {
  preflight(value); const names = runtimeNames(value.runtimeDirectory);
  if (fileBytes(value.target, names.lock) !== null || fileBytes(value.target, names.journal) !== null) throw new Refused('work writer lock/journal already exists; do not steal it; use explicit recovery');
  if (options.dryRun || !value.changes.length) return { ok: true, changed: value.changes.length, dryRun: !!options.dryRun };
  const journal = jsonText({ schemaVersion: 1, plan: value });
  const lock = jsonText({ schemaVersion: 1, planId: value.id, journalSha256: digest(journal), pid: process.pid });
  fs.mkdirSync(contained(value.target, value.runtimeDirectory), { recursive: true });
  const lockPath = contained(value.target, names.lock);
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  try { fs.writeFileSync(lockPath, lock, { flag: 'wx' }); }
  catch (error) { throw new Refused(`cannot acquire work writer lock: ${(error as Error).message}`); }
  let journalSaved = false;
  try {
    preflight(value);
    fs.writeFileSync(contained(value.target, names.journal), journal, { flag: 'wx' }); journalSaved = true;
    const changed = runTransitions(value, value.runtimeDirectory);
    fs.unlinkSync(contained(value.target, names.journal)); fs.unlinkSync(lockPath);
    return { ok: true, changed, dryRun: false };
  } catch (error) {
    if (!journalSaved) fs.unlinkSync(lockPath);
    throw new Refused(`work apply stopped; ${journalSaved ? `partial changes may remain; explicit recovery uses ${names.journal}` : 'no work records were written'}: ${(error as Error).message}`);
  }
}
/** Resume only; recovery refuses tampered journals and any user edits outside recorded before/after states. */
export function recoverWork(options: WorkOptions, controls: { dryRun?: boolean } = {}): WorkApplyResult {
  const config = settings(options); const names = runtimeNames(config.runtimeDirectory);
  const lockBytes = fileBytes(config.target, names.lock); const journalBytes = fileBytes(config.target, names.journal);
  if (!lockBytes || !journalBytes) throw new Refused('work recovery requires the original lock and journal; uncertain locks are never stolen automatically');
  const lock = parse(lockBytes, names.lock); const journal = parse(journalBytes, names.journal);
  if (lock.schemaVersion !== 1 || journal.schemaVersion !== 1 || lock.journalSha256 !== digest(journalBytes)) throw new Refused('work journal checksum mismatch or unsupported recovery format');
  const value = journal.plan as unknown as WorkPlan;
  validatePlan(value);
  if (value.target !== config.target || value.registryFile !== config.registryFile || value.runtimeDirectory !== config.runtimeDirectory || value.id !== lock.planId) throw new Refused('work recovery belongs to another scope or plan');
  // A live cooperating writer owns its lock. A dead process can be resumed; a
  // same-process caller is permitted for explicit synchronous failure recovery.
  if (typeof lock.pid !== 'number' || !Number.isInteger(lock.pid) || lock.pid <= 0) throw new Refused('invalid work writer identity');
  if (lock.pid !== process.pid) {
    try { process.kill(lock.pid, 0); throw new Refused('work writer is still running; concurrent recovery refused'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw new Refused(`cannot prove writer has stopped; recovery refused: ${(error as Error).message}`); }
  }
  preflight(value, true);
  const changed = value.changes.filter(item => fileHash(value.target, item.path) !== item.afterHash).length;
  if (controls.dryRun) return { ok: true, changed, dryRun: true, recovered: true, journal: names.journal };
  const recoveryLock = contained(config.target, '.stavel/runtime/work-recovery.lock');
  try { fs.writeFileSync(recoveryLock, jsonText({ pid: process.pid, planId: value.id }), { flag: 'wx' }); }
  catch (error) { throw new Refused(`cannot acquire exclusive work recovery lock; never steal uncertain recovery state: ${(error as Error).message}`); }
  try {
    if (fileHash(config.target, names.lock) !== digest(lockBytes) || fileHash(config.target, names.journal) !== digest(journalBytes)) throw new Refused('work recovery inputs changed while acquiring recovery lock');
    preflight(value, true);
    runTransitions(value, config.runtimeDirectory); fs.unlinkSync(contained(config.target, names.journal)); fs.unlinkSync(contained(config.target, names.lock));
  } catch (error) { throw new Refused(`work recovery stopped; journal retained: ${(error as Error).message}`); }
  finally { fs.unlinkSync(recoveryLock); }
  return { ok: true, changed, dryRun: false, recovered: true };
}
