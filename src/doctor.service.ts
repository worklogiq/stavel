import type { Alignment, MigrationPlan } from './framework.types.js';
import { checkRepository } from './checking.service.js';
import { inspectRepository, loadManifest } from './decisions.service.js';
import { locateDistribution } from './distribution.service.js';
import { fileBytes, fileHash, digest, Refused, relativeName, targetRoot } from './filesystem.service.js';
import { resolveRepositoryConfiguration, packagedConfigurationDefinitions } from './configuration.service.js';
import { mutationPlan, effectProvenance } from './effects.service.js';
import { rewriteMarkdownLinks } from './markdown.service.js';
import { readWork, planWorkMigration, workOptionsForConfiguration } from './work.service.js';
import { suggestArtifactOwners } from './artifact.service.js';
import { documentFilename } from './naming.service.js';
import { recommendTestingLayout } from './testing.service.js';

export interface Finding { id: string; state: 'passed' | 'failed' | 'skipped' | 'unavailable' | 'review-required'; severity: 'error' | 'warning' | 'info'; path?: string; message: string; evidence: string[]; repairable?: boolean }
export interface DoctorReport { root: string; state: 'failed' | 'review-required'; mechanicalPassed: boolean; readyForClosure: false; findings: Finding[]; repairable: string[]; inputs: Record<string, string | null>; workRegistryFile?: string; scope?: string }
export async function diagnoseRepository(options: { root: string; sourceRoot?: string; scope?: string }): Promise<DoctorReport> {
  const root = targetRoot(options.root), findings: Finding[] = [];
  let inputs: Record<string, string | null> = {};
  let workRegistryFile: string | undefined;
  try {
    const distribution = locateDistribution(options.sourceRoot);
    const resolved = resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), scope: options.scope });
    for (const owner of resolved.owners.filter(owner => owner.role === 'product')) {
      const overview = owner.canonical?.['artifact.product-overview'] ?? `${owner.path}/${documentFilename('product', 'overview', resolved.config.documentation?.naming ?? { shape: 'typed', identifierCase: 'kebab' })}`;
      const hash = fileHash(root, overview); inputs[overview] = hash;
      if (hash === null) findings.push({ id: `product-overview:${owner.id}`, state: 'unavailable', severity: 'error', path: overview, message: 'The selected product owner has no available canonical overview. Map the existing owner document or use guided init to align missing product facts before generation.', evidence: [`product owner: ${owner.id}`] });
    }
    for (const suggestion of suggestArtifactOwners(root, resolved.owners)) findings.push({ id: `ownership:${suggestion.surface}`, state: 'review-required', severity: 'info', message: suggestion.message, evidence: suggestion.evidence });
    const inspection = inspectRepository({ root, sourceRoot: options.sourceRoot, scope: options.scope });
    inputs = { ...inputs, ...Object.fromEntries(inspection.files.map(file => [file.path, file.hash])), ...resolved.inputs };
    for (const scope of [undefined, ...Object.keys(resolved.config.testing?.scopes ?? {})]) {
      const recommendation = recommendTestingLayout({ config: resolved.config, scope, files: inspection.files.map(file => file.path) });
      findings.push({ id: `testing-layout:${scope ?? 'repository'}`, state: recommendation.state === 'configured' ? 'passed' : 'review-required', severity: 'info', message: recommendation.reason, evidence: recommendation.sources });
    }
    const result = await checkRepository({ root, sourceRoot: options.sourceRoot, scope: options.scope });
    const workOptions = workOptionsForConfiguration(root, resolved.config);
    workRegistryFile = workOptions.registryFile!;
    const work = readWork(workOptions);
    for (const source of work.sources) inputs[source.path] = source.sha256;
    if (work.state === 'migration-needed') findings.push({ id: 'migrate-work-schema', state: 'failed', severity: 'warning', message: 'Work schema version 1 has a supported preserving migration to version 2.', evidence: work.sources.map(source => source.path), repairable: true });
    else if (work.state === 'missing') findings.push({ id: 'work-registry', state: 'unavailable', severity: resolved.kind === 'absent' ? 'warning' : 'error', message: 'The selected work registry is unavailable; an empty valid registry and missing evidence are distinct.', evidence: [workRegistryFile] });
    else if (work.state === 'invalid') findings.push({ id: 'work-records', state: 'failed', severity: 'error', message: work.issues.join('; '), evidence: work.sources.map(source => source.path) });
    findings.push(...result.diagnostics.map((item, index): Finding => ({ id: `${item.ruleId}:${index}`, state: 'failed', severity: item.severity, ...(item.path ? { path: item.path } : {}), message: item.message, evidence: ['packaged structural check'] })));
    if (result.ok) findings.push({ id: 'mechanical-checks', state: 'passed', severity: 'info', message: 'Packaged mechanical checks passed.', evidence: ['checkRepository'] });
    for (const note of result.notes) findings.push({ id: `review:${findings.length}`, state: 'review-required', severity: 'info', message: note, evidence: ['checkRepository observation'] });
    const manifest = loadManifest(root);
    inputs['.stavel.json'] = fileHash(root, '.stavel.json');
    if (!manifest) findings.push({ id: 'adoption', state: 'unavailable', severity: 'warning', message: 'No installed framework manifest. Use guided init to align adoption before repair.', evidence: ['.stavel.json absent'] });
    for (const [name, expected] of Object.entries(manifest?.files as Record<string, string> ?? {})) {
      inputs[name] = fileHash(root, name);
      if (inputs[name] !== null) continue;
      const candidate = distribution.catalog.assets.find(asset => asset.target === name);
      const source = candidate ? fileBytes(distribution.root, candidate.source) : null;
      const repairable = Boolean(source && digest(source) === expected && candidate?.role !== 'repository-template');
      findings.push({ id: `restore:${name}`, state: repairable ? 'failed' : 'unavailable', severity: 'warning', path: name, message: repairable ? 'A missing pinned framework asset can be restored exactly.' : 'Exact pinned bytes are unavailable; no replacement from a different version is proposed.', evidence: [`manifest sha256:${expected}`], repairable });
    }
  } catch (error) { findings.push({ id: 'configuration-or-inspection', state: 'failed', severity: 'error', message: (error as Error).message, evidence: ['read-only diagnosis refused invalid inputs'] }); }
  findings.push({ id: 'semantic-review', state: 'review-required', severity: 'info', message: 'An agent or human must review ownership, duplicated concepts, stale reasoning and philosophy adherence. Structural success cannot establish those properties.', evidence: [] });
  return { root, state: findings.some(item => item.state === 'failed' || item.state === 'unavailable' && item.severity === 'error') ? 'failed' : 'review-required', mechanicalPassed: !findings.some(item => (item.state === 'failed' || item.state === 'unavailable') && item.severity === 'error'), readyForClosure: false, findings, repairable: findings.filter(item => item.repairable).map(item => item.id), inputs, ...(workRegistryFile ? { workRegistryFile } : {}), ...(options.scope ? { scope: options.scope } : {}) };
}

