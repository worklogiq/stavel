import path from 'node:path';
import fs from 'node:fs';
import type { Alignment, FrameworkConfig, MigrationPlan, NamingConvention } from './framework.types.js';
import { contained, fileBytes, fileHash, digest, jsonText, Refused, relativeName, targetRoot, validateDestinations, walkFiles } from './filesystem.service.js';
import { mutationPlan } from './effects.service.js';
import { documentFilename } from './naming.service.js';
import { headingSlugs, rewriteMarkdownLinks } from './markdown.service.js';
import { extractMarkdownLinks, parseMetadata } from '@worklogiq/mdcomposer';
import { packagedConfigurationDefinitions, resolveRepositoryConfiguration, type ResolvedRepositoryConfiguration } from './configuration.service.js';
import { readWork, workOptionsForConfiguration } from './work.service.js';
import { loadArtifactCatalog, queryArtifacts, renderArtifactTemplate, type ArtifactDefinition } from './artifact.service.js';
import { locateDistribution } from './distribution.service.js';

export interface ExecutionCheck { id: string; state: 'passed' | 'failed' | 'skipped' | 'unavailable'; required: boolean; evidence: string; description?: string }
export interface ArchiveReferenceEvent { kind: 'archive-reference-rebase'; packetId: string; changes: Array<{ from: { path: string; sha256: string }; to: { path: string; sha256: string } }> }
export interface SliceExecution { schemaVersion: 1; packetId: string; sliceId: string; status: 'planned' | 'in-progress' | 'complete' | 'cancelled'; evidence: string[]; checks: ExecutionCheck[]; review?: { state: 'passed' | 'required'; source: string }; result?: string; sourceHashes?: Record<string, string>; referenceHistory?: ArchiveReferenceEvent[] }
export interface PacketManifest { schemaVersion: 1; id: string; ownerPath: string; plan?: string; designs: Array<{ path: string; sha256: string }>; review: { kind: 'accepted-design' | 'task-exception' | 'design-selection'; source: string; sha256?: string }; slices: Array<{ id: string; path: string; dependencies: string[] }>; prerequisiteEvidence: Record<string, { path: string; sha256: string }>; macro: string; stories: string[]; archive?: { sourceHome: string; sourceHashes: Record<string, string | null> }; migration?: { schemaVersion: 1; from: 'provisional-execution-fields'; sources: Record<string, string>; source: string }; referenceHistory?: ArchiveReferenceEvent[] }
export interface DeliverySlice { id: string; title: string; objective: string; endpoint: string; dependencies?: string[]; checks: string[] }
export interface ProvisionalSliceMapping { id: string; path: string; dependencies: string[]; status: SliceExecution['status']; result?: string; evidence: string[]; checks: ExecutionCheck[]; review?: SliceExecution['review'] }
export interface ProvisionalPacketMapping { manifestFile: string; packetId: string; ownerPath: string; macro: string; plan?: string; designs: string[]; review: PacketManifest['review']; slices: ProvisionalSliceMapping[] }
const safeId = (id: string): string => { if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(id)) throw new Refused(`expected portable delivery identity (letters, numbers, underscore or hyphen): ${id}`); return id; };
const packetFilename = (id: string, kind: string, naming: NamingConvention): string => documentFilename(naming.shape === 'plain' ? `${id}-${kind}` : id, kind, naming);
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const meaningful = (value: unknown): value is string => typeof value === 'string' && !!value.trim();
const sha256 = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const executionBlock = (value: SliceExecution): string => `<!-- stavel:execution\n${jsonText(value).trim()}\n-->`;
function validateReferenceHistory(value: unknown): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) throw new Refused('unsupported archive reference history');
  for (const event of value) {
    if (!plain(event) || event.kind !== 'archive-reference-rebase' || !meaningful(event.packetId) || !Array.isArray(event.changes)) throw new Refused('unsupported archive reference history event');
    safeId(event.packetId);
    for (const change of event.changes) {
      if (!plain(change)) throw new Refused('invalid archive reference history change');
      for (const source of [change.from, change.to]) { if (!plain(source) || !sha256(source.sha256)) throw new Refused('invalid archive reference history checksum'); relativeName(source.path as string); }
    }
  }
}
function validateExecution(value: SliceExecution, packetId: string, sliceId: string): void {
  if (!plain(value) || value.schemaVersion !== 1 || value.packetId !== packetId || value.sliceId !== sliceId || !['planned', 'in-progress', 'complete', 'cancelled'].includes(value.status) || !Array.isArray(value.evidence) || value.evidence.some(item => !meaningful(item)) || !Array.isArray(value.checks) || !value.checks.length) throw new Refused('invalid or mismatched slice execution identity/state/evidence');
  const ids = new Set<string>();
  for (const check of value.checks) {
    if (!plain(check) || !meaningful(check.id) || !['passed', 'failed', 'skipped', 'unavailable'].includes(check.state) || typeof check.required !== 'boolean' || !meaningful(check.evidence) || !meaningful(check.description) || ids.has(check.id)) throw new Refused('invalid or duplicated execution check/description');
    ids.add(check.id);
  }
  if (value.review !== undefined && (!plain(value.review) || !['passed', 'required'].includes(value.review.state) || !meaningful(value.review.source))) throw new Refused('invalid semantic review record');
  if (value.result !== undefined && !meaningful(value.result)) throw new Refused('invalid execution result');
  if (value.sourceHashes !== undefined && (!plain(value.sourceHashes) || Object.values(value.sourceHashes).some(hash => !sha256(hash)))) throw new Refused('invalid execution evidence hashes');
  validateReferenceHistory(value.referenceHistory);
  if (value.status === 'complete' && (!meaningful(value.result) || !value.evidence.length || value.checks.some(check => check.required && check.state !== 'passed') || value.review?.state !== 'passed')) throw new Refused('completion requires result, existing evidence, all required checks passed and actual philosophy/semantic review');
  if (value.status === 'cancelled' && !meaningful(value.result)) throw new Refused('cancellation requires actual reason');
}
function parseExecution(text: string, packetId: string, sliceId: string): SliceExecution {
  const blocks = [...text.matchAll(/<!-- stavel:execution\s*\n([\s\S]*?)\n-->/g)];
  if (blocks.length !== 1) throw new Refused('slice requires exactly one machine-readable execution block; migrate provisional records explicitly');
  let value: SliceExecution;
  try { value = JSON.parse(blocks[0][1]); } catch { throw new Refused('invalid slice execution block'); }
  validateExecution(value, packetId, sliceId);
  return value;
}
function document(title: string, kind: string, body: string, owner: string): string {
  return `# ${title}\n\n<!-- mdcomposer:meta\ntitle: ${JSON.stringify(title)}\nkind: ${kind}\nstate: draft\naudience: internal\nowner: ${JSON.stringify(owner)}\nupdated: ${new Date().toISOString().slice(0, 10)}\n-->\n\n${body}\n`;
}
function requireFile(root: string, name: string): string { relativeName(name); const hash = fileHash(root, name); if (!hash) throw new Refused(`required evidence/source missing: ${name}`); return hash; }
function executionSources(root: string, state: SliceExecution): Record<string, string> {
  const paths = [...state.evidence, ...state.checks.filter(check => check.state === 'passed').map(check => check.evidence), ...(state.review?.state === 'passed' ? [state.review.source] : [])];
  return Object.fromEntries(paths.map(name => [name, requireFile(root, name)]));
}
function verifyExecutionSources(root: string, state: SliceExecution): Record<string, string> {
  const sources = executionSources(root, state);
  if (state.status === 'complete') for (const [name, hash] of Object.entries(sources)) if (state.sourceHashes?.[name] !== hash) throw new Refused(`completion evidence changed or lacks a recorded checksum: ${name}`);
  return sources;
}
function readPrerequisite(root: string, identity: string, filename: string): { state: SliceExecution; sources: Record<string, string> } {
  const parts = identity.split('/');
  if (parts.length !== 2) throw new Refused('external prerequisite identity must be packet-qualified');
  const [packet, slice] = parts.map(safeId);
  const state = parseExecution(fileBytes(root, filename)?.toString('utf8') ?? '', packet!, slice!);
  return { state, sources: verifyExecutionSources(root, state) };
}
function prerequisiteState(root: string, identity: string, filename: string): Record<string, string> {
  const { state, sources } = readPrerequisite(root, identity, filename);
  if (state.status !== 'complete') throw new Refused(`external prerequisite is not actually complete: ${identity}`);
  return sources;
}
function validateManifest(root: string, manifestFile: string, manifest: PacketManifest): void {
  if (!plain(manifest) || manifest.schemaVersion !== 1 || !meaningful(manifest.id) || !Array.isArray(manifest.slices) || !manifest.slices.length || !Array.isArray(manifest.designs) || !manifest.designs.length || !plain(manifest.review) || !['accepted-design', 'task-exception', 'design-selection'].includes(manifest.review.kind) || !meaningful(manifest.review.source) || !Array.isArray(manifest.stories) || !plain(manifest.prerequisiteEvidence)) throw new Refused('unsupported or incomplete packet manifest');
  safeId(manifest.id); relativeName(manifest.ownerPath); relativeName(manifestFile);
  validateReferenceHistory(manifest.referenceHistory);
  if (manifest.archive !== undefined) {
    if (!plain(manifest.archive) || !plain(manifest.archive.sourceHashes)) throw new Refused('invalid archive source provenance');
    relativeName(manifest.archive.sourceHome);
    for (const [name, hash] of Object.entries(manifest.archive.sourceHashes)) { relativeName(name); if (hash !== null && !sha256(hash)) throw new Refused('invalid archived source checksum'); }
  }
  const home = path.posix.dirname(manifestFile);
  if (manifest.migration !== undefined) {
    if (!plain(manifest.migration) || manifest.migration.schemaVersion !== 1 || manifest.migration.from !== 'provisional-execution-fields' || !plain(manifest.migration.sources) || !meaningful(manifest.migration.source)) throw new Refused('unsupported provisional migration provenance');
    const originalName = (name: string) => manifest.archive ? manifest.archive.sourceHome + name.slice(home.length) : name;
    const sources = new Set([manifest.macro, ...(manifest.plan ? [manifest.plan] : []), ...manifest.slices.map(slice => slice.path)].map(originalName));
    if (Object.keys(manifest.migration.sources).length !== sources.size || Object.entries(manifest.migration.sources).some(([name, hash]) => !sources.has(name) || !sha256(hash))) throw new Refused('invalid provisional source hash set');
  }
  if (path.posix.basename(manifestFile) !== 'packet.manifest.json' || path.posix.basename(home) !== manifest.id || path.posix.basename(path.posix.dirname(home)) !== 'execution') throw new Refused('packet manifest does not belong to its execution identity/home');
  const owned = (name: string) => { relativeName(name); contained(root, name); if (!name.startsWith(`${home}/`) || name === manifestFile) throw new Refused(`manifest artifact leaves owning packet: ${name}`); };
  owned(manifest.macro);
  if (manifest.plan !== undefined) owned(manifest.plan);
  for (const story of manifest.stories) owned(story);
  const ids = new Set<string>();
  for (const slice of manifest.slices) {
    if (!plain(slice) || !meaningful(slice.id) || !Array.isArray(slice.dependencies) || slice.dependencies.some(dependency => !meaningful(dependency)) || new Set(slice.dependencies).size !== slice.dependencies.length) throw new Refused('invalid manifest slice/dependency');
    safeId(slice.id); owned(slice.path);
    if (ids.has(slice.id)) throw new Refused('duplicate manifest slice identity'); ids.add(slice.id);
  }
  validateDestinations([manifestFile, manifest.macro, ...(manifest.plan ? [manifest.plan] : []), ...manifest.slices.map(slice => slice.path), ...manifest.stories]);
  for (const source of manifest.designs) {
    if (!plain(source) || !sha256(source.sha256)) throw new Refused('invalid manifest design source checksum');
    relativeName(source.path); contained(root, source.path);
  }
  validateDestinations(manifest.designs.map(source => source.path));
  if (/^(?:chat:|user:|https?:\/\/)/i.test(manifest.review.source)) {
    if (manifest.review.kind !== 'task-exception' || manifest.review.sha256 !== undefined) throw new Refused('external review requires an explicit task exception');
  } else { relativeName(manifest.review.source); if (!sha256(manifest.review.sha256)) throw new Refused('review source lacks pinned checksum'); }
  if (manifest.review.kind === 'design-selection' && (manifest.review.source !== manifest.designs[0]!.path || manifest.review.sha256 !== manifest.designs[0]!.sha256)) throw new Refused('design selection must identify the first explicit design baseline; it is not accepted review evidence');
  for (const [identity, evidence] of Object.entries(manifest.prerequisiteEvidence)) {
    if (identity.split('/').length !== 2 || !identity.split('/').every(part => /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(part)) || !plain(evidence) || !sha256(evidence.sha256)) throw new Refused('invalid qualified prerequisite/checksum');
    relativeName(evidence.path); if (evidence.path.startsWith(`${home}/`)) throw new Refused('external prerequisite points inside its dependent packet');
  }
  const visiting = new Set<string>(), seen = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Refused('execution dependency cycle'); if (seen.has(id)) return; visiting.add(id);
    for (const dependency of manifest.slices.find(slice => slice.id === id)!.dependencies) {
      if (ids.has(dependency)) visit(dependency); else if (!(dependency in manifest.prerequisiteEvidence)) throw new Refused(`unknown or unverified prerequisite: ${dependency}`);
    }
    visiting.delete(id); seen.add(id);
  };
  for (const id of ids) visit(id);
}
function trackerBlock(manifest: PacketManifest, states: SliceExecution[]): string {
  return `<!-- stavel:generated execution-tracker -->\nDerived from canonical slice execution blocks.\n\n| Slice | Status |\n| --- | --- |\n${manifest.slices.map(slice => `| [${slice.id}](${path.posix.relative(path.posix.dirname(manifest.macro), slice.path)}) | ${states.find(state => state.sliceId === slice.id)!.status} |`).join('\n')}\n<!-- /stavel:generated execution-tracker -->`;
}
function refreshTracker(original: string, manifest: PacketManifest, states: SliceExecution[], owner: string): string {
  const begin = '<!-- stavel:generated execution-tracker -->', end = '<!-- /stavel:generated execution-tracker -->';
  if (!original.includes(begin) && !original.includes(end)) return document(manifest.id, 'macro-execution', trackerBlock(manifest, states), owner);
  if (original.split(begin).length !== 2 || original.split(end).length !== 2 || original.indexOf(end) < original.indexOf(begin)) throw new Refused('ambiguous generated execution tracker block');
  return original.slice(0, original.indexOf(begin)) + trackerBlock(manifest, states) + original.slice(original.indexOf(end) + end.length);
}
function validatePacketLinks(root: string, changes: Array<{ path: string; content: string }>, inputs: Record<string, string | null>): void {
  const planned = new Map(changes.map(change => [change.path, change.content]));
  for (const change of changes.filter(change => change.path.endsWith('.md'))) for (const link of extractMarkdownLinks(change.content)) {
    if (link.unresolvedReference) throw new Refused(`packet output has unresolved Markdown reference: ${change.path}: ${link.unresolvedReference}`);
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(link.destination)) continue;
    const boundary = link.destination.search(/[?#]/), raw = boundary < 0 ? link.destination : link.destination.slice(0, boundary), suffix = boundary < 0 ? '' : link.destination.slice(boundary);
    let decoded: string; try { decoded = decodeURIComponent(raw); } catch { throw new Refused(`invalid encoded packet link: ${link.destination}`); }
    const target = !decoded ? change.path : decoded.startsWith('/') ? path.posix.normalize(decoded.slice(1)) : path.posix.normalize(path.posix.join(path.posix.dirname(change.path), decoded));
    const absolute = contained(root, target);
    if (!planned.has(target) && fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) continue;
    const bytes = fileBytes(root, target), text = planned.get(target) ?? bytes?.toString('utf8');
    if (text === undefined) throw new Refused(`packet output has missing local link: ${change.path}: ${link.destination}`);
    const current = bytes === null ? null : digest(bytes);
    if (target in inputs && inputs[target] !== current) throw new Refused(`packet link source changed during rendering: ${target}`);
    inputs[target] = current;
    const fragment = suffix.match(/#(.*)$/)?.[1];
    if (fragment && target.endsWith('.md') && !headingSlugs(text).has(decodeURIComponent(fragment))) throw new Refused(`packet output has missing heading fragment: ${change.path}: ${link.destination}`);
  }
}
function migrationNote(sourcePath: string, sourceSha256: string, source: string, extra: Record<string, unknown> = {}): string {
  return `<!-- stavel:migration\n${jsonText({ schemaVersion: 1, from: 'provisional-execution-fields', sourcePath, sourceSha256, source, ...extra }).trim()}\n-->`;
}

/** Explicit one-time batch conversion. Agent-selected mappings retain their nondeterministic provenance. */
export function planPacketMigration(options: { root: string; alignment: Alignment; packets: ProvisionalPacketMapping[] }): MigrationPlan {
  const root = targetRoot(options.root);
  if (!options.alignment?.confirmed || !meaningful(options.alignment.instruction)) throw new Refused('provisional packet migration requires actual aligned mappings');
  if (!Array.isArray(options.packets) || !options.packets.length) throw new Refused('provisional packet migration needs a nonempty explicit batch');
  const inputs: Record<string, string | null> = {}, originals = new Map<string, string>(), contents = new Map<string, string>();
  const batch = new Map<string, { packet: ProvisionalPacketMapping; mapping: ProvisionalSliceMapping; state: SliceExecution }>();
  const packetIds = new Set<string>(), destinations: string[] = [];
  const manifests = new Map<string, PacketManifest>();
  const readOriginal = (name: string): string => {
    relativeName(name); const bytes = fileBytes(root, name); if (!bytes) throw new Refused(`provisional migration source missing: ${name}`);
    inputs[name] = digest(bytes); const text = bytes.toString('utf8'); originals.set(name, text); return text;
  };
  for (const packet of options.packets) {
    safeId(packet.packetId); relativeName(packet.manifestFile); relativeName(packet.ownerPath); relativeName(packet.macro);
    if (packetIds.has(packet.packetId.toLowerCase())) throw new Refused(`duplicate provisional packet identity: ${packet.packetId}`); packetIds.add(packet.packetId.toLowerCase());
    if (fileBytes(root, packet.manifestFile) !== null) throw new Refused(`packet manifest already exists; one-time migration refuses overwrite: ${packet.manifestFile}`);
    if (!Array.isArray(packet.slices) || !packet.slices.length || !Array.isArray(packet.designs) || !packet.designs.length) throw new Refused('provisional packet requires explicit slice and design mappings');
    if (!packet.review || !['accepted-design', 'task-exception'].includes(packet.review.kind) || !meaningful(packet.review.source)) throw new Refused('provisional packet needs actual reviewed design/exception source');
    const review = structuredClone(packet.review);
    // A one-time migration is agent-mapped; keep an inspectable repository record
    // for its actual design/review source instead of inventing chat acceptance.
    const reviewHash = requireFile(root, review.source);
    if (review.sha256 !== undefined && review.sha256 !== reviewHash) throw new Refused('review source changed since the explicit migration mapping');
    review.sha256 = inputs[review.source] = reviewHash;
    const manifest: PacketManifest = { schemaVersion: 1, id: packet.packetId, ownerPath: packet.ownerPath, macro: packet.macro, ...(packet.plan ? { plan: relativeName(packet.plan) } : {}), designs: packet.designs.map(name => ({ path: relativeName(name), sha256: inputs[name] = requireFile(root, name) })), review, slices: [], prerequisiteEvidence: {}, stories: [], migration: { schemaVersion: 1, from: 'provisional-execution-fields', source: review.source, sources: {} } };
    readOriginal(packet.macro); manifest.migration!.sources[packet.macro] = inputs[packet.macro]!;
    if (packet.plan) { readOriginal(packet.plan); manifest.migration!.sources[packet.plan] = inputs[packet.plan]!; }
    destinations.push(packet.manifestFile, packet.macro);
    const localIds = new Set(packet.slices.map(slice => slice.id));
    if (localIds.size !== packet.slices.length || new Set(packet.slices.map(slice => slice.id.toLowerCase())).size !== packet.slices.length) throw new Refused('duplicate provisional slice identity');
    for (const mapping of packet.slices) {
      safeId(mapping.id); relativeName(mapping.path);
      if (!Array.isArray(mapping.dependencies) || mapping.dependencies.some(dependency => !meaningful(dependency))) throw new Refused(`explicit dependencies required for ${mapping.id}`);
      const original = readOriginal(mapping.path);
      if (/<!--\s*stavel:(?:execution|migration)\b/.test(original)) throw new Refused(`slice already contains canonical/migrated state; refusing overwrite: ${mapping.path}`);
      const oldIds = [...original.matchAll(/^slice-id:[ \t]*([^\r\n]+)[ \t]*$/gm)], oldStatuses = [...original.matchAll(/^execution-status:[ \t]*([^\r\n]+)[ \t]*$/gm)];
      if (oldIds.length !== 1 || oldStatuses.length !== 1 || oldIds[0]![1]!.trim() !== mapping.id) throw new Refused(`provisional slice identity/status source is absent, ambiguous or differs from explicit mapping: ${mapping.path}`);
      const legacyStatus = oldStatuses[0]![1]!.trim();
      const normalized: Record<string, SliceExecution['status']> = { planned: 'planned', 'in-progress': 'in-progress', active: 'in-progress', partial: 'in-progress', complete: 'complete', cancelled: 'cancelled' };
      if (normalized[legacyStatus] !== mapping.status) throw new Refused(`provisional status differs from explicit mapping; no inferred completion or reset: ${mapping.path} (${legacyStatus} -> ${mapping.status})`);
      const state: SliceExecution = { schemaVersion: 1, packetId: packet.packetId, sliceId: mapping.id, status: mapping.status, evidence: structuredClone(mapping.evidence), checks: structuredClone(mapping.checks), ...(mapping.review ? { review: structuredClone(mapping.review) } : {}), ...(mapping.result !== undefined ? { result: mapping.result } : {}) };
      validateExecution(state, packet.packetId, mapping.id);
      const sourceHashes = executionSources(root, state); Object.assign(inputs, sourceHashes); if (state.status === 'complete') state.sourceHashes = sourceHashes;
      const dependencies = mapping.dependencies.map(dependency => dependency.startsWith(`${packet.packetId}/`) ? dependency.slice(packet.packetId.length + 1) : dependency);
      manifest.slices.push({ id: mapping.id, path: mapping.path, dependencies });
      const qualified = `${packet.packetId}/${mapping.id}`; batch.set(qualified, { packet, mapping, state }); destinations.push(mapping.path);
      const hash = manifest.migration!.sources[mapping.path] = inputs[mapping.path]!;
      const body = original.replace(/^execution-status:[^\r\n]*(?:\r?\n|$)/m, '');
      contents.set(mapping.path, `${body}${body.endsWith('\n') ? '' : '\n'}\n${executionBlock(state)}\n\n${migrationNote(mapping.path, hash, review.source, { legacySliceId: mapping.id, legacyExecutionStatus: legacyStatus, mappedStatus: mapping.status })}\n`);
    }
    manifests.set(packet.packetId, manifest);
  }
  validateDestinations(destinations);
  const generated = new Set([...destinations, ...options.packets.flatMap(packet => packet.plan ? [packet.plan] : [])]);
  for (const entry of batch.values()) for (const source of Object.keys(executionSources(root, entry.state))) if (generated.has(source)) throw new Refused(`migration proof must be a durable existing result/review record, not rewritten packet state: ${source}`);
  for (const manifest of manifests.values()) for (const source of [...manifest.designs.map(source => source.path), manifest.review.source]) if (generated.has(source)) throw new Refused(`design/review source cannot be rewritten by the same migration: ${source}`);
  const graph = new Map<string, string[]>();
  for (const [qualified, entry] of batch) {
    const manifest = manifests.get(entry.packet.packetId)!, slice = manifest.slices.find(slice => slice.id === entry.mapping.id)!;
    const edges = slice.dependencies.map(dependency => dependency.includes('/') ? dependency : `${entry.packet.packetId}/${dependency}`);
    if (new Set(edges).size !== edges.length || edges.some(edge => !batch.has(edge))) throw new Refused(`unknown or duplicate explicitly mapped batch prerequisite: ${qualified}`);
    if (['in-progress', 'complete'].includes(entry.state.status) && edges.some(edge => batch.get(edge)!.state.status !== 'complete')) throw new Refused(`mapped execution contradicts incomplete prerequisites: ${qualified}`);
    graph.set(qualified, edges);
    for (const dependency of slice.dependencies.filter(dependency => dependency.includes('/'))) {
      const prerequisite = batch.get(dependency)!;
      manifest.prerequisiteEvidence[dependency] = { path: prerequisite.mapping.path, sha256: digest(contents.get(prerequisite.mapping.path)!) };
    }
  }
  const visiting = new Set<string>(), seen = new Set<string>();
  const visit = (identity: string): void => {
    if (visiting.has(identity)) throw new Refused(`execution dependency cycle across provisional packets: ${identity}`);
    if (seen.has(identity)) return; visiting.add(identity); for (const dependency of graph.get(identity)!) visit(dependency); visiting.delete(identity); seen.add(identity);
  };
  for (const identity of graph.keys()) visit(identity);
  for (const packet of options.packets) {
    const manifest = manifests.get(packet.packetId)!; validateManifest(root, packet.manifestFile, manifest);
    const original = originals.get(packet.macro)!;
    if (/<!--\s*stavel:(?:migration|generated execution-tracker)\b/.test(original)) throw new Refused(`tracker is already migrated or has ambiguous owned content: ${packet.macro}`);
    const metadata = /<!--\s*mdcomposer:meta\b[\s\S]*?-->/.exec(original), prefixEnd = metadata ? metadata.index + metadata[0].length : /^\uFEFF?---\r?\n[\s\S]*?\r?\n---/.exec(original)?.[0].length ?? 0;
    const prefix = original.slice(0, prefixEnd), snapshot = original.slice(prefixEnd).replace(/^execution-status:[^\r\n]*(?:\r?\n|$)/m, '');
    const states = manifest.slices.map(slice => batch.get(`${packet.packetId}/${slice.id}`)!.state);
    contents.set(packet.macro, `${prefix}\n\n${trackerBlock(manifest, states)}\n\n## Provisional tracker snapshot\n\nThe following original material is migration-time history, not the current execution status authority. Current status comes from the canonical slice blocks above.\n\n<details>\n<summary>Original provisional tracker context</summary>\n\n${snapshot}\n\n</details>\n\n${migrationNote(packet.macro, inputs[packet.macro]!, manifest.review.source)}\n`);
    contents.set(packet.manifestFile, jsonText(manifest)); inputs[packet.manifestFile] = null;
  }
  return mutationPlan({ root, alignment: options.alignment, changes: [...contents].map(([path, content]) => ({ path, content, reason: 'explicit one-time provisional packet migration; preserve source identity, body and factual evidence' })), inputs, kind: 'agent-assisted', source: [...new Set(options.packets.map(packet => packet.review.source))].join('; ') });
}
export function planExecutionPacket(options: { root: string; sourceRoot?: string; resolution?: ResolvedRepositoryConfiguration; packetId: string; ownerPath: string; owner: string; title: string; designs: string[]; review?: PacketManifest['review']; substantial?: boolean; slices: DeliverySlice[]; alignment: Alignment; config: FrameworkConfig; branch?: string; facts?: Record<string, string>; stories?: boolean; storyContent?: string; prerequisiteEvidence?: Record<string, string> }): { state: 'input-required' | 'preview'; questions: string[]; plan?: MigrationPlan; manifest?: PacketManifest } {
  const root = targetRoot(options.root), id = safeId(options.packetId), ownerPath = relativeName(options.ownerPath);
  const distribution = locateDistribution(options.sourceRoot);
  if (options.resolution && targetRoot(options.resolution.root) !== root) throw new Refused('packet configuration resolution belongs to another repository');
  const resolution = options.resolution ?? resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), explicitConfig: options.config });
  const config = resolution.config;
  const storyPolicy = config.workflow?.stories?.generation ?? 'ask';
  if (!['ask', 'always', 'never'].includes(storyPolicy) || (options.stories !== undefined && typeof options.stories !== 'boolean')) throw new Refused('invalid story-generation decision');
  if (options.stories === undefined && storyPolicy === 'ask') return { state: 'input-required', questions: ['Generate local story documents for this PLAN scope?'] };
  const stories = options.stories ?? storyPolicy === 'always';
  if (!Array.isArray(options.designs) || !options.designs.length || !Array.isArray(options.slices) || !options.slices.length || !meaningful(options.title) || !meaningful(options.owner)) throw new Refused('packet requires designs, owner, title and coherent slices');
  if (options.substantial !== undefined && typeof options.substantial !== 'boolean') throw new Refused('substantial scope must be an explicit boolean when supplied');
  const configuredReview = config.workflow?.review;
  if (configuredReview !== undefined && !plain(configuredReview)) throw new Refused('workflow.review must be an object');
  const reviewPolicy = (configuredReview as Record<string, unknown> | undefined)?.design ?? 'recommended-for-substantial';
  if (typeof reviewPolicy !== 'string' || !['recommended-for-substantial', 'required-for-substantial', 'none'].includes(reviewPolicy)) throw new Refused(`unsupported design-review policy: ${String(reviewPolicy)}`);
  if (reviewPolicy === 'required-for-substantial' && options.substantial !== false && (!options.review || options.review.kind === 'design-selection')) throw new Refused('repository policy requires actual design review or an explicit task exception for substantial work');
  if (options.review && (!meaningful(options.review.source) || !['accepted-design', 'task-exception', 'design-selection'].includes(options.review.kind))) throw new Refused('invalid selected design review/selection source');
  const inputs: Record<string, string | null> = { ...resolution.inputs };
  const designs = options.designs.map(name => ({ path: relativeName(name), sha256: inputs[name] = requireFile(root, name) }));
  const review: PacketManifest['review'] = options.review ? structuredClone(options.review) : { kind: 'design-selection', source: designs[0]!.path, sha256: designs[0]!.sha256 };
  if (!/^(?:chat:|user:|https?:\/\/)/i.test(review.source)) {
    const actualHash = requireFile(root, review.source);
    if (review.sha256 !== undefined && review.sha256 !== actualHash) throw new Refused('selected design/review source changed since explicit selection');
    review.sha256 = inputs[review.source] = actualHash;
  }
  else if (review.kind !== 'task-exception') throw new Refused('accepted-design review requires a repository-owned evidence record; external chat review must be an explicit task exception');
  const ids = new Set(options.slices.map(slice => safeId(slice.id)));
  if (ids.size !== options.slices.length) throw new Refused('duplicate slice ID');
  const prerequisiteEvidence: PacketManifest['prerequisiteEvidence'] = {};
  for (const [dependency, evidence] of Object.entries(options.prerequisiteEvidence ?? {})) {
    const hash = inputs[evidence] = requireFile(root, evidence);
    Object.assign(inputs, prerequisiteState(root, dependency, evidence));
    prerequisiteEvidence[dependency] = { path: evidence, sha256: hash };
  }
  const graph = new Map(options.slices.map(slice => [slice.id, slice.dependencies ?? []]));
  const visiting = new Set<string>(), seen = new Set<string>();
  const visit = (slice: string): void => { if (visiting.has(slice)) throw new Refused('execution dependency cycle'); if (seen.has(slice)) return; visiting.add(slice); for (const dependency of graph.get(slice)!) { if (ids.has(dependency)) visit(dependency); else if (!(dependency in prerequisiteEvidence)) throw new Refused(`unknown or unverified prerequisite: ${dependency}`); } visiting.delete(slice); seen.add(slice); };
  for (const slice of options.slices) { if (!slice.objective?.trim() || !slice.endpoint?.trim() || !slice.checks?.length || slice.checks.some(check => !check.trim())) throw new Refused(`slice ${slice.id} requires objective, coherent endpoint and verification`); visit(slice.id); }
  const home = `${ownerPath}/execution/${id}`;
  const naming = config.documentation?.naming ?? { shape: 'typed' as const, identifierCase: 'kebab' as const };
  const roleIds = ['artifact.execution-plan', 'artifact.execution-slice', 'artifact.macro-execution', ...(stories ? ['artifact.story'] : [])];
  const selected = queryArtifacts({ sourceRoot: options.sourceRoot, catalog: loadArtifactCatalog(options.sourceRoot), definitions: resolution.definitions, selectedIds: roleIds });
  if (selected.unresolved.length) {
    const sources = roleIds.map(roleId => `${roleId}: ${resolution.provenance[`workflow.definitions.artifacts.${roleId}`]?.source ?? resolution.baseline.path ?? `selected ${resolution.kind} configuration`}`).join('; ');
    throw new Refused(`PLAN mandatory artifact roles are unresolved: ${selected.unresolved.join('; ')}; effective sources: ${sources}`);
  }
  const role = (roleId: string): ArtifactDefinition => {
    const artifact = selected.artifacts.find(artifact => artifact.id === roleId);
    if (!artifact || (roleId !== 'artifact.story' && artifact.family !== 'execution')) throw new Refused(`PLAN needs compatible ${roleId}; resolve its effective artifact definition instead of silently falling back`);
    return artifact;
  };
  const macro = `${home}/${packetFilename(id, role('artifact.macro-execution').kind, naming)}`;
  const planFile = `${home}/${packetFilename(id, role('artifact.execution-plan').kind, naming)}`;
  const manifest: PacketManifest = { schemaVersion: 1, id, ownerPath, plan: planFile, designs, review, slices: options.slices.map(slice => ({ id: slice.id, path: `${home}/${packetFilename(slice.id, role('artifact.execution-slice').kind, naming)}`, dependencies: slice.dependencies ?? [] })), prerequisiteEvidence, macro, stories: stories ? options.slices.map(slice => `${home}/${packetFilename(slice.id, role('artifact.story').kind, naming)}`) : [] };
  const manifestPath = `${home}/packet.manifest.json`;
  validateManifest(root, manifestPath, manifest);
  const link = (from: string, label: string, target: string) => `[${label.replace(/([\\\[\]])/g, '\\$1')}](<${encodeURI(path.posix.relative(path.posix.dirname(from), target)).replace(/#/g, '%23').replace(/\?/g, '%3F')}>)`;
  const dependencies = (from: string, slice: DeliverySlice) => (slice.dependencies ?? []).map(dependency => link(from, dependency, manifest.slices.find(item => item.id === dependency)?.path ?? prerequisiteEvidence[dependency]!.path)).join(', ') || 'None declared';
  const sourceIndex = (from: string) => designs.map(source => `- ${link(from, path.posix.basename(source.path), source.path)} — SHA-256: \`${source.sha256}\``).join('\n');
  const sliceIndex = (from: string) => `| Slice | Coherent endpoint | Dependencies |\n| --- | --- | --- |\n${options.slices.map(slice => `| ${link(from, slice.id, manifest.slices.find(record => record.id === slice.id)!.path)} | ${slice.endpoint.replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ')} | ${dependencies(from, slice)} |`).join('\n')}`;
  const dependencyIndex = (from: string) => options.slices.map(slice => `- ${slice.id}: ${dependencies(from, slice)}`).join('\n');
  const branch = options.branch ?? options.facts?.branch ?? 'Not selected (working tree); source design hashes are recorded in packet.manifest.json.';
  if (!meaningful(branch)) throw new Refused('branch/source snapshot must be actual text or omitted as not selected');
  const facts = (from: string, extra: Record<string, string> = {}): Record<string, string> => ({ ...options.facts, title: options.title, owner: options.owner, branch, initiative: options.title, phase: 'planning', scope: options.title, source_design_index: sourceIndex(from), slice_index: sliceIndex(from), dependency_index: dependencyIndex(from), ...extra });
  const mergeInputs = (selectedInputs: Record<string, string | null>) => {
    for (const [name, expected] of Object.entries(selectedInputs)) { if (name in inputs && inputs[name] !== expected) throw new Refused(`conflicting/stale packet rendering input: ${name}`); inputs[name] = expected; }
  };
  const render = (artifactId: string, destination: string, actualFacts: Record<string, string>, templateContent?: string): string => {
    const rendered = renderArtifactTemplate({ root, sourceRoot: options.sourceRoot, config, definitions: resolution.definitions, artifactId, destination, facts: actualFacts, alignment: options.alignment, ...(templateContent !== undefined ? { templateContent } : {}) });
    mergeInputs(rendered.inputs);
    if (/<!--\s*stavel:(?:execution|generated execution-tracker)\b/.test(rendered.content)) throw new Refused(`template must leave canonical execution state/tracker ownership to PLAN: ${artifactId}`);
    // Remove only the competing template field; retain Mode/branch text on the
    // same line and retain every effective custom section/guidance body.
    return rendered.content.replace(/^[ \t]*execution-status:[ \t]*[A-Za-z-]+\.?[ \t]*/gm, '').trimEnd() + '\n';
  };
  const changes: Array<{ path: string; content: string; reason: string }> = [], initialStates: SliceExecution[] = [];
  for (const slice of options.slices) {
    const record = manifest.slices.find(item => item.id === slice.id)!;
    const state: SliceExecution = { schemaVersion: 1, packetId: id, sliceId: slice.id, status: 'planned', evidence: [], checks: slice.checks.map((check, index) => ({ id: `check-${index + 1}`, state: 'unavailable', required: true, evidence: check, description: check })) };
    initialStates.push(state);
    const actualFacts = facts(record.path, { title: slice.title, slice: slice.id, objective: slice.objective, endpoint: slice.endpoint, checks: slice.checks.map(check => `- ${check}`).join('\n'), dependencies: dependencies(record.path, slice) });
    const body = render('artifact.execution-slice', record.path, actualFacts) + `\n${executionBlock(state)}\n\n## Planned slice contract\n\n${slice.objective}\n\nCoherent endpoint: ${slice.endpoint}\n\n### Selected verification\n\n${actualFacts.checks}\n\n### Source designs\n\n${sourceIndex(record.path)}\n\nDependencies: ${actualFacts.dependencies}\n`;
    changes.push({ path: record.path, content: body, reason: 'render effective execution-slice artifact/sections and append canonical planned state' });
    if (stories) {
      const name = manifest.stories[options.slices.indexOf(slice)]!;
      let content = render('artifact.story', name, facts(name, { title: slice.title, story_id: slice.id, requirement_id: 'See selected design requirements', acceptance: slice.endpoint, check_or_evidence: slice.checks.join('; ') }), options.storyContent);
      content += `\n\n## Planned outcome\n\n${slice.objective}\n\n[Canonical execution slice](${path.posix.basename(record.path)})\n`;
      changes.push({ path: name, content, reason: 'render effective story artifact/sections from the selected repository template' });
    }
  }
  const selection = review.kind === 'design-selection' ? 'Selected design baseline; this is not accepted-review evidence.' : `Provided ${review.kind} source: ${review.source}.`;
  const planned = render('artifact.execution-plan', planFile, facts(planFile)) + `\n## Canonical planning inputs\n\n${selection}\n\n${sourceIndex(planFile)}\n\n## Canonical delivery index\n\n${sliceIndex(planFile)}\n\n## Qualified dependencies\n\n${dependencyIndex(planFile)}\n`;
  changes.push({ path: planFile, content: planned, reason: 'render effective execution-plan artifact with actual source, slice and dependency indexes' });
  const macroBody = render('artifact.macro-execution', macro, facts(macro)) + `\n${trackerBlock(manifest, initialStates)}\n`;
  changes.push({ path: macro, content: macroBody, reason: 'render effective macro artifact/sections and initialize its owned derived tracker' });
  changes.push({ path: manifestPath, content: jsonText(manifest), reason: 'versioned packet identity and selected design/review sources' });
  if (changes.some(change => fileHash(root, change.path) !== null)) throw new Refused('packet destination already exists; update or explicitly migrate it');
  validatePacketLinks(root, changes, inputs);
  return { state: 'preview', questions: [], manifest, plan: mutationPlan({ root, alignment: options.alignment, changes, inputs }) };
}

