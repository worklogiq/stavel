import fs from 'node:fs';
import path from 'node:path';
import type { AnswersDocument, CreatePlanOptions, FrameworkConfig, MigrationPlan, NamingConvention, PlanOperation } from './framework.types.js';
import { alignedDecisions, expandAnswers, inspectRepository } from './decisions.service.js';
import { locateDistribution } from './distribution.service.js';
import { contained, digest, fileBytes, fileHash, jsonText, Refused, relativeName, targetRoot, validateDestinations, walkFiles } from './filesystem.service.js';
import { rewriteMarkdownLinks } from './markdown.service.js';
import { documentFilename, fixedFilenames, identifier, renameDocument } from './naming.service.js';
import { parseMetadata } from '@worklogiq/mdcomposer';
import { resolveTestingConfig } from './testing.service.js';
import { configurationDecisionOverrides, directoryConfigurationFiles, mergeConfigurationOverrides, ownConfigurationValue, packagedConfigurationDefinitions, resolveRepositoryConfiguration, type ConfigurationAmendment } from './configuration.service.js';
import { AI_EFFECT_WARNING } from './effects.service.js';
import { validateGitGuardActivation } from './git-guard.service.js';

export const DEFAULT_ENTRYPOINTS = { index: 'docs/internal/index.md', constitution: 'docs/internal/process/development-constitution.policy.md', profile: 'docs/internal/dev/project-profile.overview.md' };
const styleCases: Record<string, 'camel' | 'snake' | 'kebab' | 'pascal'> = { camelCase: 'camel', snake_case: 'snake', 'kebab-case': 'kebab', PascalCase: 'pascal' };

