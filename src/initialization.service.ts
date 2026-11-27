import type { AnswersDocument, FrameworkConfig, MigrationPlan } from './framework.types.js';
import { digest, fileBytes, fileHash, jsonText, Refused, relativeName, validateDestinations } from './filesystem.service.js';
import { artifactBaselineDefinitions, loadArtifactCatalog, previewArtifacts } from './artifact.service.js';
import { resolveRepositoryConfiguration, packagedConfigurationDefinitions } from './configuration.service.js';
import { workOptionsForConfiguration } from './work.service.js';
import { locateDistribution } from './distribution.service.js';
import { planDigest } from './planning.service.js';

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
export function augmentInitializationPlan(plan: MigrationPlan, options: { config: FrameworkConfig; answers: AnswersDocument; sourceRoot?: string }): MigrationPlan {
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
  return result;
}