export function readExecutionPacket(rootValue: string, manifestFile: string): { root: string; manifest: PacketManifest; states: SliceExecution[]; inputs: Record<string, string | null>; ready: string[]; closed: boolean } {
  const root = targetRoot(rootValue), bytes = fileBytes(root, manifestFile);
  if (!bytes) throw new Refused('packet manifest missing');
  let manifest: PacketManifest;
  try { manifest = JSON.parse(bytes.toString('utf8')); } catch { throw new Refused('packet manifest is invalid JSON'); }
  validateManifest(root, manifestFile, manifest);
  const inputs: Record<string, string | null> = { [manifestFile]: digest(bytes) };
  const ids = new Set(manifest.slices.map(slice => slice.id)); if (ids.size !== manifest.slices.length) throw new Refused('duplicate manifest slice identity');
  const states = manifest.slices.map(slice => {
    const text = fileBytes(root, slice.path); if (!text) throw new Refused(`missing slice: ${slice.path}`); inputs[slice.path] = digest(text);
    const state = parseExecution(text.toString('utf8'), manifest.id, slice.id); Object.assign(inputs, verifyExecutionSources(root, state)); return state;
  });
  for (const name of [manifest.macro, ...(manifest.plan ? [manifest.plan] : []), ...manifest.stories]) inputs[name] = requireFile(root, name);
  for (const source of manifest.designs) { if (requireFile(root, source.path) !== source.sha256) throw new Refused(`design changed since packet preparation: ${source.path}`); inputs[source.path] = source.sha256; }
  if (manifest.review.sha256) {
    if (requireFile(root, manifest.review.source) !== manifest.review.sha256) throw new Refused('selected design/review source changed since packet preparation');
    inputs[manifest.review.source] = manifest.review.sha256;
  }
  const externalStates = new Map<string, SliceExecution>();
  for (const [dependency, evidence] of Object.entries(manifest.prerequisiteEvidence)) {
    if (requireFile(root, evidence.path) !== evidence.sha256) throw new Refused(`external prerequisite evidence changed: ${dependency}`);
    const prerequisite = readPrerequisite(root, dependency, evidence.path); externalStates.set(dependency, prerequisite.state);
    inputs[evidence.path] = evidence.sha256; Object.assign(inputs, prerequisite.sources);
  }
  const dependencyComplete = (dependency: string): boolean => (ids.has(dependency) ? states.find(state => state.sliceId === dependency) : externalStates.get(dependency))?.status === 'complete';
  for (const slice of manifest.slices) if (['in-progress', 'complete'].includes(states.find(state => state.sliceId === slice.id)!.status) && slice.dependencies.some(dependency => !dependencyComplete(dependency))) throw new Refused(`execution state contradicts incomplete prerequisites: ${slice.id}`);
  const ready = manifest.slices.filter(slice => states.find(state => state.sliceId === slice.id)!.status === 'planned' && slice.dependencies.every(dependencyComplete)).map(slice => slice.id);
  return { root, manifest, states, inputs, ready, closed: states.every(state => ['complete', 'cancelled'].includes(state.status)) };
}
export function planSliceTransition(options: { root: string; manifestFile: string; sliceId: string; status: SliceExecution['status']; alignment: Alignment; evidence?: string[]; checks?: ExecutionCheck[]; review?: SliceExecution['review']; result?: string; owner?: string }): MigrationPlan {
  const packet = readExecutionPacket(options.root, options.manifestFile), slice = packet.manifest.slices.find(item => item.id === options.sliceId), before = packet.states.find(item => item.sliceId === options.sliceId);
  if (!slice || !before) throw new Refused('unknown slice');
  if (before.status === 'planned' && options.status === 'in-progress' && !packet.ready.includes(before.sliceId)) throw new Refused('slice prerequisites are not complete');
  const transitions: Record<string, string[]> = { planned: ['planned', 'in-progress', 'cancelled'], 'in-progress': ['in-progress', 'complete', 'cancelled'], complete: ['complete'], cancelled: ['cancelled'] };
  if (!transitions[before.status].includes(options.status)) throw new Refused('invalid execution transition; reopening requires a new explicit packet/amendment');
  const checks = options.checks?.map(check => ({ ...check, description: before.checks.find(existing => existing.id === check.id)?.description ?? check.description }));
  if (checks && before.checks.some(existing => existing.required && !checks.some(check => check.id === existing.id && check.required))) throw new Refused('required verification checks cannot be omitted or downgraded by an execution transition; resolve an explicit design amendment');
  const next: SliceExecution = { ...before, status: options.status, evidence: options.evidence ?? before.evidence, checks: checks ?? before.checks, ...(options.review ? { review: options.review } : {}), ...(options.result ? { result: options.result } : {}) };
  validateExecution(next, packet.manifest.id, slice.id);
  const sourceHashes = executionSources(packet.root, next);
  const generated = new Set([options.manifestFile, packet.manifest.macro, ...(packet.manifest.plan ? [packet.manifest.plan] : []), ...packet.manifest.slices.map(item => item.path)]);
  if (Object.keys(sourceHashes).some(source => generated.has(source))) throw new Refused('execution evidence must be a durable result record, not mutable generated execution state');
  Object.assign(packet.inputs, sourceHashes);
  if (next.status === 'complete') next.sourceHashes = sourceHashes;
  const text = fileBytes(packet.root, slice.path)!.toString('utf8').replace(/<!-- stavel:execution\s*\n[\s\S]*?\n-->/, executionBlock(next));
  const states = packet.states.map(state => state.sliceId === next.sliceId ? next : state);
  const macro = refreshTracker(fileBytes(packet.root, packet.manifest.macro)!.toString('utf8'), packet.manifest, states, options.owner ?? 'repository-maintainer');
  return mutationPlan({ root: packet.root, alignment: options.alignment, inputs: packet.inputs, changes: [{ path: slice.path, content: text, reason: 'canonical execution transition with actual evidence' }, { path: packet.manifest.macro, content: macro, reason: 'refresh derived tracker while preserving owned surrounding context' }] });
}
export function planVibeCheckpoint(options: { root: string; ownerPath: string; id: string; trigger: 'decision' | 'outcome' | 'phase' | 'handoff'; summary: string; sources: string[]; nextAction: string; alignment: Alignment }): MigrationPlan {
  safeId(options.id); relativeName(options.ownerPath);
  if (!options.summary?.trim() || !options.nextAction?.trim() || !['decision', 'outcome', 'phase', 'handoff'].includes(options.trigger)) throw new Refused('checkpoint requires meaningful trigger, result and next action');
  const inputs = Object.fromEntries(options.sources.map(source => [source, requireFile(options.root, source)]));
  const name = `${options.ownerPath}/${options.id}.recon.md`;
  if (fileHash(options.root, name)) throw new Refused('checkpoint exists; preserve its history and choose another identity');
  return mutationPlan({ root: options.root, alignment: options.alignment, inputs, changes: [{ path: name, content: document(`VIBE: ${options.id}`, 'recon', `Trigger: ${options.trigger}\n\n${options.summary}\n\n## Sources\n\n${options.sources.map(source => `- [${path.posix.basename(source)}](${path.posix.relative(options.ownerPath, source)})`).join('\n')}\n\n## Next action\n\n${options.nextAction}`, 'repository-maintainer'), reason: 'proportional contemporaneous VIBE checkpoint' }] });
}