export function configurationForAnswers(base: FrameworkConfig, answers: AnswersDocument, decisions: Record<string, unknown>): FrameworkConfig {
  const selectedConfiguration = configurationDecisionOverrides(decisions);
  const config = mergeConfigurationOverrides(mergeConfigurationOverrides(base, selectedConfiguration), answers.configuration);
  config.documentation ??= {};
  config.documentation.naming ??= { shape: 'typed', identifierCase: 'kebab', generatedIdentifierCase: 'kebab' };
  if (decisions['documentation.taxonomy'] === 'mapped' && (!answers.configuration?.documentation?.roots?.length || !Object.keys(answers.ownership ?? {}).length)) throw new Refused('mapped taxonomy requires explicit configuration.documentation.roots and ownership mappings');
  if (decisions['documentation.lifecycle'] === 'mapped-legacy' && (!answers.configuration?.documentation?.states?.length || !Object.keys(answers.lifecycleMappings ?? {}).length)) throw new Refused('mapped-legacy lifecycle requires explicit allowed states and lifecycleMappings');
  if (decisions['documentation.audiences'] === 'internal') {
    config.documentation.audiences = ['internal']; config.documentation.defaultAudience = 'internal';
    config.documentation.roots = [config.documentation.roots?.[0] ?? 'docs/internal'];
  }
  const style = String(decisions['documentation.naming.style'] ?? decisions['documentation.naming.shape'] ?? '');
  if (styleCases[style]) config.documentation.naming = { shape: 'plain', identifierCase: styleCases[style], generatedIdentifierCase: styleCases[style] };
  else if (style === 'typed') config.documentation.naming.shape = 'typed';
  const selectedCase = decisions['documentation.naming.identifierCase'];
  if (['camel', 'snake', 'kebab', 'pascal', 'any'].includes(String(selectedCase))) config.documentation.naming.identifierCase = selectedCase as NamingConvention['identifierCase'];
  const generatedCase = decisions['documentation.naming.generatedIdentifierCase'];
  if (['camel', 'snake', 'kebab', 'pascal'].includes(String(generatedCase))) config.documentation.naming.generatedIdentifierCase = generatedCase as NonNullable<NamingConvention['generatedIdentifierCase']>;
  config.source = { ...config.source, decisions: Object.fromEntries(Object.entries(decisions).filter(([key]) => key.startsWith('source.'))) };
  const sourceNaming = config.source.naming && typeof config.source.naming === 'object' ? config.source.naming as Record<string, unknown> : {};
  const sourceCase = decisions['source.naming.identifierCase'];
  if (['camel', 'snake', 'kebab', 'pascal', 'any'].includes(String(sourceCase))) config.source.naming = { ...sourceNaming, identifierCase: sourceCase };
  const selectedLanguages = decisions['source.languages'];
  if (selectedLanguages !== undefined) {
    const items = Array.isArray(selectedLanguages) ? selectedLanguages : typeof selectedLanguages === 'string' ? selectedLanguages.split(',').map(item => item.trim()) : [];
    if (!items.length || items.some(item => typeof item !== 'string' || !/^[a-z][a-z0-9+#-]*$/i.test(item))) throw new Refused('source.languages must be explicit language IDs as a nonempty array or comma-separated list, not free prose');
    const aliases: Record<string, string> = { js: 'javascript', ts: 'typescript', py: 'python', 'c#': 'csharp', 'c++': 'cpp' };
    config.source.languages = [...new Set(items.map(item => aliases[String(item).toLowerCase()] ?? String(item).toLowerCase()))];
  }
  const scopes = decisions['source.scopes'] ?? config.source.scopes;
  if (scopes !== undefined) {
    if (!scopes || typeof scopes !== 'object' || Array.isArray(scopes)) throw new Refused('source.scopes must map repository-relative roots to explicit language/convention records');
    for (const [scope, value] of Object.entries(scopes)) {
      relativeName(scope);
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Refused(`source scope must be a convention object: ${scope}`);
      const convention = value as Record<string, unknown>;
      const unsupported = Object.keys(convention).filter(key => !['language', 'naming', 'roles', 'rules'].includes(key));
      if (unsupported.length) throw new Refused(`unsupported source scope fields at ${scope}: ${unsupported.join(', ')}`);
      if (convention.language !== undefined && (typeof convention.language !== 'string' || !/^[a-z][a-z0-9+#-]*$/i.test(convention.language))) throw new Refused(`source scope language must be an explicit ID: ${scope}`);
      if (convention.roles !== undefined && (!Array.isArray(convention.roles) || !convention.roles.length || convention.roles.some(role => typeof role !== 'string' || !role.trim()))) throw new Refused(`source scope roles must be a nonempty string array: ${scope}`);
      if (convention.rules !== undefined && (!convention.rules || typeof convention.rules !== 'object' || Array.isArray(convention.rules) || Object.values(convention.rules).some(rule => typeof rule !== 'boolean' && (!rule || typeof rule !== 'object' || Array.isArray(rule))))) throw new Refused(`source scope rules must be a rule-option mapping: ${scope}`);
      if (convention.naming !== undefined) {
        if (!convention.naming || typeof convention.naming !== 'object' || Array.isArray(convention.naming)) throw new Refused(`source scope naming must be an object: ${scope}`);
        const naming = convention.naming as Record<string, unknown>;
        if (naming.identifierCase !== undefined && !['camel', 'snake', 'kebab', 'pascal', 'any'].includes(String(naming.identifierCase))) throw new Refused(`source scope has unsupported casing: ${scope}`);
        if (naming.shape !== undefined && !['plain', 'typed'].includes(String(naming.shape))) throw new Refused(`source scope has unsupported filename shape: ${scope}`);
        if (naming.allowedNames !== undefined && (!Array.isArray(naming.allowedNames) || naming.allowedNames.some(name => typeof name !== 'string' || !name.trim()))) throw new Refused(`source scope allowedNames must be a string array: ${scope}`);
      }
    }
    config.source.scopes = scopes;
  }
  const selectedModules = decisions['tooling.modules'];
  if (selectedModules !== undefined) config.tooling = { modules: selectedModules };
  if (selectedModules === 'custom' && !Object.keys({ ...selectedConfiguration.rules, ...answers.configuration?.rules }).length) throw new Refused('custom tooling requires explicit configuration.rules');
  if (selectedModules === 'markdown-and-javascript-typescript') {
    config.rules ??= {};
    config.rules['source-naming'] = { enabled: true, severity: 'error', ...(config.rules['source-naming'] as object ?? {}) };
    (config.rules['source-naming'] as Record<string, unknown>).enabled = true;
    config.rules['file-length'] = { enabled: true, severity: 'warning', maxLines: config.source.maxLines ?? 500, ...(config.rules['file-length'] as object ?? {}) };
    (config.rules['file-length'] as Record<string, unknown>).enabled = true;
    for (const id of ['api-client-usage', 'api-error-codes', 'frontend-i18n-copy', 'frontend-error-surfaces']) {
      const supplied = ownConfigurationValue(answers.configuration, `rules.${id}`).present || ownConfigurationValue(selectedConfiguration, `rules.${id}`).present;
      const rule = config.rules[id] as Record<string, unknown> | undefined;
      if (!supplied || !rule || typeof rule.enabled !== 'boolean') throw new Refused(`selected JavaScript/TypeScript tooling requires an explicit ${id} configuration or disabled reason`);
      if (rule.enabled && (!Array.isArray(rule.roots) || !rule.roots.length || id === 'api-client-usage' && (typeof rule.apiClientModule !== 'string' || !rule.apiClientModule.trim()))) throw new Refused(`${id} needs explicit applicable roots${id === 'api-client-usage' ? ' and an accepted API client module' : ''}`);
      if (!rule.enabled && (typeof rule.reason !== 'string' || !rule.reason.trim())) throw new Refused(`disabled ${id} needs an explicit applicability reason`);
      for (const scope of rule.roots as string[] ?? []) relativeName(scope);
      config.rules[id] = rule;
    }
  }
  config.testing = resolveTestingConfig(config.testing, decisions['verification.testPlacement'], decisions['verification.testLayout']);
  const selectedStories = decisions['workflow.stories.generation'];
  const selectedTemplate = decisions['workflow.stories.template'];
  if (config.workflow?.stories || selectedStories !== undefined || selectedTemplate !== undefined) {
    const supplied = config.workflow?.stories;
    if (supplied !== undefined && (!supplied || typeof supplied !== 'object' || Array.isArray(supplied))) throw new Refused('workflow.stories must be an object');
    const stories = { generation: 'ask', template: 'docs/internal/templates/design/story.template.md', ...base.workflow?.stories, ...supplied };
    if (selectedStories !== undefined && selectedStories !== 'profile-default') stories.generation = String(selectedStories) as typeof stories.generation;
    if (selectedTemplate !== undefined) stories.template = String(selectedTemplate);
    const generation = stories.generation;
    if (Object.keys(stories).some(key => !['generation', 'template'].includes(key)) || generation !== 'ask' && generation !== 'always' && generation !== 'never') throw new Refused('workflow.stories requires generation ask, always or never and a template path');
    if (typeof stories.template !== 'string' || !stories.template.endsWith('.md')) throw new Refused('workflow.stories.template must name a repository-relative Markdown template');
    stories.template = relativeName(stories.template);
    config.workflow = { ...config.workflow, stories: { generation, template: stories.template } };
  }
  return config;
}

export function validateAnswers(answers: AnswersDocument): void {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new Refused('answers must be a JSON object');
  const allowed = new Set(['answers', 'alignment', 'useDefaults', 'configuration', 'mappings', 'lifecycleMappings', 'ownership', 'history', 'acceptanceRecords']);
  const unexpected = Object.keys(answers).filter(key => !allowed.has(key));
  if (unexpected.length) throw new Refused(`unsupported answers fields: ${unexpected.join(', ')}; ownership maps canonical roles; mappings is migration-only`);
  if (!answers.answers || typeof answers.answers !== 'object' || Array.isArray(answers.answers)) throw new Refused('answers.answers must be a decision-ID mapping');
  if (answers.useDefaults !== undefined && typeof answers.useDefaults !== 'boolean') throw new Refused('useDefaults must be a boolean');
  if (answers.configuration !== undefined) {
    if (!answers.configuration || typeof answers.configuration !== 'object' || Array.isArray(answers.configuration) || answers.configuration.schemaVersion !== undefined && answers.configuration.schemaVersion !== 1) throw new Refused('configuration must be a version-1 profile object');
    for (const key of ['roots', 'states'] as const) {
      const values = answers.configuration.documentation?.[key];
      if (values !== undefined && (!Array.isArray(values) || !values.length || values.some(value => typeof value !== 'string' || !value.trim()))) throw new Refused(`configuration.documentation.${key} must be a nonempty string array`);
      if (key === 'roots') for (const value of values ?? []) relativeName(value);
    }
  }
  for (const key of ['mappings', 'lifecycleMappings', 'ownership', 'acceptanceRecords'] as const) {
    const record = answers[key];
    if (record !== undefined && (!record || typeof record !== 'object' || Array.isArray(record) || Object.values(record).some(value => typeof value !== 'string' || !value.trim()))) throw new Refused(`${key} must be an object mapping names to nonempty strings`);
  }
}

function decisionValue(value: unknown): unknown {
  return value && typeof value === 'object' && !Array.isArray(value) && 'value' in value ? (value as { value: unknown }).value : value;
}

function remapAsset(name: string, frameworkPath: string | undefined, config?: FrameworkConfig): string {
  const internalRoot = relativeName(frameworkPath ?? 'docs/internal');
  const internalOnly = (config?.documentation?.audiences as string[] | undefined)?.length === 1 && (config?.documentation?.audiences as string[])[0] === 'internal';
  if (name.startsWith('docs/public/')) {
    const publicRoot = internalOnly ? `${internalRoot}/guides` : config?.documentation?.roots?.[1] ?? 'docs/public';
    return `${relativeName(publicRoot)}/${name.slice('docs/public/'.length)}`;
  }
  if (!name.startsWith('docs/internal/')) return name;
  const owners = config?.documentation?.ownershipRoots as Record<string, string> | undefined;
  const knownPrefixes: Record<string, string> = { architecture: 'architecture', philosophies: 'philosophies', process: 'process', developerGuides: 'dev', decisions: 'decisions', platform: 'platform', modules: 'modules', edge: 'edge' };
  for (const [role, prefix] of Object.entries(knownPrefixes)) if (owners?.[role] && name.startsWith(`docs/internal/${prefix}/`)) return `${relativeName(owners[role])}/${name.slice(`docs/internal/${prefix}/`.length)}`;
  return `${internalRoot}/${name.slice('docs/internal/'.length)}`;
}

function setAudience(content: string, audience: string): string {
  return content.replace(/(<!--\s*mdcomposer:meta[\s\S]*?)(-->)/, (_block, body: string, closing: string) => `${body.replace(/^(\s*audience:\s*).*$/m, `$1${audience}`)}${closing}`);
}

function generateMetadata(content: string, name: string, answers: AnswersDocument, allowedStates = ['draft', 'accepted', 'active', 'complete', 'deprecated'], owner = 'project-maintainer'): string {
  if (name.includes('/templates/') || fixedFilenames.has(path.posix.basename(name))) return content;
  if (/<!--\s*mdcomposer:meta\b/.test(content) || /^---\r?\n/.test(content)) {
    const existing = parseMetadata(content);
    const original = String(existing.data.state ?? 'draft');
    const mapped = answers.lifecycleMappings?.[original] ?? (original === 'superseded' ? 'deprecated' : original);
    if (!allowedStates.includes(mapped)) throw new Refused(`legacy state ${original} needs an explicit supported lifecycle mapping: ${name}`);
    if (mapped !== original) content = content.replace(/^(\s*state:\s*).*$/m, `$1${mapped}`);
    if (['accepted', 'active'].includes(mapped) && !existing.data.acceptance) {
      const record = answers.acceptanceRecords?.[name];
      if (!record?.trim()) throw new Refused(`legacy ${mapped} metadata needs an actual acceptance record before conversion: ${name}`);
      const line = `acceptance: ${JSON.stringify(record)}\n`;
      if (/<!--\s*mdcomposer:meta\b/.test(content)) return content.replace(/(<!--\s*mdcomposer:meta[\s\S]*?)(-->)/, `$1${line}$2`);
      return content.replace(/^(---\r?\n[\s\S]*?)(\r?\n---)/, `$1\n${line.trimEnd()}$2`);
    }
    return content;
  }
  const statusLine = content.match(/^Status:\s*(.+)$/im)?.[1] ?? '';
  const declared = statusLine.match(/^([a-z][a-z0-9_-]*)\b/i)?.[1]?.toLowerCase();
  let state = answers.lifecycleMappings?.[declared ?? 'draft'] ?? declared ?? 'draft';
  if (state === 'superseded') state = 'deprecated';
  if (state === 'archived') {
    const mapped = answers.lifecycleMappings?.archived;
    if (!mapped || !['draft', 'accepted', 'active', 'complete', 'deprecated'].includes(mapped)) throw new Refused(`archived lifecycle needs an explicit meaningful state mapping: ${name}; archive location does not imply completion`);
    state = mapped;
  }
  if (!allowedStates.includes(state)) throw new Refused(`legacy state ${state} needs an explicit supported lifecycle mapping: ${name}`);
  const title = content.match(/^#\s+(.+)$/m)?.[1] ?? path.posix.basename(name, '.md');
  const kind = path.posix.basename(name, '.md').split('.').slice(1).join('-') || 'overview';
  const acceptanceRecord = answers.acceptanceRecords?.[name];
  if ((state === 'accepted' || state === 'active') && !acceptanceRecord?.trim()) throw new Refused(`legacy ${state} declaration needs an actual acceptance record before metadata conversion: ${name}; supply acceptanceRecords rather than inventing approval evidence`);
  const acceptance = acceptanceRecord ? `acceptance: ${JSON.stringify(acceptanceRecord)}\n` : '';
  return `<!-- mdcomposer:meta\ntitle: ${JSON.stringify(title)}\nkind: ${kind}\nstate: ${state}\naudience: ${name.startsWith('docs/public/') ? 'public' : 'internal'}\nowner: ${JSON.stringify(owner)}\nupdated: ${new Date().toISOString().slice(0, 10)}\n${acceptance}-->\n\n${content}`;
}

function fillTemplate(text: string, values: Record<string, string>): string {
  const replace = (value: string): string => value.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key: string) => values[key] ?? 'not yet established');
  return text.replace(/^(\s*[A-Za-z][A-Za-z0-9_-]*:\s*)(["'])(.*)\2\s*$/gm, (_line, prefix: string, quote: string, body: string) => {
    let decoded = body;
    if (quote === '"') { try { decoded = JSON.parse(`"${body}"`) as string; } catch { decoded = body; } }
    return `${prefix}${JSON.stringify(replace(decoded))}`;
  }).replace(/\{\{([A-Z_]+)\}\}/g, (_match, key: string) => values[key] ?? 'not yet established');
}

function contextDocument(name: string, track: string, answers: AnswersDocument, decisions: Record<string, unknown>, contextPath: string, mapping: Record<string, string>): string {
  const owner = String(decisions['project.owner'] ?? 'project-maintainer');
  const history = answers.history ?? [];
  const entries = history.length ? history.map(item => {
    if (!item.sources?.length) throw new Refused(`historical observation needs source references: ${item.topic}`);
    const citations = item.sources.map(source => {
      const label = source.replace(/([\\\[\]])/g, '\\$1');
      const link = `[${label}](<${source}>)`;
      return /^[a-z][a-z0-9+.-]*:/i.test(source) ? link : rewriteMarkdownLinks(link, 'repository-context-input.md', contextPath, mapping);
    });
    return `### ${item.topic}\n\nEvidence status: ${item.status ?? 'observed; acceptance unverified'}.\n\n${item.observation}\n\nSources: ${citations.join(', ')}\n`;
  }).join('\n') : 'Historical constraints, rejected approaches, recurring issues, compatibility obligations, and unresolved discrepancies are not yet established. Consult repository history and current owners before relying on historical claims.\n';
  return `# ${name}: repository context\n\n<!-- mdcomposer:meta\ntitle: ${JSON.stringify(`${name} repository context`)}\nkind: overview\nstate: draft\naudience: internal\nowner: ${JSON.stringify(owner)}\nupdated: ${new Date().toISOString().slice(0, 10)}\n-->\n\nAdoption route: ${track}. This record distinguishes observations from accepted policy.\n\n## Established choices\n\n\`\`\`json\n${JSON.stringify(decisions, null, 2)}\n\`\`\`\n\n## Historical context and open questions\n\n${entries}`;
}

function migrationMappings(files: string[], answers: AnswersDocument, naming: NamingConvention, kinds: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const [from, to] of Object.entries(answers.mappings ?? {})) {
    relativeName(from); relativeName(to);
    if (!files.includes(from)) throw new Refused(`migration source does not exist: ${from}`);
    if (fixedFilenames.has(path.posix.basename(from)) && (path.posix.basename(from) !== path.posix.basename(to) || ['AGENTS.md', 'SKILL.md', 'package.json'].includes(path.posix.basename(from)) && from !== to)) throw new Refused(`host-required filename/location cannot be migrated: ${from}`);
    if (!/\.md$/i.test(from) && !/(?:^|\/)(?:\.stavel\.json|package\.json|stavel\.config\.json)$/.test(from)) throw new Refused(`general migration cannot rename application source: ${from}; v1 covers documentation, instructions, configuration, and tool wiring`);
    mapping[from] = to;
  }
  for (const name of files) {
    if (!/\.md$/i.test(name) || fixedFilenames.has(path.posix.basename(name))) continue;
    if (!/^(?:docs\/|framework\/|examples\/)/.test(name) && !mapping[name]) continue;
    const proposed = mapping[name] ?? name;
    if (!path.posix.basename(proposed, '.md').includes('.') && !mapping[name]) throw new Refused(`document kind needs an explicit migration mapping: ${name}; discover its owner and role before generating a typed filename`);
    const typed = renameDocument(proposed, naming, kinds);
    if (typed !== name) mapping[name] = typed;
  }
  validateDestinations(Object.values(mapping));
  return mapping;
}

export function createPlan(options: CreatePlanOptions & { configurationHome?: 'root' | 'directory'; scope?: string; taskAmendments?: ConfigurationAmendment[] }): MigrationPlan {
  const root = targetRoot(options.root);
  if (!options.name?.trim() || /[\x00-\x1f]/.test(options.name)) throw new Refused('project name must be nonempty and contain no control characters');
  const track = options.track ?? 'existing';
  if (!['greenfield', 'existing', 'research'].includes(track)) throw new Refused(`invalid track: ${track}`);
  const mode = options.mode ?? (track === 'greenfield' ? 'bootstrap' : 'adopt');
  validateAnswers(options.answers);
  if (mode !== 'migrate' && Object.keys(options.answers.mappings ?? {}).length) throw new Refused('mappings is migration-only; use ownership for canonical-document roles when adopting without renaming');
  const recordedName = decisionValue(options.answers.answers['project.name']);
  if (recordedName !== undefined && recordedName !== options.name) throw new Refused('--name conflicts with the aligned project.name answer');
  const recordedMode = decisionValue(options.answers.answers['workflow.mode']);
  if (recordedMode !== undefined && recordedMode !== mode) throw new Refused('--mode conflicts with the aligned workflow.mode answer');
  const expanded = expandAnswers(options.answers) as AnswersDocument;
  const normalizedAnswers: AnswersDocument = { ...expanded, answers: { ...expanded.answers, 'project.name': expanded.answers['project.name'] ?? options.name, 'workflow.mode': expanded.answers['workflow.mode'] ?? mode } };
  const distribution = locateDistribution(options.sourceRoot);
  if (options.upgradeBaseline && mode !== 'migrate') throw new Refused('baseline upgrade requires an aligned mode migrate plan');
  const resolved = resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), scope: options.scope, taskAmendments: options.taskAmendments, upgradeBaseline: options.upgradeBaseline });
  if (options.scope || options.taskAmendments?.length) throw new Refused('adoption plans persist repository policy only; task/scope amendments are read-only inputs for their workflow, not standing configuration writes');
  if (options.configurationHome !== undefined && !['root', 'directory'].includes(options.configurationHome)) throw new Refused('configurationHome must be root or directory');
  if (resolved.kind === 'configured-directory' && options.configurationHome === 'root') throw new Refused('directory-to-root configuration downgrade requires a separate explicit migration');
  const configurationHome = options.configurationHome ?? (resolved.kind === 'configured-directory' ? 'directory' : 'root');
  if (resolved.kind === 'legacy-root' && configurationHome === 'directory' && mode !== 'migrate') throw new Refused('root configuration retirement requires mode migrate with aligned decisions');
  const decisions = alignedDecisions({ ...options, root, track, answers: normalizedAnswers });
  decisions['project.name'] = options.name;
  decisions['workflow.mode'] = mode;
  const projectOwner = String(decisions['project.owner'] ?? 'project-maintainer');
  const persistedDecisions = new Map(resolved.decisions.filter(record => record.scope === 'repository').map(record => [record.id, record]));
  const configurationDecisions = options.upgradeBaseline ? Object.fromEntries(Object.entries(decisions).filter(([id]) => Object.hasOwn(options.answers.answers, id) || persistedDecisions.has(id) && persistedDecisions.get(id)!.origin !== 'profile-default')) : decisions;
  const config = configurationForAnswers(resolved.config, normalizedAnswers, configurationDecisions);
  const frameworkRoot = options.frameworkPath ?? (normalizedAnswers.configuration?.documentation?.roots || decisions['documentation.taxonomy'] === 'mapped' || resolved.kind !== 'absent' ? config.documentation?.roots?.[0] : undefined);
  if (frameworkRoot) {
    relativeName(frameworkRoot);
    config.documentation!.roots = (config.documentation?.roots ?? ['docs/internal', 'docs/public']).map(name => name === 'docs/internal' || name.startsWith('docs/internal/') ? `${frameworkRoot}${name.slice('docs/internal'.length)}` : name);
    const owners = config.documentation?.ownershipRoots as Record<string, string> | undefined;
    if (owners) config.documentation!.ownershipRoots = Object.fromEntries(Object.entries(owners).map(([role, name]) => [role, name === 'docs/internal' || name.startsWith('docs/internal/') ? `${frameworkRoot}${name.slice('docs/internal'.length)}` : name]));
    const defaultOwnerPaths = new Set((distribution.config.documentation?.owners as Array<{ path: string }> | undefined ?? []).map(owner => owner.path));
    if (!normalizedAnswers.configuration?.documentation?.owners && Array.isArray(config.documentation?.owners)) config.documentation.owners = config.documentation.owners.map(owner => {
      const record = owner as Record<string, unknown>; const name = String(record.path);
      return defaultOwnerPaths.has(name) && (name === 'docs/internal' || name.startsWith('docs/internal/')) ? { ...record, path: `${frameworkRoot}${name.slice('docs/internal'.length)}` } : record;
    });
    if (config.documentation?.archive && typeof config.documentation.archive.root === 'string' && config.documentation.archive.root.startsWith('docs/internal/')) config.documentation.archive.root = `${frameworkRoot}${config.documentation.archive.root.slice('docs/internal'.length)}`;
  }
  const naming = config.documentation?.naming ?? { shape: 'typed', identifierCase: 'kebab' };
  const inspection = inspectRepository({ root, track });
  const inputs: Record<string, string | null> = { ...Object.fromEntries(inspection.files.map(file => [file.path, file.hash])), ...resolved.inputs };
  const desired = new Map<string, Buffer>();
  const reasons = new Map<string, string>();
  const origins: Record<string, string> = {};
  const mapping = mode === 'migrate' ? migrationMappings(inspection.files.map(file => file.path), normalizedAnswers, naming, config.documentation?.kinds ?? []) : {};
  for (const [from, to] of Object.entries(mapping)) {
    const source = fileBytes(root, from)!;
    const oldDestination = fileBytes(root, to);
    if (oldDestination && !mapping[to] && from !== to && !oldDestination.equals(source)) throw new Refused(`no files written; differing migration destination requires review: ${to}`);
    desired.set(to, source);
    origins[to] = from;
    reasons.set(to, 'approved taxonomy migration preserving the original document');
  }
  const catalogMapping: Record<string, string> = {};
  const repositoryTemplates = new Set<string>();
  const preservedTemplates = new Set<string>();
  for (const asset of distribution.catalog.assets) {
    if (asset.role === 'git-hook-runtime') continue;
    const destination = remapAsset(asset.target, frameworkRoot, config);
    const filename = path.posix.basename(destination);
    const typedDestination = destination.endsWith('.md') && !fixedFilenames.has(filename) ? renameDocument(destination, naming, config.documentation?.kinds ?? []) : destination;
    catalogMapping[asset.source] = typedDestination;
    if (asset.role === 'repository-template') repositoryTemplates.add(typedDestination);
    const bytes = fileBytes(distribution.root, asset.source);
    if (!bytes) throw new Refused(`missing source asset: ${asset.source}`);
    const existing = fileBytes(root, typedDestination);
    if (desired.has(typedDestination)) continue;
    if (existing && asset.role === 'repository-template') {
      desired.set(typedDestination, existing); preservedTemplates.add(typedDestination); reasons.set(typedDestination, 'preserve repository-owned template customization');
    }
    else if (existing && mode === 'migrate') { desired.set(typedDestination, existing); reasons.set(typedDestination, 'preserve existing accepted document content'); }
    else { desired.set(typedDestination, bytes); reasons.set(typedDestination, `portable asset: ${asset.role}`); }
  }
  for (const asset of distribution.catalog.assets) {
    if (asset.role === 'git-hook-runtime') continue;
    const destination = catalogMapping[asset.source];
    if (preservedTemplates.has(destination) || origins[destination] || (mode === 'migrate' && fileBytes(root, destination))) continue;
    if (destination.endsWith('.md')) {
      let text = rewriteMarkdownLinks(desired.get(destination)!.toString('utf8'), asset.source, destination, catalogMapping);
      if (decisions['documentation.audiences'] === 'internal') text = setAudience(text, 'internal');
      text = generateMetadata(text, destination, normalizedAnswers, config.documentation?.states, projectOwner);
      desired.set(destination, Buffer.from(text));
    }
  }
  const originalEntrypoints = distribution.catalog.entrypoints ?? DEFAULT_ENTRYPOINTS;
  const entrypoints = Object.fromEntries(Object.entries(originalEntrypoints).map(([key, name]) => [key, catalogMapping[name] ?? remapAsset(name, frameworkRoot, config)])) as typeof DEFAULT_ENTRYPOINTS;
  if (!fixedFilenames.has(path.posix.basename(entrypoints.profile))) entrypoints.profile = renameDocument(entrypoints.profile, naming, config.documentation?.kinds ?? []);
  const sourceProfile = distribution.catalog.profileTemplate ? fileBytes(distribution.root, distribution.catalog.profileTemplate) : null;
  const values = {
    PROJECT_NAME: options.name, TRACK: track, FRAMEWORK_VERSION: distribution.version,
    ALIGNMENT_INSTRUCTION: options.answers.alignment.instruction, OWNER: projectOwner,
    DECISIONS_JSON: JSON.stringify(decisions, null, 2), OWNERSHIP_LINKS: Object.entries(normalizedAnswers.ownership ?? {}).map(([role, name]) => {
      const original = relativeName(name);
      const destination = mapping[original] ?? original;
      return `- ${role}: [${destination}](${path.posix.relative(path.posix.dirname(entrypoints.profile), destination)})`;
    }).join('\n') || 'Canonical owners are not yet established; discover and link them before relying on an architecture assumption.',
    PROJECT_CONTEXT: 'Historical observations and open questions are recorded separately from accepted policy.',
    INDEX_PATH: entrypoints.index, CONSTITUTION_PATH: entrypoints.constitution, PROFILE_PATH: entrypoints.profile,
    FRAMEWORK_ROOT: path.posix.dirname(entrypoints.index),
  };
  const profileExisting = fileBytes(root, entrypoints.profile);
  if (!profileExisting && !desired.has(entrypoints.profile)) {
    const profileValues = { ...values, INDEX_PATH: path.posix.relative(path.posix.dirname(entrypoints.profile), entrypoints.index), CONSTITUTION_PATH: path.posix.relative(path.posix.dirname(entrypoints.profile), entrypoints.constitution), PROFILE_PATH: path.posix.basename(entrypoints.profile) };
    const profile = sourceProfile ? fillTemplate(sourceProfile.toString('utf8'), profileValues).replace(/^(\s*kind:\s*)["']?template["']?\s*$/m, '$1overview').replace(/^(\s*audience:\s*).*$/m, '$1internal').replace(/<!--\s*Template output:[\s\S]*?-->/g, '') : `# ${options.name}: development profile\n\nStatus: draft local adoption. Owner: ${values.OWNER}.\n\nAcceptance authority/record: pending review.\n\nRoute: ${track}.\n\n[Development index](${path.posix.relative(path.posix.dirname(entrypoints.profile), entrypoints.index)})\n\n[Constitution](${path.posix.relative(path.posix.dirname(entrypoints.profile), entrypoints.constitution)})\n\n## Decisions\n\n\`\`\`json\n${values.DECISIONS_JSON}\n\`\`\`\n`;
    desired.set(entrypoints.profile, Buffer.from(generateMetadata(profile, entrypoints.profile, normalizedAnswers, config.documentation?.states, projectOwner)));
    reasons.set(entrypoints.profile, 'draft local profile; alignment does not manufacture document acceptance');
  }
  const contextName = path.posix.join(path.posix.dirname(entrypoints.profile), documentFilename('repository-context', 'overview', naming));
  if (!fileBytes(root, contextName) && !desired.has(contextName)) {
    desired.set(contextName, Buffer.from(contextDocument(options.name, track, normalizedAnswers, decisions, contextName, mapping)));
    reasons.set(contextName, 'bounded historical context with observations distinguished from acceptance');
  }
  if (config.workflow?.stories) {
    const stories = config.workflow.stories;
    stories.template = catalogMapping[stories.template] ?? stories.template;
    if (!desired.has(stories.template) && !fileBytes(root, stories.template)) throw new Refused(`configured story template is missing: ${stories.template}`);
  }
  if (configurationHome === 'directory') {
    const naming = config.documentation?.naming;
    const namingStyle = naming?.shape === 'typed' ? 'typed' : Object.entries(styleCases).find(([, value]) => value === naming?.identifierCase)?.[0];
    const effectiveDefaults: Record<string, unknown> = { 'documentation.naming.style': namingStyle, 'documentation.naming.identifierCase': naming?.identifierCase, 'documentation.naming.generatedIdentifierCase': naming?.generatedIdentifierCase, 'source.naming.identifierCase': (config.source?.naming as Record<string, unknown> | undefined)?.identifierCase, 'source.languages': config.source?.languages, 'source.scopes': config.source?.scopes };
    if (options.upgradeBaseline) {
      for (const [id, value] of Object.entries(effectiveDefaults)) if (Object.hasOwn(decisions, id) && value !== undefined && !Object.hasOwn(options.answers.answers, id) && (!persistedDecisions.has(id) || persistedDecisions.get(id)!.origin === 'profile-default')) decisions[id] = value;
      config.source = { ...config.source, decisions: Object.fromEntries(Object.entries(decisions).filter(([id]) => id.startsWith('source.'))) };
    }
    const records = Object.entries(decisions).map(([id, value]) => {
      const prior = persistedDecisions.get(id); const property = id.startsWith('configuration.') ? ownConfigurationValue(normalizedAnswers.configuration, id.slice('configuration.'.length)) : { present: false };
      const explicit = Object.hasOwn(options.answers.answers, id) || property.present;
      return { id, value, scope: 'repository', source: explicit || prior && jsonText(prior.value) !== jsonText(value) || options.upgradeBaseline && prior?.origin === 'profile-default' ? normalizedAnswers.alignment.instruction : prior?.source ?? normalizedAnswers.alignment.instruction, status: 'accepted' as const, origin: explicit ? 'explicit-answer' : prior?.origin ?? (prior ? 'accepted-policy' : 'profile-default'), ...(property.present ? { declared: structuredClone(property.value) } : {}) };
    });
    const combined = new Map(resolved.decisions.map(record => [`${record.scope}:${record.id}`, record]));
    for (const record of records) combined.set(`repository:${record.id}`, record);
    const files = directoryConfigurationFiles({ config, baseline: resolved.baselineProfile, decisions: [...combined.values()], previous: resolved, explicit: normalizedAnswers.configuration });
    for (const [name, bytes] of Object.entries(files)) { desired.set(name, bytes); reasons.set(name, 'aligned committed configuration with pinned baseline'); }
  } else {
    desired.set('stavel.config.json', Buffer.from(jsonText(config)));
    reasons.set('stavel.config.json', 'selected project configuration');
  }
  const license = fileBytes(distribution.root, 'LICENSE');
  if (!license) throw new Refused('upstream license is missing');
  const licenseName = `${path.posix.dirname(entrypoints.index)}/LICENSE`;
  desired.set(licenseName, license); reasons.set(licenseName, 'retain upstream license with adopted framework');
  const agentsTemplate = distribution.catalog.agentsTemplate ? fileBytes(distribution.root, distribution.catalog.agentsTemplate) : null;
  let agents = agentsTemplate ? fillTemplate(agentsTemplate.toString('utf8'), values) : `# ${options.name}: development instructions\n\nRead the [development index](${entrypoints.index}), [constitution](${entrypoints.constitution}), and [project profile](${entrypoints.profile}).\n\nFollow the accepted local profile and task scope. Preserve required mechanisms; report actual checks and missing evidence.\n`;
  agents = agents.replace(/<!--\s*mdcomposer:meta[\s\S]*?-->/g, '').replace(/<!--\s*Template output:[\s\S]*?-->/g, '');
  agents = agents.replaceAll(`${values.FRAMEWORK_ROOT}/constitution.md`, entrypoints.constitution).replaceAll(`${values.FRAMEWORK_ROOT}/project-profile.md`, entrypoints.profile);
  const agentsExisting = fileBytes(root, 'AGENTS.md');
  const priorManifest = inspection.manifest;
  const previouslyInstalled = priorManifest?.files as Record<string, string> | undefined;
  const rootOwned = agentsExisting && previouslyInstalled?.['AGENTS.md'] === digest(agentsExisting);
  const entrypoint = !agentsExisting || agentsExisting.toString('utf8') === agents || (mode === 'migrate' && rootOwned) ? 'AGENTS.md' : 'stavel-agents.policy.md';
  if (entrypoint === 'AGENTS.md' || !fileBytes(root, entrypoint)) {
    desired.set(entrypoint, Buffer.from(agents)); reasons.set(entrypoint, entrypoint === 'AGENTS.md' ? 'root agent routing' : 'preserve existing root instructions; companion integration remains pending');
  }
  if (mode === 'migrate') {
    const combinedMapping = { ...mapping };
    for (const file of inspection.files) {
      if (!file.path.endsWith('.md')) continue;
      const destination = mapping[file.path] ?? file.path;
      let content = desired.get(destination)?.toString('utf8') ?? fileBytes(root, file.path)!.toString('utf8');
      const rewritten = rewriteMarkdownLinks(content, file.path, destination, combinedMapping);
      content = mapping[file.path] ? generateMetadata(rewritten, destination, normalizedAnswers, config.documentation?.states, projectOwner) : rewritten;
      if (content !== fileBytes(root, file.path)!.toString('utf8') || mapping[file.path]) { desired.set(destination, Buffer.from(content)); reasons.set(destination, mapping[file.path] ? 'taxonomy move and reference/lifecycle transformation' : 'update references to moved documents'); }
    }
  }
  validateDestinations([...desired.keys()]);
  const installedFiles: Record<string, string> = {};
  for (const [name, content] of desired) if (!repositoryTemplates.has(name)) installedFiles[name] = digest(content);
  const previousFiles = priorManifest?.files as Record<string, string> | undefined;
  for (const [name, hash] of Object.entries(previousFiles ?? {})) if (!(configurationHome === 'directory' && name === 'stavel.config.json') && !repositoryTemplates.has(name) && !mapping[name] && fileBytes(root, name) && !installedFiles[name]) installedFiles[name] = hash;
  const generatedBlocks = priorManifest?.generatedBlocks;
  const routingHash = generatedBlocks && typeof generatedBlocks === 'object' && !Array.isArray(generatedBlocks) ? (generatedBlocks as Record<string, unknown>)['AGENTS.md#routing'] : undefined;
  const routingBlocks = agentsExisting?.toString('utf8').match(/<!-- stavel:generated routing -->[\s\S]*?<!-- \/stavel:generated routing -->/g) ?? [];
  const preserveRouting = entrypoint === 'stavel-agents.policy.md' && priorManifest?.entrypoint === entrypoint && priorManifest.integration_at_install === 'owned-routing-block' && routingBlocks.length === 1 && typeof routingHash === 'string' && digest(routingBlocks[0]) === routingHash;
  const manifest = {
    product: 'stavel', format: 2, framework_version: distribution.version, profile_version: `${config.id ?? 'default'}@${config.version ?? 1}`,
    framework_path: path.posix.dirname(entrypoints.index), project_name: options.name, track, entrypoint,
    integration_at_install: entrypoint === 'AGENTS.md' ? 'direct' : preserveRouting ? 'owned-routing-block' : 'pending', ...(preserveRouting ? { generatedBlocks } : {}), entrypoints,
    alignment: options.answers.alignment, decisions, files: installedFiles,
  };
  desired.set('.stavel.json', Buffer.from(jsonText(manifest))); reasons.set('.stavel.json', 'versioned adoption record and installed hashes');
  const operations: PlanOperation[] = [];
  for (const [name, content] of desired) {
    const from = origins[name];
    const previous = fileBytes(root, name);
    if (!from && previous?.equals(content)) continue;
    if (mode !== 'migrate' && previous && !previous.equals(content)) throw new Refused(`no files written; differing destination requires review: ${name}`);
    const before = from ? fileHash(root, from) : previous ? digest(previous) : null;
    const kind = from && from !== name ? 'move' : previous ? 'update' : 'create';
    operations.push({ id: `op-${operations.length + 1}`, kind, path: name, ...(from ? { from } : {}), beforeHash: before, afterHash: digest(content), content: content.toString('base64'), encoding: 'base64', reason: reasons.get(name) ?? 'selected framework adoption' });
    if (!(name in inputs)) inputs[name] = previous ? digest(previous) : null;
  }
  if (configurationHome === 'directory' && resolved.kind === 'legacy-root') operations.push({ id: `op-${operations.length + 1}`, kind: 'delete', path: 'stavel.config.json', beforeHash: inputs['stavel.config.json'], afterHash: null, reason: 'explicit migration retires the legacy configuration authority' });
  const plan: MigrationPlan = {
    product: 'stavel', schemaVersion: 2, id: '', root, frameworkVersion: distribution.version, profileVersion: manifest.profile_version,
    mode, track, projectName: options.name, alignment: options.answers.alignment, decisions, inputs, operations,
    diagnostics: [], createdAt: new Date().toISOString(),
  };
  plan.id = planDigest(plan);
  return plan;
}

export function planDigest(plan: MigrationPlan): string { const copy = { ...plan, id: '' }; return digest(jsonText(copy)); }

export function validatePlan(plan: MigrationPlan): void {
  if (!plan || plan.product !== 'stavel') throw new Refused('unsupported plan product; Stavel accepts only plans generated for Stavel. Legacy plans and journals are not supported.');
  if (!plan || plan.schemaVersion !== 2 || !Array.isArray(plan.operations) || !plan.inputs || typeof plan.inputs !== 'object') throw new Refused('unsupported migration plan; expected schemaVersion 2');
  if (plan.id !== planDigest(plan)) throw new Refused('plan checksum does not match; regenerate the plan rather than editing serialized operations');
  if (plan.gitGuardActivation !== undefined) {
    validateGitGuardActivation(plan.gitGuardActivation, plan.root);
    if (Object.keys(plan.inputs).some(name => name.replace(/\\/g, '/').toLowerCase() === '.git/config') || plan.operations.some(operation => [operation.path, operation.from].some(name => name?.replace(/\\/g, '/').toLowerCase() === '.git/config'))) throw new Refused('Git activation owns local config preconditions/effects; regenerate the plan without a competing generic Git config input or operation');
  }
  if (plan.execution !== undefined) {
    const execution = plan.execution;
    if (!execution || typeof execution !== 'object' || Array.isArray(execution) || Object.keys(execution).some(key => !['kind', 'source', 'warnings'].includes(key)) || !['deterministic', 'agent-assisted'].includes(execution.kind) || !Array.isArray(execution.warnings) || execution.warnings.some(warning => typeof warning !== 'string' || !warning.trim())) throw new Refused('invalid plan execution provenance');
    if (execution.kind === 'agent-assisted' && (typeof execution.source !== 'string' || !execution.source.trim() || !execution.warnings.includes(AI_EFFECT_WARNING))) throw new Refused('AI-assisted migration or repair requires its source and nondeterministic judgment warning');
  }
  if (plan.alignment?.confirmed !== true || typeof plan.alignment.instruction !== 'string' || !plan.alignment.instruction.trim()) throw new Refused('plan lacks aligned user decisions');
  targetRoot(plan.root);
  validateDestinations(plan.operations.filter(operation => operation.kind !== 'delete').map(operation => operation.path));
  for (const [name, hash] of Object.entries(plan.inputs)) {
    relativeName(name);
    if (hash !== null && !/^[0-9a-f]{64}$/.test(hash)) throw new Refused(`invalid input digest: ${name}`);
  }
  for (const operation of plan.operations) {
    relativeName(operation.path);
    if (operation.from) relativeName(operation.from);
    if (!['create', 'update', 'move', 'delete'].includes(operation.kind)) throw new Refused(`unsupported plan operation: ${operation.kind}`);
    if (operation.kind === 'move' && !operation.from) throw new Refused('move operation is missing its source');
    if (operation.kind !== 'delete' && (typeof operation.content !== 'string' || digest(Buffer.from(operation.content, 'base64')) !== operation.afterHash)) throw new Refused(`planned content hash mismatch: ${operation.path}`);
  }
}
