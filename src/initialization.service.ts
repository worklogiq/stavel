import path from 'node:path';
import type { Alignment, AnswersDocument, FrameworkConfig, MigrationPlan, Track } from './framework.types.js';
import { contained, digest, fileBytes, fileHash, jsonText, Refused, relativeName, targetRoot, validateDestinations } from './filesystem.service.js';
import { artifactBaselineDefinitions, loadArtifactCatalog, previewArtifacts } from './artifact.service.js';
import { ownConfigurationValue, resolveRepositoryConfiguration, packagedConfigurationDefinitions } from './configuration.service.js';
import { readWork, workOptionsForConfiguration } from './work.service.js';
import { locateDistribution } from './distribution.service.js';
import { planDigest } from './planning.service.js';
import { loadManifest } from './decisions.service.js';
import { markdownLinks } from './markdown.service.js';
import { renameDocument } from './naming.service.js';
import { extractMarkdownLinks, parseMetadata } from '@worklogiq/mdcomposer';
import { augmentGitGuardPlan, inspectGitGuards, type GitGuardInspection } from './git-guard.service.js';
import { mutationPlan } from './effects.service.js';

export interface InitializationGap { id: string; component: 'configuration' | 'instructions' | 'framework' | 'product' | 'templates' | 'work' | 'guards'; path?: string; message: string; repairable: boolean }
export interface InitializationReadiness {
  state: 'ready' | 'partial' | 'unconfigured'; adoption: 'installed' | 'manual' | 'none'; root: string; track?: Track;
  documentsReady: boolean; gaps: InitializationGap[]; inputs: Record<string, string | null>; config: FrameworkConfig; guards?: GitGuardInspection;
}
/** Check selected setup components, independently of transient sessions and unrelated repository health. */
export function initializationReadiness(options: { root: string; sourceRoot?: string; guardBundlePath?: string }): InitializationReadiness {
  const root = targetRoot(options.root), distribution = locateDistribution(options.sourceRoot), manifest = loadManifest(root);
  const resolved = resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution) });
  const inputs: Record<string, string | null> = { ...resolved.inputs, '.stavel.json': fileHash(root, '.stavel.json') };
  const gaps: InitializationGap[] = [];
  const read = (name: string): Buffer | null => { const bytes = fileBytes(root, name); inputs[name] = bytes ? digest(bytes) : null; return bytes; };
  const gap = (id: string, component: InitializationGap['component'], message: string, filename?: string, repairable = false): void => { if (!gaps.some(item => item.id === id)) gaps.push({ id, component, message, ...(filename ? { path: filename } : {}), repairable }); };
  const track = manifest?.track as Track | undefined;
  const adoption = manifest ? 'installed' : resolved.kind === 'absent' ? 'none' : 'manual';
  if (resolved.kind === 'absent') {
    if (manifest) gap('configuration:missing', 'configuration', 'The installed setup has no selected configuration; restore its actual policy before continuing.', 'stavel.config.json');
    return { state: manifest ? 'partial' : 'unconfigured', adoption, root, track, documentsReady: false, gaps, inputs, config: resolved.config };
  }
  const config = resolved.config;
  // The apply engine acquires this coordination lock before checking content
  // inputs; it must not become a null content precondition in its own plan.
  if (fileBytes(root, '.stavel/runtime/writer.lock')) gap('setup:writer', 'configuration', 'A repository writer is active or awaiting recovery; inspect it before treating setup as complete.', '.stavel/runtime/writer.lock');
  const withinDocs = (name: string): boolean => (config.documentation?.roots ?? ['docs/internal', 'docs/public']).some(prefix => name === prefix || name.startsWith(`${prefix}/`));
  const enabled = (id: string): boolean => { const rule = config.rules?.[id]; return rule !== false && !(rule && typeof rule === 'object' && (rule as { enabled?: boolean }).enabled === false); };
  const document = (name: string, component: InitializationGap['component'], id: string): boolean => {
    const bytes = read(name); if (!bytes?.toString('utf8').trim()) { gap(id, component, 'A selected setup document is missing or empty.', name); return false; }
    if (withinDocs(name) && !['index.md', 'README.md'].includes(path.posix.basename(name))) {
      const metadata = parseMetadata(bytes.toString('utf8')); const required = config.documentation?.metadata?.requiredFields ?? config.documentation?.metadata?.required ?? ['title', 'kind', 'state', 'audience', 'owner', 'updated'];
      if (!Array.isArray(required) || required.some(field => typeof field !== 'string' || !field.trim())) throw new Refused('configured document metadata requirements must be an array of field paths');
      if (enabled('doc-metadata') && (metadata.issues.length || required.some(field => { const value = ownConfigurationValue(metadata.data, field); return !value.present || value.value === null || value.value === ''; }))) { gap(`${id}:metadata`, component, 'The selected document does not satisfy its configured metadata requirements.', name); return false; }
      if (enabled('doc-states') && metadata.data.state !== undefined && !(config.documentation?.states ?? ['draft', 'accepted', 'active', 'complete', 'deprecated']).includes(String(metadata.data.state))) { gap(`${id}:state`, component, 'The selected document has an unsupported lifecycle state.', name); return false; }
    }
    return true;
  };
  const rootAgents = read('AGENTS.md');
  if (!rootAgents?.toString('utf8').trim()) gap('instructions:missing', 'instructions', 'Root instructions are missing; map the existing instructions instead of copying a second framework.', 'AGENTS.md');
  type Route = { target: string; label: string; valid: boolean };
  const routes = (name: string, bytes: Buffer | null): Route[] => {
    if (!bytes) return [];
    const source = bytes.toString('utf8'), diagnostics = markdownLinks(root, name, source).diagnostics;
    return extractMarkdownLinks(source).flatMap(link => {
      if (!['link', 'reference'].includes(link.kind) || /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(link.destination)) return [];
      try {
        const filename = decodeURIComponent(link.destination.split(/[?#]/)[0]); const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), filename.replace(/\\/g, '/'))); contained(root, target);
        return [{ target, label: source.slice(link.start, link.end).match(/^\[([^\]]+)\]/)?.[1] ?? '', valid: !diagnostics.some(issue => issue.line === link.line) }];
      } catch { return []; }
    });
  };
  const rootRoutes = routes('AGENTS.md', rootAgents); const allRoutes = [...rootRoutes];
  if (rootRoutes.some(route => route.target === 'stavel-agents.policy.md')) allRoutes.push(...routes('stavel-agents.policy.md', read('stavel-agents.policy.md')));
  if (manifest?.entrypoint === 'stavel-agents.policy.md' && !rootRoutes.some(route => route.target === 'stavel-agents.policy.md' && route.valid)) gap('instructions:companion-routing', 'instructions', 'The selected companion instructions are not routed from root instructions.', 'AGENTS.md');
  const defaultEntries = distribution.catalog.entrypoints ?? { index: 'docs/internal/index.md', constitution: 'docs/internal/process/development-constitution.policy.md', profile: 'docs/internal/dev/project-profile.overview.md' };
  const entries = manifest?.entrypoints;
  if (entries !== undefined && (!entries || typeof entries !== 'object' || Array.isArray(entries))) throw new Refused('installed setup has invalid entrypoints');
  for (const [role, original] of Object.entries(defaultEntries)) {
    const match = role === 'index' ? /index|framework home/i : role === 'constitution' ? /constitution|charter/i : /profile|adoption record|local conventions/i;
    let filename = (entries as Record<string, unknown> | undefined)?.[role];
    if (filename !== undefined && (typeof filename !== 'string' || !filename.trim())) throw new Refused(`installed setup has invalid ${role} entrypoint`);
    if (!filename) filename = allRoutes.find(route => route.valid && match.test(route.label))?.target;
    if (!filename) {
      const owners = config.documentation?.ownershipRoots as Record<string, string> | undefined;
      const home = role === 'constitution' ? owners?.process : role === 'profile' ? owners?.developerGuides : undefined;
      const internal = config.documentation?.roots?.[0] ?? 'docs/internal';
      const mapped = home ? `${home}/${path.posix.basename(original)}` : original.startsWith('docs/internal/') ? `${internal}/${original.slice('docs/internal/'.length)}` : original;
      filename = path.posix.basename(mapped) === 'index.md' ? mapped : renameDocument(mapped, config.documentation?.naming ?? { shape: 'typed', identifierCase: 'kebab' }, config.documentation?.kinds ?? []);
    }
    const selected = relativeName(String(filename)); document(selected, 'framework', `framework:${role}`);
    if (!allRoutes.some(route => route.target === selected && route.valid)) gap(`instructions:${role}`, 'instructions', 'Root or explicitly delegated instructions must route to the selected framework owner.', selected);
  }
  for (const [name, expected] of Object.entries(manifest?.files as Record<string, string> ?? {})) {
    if (read(name) !== null) continue;
    const asset = distribution.catalog.assets.find(asset => asset.target === name && asset.role !== 'repository-template'); const source = asset ? fileBytes(distribution.root, asset.source) : null;
    gap(`installed:${name}`, 'framework', 'An installed framework component is missing; preserve current amendments while restoring it.', name, Boolean(source && digest(source) === expected));
  }
  const products = resolved.owners.filter(owner => owner.role === 'product');
  if (!products.length) gap('product:owner', 'product', 'Map the actual product documentation owner before completing setup.');
  for (const owner of products) document(owner.canonical?.['artifact.product-overview'] ?? `${owner.path}/${renameDocument('product.overview.md', config.documentation?.naming ?? { shape: 'typed', identifierCase: 'kebab' }, config.documentation?.kinds ?? [])}`, 'product', `product:${owner.id}`);
  if (config.workflow?.stories) {
    const template = config.workflow.stories.template, bytes = read(template);
    if (!bytes || parseMetadata(bytes.toString('utf8')).data.kind !== 'template') gap('template:story', 'templates', 'The selected editable story template is missing or does not declare kind: template.', template);
  }
  const work = readWork(workOptionsForConfiguration(root, config)); for (const source of work.sources) inputs[source.path] = source.sha256;
  if (!['ready', 'empty'].includes(work.state)) gap('work:registry', 'work', work.issues.join('; ') || `Selected work records need attention: ${work.state}.`, work.registryFile, work.state === 'migration-needed');
  const documentsReady = gaps.length === 0;
  const guards = inspectGitGuards({ root, config, sourceRoot: options.sourceRoot, bundlePath: options.guardBundlePath }); Object.assign(inputs, guards.inputs);
  if (!['not-selected', 'disabled', 'ready'].includes(guards.state)) for (const [index, issue] of guards.issues.entries()) gap(`guards:${issue.code}:${index}`, 'guards', issue.message, undefined, issue.repairable);
  if (!['not-selected', 'disabled', 'ready'].includes(guards.state) && !guards.issues.length) gap('guards:incomplete', 'guards', `Selected Git guards remain ${guards.state}.`, undefined, guards.repairable);
  return { state: gaps.length ? 'partial' : 'ready', adoption, root, track, documentsReady, gaps, inputs, config, guards };
}

export function previewInitializationCompletion(options: { readiness: InitializationReadiness; alignment: Alignment; sourceRoot?: string; guardBundlePath?: string }): { plan: MigrationPlan; guardActivation?: ReturnType<typeof augmentGitGuardPlan>['activation'] } {
  const { readiness } = options;
  if (!readiness.documentsReady || !readiness.guards || !['incomplete', 'pending-git'].includes(readiness.guards.state)) throw new Refused('initialization has gaps requiring explicit owner decisions or an unsupported guard integration; no generic repair is proposed');
  const base = mutationPlan({ root: readiness.root, alignment: options.alignment, changes: [], inputs: readiness.inputs });
  const selected = augmentGitGuardPlan(base, { config: readiness.config, sourceRoot: options.sourceRoot, bundlePath: options.guardBundlePath });
  return { plan: selected.plan, ...(selected.activation ? { guardActivation: selected.activation } : {}) };
}

const value = (answers: AnswersDocument, id: string): string => {
  const raw = answers.answers[id];
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    if (Array.isArray(raw) || record.status !== undefined && !['resolved-from-user', 'resolved-from-accepted-repo-policy'].includes(String(record.status)) && !(record.status === 'answered' && typeof record.source === 'string' && record.source.trim())) return '';
    return typeof record.value === 'string' ? record.value : '';
  }
  return typeof raw === 'string' ? raw : '';
};
export function initializationProduct(options: { root: string; config: FrameworkConfig; answers: AnswersDocument; sourceRoot?: string }): ReturnType<typeof previewArtifacts> {
  const docs = options.config.documentation ?? {};
  const roots = docs.ownershipRoots as Record<string, string> | undefined;
  const owners = Array.isArray(docs.owners) ? docs.owners as Array<{ id: string; role: 'product'; path: string }> : [{ id: 'product', role: 'product' as const, path: roots?.product ?? `${docs.roots?.[0] ?? 'docs/internal'}/product` }];
  const products = owners.filter(owner => owner.role === 'product');
  const selectedProduct = value(options.answers, 'product.id') || (products.length === 1 ? products[0].id : undefined);
  const resolution = resolveRepositoryConfiguration({ root: options.root, packagedBaseline: options.config, explicitConfig: options.config, packagedDefinitions: packagedConfigurationDefinitions(locateDistribution(options.sourceRoot)) });
  const preview = previewArtifacts({ root: options.root, config: options.config, resolution, owners, productId: selectedProduct, selectedIds: ['artifact.product-overview'], sourceRoot: options.sourceRoot, facts: { title: value(options.answers, 'product.title') || (products.length === 1 ? value(options.answers, 'project.name') : ''), owner: value(options.answers, 'project.owner') || 'repository-maintainer', purpose: value(options.answers, 'product.purpose') || (products.length === 1 ? value(options.answers, 'project.intent') : ''), audience: value(options.answers, 'product.audience'), scope: value(options.answers, 'product.scope'), outcomes: value(options.answers, 'product.outcomes') }, alignment: options.answers.alignment, discoveryOnly: options.answers.alignment?.confirmed !== true });
  if (products.length > 1 && !products.some(product => product.id === selectedProduct)) preview.questions.push({ id: 'question.product.owner', fact: 'id', prompt: `Select the actual product ID for this setup scope: ${products.map(product => `${product.id} (${product.path})`).join(', ')}` });
  return preview;
}
export function augmentInitializationPlan(plan: MigrationPlan, options: { config: FrameworkConfig; answers: AnswersDocument; sourceRoot?: string; guardBundlePath?: string; upgradeRuntime?: boolean }): MigrationPlan {
  if (!options.answers.alignment?.confirmed || !options.answers.alignment.instruction?.trim()) throw new Refused('initialization augmentation requires actual alignment');
  const product = initializationProduct({ ...options, root: plan.root });
  if (!product.ready || !product.plan) throw new Refused(`initialization product decisions remain: ${product.unresolved.join('; ')}`);
  const result = structuredClone(plan);
  const append = (other: MigrationPlan): void => {
    for (const [name, hash] of Object.entries(other.inputs)) { if (name in result.inputs && result.inputs[name] !== hash) throw new Refused(`conflicting initialization input: ${name}`); result.inputs[name] = hash; }
    result.operations.push(...other.operations);
  };
  append(product.plan);
  const agents = fileBytes(plan.root, 'AGENTS.md');
  const manifestOperation = result.operations.find(operation => operation.path === '.stavel.json');
  const manifestBytes = manifestOperation?.content ? Buffer.from(manifestOperation.content, 'base64') : fileBytes(plan.root, '.stavel.json');
  const manifest = manifestBytes ? JSON.parse(manifestBytes.toString('utf8')) as Record<string, unknown> : undefined;
  if (agents && manifest?.entrypoint === 'stavel-agents.policy.md' && !result.operations.some(operation => operation.path === 'AGENTS.md')) {
    const prior = agents.toString('utf8');
    const entrypoints = manifest?.entrypoints as { index: string; constitution: string } | undefined;
    if (!entrypoints) throw new Refused('initialization routing requires actual planned manifest entrypoints');
    relativeName(entrypoints.index); relativeName(entrypoints.constitution);
    const begin = '<!-- stavel:generated routing -->', end = '<!-- /stavel:generated routing -->';
    const block = `${begin}\nRead the [development index](${entrypoints.index}) and [constitution](${entrypoints.constitution}), then follow the [Stavel adoption instructions](stavel-agents.policy.md). Preserve the repository instructions above and current user scope.\n${end}`;
    if (prior.split(begin).length > 2 || prior.split(end).length > 2 || prior.includes(begin) !== prior.includes(end) || prior.includes(begin) && prior.indexOf(end) < prior.indexOf(begin)) throw new Refused('ambiguous existing Stavel routing block');
    const content = prior.includes(begin) ? prior.slice(0, prior.indexOf(begin)) + block + prior.slice(prior.indexOf(end) + end.length) : prior.trimEnd() + '\n\n' + block + '\n';
    result.inputs['AGENTS.md'] = digest(agents);
    if (content !== prior) result.operations.push({ id: 'routing', kind: 'update', path: 'AGENTS.md', beforeHash: digest(agents), afterHash: digest(content), content: Buffer.from(content).toString('base64'), encoding: 'base64', reason: 'preserve existing instructions and append explicitly owned framework routing' });
    if (manifest) { manifest.integration_at_install = 'owned-routing-block'; manifest.generatedBlocks = { 'AGENTS.md#routing': digest(block) }; }
  }
  const registry = workOptionsForConfiguration(plan.root, options.config).registryFile!;
  // Setup does not invent future capabilities or active initiatives. The work
  // commands add meaningful owners and pointers when actual work is selected.
  const before = fileHash(plan.root, registry);
  if (before === null && !result.operations.some(operation => operation.path === registry)) {
    const content = Buffer.from(jsonText({ schemaVersion: 2, capabilities: [] }));
    result.inputs[registry] = null;
    result.operations.push({ id: '', kind: 'create', path: registry, beforeHash: null, afterHash: digest(content), content: content.toString('base64'), encoding: 'base64', reason: 'seed empty pointer-only work registry without invented work' });
  }
  validateDestinations(result.operations.filter(operation => operation.kind !== 'delete').map(operation => operation.path));
  if (manifestOperation && manifest) {
    const content = Buffer.from(jsonText(manifest)); manifestOperation.content = content.toString('base64'); manifestOperation.afterHash = digest(content);
  }
  result.operations.forEach((operation, index) => { operation.id = `op-${index + 1}`; });
  result.id = planDigest(result);
  return augmentGitGuardPlan(result, { config: options.config, sourceRoot: options.sourceRoot, bundlePath: options.guardBundlePath, upgradeRuntime: options.upgradeRuntime }).plan;
}