function packetFiles(root: string, home: string): string[] {
  const result: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of fs.readdirSync(contained(root, directory), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const name = `${directory}/${entry.name}`; contained(root, name);
      if (entry.isDirectory()) visit(name); else if (entry.isFile()) result.push(name); else throw new Refused(`packet contains unsupported file type: ${name}`);
    }
  };
  visit(home); return result;
}
function archivedMetadata(text: string, outcome?: 'complete' | 'deprecated'): string {
  const original = parseMetadata(text).data.state;
  if (typeof original !== 'string') return text;
  const state = outcome ?? (['complete', 'deprecated'].includes(original) ? original : 'deprecated');
  const update = (body: string) => body.replace(/^([ \t]*state:[ \t]*).*$/m, (_line, prefix: string) => `${prefix}${state}`);
  if (/<!--\s*mdcomposer:meta\b/.test(text)) return text.replace(/(<!--\s*mdcomposer:meta\b)([\s\S]*?)(-->)/, (_block, start: string, body: string, end: string) => start + update(body) + end);
  return text.replace(/^(\uFEFF?---\r?\n)([\s\S]*?)(\r?\n---)/, (_block, start: string, body: string, end: string) => start + update(body) + end);
}
function historicalLinks(text: string, name: string, mapping: Record<string, string>): { content: string; historical: string[] } {
  const edits: Array<{ start: number; end: number; text: string }> = [], historical: string[] = [];
  for (const link of extractMarkdownLinks(text)) {
    if (link.unresolvedReference || /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(link.destination)) continue;
    const split = link.destination.search(/[?#]/), rawPath = split < 0 ? link.destination : link.destination.slice(0, split), suffix = split < 0 ? '' : link.destination.slice(split);
    let resolved: string;
    try { resolved = path.posix.normalize(path.posix.join(path.posix.dirname(name), decodeURIComponent(rawPath))); } catch { continue; }
    if (!mapping[resolved]) continue;
    const raw = text.slice(link.start, link.end), label = /^!?\[([^\]]+)\]/.exec(raw)?.[1] ?? path.posix.basename(resolved);
    if (link.kind === 'definition') { historical.push(`- [${label}](${path.posix.relative(path.posix.dirname(name), mapping[resolved])}${suffix})`); edits.push({ start: link.start, end: link.end, text: '' }); }
    else {
      historical.push(`- [${label}](${path.posix.relative(path.posix.dirname(name), mapping[resolved])}${suffix})`);
      edits.push({ start: link.start, end: link.end, text: `${label} (archived; see historical context)` });
    }
  }
  // An outer link can include a linked image; retain the outer replacement only.
  const selected = edits.filter(edit => !edits.some(other => other !== edit && other.start <= edit.start && other.end >= edit.end && (other.start !== edit.start || other.end !== edit.end)));
  let content = text;
  for (const edit of selected.sort((a, b) => b.start - a.start)) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
  return { content, historical: [...new Set(historical)] };
}
function archiveReferenceChanges(root: string, home: string, archiveRoot: string, mapping: Record<string, string>, config: FrameworkConfig, inputs: Record<string, string | null>): Array<{ path: string; content: string; reason: string }> {
  const changes: Array<{ path: string; content: string; reason: string }> = [];
  for (const name of walkFiles(root).filter(name => name.endsWith('.md') && !name.startsWith(`${home}/`))) {
    const bytes = fileBytes(root, name)!; inputs[name] = digest(bytes); const text = bytes.toString('utf8');
    if (name.startsWith(`${archiveRoot}/`)) {
      const content = rewriteMarkdownLinks(text, name, name, mapping);
      if (content !== text) changes.push({ path: name, content, reason: 'rebase historical links without changing their historical authority' });
      continue;
    }
    const heading = String(config.documentation?.archive?.historicalHeading ?? 'Historical context (archived)');
    const marker = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').exec(text);
    const split = marker?.index ?? -1, rest = split < 0 ? '' : text.slice(split + marker![0].length);
    const nextHeading = /^## /m.exec(rest), end = split < 0 ? -1 : nextHeading ? split + marker![0].length + nextHeading.index : text.length;
    const active = split < 0 ? text : text.slice(0, split) + text.slice(end), oldHistory = split < 0 ? '' : text.slice(split, end);
    const { content: updated, historical } = historicalLinks(active, name, mapping);
    let history = oldHistory ? rewriteMarkdownLinks(oldHistory, name, name, mapping) : '';
    if (!historical.length && history === oldHistory) continue;
    if (historical.length) history = history ? `${history.trimEnd()}\n\n${historical.join('\n')}\n` : `## ${heading}\n\n${historical.join('\n')}\n`;
    const content = updated.trimEnd() + (history ? '\n\n' + history : '\n');
    if (content !== text) changes.push({ path: name, content, reason: 'keep archived evidence links under historical context' });
  }
  return changes;
}

function archiveOwnerReferences(root: string, config: FrameworkConfig, mapping: Record<string, string>, contents: Map<string, Buffer>, inputs: Record<string, string | null>, packetId: string, sourceRoot?: string): void {
  const sourcePath = (value: string, sourceFile?: string): { path: string; suffix: string } | undefined => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value)) return undefined;
    const boundary = value.indexOf('#'), filename = boundary < 0 ? value : value.slice(0, boundary), suffix = boundary < 0 ? '' : value.slice(boundary);
    const name = sourceFile ? path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), filename)) : filename;
    try { contained(root, name); } catch { return undefined; }
    return { path: name, suffix };
  };
  const distribution = locateDistribution(sourceRoot);
  const resolved = resolveRepositoryConfiguration({ root, packagedBaseline: config, packagedDefinitions: packagedConfigurationDefinitions(distribution) }); Object.assign(inputs, resolved.inputs);
  for (const name of Object.keys(resolved.inputs)) if (mapping[name]) throw new Refused(`archive would move active configuration authority ${name}; explicitly relocate its configuration home first`);
  for (const owner of resolved.owners) for (const source of Object.values(owner.canonical ?? {})) if (mapping[source]) throw new Refused(`archive would move current owner authority ${owner.id}: ${source}; resolve its current versus historical owner mapping first`);
  const amendments = [...(Array.isArray(resolved.config.workflow?.amendments) ? resolved.config.workflow.amendments : []), ...(Array.isArray(resolved.config.workflow?.scopes) ? resolved.config.workflow.scopes.flatMap(scope => plain(scope) && Array.isArray(scope.amendments) ? scope.amendments : []) : [])];
  for (const amendment of amendments) if (plain(amendment) && typeof amendment.source === 'string' && mapping[sourcePath(amendment.source)?.path ?? '']) throw new Refused('archive would move an active amendment source; explicitly align its historical provenance before archival');
  const decisionsRef = resolved.layout?.topics.decisions;
  if (decisionsRef) {
    const filename = `.stavel-config/${decisionsRef}`, original = fileBytes(root, filename)!;
    const topic = JSON.parse(original.toString('utf8').replace(/^\uFEFF/, '')) as { schemaVersion: number; decisions: Array<Record<string, unknown>> };
    let changed = false;
    for (const decision of topic.decisions) {
      const ref = typeof decision.source === 'string' ? sourcePath(decision.source) : undefined;
      if (!ref || !mapping[ref.path]) continue;
      if (decision.referenceHistory !== undefined && !Array.isArray(decision.referenceHistory)) throw new Refused(`unsupported decision reference history: ${String(decision.id)}`);
      const previous = decision.source as string; decision.source = mapping[ref.path] + ref.suffix;
      decision.referenceHistory = [...(decision.referenceHistory as unknown[] ?? []), { operation: 'archive-reference-rebase', packetId, from: previous, to: decision.source, sourceSha256: requireFile(root, ref.path) }]; changed = true;
    }
    if (changed) { inputs[filename] = digest(original); contents.set(filename, Buffer.from(jsonText(topic))); }
  }
  const work = readWork(workOptionsForConfiguration(root, config));
  if (work.state === 'invalid') throw new Refused(`cannot safely preserve work references during archival: ${work.issues.join('; ')}`);
  for (const source of work.sources) inputs[source.path] = source.sha256;
  if (mapping[work.registryFile] || work.capabilities.some(cap => mapping[cap.sourceFile])) throw new Refused('archive would move a current work registry/status owner; explicitly relocate the authoritative work record first');
  for (const cap of work.capabilities) {
    const record = structuredClone(cap.record); let changed = false;
    for (const item of record.items) {
      const refs: Array<{ field: string; from: string; to: string; sourceSha256: string }> = [];
      for (const field of ['record', 'tracker']) {
        if (typeof item[field] !== 'string') continue;
        const ref = sourcePath(item[field] as string, cap.sourceFile); if (!ref || !mapping[ref.path]) continue;
        const from = item[field] as string, to = path.posix.relative(path.posix.dirname(cap.sourceFile), mapping[ref.path]) + ref.suffix;
        item[field] = to; refs.push({ field, from, to, sourceSha256: requireFile(root, ref.path) });
      }
      if (refs.length) { item.history = [...(item.history ?? []), { at: new Date().toISOString(), operation: 'archive-reference-rebase', packetId, references: refs }]; changed = true; }
    }
    if (changed) contents.set(cap.sourceFile, Buffer.from(jsonText(record)));
  }
}