export function previewRepairs(options: { root: string; sourceRoot?: string; report: DoctorReport; alignment: Alignment; kind?: 'deterministic' | 'agent-assisted'; source?: string; linkMappings?: Record<string, string>; linkFiles?: string[]; generatedBlocks?: Array<{ path: string; id: string; content: string; ownershipSource: string }> }): MigrationPlan {
  const root = targetRoot(options.root);
  if (root !== options.report.root) throw new Refused('diagnosis belongs to a different repository');
  const distribution = locateDistribution(options.sourceRoot);
  for (const [name, hash] of Object.entries(options.report.inputs)) if (fileHash(root, name) !== hash) throw new Refused(`stale diagnosis: ${name}`);
  const pending = new Map<string, { content: string | Buffer; reason: string }>();
  const manifest = loadManifest(root);
  for (const id of options.report.repairable) {
    if (id === 'migrate-work-schema') {
      const config = resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution) }).config;
      const migration = planWorkMigration(workOptionsForConfiguration(root, config));
      for (const change of migration.changes) pending.set(change.path, { content: change.content, reason: 'supported deterministic work schema migration preserving local fields and history' });
      continue;
    }
    const name = id.slice('restore:'.length);
    const asset = distribution.catalog.assets.find(item => item.target === name && item.role !== 'repository-template');
    const bytes = asset ? fileBytes(distribution.root, asset.source) : null;
    if (!bytes || digest(bytes) !== (manifest?.files as Record<string, string>)?.[name] || fileHash(root, name) !== null) throw new Refused(`pinned restoration is unavailable or changed: ${name}`);
    pending.set(name, { content: bytes, reason: 'restore exact missing pinned framework asset' });
  }
  for (const block of options.generatedBlocks ?? []) {
    if (!/^[a-z][a-z0-9-]*$/.test(block.id) || !block.ownershipSource?.trim()) throw new Refused('generated block requires a stable ID and explicit ownership source');
    const text = pending.get(block.path)?.content.toString() ?? fileBytes(root, block.path)?.toString('utf8');
    if (/<!--\s*\/?stavel:generated\b/.test(block.content)) throw new Refused('generated block content cannot inject ownership delimiters');
    const markers = [...(text ?? '').matchAll(/<!--\s*(\/?)stavel:generated ([a-z][a-z0-9-]*)\s*-->/g)];
    let active: string | undefined; const seen = new Set<string>();
    for (const marker of markers) {
      if (!marker[1]) { if (active || seen.has(marker[2])) throw new Refused('nested or duplicate generated ownership blocks'); active = marker[2]; seen.add(marker[2]); }
      else { if (active !== marker[2]) throw new Refused('overlapping generated ownership blocks'); active = undefined; }
    }
    if (active) throw new Refused('unclosed generated ownership block');
    const start = `<!-- stavel:generated ${block.id} -->`, end = `<!-- /stavel:generated ${block.id} -->`;
    if (!text || text.split(start).length !== 2 || text.split(end).length !== 2 || text.indexOf(end) < text.indexOf(start)) throw new Refused(`missing or ambiguous owned block: ${block.path}`);
    const content = text.slice(0, text.indexOf(start) + start.length) + '\n' + block.content + '\n' + text.slice(text.indexOf(end));
    pending.set(block.path, { content, reason: `refresh explicitly owned blocks; ${block.ownershipSource}` });
  }
  for (const [name, destination] of Object.entries(options.linkMappings ?? {})) { relativeName(name); relativeName(destination); }
  for (const name of options.linkFiles ?? []) {
    const bytes = pending.has(name) ? Buffer.from(pending.get(name)!.content) : fileBytes(root, name);
    if (!bytes) throw new Refused(`link repair source missing: ${name}`);
    pending.set(name, { content: rewriteMarkdownLinks(bytes.toString('utf8'), name, name, options.linkMappings ?? {}), reason: 'compose owned repair and explicitly accepted path rebases' });
  }
  // Schema migrations and accepted path rebases use their versioned planners;
  // this repair boundary never invents a schema or a semantic transformation.
  effectProvenance(options.kind, options.source);
  return mutationPlan({ root, alignment: options.alignment, changes: [...pending].map(([path, change]) => ({ path, ...change })), inputs: options.report.inputs, kind: options.kind, source: options.source, version: distribution.version });
}
