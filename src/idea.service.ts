import path from 'node:path';
import crypto from 'node:crypto';
import type { FrameworkConfig, MigrationPlan } from './framework.types.js';
import type { ConfigurationOwner, ResolvedRepositoryConfiguration } from './configuration.service.js';
import { packagedConfigurationDefinitions, resolveRepositoryConfiguration } from './configuration.service.js';
import { locateDistribution } from './distribution.service.js';
import { contained, digest, fileBytes, fileHash, jsonText, posix, Refused, relativeName, targetRoot, walkFiles } from './filesystem.service.js';
import { documentFilename, identifier } from './naming.service.js';
import { composeWorkCreate, readWork, workOptionsForConfiguration } from './work.service.js';
import type { WorkItem, WorkReport } from './work.service.js';
import { mutationPlan } from './effects.service.js';
import { applyPlan } from './migration.service.js';
import { renderArtifactTemplate } from './artifact.service.js';
import { parseMetadata } from '@worklogiq/mdcomposer';

export interface IdeaCaptureOptions {
  root: string; sourceRoot?: string; resolution?: ResolvedRepositoryConfiguration;
  text?: string; title?: string; source?: string; requestId?: string; capabilityId?: string; ownerId?: string; contextPath?: string; now?: string;
}
export interface IdeaQuestion { id: 'text' | 'capability' | 'owner'; prompt: string; options?: Array<{ id: string; path: string; title?: string }> }
export interface IdeaCaptureResult {
  state: 'setup-needed' | 'input-required' | 'preview' | 'existing' | 'captured'; root: string;
  questions: IdeaQuestion[]; reason?: string; id?: string; recordPath?: string; capabilityId?: string; ownerId?: string;
  plan?: MigrationPlan; application?: { ok: true; changed: number; journal?: string };
}
interface IdeaPolicy { directory: string; statusFiles: Record<string, string> }
interface IdeaPayload { schemaVersion: 1; id: string; title: string; originalText: string; source: string; capturedAt: string; capabilityId: string; ownerId: string; requestId?: string }
interface CaptureIdentity { schemaVersion: 1; fingerprint: string; ownerId: string; source: string; capturedAt: string; requestId?: string }
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const safeJSON = (value: unknown): string => JSON.stringify(value, null, 2).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\{\{/g, '\\u007b\\u007b');
const literal = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
const fold = (value: string): string => value.normalize('NFC').toLowerCase();
const fingerprint = (text: string, title: string, source: string): string => digest(jsonText({ originalText: text, title, source }));

function policy(config: FrameworkConfig): IdeaPolicy {
  const modes = config.workflow?.modes;
  if (modes !== undefined) {
    if (!Array.isArray(modes) || modes.some(mode => typeof mode !== 'string' || !mode.trim())) throw new Refused('workflow.modes must be an explicit array of mode names');
    if (!modes.some(mode => mode.trim().toUpperCase() === 'IDEA')) throw new Refused('IDEA is excluded by workflow.modes; explicitly align the preserving mode addition before capture');
  }
  const raw = config.workflow?.ideas;
  if (raw !== undefined && (!plain(raw) || Object.keys(raw).some(key => !['directory', 'statusFiles'].includes(key)))) throw new Refused('workflow.ideas accepts only directory and statusFiles');
  const value = raw as Record<string, unknown> | undefined;
  const directory = value?.directory ?? 'ideas';
  if (typeof directory !== 'string') throw new Refused('workflow.ideas.directory must be an owner-relative directory');
  relativeName(directory);
  const routes = value?.statusFiles ?? {};
  if (!plain(routes)) throw new Refused('workflow.ideas.statusFiles must map capability IDs to repository-relative paths');
  const statusFiles: Record<string, string> = Object.create(null) as Record<string, string>;
  for (const [id, filename] of Object.entries(routes)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id) || typeof filename !== 'string') throw new Refused('invalid workflow.ideas.statusFiles capability/path mapping');
    statusFiles[id] = relativeName(filename);
  }
  return { directory, statusFiles };
}
function optionalText(value: unknown, label: string): string | undefined {
  if (value === undefined) return;
  if (typeof value !== 'string' || !value.trim() || value.includes('\0')) throw new Refused(`${label} must be nonempty text`);
  return value;
}
function slug(value: string): string { return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48).replace(/-$/, '') || 'thought'; }
function inferredTitle(text: string): string {
  const first = text.split(/\r?\n/).find(line => line.trim())!.trim();
  const characters = [...first]; return characters.length > 96 ? characters.slice(0, 93).join('') + '...' : first;
}
function render(payload: IdeaPayload, maintainer: string, recordPath: string, options: IdeaCaptureOptions, resolution: ResolvedRepositoryConfiguration): { content: string; inputs: Record<string, string | null> } {
  if (!resolution.definitions.artifacts?.['artifact.idea']) throw new Refused('IDEA artifact.idea definition is missing or omitted; use a compatible complete package and explicitly aligned idea template');
  const rendered = renderArtifactTemplate({ root: resolution.root, sourceRoot: options.sourceRoot, config: { ...resolution.config, documentation: { ...resolution.config.documentation, defaultAudience: 'internal' } }, definitions: resolution.definitions, artifactId: 'artifact.idea', destination: recordPath, facts: { title: literal(payload.title), owner: literal(maintainer), originalText: literal(payload.originalText), source: literal(payload.source), capturedAt: payload.capturedAt }, alignment: { confirmed: true, instruction: payload.source } });
  const parsedMetadata = parseMetadata(rendered.content);
  if (parsedMetadata.issues.length) throw new Refused(`IDEA template metadata is invalid: ${parsedMetadata.issues.join('; ')}`);
  const metadata = parsedMetadata.data;
  if (rendered.artifact.kind !== 'recon' || metadata.kind !== 'recon' || metadata.state !== 'draft' || metadata.audience !== 'internal') throw new Refused('IDEA template must render draft internal recon metadata; capture does not approve or publish an idea');
  if (/<!--\s*\/?stavel:idea\b/.test(rendered.content)) throw new Refused('IDEA template must leave the literal original-text identity block to the capture operation');
  return { content: `${rendered.content.trimEnd()}\n\n<!-- stavel:idea\n${safeJSON(payload)}\n-->\n`, inputs: rendered.inputs };
}
function sourceName(root: string, statusFile: string, reference: string): string {
  if (typeof reference !== 'string' || !reference || /^[\\/]|^[a-z][a-z0-9+.-]*:/i.test(reference) || /[\0\r\n]/.test(reference)) throw new Refused('invalid original idea record reference');
  const result = path.posix.normalize(path.posix.join(path.posix.dirname(statusFile), reference)); contained(root, result); return result;
}
function existingRequest(root: string, report: WorkReport, requestId: string, originalText: string, title: string, source: string, options: IdeaCaptureOptions): IdeaCaptureResult | undefined {
  const matches = report.items.filter(entry => plain(entry.item.capture) && entry.item.capture.requestId === requestId);
  if (matches.length > 1) throw new Refused('capture request ID is duplicated in work records; resolve its authoritative identity before retrying');
  const match = matches[0]; if (!match) return;
  const capture = match.item.capture as unknown as CaptureIdentity;
  if (capture.schemaVersion !== 1 || typeof capture.fingerprint !== 'string' || typeof capture.ownerId !== 'string') throw new Refused('capture request identity is invalid; do not overwrite it through retry');
  if (options.capabilityId !== undefined && options.capabilityId !== match.capabilityId || options.ownerId !== undefined && options.ownerId !== capture.ownerId) throw new Refused('capture request ID conflicts with the recorded owner; retries do not move existing ideas');
  const recordPath = sourceName(root, match.sourceFile, typeof match.item.sourceIdea === 'string' ? match.item.sourceIdea : match.item.record);
  const bytes = fileBytes(root, recordPath); if (!bytes) throw new Refused(`captured original idea record is unavailable: ${recordPath}`);
  const blocks = [...bytes.toString('utf8').matchAll(/<!-- stavel:idea\r?\n([\s\S]*?)\r?\n-->/g)];
  if (blocks.length !== 1) throw new Refused('captured idea requires one original-text identity block; do not overwrite an ambiguous record');
  let payload: IdeaPayload;
  try { payload = JSON.parse(blocks[0][1]) as IdeaPayload; } catch { throw new Refused('captured original idea identity is invalid JSON'); }
  if (!payload || payload.schemaVersion !== 1 || payload.id !== match.item.id || payload.requestId !== requestId || payload.capabilityId !== match.capabilityId || payload.ownerId !== capture.ownerId || typeof payload.originalText !== 'string' || typeof payload.title !== 'string' || typeof payload.source !== 'string' || fingerprint(payload.originalText, payload.title, payload.source) !== capture.fingerprint || payload.source !== capture.source || payload.capturedAt !== capture.capturedAt) throw new Refused('captured original idea identity changed; an idempotent retry cannot replace it');
  if (payload.originalText !== originalText || options.title !== undefined && payload.title !== title || options.source !== undefined && payload.source !== source) throw new Refused('capture request ID conflicts with the existing original text, title or source');
  return { state: 'existing', root, questions: [], id: match.item.id, recordPath, capabilityId: match.capabilityId, ownerId: capture.ownerId };
}

