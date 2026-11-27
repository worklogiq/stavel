import fs from 'node:fs';
import path from 'node:path';
import type { Alignment, FrameworkConfig, MigrationPlan, NamingConvention } from './framework.types.js';
import { contained, digest, fileBytes, fileHash, jsonText, readJson, Refused, relativeName, targetRoot, validateDestinations } from './filesystem.service.js';
import { locateDistribution } from './distribution.service.js';
import { documentFilename } from './naming.service.js';
import { planDigest } from './planning.service.js';
import { extractMarkdownLinks } from '@worklogiq/mdcomposer';
import { headingSlugs, rewriteMarkdownLinks } from './markdown.service.js';
import type { ConfigurationDefinition } from './configuration.service.js';
import { packagedConfigurationDefinitions, resolveRepositoryConfiguration } from './configuration.service.js';

export interface ArtifactSection { id: string; title: string; guidance?: string; required?: boolean; version?: number; [key: string]: unknown }
export interface ArtifactDefinition {
  id: string; family: string; title: string; kind: string; template: string;
  surfaces: string[]; requiredFacts: string[]; sections: string[];
  version?: number; required?: boolean; dependencies?: string[]; templateSource?: 'distribution' | 'repository'; identifierSuffix?: string;
  [key: string]: unknown;
}
export interface ArtifactDefinitions { artifacts?: Record<string, ConfigurationDefinition>; sections?: Record<string, ConfigurationDefinition>; questions?: Record<string, ConfigurationDefinition> }
export interface ArtifactQuestion extends ConfigurationDefinition { id: string; fact: string; prompt: string; requiredFor: string[] }
export interface ArtifactCatalog { product: 'stavel'; schemaVersion: 1; version: number; artifacts: ArtifactDefinition[]; sections: ArtifactSection[]; questions?: ArtifactQuestion[] }
export interface ArtifactOwner { id: string; role: 'product' | 'capability' | 'feature' | 'contract-topic' | 'grouping'; path: string; parent?: string; canonical?: Record<string, string> }
export interface ArtifactOmission { id: string; reason: string }
export interface ArtifactQueryOptions {
  sourceRoot?: string; catalog?: ArtifactCatalog; surfaces?: string[]; selectedIds?: string[];
  definitions?: ArtifactDefinitions; omissions?: ArtifactOmission[];
}
export interface ArtifactSelection { artifacts: ArtifactDefinition[]; sections: ArtifactSection[]; omitted: ArtifactOmission[]; unresolved: string[] }
export interface ArtifactResolution {
  config: FrameworkConfig; owners?: ArtifactOwner[]; definitions?: ArtifactDefinitions; inputs?: Record<string, string | null>;
}
export interface ArtifactPreviewOptions extends ArtifactQueryOptions {
  discoveryOnly?: boolean;
  root: string; config?: FrameworkConfig; resolution?: ArtifactResolution; owners?: ArtifactOwner[];
  productId?: string; ownerId?: string; identifier?: string; facts: Record<string, string>;
  canonical?: Record<string, string>; alignment: Alignment;
}
export interface ArtifactPreview {
  ready: boolean; unresolved: string[]; suggestions: Array<{ surface: string; evidence: string[]; message: string }>;
  questions: Array<{ id: string; fact: string; prompt: string }>;
  artifacts: Array<{ id: string; path: string; action: 'create' | 'preserve'; content?: string }>;
  omitted: ArtifactOmission[]; plan?: MigrationPlan;
}
export interface RenderArtifactTemplateOptions {
  root: string; sourceRoot?: string; config: FrameworkConfig; definitions?: ArtifactDefinitions;
  artifactId: string; destination: string; facts: Record<string, string>; alignment: Alignment; templateContent?: string;
}
export interface RenderedArtifactTemplate { content: string; inputs: Record<string, string | null>; artifact: ArtifactDefinition }