function renderArchiveReferences(root: string, manifestFile: string, current: ReturnType<typeof readExecutionPacket>, mapping: Record<string, string>, contents: Map<string, Buffer>, inputs: Record<string, string | null>): void {
  const records = new Map<string, ReturnType<typeof readExecutionPacket>>([[manifestFile, current]]);
  for (const name of walkFiles(root).filter(name => path.posix.basename(name) === 'packet.manifest.json' && name !== manifestFile)) {
    const bytes = fileBytes(root, name)!; let value: unknown;
    try { value = JSON.parse(bytes.toString('utf8')); } catch { if (Object.keys(mapping).some(source => bytes.toString('utf8').includes(source))) throw new Refused(`unsupported dependent manifest references this packet: ${name}`); continue; }
    if (!plain(value) || !('slices' in value) || !('prerequisiteEvidence' in value)) { if (Object.keys(mapping).some(source => bytes.toString('utf8').includes(source))) throw new Refused(`unsupported dependent manifest references this packet: ${name}`); continue; }
    try { records.set(name, readExecutionPacket(root, name)); }
    catch (error) { throw new Refused(`cannot safely refresh dependent packet ${name}; resolve its unsupported/stale evidence first: ${(error as Error).message}`); }
  }
  for (const record of records.values()) Object.assign(inputs, record.inputs);
  const originalBytes = new Map<string, Buffer>(), nodes = new Map<string, { dependencies: string[]; render: () => Buffer }>();
  const original = (name: string) => { if (!originalBytes.has(name)) originalBytes.set(name, fileBytes(root, name)!); return originalBytes.get(name)!; };
  const hashAfter = (name: string): string => digest(contents.get(name) ?? original(name));
  const rebase = (name: string) => mapping[name] ?? name;
  const reference = (event: ArchiveReferenceEvent, name: string, beforeHash: string): { path: string; sha256: string } => {
    const after = { path: rebase(name), sha256: hashAfter(name) };
    if (after.path !== name || after.sha256 !== beforeHash) event.changes.push({ from: { path: name, sha256: beforeHash }, to: after });
    return after;
  };
  for (const [filename, record] of records) {
    for (const state of record.states) {
      const name = record.manifest.slices.find(slice => slice.id === state.sliceId)!.path;
      nodes.set(name, { dependencies: Object.keys(executionSources(root, state)), render: () => {
        const next = structuredClone(state), event: ArchiveReferenceEvent = { kind: 'archive-reference-rebase', packetId: current.manifest.id, changes: [] };
        next.evidence = next.evidence.map(rebase); next.checks.forEach(check => { check.evidence = rebase(check.evidence); }); if (next.review) next.review.source = rebase(next.review.source);
        if (next.sourceHashes) next.sourceHashes = Object.fromEntries(Object.entries(next.sourceHashes).map(([source, hash]) => { const after = reference(event, source, hash); return [after.path, after.sha256]; }));
        if (event.changes.length) next.referenceHistory = [...(next.referenceHistory ?? []), event];
        const base = contents.get(name) ?? original(name);
        return jsonText(next) === jsonText(state) ? base : Buffer.from(base.toString('utf8').replace(/<!-- stavel:execution\s*\n[\s\S]*?\n-->/, executionBlock(next)));
      } });
    }
    nodes.set(filename, { dependencies: [...record.manifest.designs.map(source => source.path), ...(record.manifest.review.sha256 ? [record.manifest.review.source] : []), ...Object.values(record.manifest.prerequisiteEvidence).map(source => source.path)], render: () => {
      const manifest = structuredClone(record.manifest), event: ArchiveReferenceEvent = { kind: 'archive-reference-rebase', packetId: current.manifest.id, changes: [] };
      manifest.designs.forEach(source => { const after = reference(event, source.path, source.sha256); source.path = after.path; source.sha256 = after.sha256; });
      if (manifest.review.sha256) { const after = reference(event, manifest.review.source, manifest.review.sha256); manifest.review.source = after.path; manifest.review.sha256 = after.sha256; }
      Object.values(manifest.prerequisiteEvidence).forEach(source => { const after = reference(event, source.path, source.sha256); source.path = after.path; source.sha256 = after.sha256; });
      if (filename === manifestFile) {
        manifest.archive = { sourceHome: path.posix.dirname(manifestFile), sourceHashes: { ...inputs } };
        manifest.slices.forEach(slice => { slice.path = rebase(slice.path); }); manifest.macro = rebase(manifest.macro); if (manifest.plan) manifest.plan = rebase(manifest.plan); manifest.stories = manifest.stories.map(rebase);
      }
      if (event.changes.length) manifest.referenceHistory = [...(manifest.referenceHistory ?? []), event];
      if (filename !== manifestFile && !event.changes.length) return contents.get(filename) ?? original(filename);
      return Buffer.from(jsonText(manifest));
    } });
  }
  const visiting = new Set<string>(), done = new Set<string>();
  const visit = (name: string): void => {
    if (visiting.has(name)) throw new Refused(`archive evidence-hash cycle cannot be safely refreshed; prepare an explicit independent proof/batch before archival: ${name}`);
    if (done.has(name) || !nodes.has(name)) return; visiting.add(name);
    const node = nodes.get(name)!; for (const dependency of node.dependencies) visit(dependency);
    const bytes = node.render(); if (mapping[name] || !bytes.equals(original(name))) contents.set(name, bytes);
    visiting.delete(name); done.add(name);
  };
  for (const name of nodes.keys()) visit(name);
}