/** Plan one literal capture and validated work registration. The capture request itself supplies the narrow write authority. */
export function planIdeaCapture(options: IdeaCaptureOptions): IdeaCaptureResult {
  const root = targetRoot(options.root), base = { root, questions: [] as IdeaQuestion[] };
  const distribution = locateDistribution(options.sourceRoot);
  const resolution = options.resolution ?? resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution) });
  if (resolution.root !== root) throw new Refused('idea configuration belongs to a different repository');
  if (resolution.kind === 'absent' || !fileBytes(root, '.stavel-config/stavel.config.json') && !fileBytes(root, 'stavel.config.json')) return { ...base, state: 'setup-needed', reason: 'Adopt the repository configuration before capture; IDEA does not bootstrap a target.' };
  for (const [name, hash] of Object.entries(resolution.inputs)) if (fileHash(root, name) !== hash) throw new Refused(`idea configuration changed since resolution: ${name}`);
  const config = resolution.config, selectedPolicy = policy(config);
  const work = workOptionsForConfiguration(root, config), report = readWork(work);
  if (report.state === 'missing' || report.state === 'migration-needed') return { ...base, state: 'setup-needed', reason: report.issues.join('; ') };
  if (report.state === 'invalid') throw new Refused(`cannot capture into invalid work records: ${report.issues.join('; ')}`);
  if (fileBytes(root, '.stavel/runtime/writer.lock')) throw new Refused('idea capture has an active or uncertain writer; finish explicit journal recovery before retrying');
  if (options.text === undefined || typeof options.text === 'string' && !options.text.trim()) return { ...base, state: 'input-required', questions: [{ id: 'text', prompt: 'What original idea should be captured?' }] };
  if (typeof options.text !== 'string' || options.text.includes('\0')) throw new Refused('idea text must be text without NUL bytes');
  const originalText = options.text;
  const title = optionalText(options.title, 'idea title') ?? inferredTitle(originalText);
  if (/[\r\n]/.test(title)) throw new Refused('idea title must be a single line');
  const source = optionalText(options.source, 'capture source') ?? 'api:explicit-idea-capture';
  const requestId = optionalText(options.requestId, 'capture request ID');
  if (requestId && (requestId.length > 256 || /[\r\n]/.test(requestId))) throw new Refused('capture request ID must be a single line of at most 256 characters');
  optionalText(options.capabilityId, 'capability ID'); optionalText(options.ownerId, 'owner ID');
  const intent = fingerprint(originalText, title, source);
  if (requestId) { const existing = existingRequest(root, report, requestId, originalText, title, source, options); if (existing) return existing; }
  const configured = resolution.owners;
  const owners: ConfigurationOwner[] = [...configured];
  for (const cap of report.capabilities) if (!owners.some(owner => owner.id === cap.record.capabilityId)) owners.push({ id: cap.record.capabilityId, role: 'capability', path: path.posix.dirname(cap.sourceFile) });
  const ownerMap = new Map(owners.map(owner => [owner.id, owner]));
  const capabilities = owners.filter(owner => owner.role === 'capability');
  let selectedOwner: ConfigurationOwner | undefined;
  if (options.ownerId) selectedOwner = ownerMap.get(options.ownerId);
  else if (options.capabilityId) selectedOwner = capabilities.find(owner => owner.id === options.capabilityId);
  else if (options.contextPath) {
    let context = options.contextPath;
    if (path.isAbsolute(context) || path.win32.isAbsolute(context)) context = posix(path.relative(root, context));
    if (context === '') context = '.';
    if (context !== '.') relativeName(context);
    const matches = context === '.' ? [] : owners.filter(owner => ['feature', 'capability'].includes(owner.role) && (context === owner.path || context.startsWith(`${owner.path}/`))).sort((a, b) => b.path.length - a.path.length);
    if (matches.length && (matches.length === 1 || matches[0].path.length !== matches[1].path.length)) selectedOwner = matches[0];
  }
  if (!selectedOwner && !options.ownerId && !options.capabilityId && capabilities.length === 1) selectedOwner = capabilities[0];
  if (!selectedOwner || !['feature', 'capability'].includes(selectedOwner.role)) return { ...base, state: 'input-required', questions: [{ id: options.ownerId ? 'owner' : 'capability', prompt: 'Select an existing configured feature/capability owner for this idea.', options: (options.ownerId ? owners.filter(owner => ['feature', 'capability'].includes(owner.role)) : capabilities).map(owner => ({ id: owner.id, path: owner.path })) }] };
  let capability: ConfigurationOwner | undefined = selectedOwner;
  const seen = new Set<string>();
  while (capability && capability.role !== 'capability') { if (seen.has(capability.id)) throw new Refused('cyclic idea owner ancestry'); seen.add(capability.id); capability = capability.parent ? ownerMap.get(capability.parent) : undefined; }
  if (!capability || options.capabilityId && options.capabilityId !== capability.id) return { ...base, state: 'input-required', questions: [{ id: 'capability', prompt: 'Select a configured capability containing the chosen feature owner.', options: capabilities.map(owner => ({ id: owner.id, path: owner.path })) }] };
  const registered = report.capabilities.find(entry => entry.record.capabilityId === capability!.id);
  const naming = config.documentation?.naming ?? distribution.config.documentation?.naming;
  if (!naming) throw new Refused('IDEA requires a selected documentation filename convention');
  const kinds = config.documentation?.kinds ?? distribution.config.documentation?.kinds;
  if (kinds && !kinds.includes('recon')) throw new Refused('IDEA requires the existing recon document kind; explicitly align the local kind registry before capture');
  const states = config.documentation?.states ?? distribution.config.documentation?.states;
  if (states !== undefined && (!Array.isArray(states) || !states.includes('draft'))) throw new Refused('IDEA requires draft document state; explicitly align the local metadata vocabulary before capture');
  const audiences = config.documentation?.audiences ?? distribution.config.documentation?.audiences;
  if (audiences !== undefined && (!Array.isArray(audiences) || !audiences.includes('internal'))) throw new Refused('IDEA requires internal document audience; explicitly align the local metadata vocabulary before capture');
  const selectedStatus = selectedPolicy.statusFiles[capability.id];
  if (registered && selectedStatus && selectedStatus !== registered.sourceFile) throw new Refused('configured idea status route conflicts with the existing registry; capture never relocates work owners');
  const capStem = identifier(slug(capability.id), naming.identifierCase === 'any' ? naming.generatedIdentifierCase ?? 'kebab' : naming.identifierCase);
  const statusFile = registered?.sourceFile ?? selectedStatus ?? `${capability.path}/${capStem}.status.json`;
  contained(root, statusFile);
  const captureDirectory = `${selectedOwner.path}/${selectedPolicy.directory}`; contained(root, captureDirectory);
  const existingNames = new Set(walkFiles(root, selectedOwner.path).map(fold));
  const existingIds = new Set(report.items.map(entry => fold(entry.item.id)));
  const suffix = requestId ? digest(requestId).slice(0, 12) : crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const stem = `idea-${slug(title)}-${suffix}`;
  let id = stem, recordPath = `${captureDirectory}/${documentFilename(id, 'recon', naming)}`;
  for (let collision = 2; existingIds.has(fold(id)) || existingNames.has(fold(recordPath)) || fileHash(root, recordPath) !== null; collision++) {
    if (collision > 10000) throw new Refused('could not allocate a collision-free idea identity');
    id = `${stem}-${collision}`; recordPath = `${captureDirectory}/${documentFilename(id, 'recon', naming)}`;
  }
  const now = options.now ?? new Date().toISOString();
  if (typeof now !== 'string' || !Number.isFinite(Date.parse(now))) throw new Refused('idea capture timestamp must be an ISO-compatible date');
  const capturedAt = new Date(now).toISOString();
  const maintainer = registered?.record.owner ?? (resolution.decisions.find(decision => decision.id === 'project.owner' && decision.status === 'accepted' && typeof decision.value === 'string')?.value as string | undefined) ?? 'repository-maintainer';
  const payload: IdeaPayload = { schemaVersion: 1, id, title, originalText, source, capturedAt, capabilityId: capability.id, ownerId: selectedOwner.id, ...(requestId ? { requestId } : {}) };
  const capture: CaptureIdentity = { schemaVersion: 1, fingerprint: intent, ownerId: selectedOwner.id, source, capturedAt, ...(requestId ? { requestId } : {}) };
  const recordReference = path.posix.relative(path.posix.dirname(statusFile), recordPath);
  const item: WorkItem = { id, title, workType: 'idea', status: 'planned', phase: 'exploration', mode: 'IDEA', implementationStatus: 'not-started', record: recordReference, sourceIdea: recordReference, nextAction: 'Explore this idea when selected; no design or implementation is approved by capture.', blockers: [], history: [], capture };
  const rendered = render(payload, maintainer, recordPath, options, resolution);
  const composition = composeWorkCreate({ ...work, now: capturedAt }, { capabilityId: capability.id, statusFile: path.posix.relative(path.posix.dirname(work.registryFile!), statusFile), title: registered?.record.title ?? capability.id, owner: maintainer, item }, { [recordPath]: rendered.content });
  for (const change of composition.changes) {
    const name = fold(change.path);
    if (name.startsWith('.git/') || name === '.git' || name.startsWith('.stavel/') || name.startsWith('.stavel-config/') || ['.stavel.json', 'stavel.config.json', 'agents.md', 'package.json'].includes(name) || Object.hasOwn(resolution.inputs, change.path)) throw new Refused(`idea capture cannot overwrite repository/configuration authority: ${change.path}`);
  }
  const inputs: Record<string, string | null> = {};
  for (const readSet of [composition.inputs, resolution.inputs, rendered.inputs]) for (const [name, hash] of Object.entries(readSet)) {
    if (Object.hasOwn(inputs, name) && inputs[name] !== hash) throw new Refused(`idea input changed while composing capture: ${name}`);
    inputs[name] = hash;
  }
  const plan = mutationPlan({ root, alignment: { confirmed: true, instruction: source }, changes: composition.changes, inputs, version: distribution.version });
  return { ...base, state: 'preview', id, recordPath, capabilityId: capability.id, ownerId: selectedOwner.id, plan };
}

/** Apply the exact composed preview through the existing exclusive writer/journal; failures propagate with recovery evidence. */
export function captureIdea(options: IdeaCaptureOptions, controls: { preview?: boolean; dryRun?: boolean; failAfterOperations?: number } = {}): IdeaCaptureResult {
  const result = planIdeaCapture(options);
  if (!result.plan || controls.preview) return result;
  const application = applyPlan(result.plan, { dryRun: controls.dryRun, failAfterOperations: controls.failAfterOperations });
  return { ...result, state: controls.dryRun ? 'preview' : 'captured', application };
}