const stableId = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
function definition(value: unknown, expectedId: string, section = false): ArtifactDefinition | ArtifactSection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Refused(`invalid artifact definition: ${expectedId}`);
  const item = value as ArtifactDefinition;
  if (item.id !== expectedId || !stableId.test(item.id) || typeof item.title !== 'string' || !item.title.trim()) throw new Refused(`invalid artifact definition identity/title: ${expectedId}`);
  if (section) {
    if (item.guidance !== undefined && typeof item.guidance !== 'string') throw new Refused(`invalid section guidance: ${expectedId}`);
    return item as unknown as ArtifactSection;
  }
  if (typeof item.family !== 'string' || !stableId.test(item.family) || typeof item.kind !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(item.kind)) throw new Refused(`invalid artifact family/kind: ${expectedId}`);
  if (typeof item.template !== 'string' || !item.template.endsWith('.md')) throw new Refused(`artifact template must be Markdown: ${expectedId}`);
  relativeName(item.template);
  if (item.templateSource !== undefined && !['repository', 'distribution'].includes(item.templateSource)) throw new Refused(`unknown artifact template source: ${expectedId}`);
  if (item.identifierSuffix !== undefined && (typeof item.identifierSuffix !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(item.identifierSuffix))) throw new Refused(`artifact identifierSuffix must be a portable kebab identifier: ${expectedId}`);
  for (const field of ['surfaces', 'requiredFacts', 'sections', 'dependencies'] as const) {
    if (field === 'dependencies' && item[field] === undefined) continue;
    if (!Array.isArray(item[field]) || item[field]!.some(value => typeof value !== 'string' || !value.trim()) || new Set(item[field]).size !== item[field]!.length) throw new Refused(`invalid artifact ${field}: ${expectedId}`);
  }
  return item;
}

export function loadArtifactCatalog(sourceRoot?: string): ArtifactCatalog {
  const distribution = locateDistribution(sourceRoot);
  const catalog = readJson<ArtifactCatalog>(contained(distribution.root, 'config/artifacts.catalog.json'));
  if (!catalog || catalog.product !== 'stavel' || catalog.schemaVersion !== 1 || !Number.isInteger(catalog.version) || !Array.isArray(catalog.artifacts) || !Array.isArray(catalog.sections)) throw new Refused('unsupported artifact catalog');
  const artifactIds = new Set<string>(), sectionIds = new Set<string>();
  for (const section of catalog.sections) { definition(section, section?.id, true); if (sectionIds.has(section.id)) throw new Refused(`duplicate artifact section: ${section.id}`); sectionIds.add(section.id); }
  for (const artifact of catalog.artifacts) {
    definition(artifact, artifact?.id);
    if (artifactIds.has(artifact.id)) throw new Refused(`duplicate artifact: ${artifact.id}`);
    artifactIds.add(artifact.id);
    if (artifact.sections.some(id => !sectionIds.has(id))) throw new Refused(`unknown artifact section in ${artifact.id}`);
    const portable = distribution.catalog.assets.find(asset => asset.source === artifact.template);
    if (!portable || !['template', 'repository-template'].includes(portable.role) || !fileBytes(distribution.root, artifact.template)?.length) throw new Refused(`artifact template is not a nonempty portable asset: ${artifact.template}`);
  }
  if (catalog.questions !== undefined) {
    if (!Array.isArray(catalog.questions) || new Set(catalog.questions.map(item => item?.id)).size !== catalog.questions.length) throw new Refused('invalid artifact question identities');
    for (const question of catalog.questions) if (!question || !stableId.test(question.id) || typeof question.fact !== 'string' || !question.fact.trim() || typeof question.prompt !== 'string' || !question.prompt.trim() || !Array.isArray(question.requiredFor) || question.requiredFor.some(id => !artifactIds.has(id))) throw new Refused('invalid artifact question definition');
  }
  return catalog;
}

/** Definitions supplied by the common resolver are already amended; do not independently replay amendments. */
export function artifactBaselineDefinitions(catalog: ArtifactCatalog): ArtifactDefinitions & { questions: Record<string, ConfigurationDefinition> } {
  return { artifacts: Object.fromEntries(catalog.artifacts.map(item => [item.id, structuredClone(item)])), sections: Object.fromEntries(catalog.sections.map(item => [item.id, structuredClone(item)])), questions: Object.fromEntries((catalog.questions ?? []).map(item => [item.id, structuredClone(item)])) };
}