export function planPacketArchive(options: { root: string; manifestFile: string; config: FrameworkConfig; alignment: Alignment; sourceRoot?: string }): MigrationPlan {
  const packet = readExecutionPacket(options.root, options.manifestFile);
  if (!packet.closed) throw new Refused('archive requires every slice to be actually complete or cancelled');
  const home = path.posix.dirname(options.manifestFile);
  const archiveRoot = relativeName(String(options.config.documentation?.archive?.root ?? 'docs/internal/_archive'));
  const docRoot = options.config.documentation?.roots?.[0] ?? 'docs/internal';
  const ownerRelative = packet.manifest.ownerPath.startsWith(`${docRoot}/`) ? packet.manifest.ownerPath.slice(docRoot.length + 1) : packet.manifest.ownerPath;
  const archiveHome = `${archiveRoot}/${ownerRelative}/execution/${packet.manifest.id}`;
  if (home === archiveHome || home.startsWith(`${archiveRoot}/`)) throw new Refused('packet is already archived');
  const files = packetFiles(packet.root, home);
  const mapping = Object.fromEntries(files.map(name => [name, archiveHome + name.slice(home.length)]));
  const changes: Array<{ path: string; content: string | Buffer | null; reason: string }> = [];
  const contents = new Map<string, Buffer>();
  for (const name of files) {
    const bytes = fileBytes(packet.root, name)!; packet.inputs[name] = digest(bytes);
    if (!name.endsWith('.md')) { contents.set(name, bytes); continue; }
    const original = bytes.toString('utf8');
    const slice = packet.manifest.slices.find(slice => slice.path === name);
    let state = slice ? packet.states.find(state => state.sliceId === slice.id) : undefined;
    if (!state && packet.manifest.stories.includes(name)) {
      const linked = extractMarkdownLinks(original).flatMap(link => {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(link.destination)) return [];
        let resolved: string; try { resolved = path.posix.normalize(path.posix.join(path.posix.dirname(name), decodeURIComponent(link.destination.split(/[?#]/)[0]))); } catch { return []; }
        const slice = packet.manifest.slices.find(slice => slice.path === resolved);
        return slice ? [slice.id] : [];
      });
      const ids = [...new Set(linked)]; if (ids.length === 1) state = packet.states.find(state => state.sliceId === ids[0]);
    }
    const outcome = state ? state.status === 'complete' ? 'complete' : 'deprecated' : name === packet.manifest.macro || name === packet.manifest.plan ? packet.states.every(state => state.status === 'complete') ? 'complete' : 'deprecated' : undefined;
    const content = archivedMetadata(rewriteMarkdownLinks(original, name, mapping[name], mapping), outcome);
    contents.set(name, Buffer.from(content));
  }
  const referenceChanges = archiveReferenceChanges(packet.root, home, archiveRoot, mapping, options.config, packet.inputs);
  for (const change of referenceChanges) { contents.set(change.path, Buffer.from(change.content)); packet.inputs[change.path] = requireFile(packet.root, change.path); }
  archiveOwnerReferences(packet.root, options.config, mapping, contents, packet.inputs, packet.manifest.id, options.sourceRoot);
  renderArchiveReferences(packet.root, options.manifestFile, packet, mapping, contents, packet.inputs);
  for (const name of files) {
    const destination = mapping[name];
    if (fileHash(packet.root, destination) !== null) throw new Refused(`archive collision: ${destination}`);
    changes.push({ path: name, content: null, reason: 'archive closed packet as a unit; original evidence preserved' }, { path: destination, content: contents.get(name)!, reason: 'mirror closed packet with stable identity and rebased links' });
  }
  for (const [name, content] of contents) if (!mapping[name] && !content.equals(fileBytes(packet.root, name)!)) changes.push({ path: name, content, reason: 'mechanically rebase supported historical references/proof pins; original references retained without new acceptance' });
  return mutationPlan({ root: packet.root, alignment: options.alignment, inputs: packet.inputs, changes });
}