export function queryArtifacts(options: ArtifactQueryOptions = {}): ArtifactSelection {
  const catalog = options.catalog ?? loadArtifactCatalog(options.sourceRoot);
  const definitions = options.definitions ?? artifactBaselineDefinitions(catalog);
  const artifacts = Object.entries(definitions.artifacts ?? {}).map(([id, item]) => definition(item, id) as ArtifactDefinition);
  const sections = Object.entries(definitions.sections ?? {}).map(([id, item]) => definition(item, id, true) as ArtifactSection);
  const sectionIds = new Set(sections.map(section => section.id));
  const selected = options.selectedIds ? new Set(options.selectedIds) : null;
  const omissions = options.omissions ?? [];
  if (new Set(omissions.map(item => item.id)).size !== omissions.length || omissions.some(item => !item.reason?.trim())) throw new Refused('artifact omissions require unique IDs and reasons');
  const omitted = [...omissions], unresolved: string[] = [];
  for (const artifact of catalog.artifacts) if (!artifacts.some(item => item.id === artifact.id)) omitted.push({ id: artifact.id, reason: 'Omitted by the effective resolved artifact definitions.' });
  const result: ArtifactDefinition[] = [];
  for (const id of selected ?? []) if (!artifacts.some(item => item.id === id)) unresolved.push(`Unknown or omitted artifact: ${id}`);
  for (const omission of omissions) if (!artifacts.some(item => item.id === omission.id)) unresolved.push(`Unknown omission target: ${omission.id}`);
  for (const artifact of artifacts) {
    for (const id of artifact.sections.filter(id => !sectionIds.has(id))) {
      const baseline = catalog.sections.find(section => section.id === id);
      if (!baseline) throw new Refused(`artifact ${artifact.id} references an unknown section: ${id}`);
      if (baseline.required) throw new Refused(`cannot omit required artifact section: ${id}`);
      omitted.push({ id, reason: 'Omitted by the effective resolved section definitions.' });
    }
    if (selected && !selected.has(artifact.id)) continue;
    const omission = omissions.find(item => item.id === artifact.id);
    if (omission) { if (artifact.required) throw new Refused(`cannot omit required artifact: ${artifact.id}`); continue; }
    if (!selected && options.surfaces?.length && !artifact.surfaces.includes('any') && !options.surfaces.some(surface => artifact.surfaces.includes(surface))) {
      omitted.push({ id: artifact.id, reason: `Not applicable to selected surfaces: ${options.surfaces.join(', ')}` }); continue;
    }
    result.push({ ...artifact, sections: artifact.sections.filter(id => sectionIds.has(id)) });
  }
  for (const artifact of result) for (const dependency of artifact.dependencies ?? []) if (!result.some(item => item.id === dependency)) unresolved.push(`${artifact.id} requires selected artifact ${dependency}`);
  return { artifacts: structuredClone(result), sections: structuredClone(sections), omitted, unresolved };
}

function ownerMap(raw: ArtifactOwner[]): Map<string, ArtifactOwner> {
  const result = new Map<string, ArtifactOwner>();
  for (const owner of raw) {
    if (!stableId.test(owner.id) || result.has(owner.id) || !['product', 'capability', 'feature', 'contract-topic', 'grouping'].includes(owner.role)) throw new Refused(`invalid or duplicate semantic owner: ${owner.id}`);
    relativeName(owner.path); result.set(owner.id, owner);
  }
  validateDestinations(raw.map(item => `${item.path}/.owner`));
  for (const owner of raw) {
    const seen = new Set([owner.id]); let current = owner;
    while (current.parent) {
      if (seen.has(current.parent)) throw new Refused(`cyclic semantic owner: ${owner.id}`);
      seen.add(current.parent);
      const parent = result.get(current.parent);
      if (!parent) throw new Refused(`unknown parent owner: ${current.parent}`);
      if (!current.path.startsWith(`${parent.path}/`)) throw new Refused(`owner path is outside its semantic parent: ${current.id}`);
      current = parent;
    }
  }
  return result;
}

export function suggestArtifactOwners(rootValue: string, owners: ArtifactOwner[] = []): ArtifactPreview['suggestions'] {
  const root = targetRoot(rootValue), suggestions: ArtifactPreview['suggestions'] = [];
  const bytes = fileBytes(root, 'package.json');
  if (bytes) {
    let manifest: Record<string, unknown>;
    try { manifest = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')) as Record<string, unknown>; }
    catch { throw new Refused('cannot inspect ownership: package.json is invalid JSON'); }
    if (manifest.bin && !owners.some(item => item.id === 'cli' || /(?:^|\/)cli$/.test(item.path))) suggestions.push({ surface: 'cli', evidence: ['package.json#bin'], message: 'An executable CLI is present; map its capability owner before creating CLI feature documents.' });
  }
  const skills = contained(root, 'skills');
  if (fs.existsSync(skills) && fs.statSync(skills).isDirectory()) {
    const evidence: string[] = [];
    for (const entry of fs.readdirSync(skills, { withFileTypes: true })) if (entry.isDirectory() && fileBytes(root, `skills/${entry.name}/SKILL.md`)) evidence.push(`skills/${entry.name}/SKILL.md`);
    if (evidence.length && !owners.some(item => item.id === 'skill' || /(?:^|\/)skill$/.test(item.path))) suggestions.push({ surface: 'skill', evidence, message: 'Agent skill entrypoints are present; map their capability owner. A source file alone does not establish a separate feature.' });
  }
  return suggestions;
}

function sectionOverrides(text: string, artifact: ArtifactDefinition, sections: ArtifactSection[], baselineSections: ArtifactSection[]): string {
  const headings = [...text.matchAll(/^## (.+)\r?$/gm)];
  let output = text;
  for (let index = headings.length - 1; index >= 0; index--) {
    const heading = headings[index];
    const baseline = baselineSections.find(item => item.title === heading[1]);
    const section = sections.find(item => artifact.sections.includes(item.id) && (item.title === heading[1] || item.id === baseline?.id));
    const end = index + 1 < headings.length ? headings[index + 1].index : text.length;
    if (baseline && !artifact.sections.includes(baseline.id)) output = output.slice(0, heading.index) + output.slice(end);
    else if (section?.guidance !== undefined || section && section.title !== heading[1]) {
      const body = section.guidance !== undefined ? `${section.guidance.trim()}\n\n` : text.slice(heading.index! + heading[0].length, end).replace(/^\r?\n/, '');
      output = output.slice(0, heading.index) + `## ${section.title}\n\n${body}` + output.slice(end);
    }
  }
  for (const id of artifact.sections) {
    const section = sections.find(item => item.id === id)!;
    const baseline = baselineSections.find(item => item.id === id);
    if (!headings.some(heading => heading[1] === section.title || heading[1] === baseline?.title) && (!baseline || section.guidance !== undefined)) output += `\n## ${section.title}\n\n${section.guidance ?? 'Record applicable facts and evidence.'}\n`;
  }
  return output;
}

function artifactTemplateSource(root: string, distributionRoot: string, config: FrameworkConfig, artifact: ArtifactDefinition): { text: string; repositoryPath?: string; inputs: Record<string, string | null> } {
  const selectedStory = artifact.id === 'artifact.story' ? config.workflow?.stories?.template : undefined;
  const selectedStoryBytes = selectedStory ? fileBytes(root, selectedStory) : null;
  if (selectedStory && !selectedStoryBytes && selectedStory !== 'docs/internal/templates/design/story.template.md') throw new Refused(`Selected story template does not exist: ${selectedStory}`);
  const repositoryPath = selectedStoryBytes ? selectedStory : artifact.templateSource === 'repository' ? artifact.template : undefined;
  const bytes = repositoryPath ? fileBytes(root, repositoryPath) : fileBytes(distributionRoot, artifact.template);
  if (!bytes?.length) throw new Refused(`artifact template is missing or empty: ${repositoryPath ?? artifact.template}`);
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  if (!/^\s*kind:\s*["']?template["']?\s*$/m.test(text)) throw new Refused(`artifact template must declare kind: template: ${repositoryPath ?? artifact.template}`);
  return { text, ...(repositoryPath ? { repositoryPath } : {}), inputs: repositoryPath ? { [repositoryPath]: digest(bytes) } : {} };
}

function artifactTemplateContent(options: { template: ReturnType<typeof artifactTemplateSource>; artifact: ArtifactDefinition; sections: ArtifactSection[]; catalog: ArtifactCatalog; config: FrameworkConfig; destination: string; facts: Record<string, string>; alignment: Alignment }): string {
  const { artifact, facts } = options;
  let content = sectionOverrides(options.template.text, artifact, options.sections, options.catalog.sections.filter(section => options.catalog.artifacts.find(item => item.id === artifact.id)?.sections.includes(section.id)));
  if (options.template.repositoryPath) content = rewriteMarkdownLinks(content, options.template.repositoryPath, options.destination, {});
  const documentId = path.posix.basename(options.destination).split('.')[0];
  const replacements: Record<string, string> = {
    TITLE: facts.title, CAPABILITY: facts.title, SURFACE: facts.title, INITIATIVE: facts.title, PROJECT_NAME: facts.title,
    HYPOTHESIS: facts.title, SCOPE: facts.scope ?? facts.title, OWNER: facts.owner,
    CAPABILITIES: 'Link actual capability and shared-contract owners when selected. This renderer does not infer owner mappings.',
    SLICE: documentId, STORY_ID: documentId, DECISION_ID: documentId, PHASE: 'draft', RECORD: options.alignment.instruction,
    REQUIREMENTS: 'Link accepted requirements when available.', REQUIREMENT_ID: 'Pending', ACCEPTANCE: 'Define observable acceptance before execution.', CHECK_OR_EVIDENCE: 'Pending verification',
    SLICE_INDEX: 'No execution slices have been selected in this draft. Link actual slice owners, dependencies and acceptance when PLAN selects them.',
  };
  for (const [key, value] of Object.entries(facts)) {
    if (typeof value !== 'string') throw new Refused(`artifact fact must be text: ${key}`);
    replacements[key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase().replace(/[-\s]/g, '_')] = value;
  }
  content = content.replace(/\{\{([A-Z_]+)\}\}/g, (token, key: string) => replacements[key] ?? token);
  const unresolvedTokens = [...new Set(content.match(/\{\{[^}]+\}\}/g) ?? [])];
  if (unresolvedTokens.length) throw new Refused(`${artifact.id} has unanswered template fields: ${unresolvedTokens.join(', ')}`);
  const audience = artifact.id === 'artifact.public-docs' ? 'public' : String(options.config.documentation?.defaultAudience ?? 'internal');
  const metadata = (body: string): string => {
    let result = body;
    for (const [key, value] of Object.entries({ title: JSON.stringify(`${facts.title}: ${artifact.title}`), owner: JSON.stringify(facts.owner), kind: artifact.kind, state: 'draft', audience, updated: new Date().toISOString().slice(0, 10) })) {
      const field = new RegExp(`^([ \\t]*${key}:[ \\t]*).*$`, 'm');
      result = field.test(result) ? result.replace(field, (_line, prefix: string) => `${prefix}${value}`) : `${result.trimEnd()}\n${key}: ${value}\n`;
    }
    return result;
  };
  if (/<!-- mdcomposer:meta/.test(content)) content = content.replace(/<!-- mdcomposer:meta([\s\S]*?)-->/, (_block, body: string) => `<!-- mdcomposer:meta${metadata(body)}-->`);
  else if (/^---\r?\n/.test(content)) content = content.replace(/^---\r?\n([\s\S]*?)\r?\n---/, (_block, body: string) => `---\n${metadata(body).trim()}\n---`);
  else content = `<!-- mdcomposer:meta\n${metadata('').trim()}\n-->\n\n${content}`;
  return content.replace(/<!--\s*(?:Template output:|Repository-owned template:)[\s\S]*?-->/g, '').trimEnd() + '\n';
}

/** Render only. The orchestrator owns destination preservation and validates links across its complete planned output graph. */
export function renderArtifactTemplate(options: RenderArtifactTemplateOptions): RenderedArtifactTemplate {
  if (options.alignment?.confirmed !== true || typeof options.alignment.instruction !== 'string' || !options.alignment.instruction.trim()) throw new Refused('artifact rendering requires actual aligned decisions');
  if (!options.facts || typeof options.facts !== 'object' || Array.isArray(options.facts)) throw new Refused('artifact rendering requires explicit textual facts');
  const root = targetRoot(options.root), destination = relativeName(options.destination);
  if (!destination.endsWith('.md')) throw new Refused('artifact destination must be Markdown');
  contained(root, destination);
  const distribution = locateDistribution(options.sourceRoot), catalog = loadArtifactCatalog(options.sourceRoot);
  const resolution = options.definitions ? undefined : resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), explicitConfig: options.config });
  const config = resolution?.config ?? options.config;
  const selection = queryArtifacts({ catalog, definitions: options.definitions ?? resolution?.definitions });
  if (selection.unresolved.length) throw new Refused(`artifact definitions unresolved: ${selection.unresolved.join('; ')}`);
  const artifact = selection.artifacts.find(item => item.id === options.artifactId);
  if (!artifact) throw new Refused(`unknown or omitted artifact: ${options.artifactId}`);
  const knownKinds = config.documentation?.kinds ?? distribution.config.documentation?.kinds;
  if (knownKinds && !knownKinds.includes(artifact.kind)) throw new Refused(`${artifact.id} requires registering document kind ${artifact.kind}`);
  const missing = artifact.requiredFacts.filter(key => typeof options.facts[key] !== 'string' || !options.facts[key].trim());
  if (missing.length) throw new Refused(`${artifact.id} needs aligned facts: ${missing.join(', ')}`);
  let template = artifactTemplateSource(root, distribution.root, config, artifact);
  if (options.templateContent !== undefined) {
    if (typeof options.templateContent !== 'string' || !options.templateContent.trim()) throw new Refused('inline artifact template content must be nonempty Markdown');
    template = { ...template, text: options.templateContent };
  }
  const content = artifactTemplateContent({ template, artifact, sections: selection.sections, catalog, config, destination, facts: options.facts, alignment: options.alignment });
  const inputs = { ...resolution?.inputs, ...template.inputs, [destination]: fileHash(root, destination) };
  for (const link of extractMarkdownLinks(content)) {
    if (link.unresolvedReference) throw new Refused(`unresolved Markdown reference: ${link.unresolvedReference}`);
    if (/^[a-z][a-z0-9+.-]*:/i.test(link.destination) || link.destination.startsWith('//')) continue;
    const raw = link.destination.split(/[?#]/)[0];
    let decoded: string;
    try { decoded = decodeURIComponent(raw); } catch { throw new Refused(`invalid encoded artifact link: ${link.destination}`); }
    const target = !decoded ? destination : decoded.startsWith('/') ? path.posix.normalize(decoded.slice(1)) : path.posix.normalize(path.posix.join(path.posix.dirname(destination), decoded));
    const absolute = contained(root, target);
    if (target !== destination && (!fs.existsSync(absolute) || fs.statSync(absolute).isFile())) inputs[target] = fileHash(root, target);
  }
  return { content, inputs, artifact: structuredClone(artifact) };
}

export function previewArtifacts(options: ArtifactPreviewOptions): ArtifactPreview {
  const root = targetRoot(options.root);
  const config = options.resolution?.config ?? options.config ?? { schemaVersion: 1 };
  const configuredOwners = config.documentation?.owners;
  const owners = options.owners ?? options.resolution?.owners ?? (Array.isArray(configuredOwners) ? configuredOwners as ArtifactOwner[] : []);
  const mapped = ownerMap(owners);
  const products = owners.filter(owner => owner.role === 'product');
  const product = options.productId ? mapped.get(options.productId) : products.length === 1 ? products[0] : undefined;
  const owner = options.ownerId ? mapped.get(options.ownerId) : product;
  const catalog = options.catalog ?? loadArtifactCatalog(options.sourceRoot);
  const selection = queryArtifacts({ ...options, catalog, definitions: options.definitions ?? options.resolution?.definitions });
  const result: ArtifactPreview = { ready: false, unresolved: [...selection.unresolved], questions: [], suggestions: suggestArtifactOwners(root, owners), artifacts: [], omitted: selection.omitted };
  if (!product || product.role !== 'product') result.unresolved.push('Select one actual product owner (productId) and map its repository-relative documentation path.');
  if (!owner) result.unresolved.push('Select the actual capability, feature, contract or product owner (ownerId) before rendering.');
  if (!options.discoveryOnly && (options.alignment?.confirmed !== true || !options.alignment.instruction?.trim())) result.unresolved.push('Align the selected artifact definitions, ownership paths and facts before generating files.');
  if (result.unresolved.length || !owner || !product) return result;
  let ancestor: ArtifactOwner | undefined = owner;
  while (ancestor && ancestor.id !== product.id) ancestor = ancestor.parent ? mapped.get(ancestor.parent) : undefined;
  if (!ancestor) throw new Refused('selected owner is not within the selected product');
  const distribution = locateDistribution(options.sourceRoot);
  const naming: NamingConvention = config.documentation?.naming ?? distribution.config.documentation!.naming!;
  const knownKinds = config.documentation?.kinds ?? distribution.config.documentation?.kinds;
  if (!naming || !['plain', 'typed'].includes(naming.shape) || !['camel', 'snake', 'kebab', 'pascal', 'any'].includes(naming.identifierCase)) throw new Refused('artifact rendering requires a valid selected documentation naming convention');
  for (const artifact of selection.artifacts) if (knownKinds && !knownKinds.includes(artifact.kind)) result.unresolved.push(`${artifact.id} requires registering document kind ${artifact.kind} in the selected configuration.`);
  if (result.unresolved.length) return result;
  const inputs: Record<string, string | null> = { ...options.resolution?.inputs };
  const operations: MigrationPlan['operations'] = [];
  const canonical = { ...owner.canonical, ...options.canonical };
  const destinations = new Map<string, string>();
  for (const artifact of selection.artifacts) {
    const targetOwner = artifact.id === 'artifact.product-overview' ? product : owner;
    const existing = canonical[artifact.id] ?? targetOwner.canonical?.[artifact.id];
    const baseId = artifact.id === 'artifact.product-overview' ? 'product' : options.identifier ?? owner.id;
    const id = artifact.identifierSuffix ? `${baseId}-${artifact.identifierSuffix}` : baseId;
    const filename = documentFilename(naming.shape === 'plain' && artifact.id !== 'artifact.product-overview' ? `${id}-${artifact.kind}` : id, artifact.kind, naming);
    const destination = existing ? relativeName(existing) : `${targetOwner.path}/${filename}`;
    contained(root, destination); destinations.set(artifact.id, destination);
  }
  validateDestinations([...destinations.values()]);
  const linkTo = (from: string, to: string): string => path.posix.relative(path.posix.dirname(from), to);
  for (const artifact of selection.artifacts) {
    const destination = destinations.get(artifact.id)!;
    const previous = fileBytes(root, destination); inputs[destination] = previous ? digest(previous) : null;
    if (previous) { result.artifacts.push({ id: artifact.id, path: destination, action: 'preserve' }); continue; }
    if (canonical[artifact.id] || (artifact.id === 'artifact.product-overview' ? product : owner).canonical?.[artifact.id]) { result.unresolved.push(`Mapped canonical artifact does not exist: ${artifact.id} -> ${destination}`); continue; }
    const missing = artifact.requiredFacts.filter(key => typeof options.facts[key] !== 'string' || !options.facts[key].trim());
    if (missing.length) {
      result.unresolved.push(`${artifact.id} needs aligned facts: ${missing.join(', ')}`);
      for (const fact of missing) {
        const effectiveQuestions = options.definitions?.questions ?? options.resolution?.definitions?.questions;
        const question = effectiveQuestions ? Object.values(effectiveQuestions).find(item => item.fact === fact) as ArtifactQuestion | undefined : catalog.questions?.find(item => item.fact === fact);
        if (!result.questions.some(item => item.fact === fact)) result.questions.push({ id: question?.id ?? `question.artifact.fact.${fact}`, fact, prompt: question?.prompt ?? `Provide the aligned ${fact} for ${artifact.title}.` });
      }
      continue;
    }
    const ownerSummary = owners.filter(item => {
      if (!['capability', 'contract-topic'].includes(item.role)) return false;
      let ancestor: ArtifactOwner | undefined = item;
      while (ancestor && ancestor.id !== product.id) ancestor = ancestor.parent ? mapped.get(ancestor.parent) : undefined;
      return Boolean(ancestor);
    }).map(item => {
      const canonicalDocument = Object.values(item.canonical ?? {}).find(name => fileBytes(root, name)) ?? (fileBytes(root, `${item.path}/index.md`) ? `${item.path}/index.md` : undefined);
      return canonicalDocument ? `- [${item.id}](${linkTo(destination, canonicalDocument)}) (${item.role})` : `- ${item.id} (${item.role}); mapped documentation home: \`${item.path}\`.`;
    }).join('\n') || 'No capability or shared-contract owner mappings are aligned for this product yet.';
    let content: string;
    try {
      const template = artifactTemplateSource(root, distribution.root, config, artifact);
      Object.assign(inputs, template.inputs);
      content = artifactTemplateContent({ template, artifact, sections: selection.sections, catalog, config, destination, facts: { ...options.facts, capabilities: options.facts.capabilities ?? ownerSummary, slice: options.identifier ?? owner.id, story_id: options.identifier ?? owner.id, decision_id: options.identifier ?? owner.id }, alignment: options.alignment }).trimEnd();
    } catch (error) {
      if (error instanceof Refused && /Selected story template does not exist|unanswered template fields/.test(error.message)) { result.unresolved.push(error.message); continue; }
      throw error;
    }
    const references = [...destinations].filter(([id]) => id !== artifact.id).map(([id, name]) => `- [${selection.artifacts.find(item => item.id === id)!.title}](${linkTo(destination, name)})`);
    if (references.length) content += `\n\n## Related artifacts\n\n${references.join('\n')}`;
    content += '\n';
    result.artifacts.push({ id: artifact.id, path: destination, action: 'create', content });
    operations.push({ id: `artifact-${operations.length + 1}`, kind: 'create', path: destination, beforeHash: null, afterHash: digest(content), content: Buffer.from(content).toString('base64'), encoding: 'base64', reason: `render aligned ${artifact.id}; preserve existing canonical documents` });
  }
  if (result.unresolved.length) return result;
  const overview = destinations.get('artifact.product-overview');
  if (overview) {
    const index = `${product.path}/index.md`, previous = fileBytes(root, index); inputs[index] = previous ? digest(previous) : null;
    if (!previous) {
      if (!options.facts.title?.trim() || !options.facts.owner?.trim()) { result.unresolved.push('Product navigation needs aligned facts: title, owner'); return result; }
      const content = `# ${options.facts.title}\n\n<!-- mdcomposer:meta\ntitle: ${JSON.stringify(options.facts.title)}\nkind: overview\nstate: draft\naudience: internal\nowner: ${JSON.stringify(options.facts.owner)}\nupdated: ${new Date().toISOString().slice(0, 10)}\n-->\n\n[Product overview](${linkTo(index, overview)})\n`;
      operations.push({ id: `artifact-${operations.length + 1}`, kind: 'create', path: index, beforeHash: null, afterHash: digest(content), content: Buffer.from(content).toString('base64'), encoding: 'base64', reason: 'route product navigation to its canonical overview' });
    } else {
      const original = previous.toString('utf8');
      const linked = extractMarkdownLinks(original).some(link => path.posix.normalize(path.posix.join(product.path, link.destination.split(/[?#]/)[0])) === overview);
      if (!linked) {
        const content = `${original}${original.endsWith('\n') ? '' : '\n'}\n[Product overview](${linkTo(index, overview)})\n`;
        operations.push({ id: `artifact-${operations.length + 1}`, kind: 'update', path: index, beforeHash: digest(previous), afterHash: digest(content), content: Buffer.from(content).toString('base64'), encoding: 'base64', reason: 'append overview routing while preserving existing product navigation' });
      }
    }
  }
  validateDestinations(operations.map(operation => operation.path));
  const planned = new Map(operations.map(operation => [operation.path, Buffer.from(operation.content!, 'base64').toString('utf8')]));
  for (const [name, content] of planned) for (const link of extractMarkdownLinks(content)) {
    if (link.unresolvedReference) { result.unresolved.push(`${name}: unresolved Markdown reference ${link.unresolvedReference}`); continue; }
    if (/^[a-z][a-z0-9+.-]*:/i.test(link.destination) || link.destination.startsWith('//')) continue;
    const boundary = link.destination.search(/[?#]/), raw = boundary < 0 ? link.destination : link.destination.slice(0, boundary), suffix = boundary < 0 ? '' : link.destination.slice(boundary);
    let decoded: string;
    try { decoded = decodeURIComponent(raw); } catch { throw new Refused(`invalid encoded artifact link: ${link.destination}`); }
    const destination = !decoded ? name : decoded.startsWith('/') ? path.posix.normalize(decoded.slice(1)) : path.posix.normalize(path.posix.join(path.posix.dirname(name), decoded));
    relativeName(destination);
    const existing = fileBytes(root, destination), target = planned.get(destination) ?? existing?.toString('utf8');
    if (target === undefined) { result.unresolved.push(`${name}: missing local link ${link.destination}`); continue; }
    if (!planned.has(destination)) inputs[destination] = digest(existing!);
    const fragment = suffix.match(/#(.*)$/)?.[1];
    if (fragment && !headingSlugs(target).has(decodeURIComponent(fragment))) result.unresolved.push(`${name}: missing heading fragment ${link.destination}`);
  }
  if (result.unresolved.length) return result;
  if (options.discoveryOnly) { result.ready = true; return result; }
  const plan: MigrationPlan = { product: 'stavel', schemaVersion: 2, id: '', root, frameworkVersion: distribution.version, profileVersion: `${config.id ?? 'default'}@${config.version ?? 1}`, mode: 'adopt', track: 'existing', projectName: options.facts.title || product.id, alignment: options.alignment, decisions: { artifacts: selection.artifacts.map(artifact => artifact.id), owner: owner.id, product: product.id }, inputs, operations, diagnostics: [], createdAt: new Date().toISOString() };
  plan.id = planDigest(plan); result.plan = plan; result.ready = true; return result;
}

export function createArtifactPlan(options: ArtifactPreviewOptions): MigrationPlan {
  const preview = previewArtifacts(options);
  if (preview.ready && options.discoveryOnly) throw new Refused('artifact inputs unresolved for application: read-only discovery issues no plan; align the selected decisions and request a regular preview');
  if (!preview.ready || !preview.plan) throw new Refused(`artifact inputs unresolved: ${preview.unresolved.join('; ')}`);
  return preview.plan;
}
