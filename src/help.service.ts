import type { FrameworkConfig } from './framework.types.js';
import { fileBytes, Refused } from './filesystem.service.js';
import { locateDistribution } from './distribution.service.js';
import { artifactBaselineDefinitions, loadArtifactCatalog, queryArtifacts } from './artifact.service.js';
import type { ArtifactCatalog } from './artifact.service.js';
import { resolveRepositoryConfiguration, packagedConfigurationDefinitions } from './configuration.service.js';
import type { ResolvedRepositoryConfiguration } from './configuration.service.js';

export interface HelpCapability {
  id: string; name: string; summary: string; interface: 'cli' | 'agent' | 'artifact';
  availability: 'available' | 'unavailable'; reason: string; prerequisites: string[]; examples: string[];
  provenance: { source: string; version: string; layer: string }; subcommands?: string[]; prompt?: string;
}
export interface EffectiveHelp {
  product: 'stavel'; schemaVersion: 1; version: string; contextual: boolean;
  commands: HelpCapability[]; modes: HelpCapability[]; artifacts: HelpCapability[];
  configuration?: ResolvedRepositoryConfiguration;
  conventions?: { naming: unknown; testing: unknown; stories: unknown; commits: unknown; review: unknown; owners: unknown; provenance: { source: string; layer: string; version: string } };
  notes: string[];
}
const commands: Array<[string, string, string[], string]> = [
  ['help', 'Explain CLI commands and agent workflows; general help needs no adopted repository.', [], 'stavel help --json'],
  ['init', 'Discover the project, ask applicable questions, align choices and preview setup.', [], 'stavel init'],
  ['idea', 'Capture original idea text and register it in capability-owned work without an execution plan.', [], 'stavel idea "Add an export view" --capability cli'],
  ['hooks', 'Inspect selected local Git guards or recover their checked activation.', ['inspect', 'resume', 'rollback'], 'stavel hooks inspect'],
  ['doctor', 'Report mechanical findings and offer a bounded repair preview.', [], 'stavel doctor'],
  ['config', 'Explain effective repository configuration and provenance.', ['explain'], 'stavel config explain'],
  ['work', 'Read and manage pointer-indexed capability work records.', ['list', 'create', 'update', 'migrate', 'apply', 'recover'], 'stavel work list'],
  ['artifacts', 'Inspect portable artifact definitions or preview aligned owner-aware documents.', ['list', 'plan'], 'stavel artifacts list'],
  ['packet', 'Prepare/read delivery packets, update records, verify closure and archive or checkpoint them.', ['plan', 'migrate', 'read', 'update', 'close', 'archive', 'vibe'], 'stavel packet plan --input packet-input.json'],
  ['inspect', 'Read repository evidence without running application code.', [], 'stavel inspect --target .'],
  ['questions', 'List applicable adoption questions and unresolved answers.', [], 'stavel questions --target .'],
  ['plan', 'Prepare an aligned adoption or migration plan; this is distinct from agent PLAN.', [], 'stavel plan --target . --name Example --track greenfield --mode bootstrap --answers answers.json'],
  ['check', 'Run configured structural checks; success does not prove application semantics.', [], 'stavel check --target .'],
  ['verify', 'Verify a saved plan against actual filesystem state.', [], 'stavel verify --plan plan.json'],
  ['apply', 'Apply or dry-run an aligned hash-checked plan.', [], 'stavel apply --plan plan.json --dry-run'],
  ['migrate', 'Prepare/apply or recover a reviewed repository migration.', ['plan', 'apply', 'resume', 'rollback'], 'stavel migrate apply --plan plan.json --dry-run'],
  ['export-skill', 'Export the complete portable skill and bundled tools.', [], 'stavel export-skill --output exported-skill --dry-run'],
  ['rules', 'List available versioned policy rule modules.', ['list'], 'stavel rules list'],
  ['docs', 'Run the bundled mdcomposer CLI; its own help describes supported operations.', [], 'stavel docs --help'],
];
const modes: Array<[string, string, string, string[]]> = [
  ['idea', 'IDEA', 'Quickly capture a thought and register it for later exploration, design or planning.', ['An adopted target and resolvable capability/feature owner; no design or story questionnaire.']],
  ['experiment', 'EXPERIMENT', 'Standalone experiments, proofs of concept and bounded learning.', ['A bounded question or learning objective; experiments do not silently change production contracts.']],
  ['explore', 'EXPLORE', 'Clarify requirements and understand the codebase; capture evidence and recon.', ['The user task and relevant repository instructions.']],
  ['design', 'DESIGN', 'Turn exploration, experiments, stories or VIBE output into design documents.', ['Actual scope, canonical owners and unresolved material choices.']],
  ['plan', 'PLAN', 'Turn a selected design into coherent execution slices and optional stories.', ['Selected design/review policy; ask about story outputs unless already answered or configured.']],
  ['execute', 'EXECUTE', 'Carry out ready selected slices using STRICT MODE automatically.', ['Authorized scope, accepted design/review or explicit exception, ready slices and verification.']],
  ['vibe', 'VIBE', 'Combine applicable activities while recording decisions and honoring philosophies.', ['Task authority and contemporaneous owner records; preserve accepted requirements.']],
  ['review', 'REVIEW', 'Assess actual results, philosophies and evidence; close the requested scope.', ['Actual implementation/check evidence and explicit open limitations.']],
  ['strict', 'STRICT MODE', 'Preserve implementation fidelity, required mechanisms and independent verification.', ['Task authority and the applicable requirements/design; strictness does not grant permission.']],
];

/** Read-only shared help. General help deliberately never resolves or reads target configuration. */
export function effectiveHelp(options: { root?: string; sourceRoot?: string; contextual?: boolean; scope?: string } = {}): EffectiveHelp {
  const distribution = locateDistribution(options.sourceRoot);
  const result: EffectiveHelp = { product: 'stavel', schemaVersion: 1, version: distribution.version, contextual: options.contextual === true, commands: [], modes: [], artifacts: [], notes: [
    'CLI plan prepares adoption/migration operations. Agent PLAN prepares delivery slices and selected stories.',
    'Agent workflows are guidance; they are not CLI execute/design/strict subcommands or a universal host invocation syntax.',
    'General help reads package assets only. Contextual help reads repository policy without running configured commands.',
    'Generation never records acceptance, runs application code, creates tracker issues, commits or publishes by itself.',
    'AI-authored migrations/repairs may be nondeterministic; a deterministic applicator does not prove transformation correctness.',
  ] };
  let catalog: ArtifactCatalog | undefined;
  try { catalog = loadArtifactCatalog(options.sourceRoot); }
  catch (error) { result.notes.push(`Artifact catalog unavailable: ${(error as Error).message}`); }
  let configuration: FrameworkConfig = distribution.config;
  result.conventions = { naming: configuration.documentation?.naming, testing: configuration.testing, stories: configuration.workflow?.stories, commits: configuration.workflow?.commits, review: configuration.workflow?.review, owners: configuration.documentation?.owners ?? [], provenance: { source: 'config/default.profile.json', layer: 'packaged-baseline', version: `${configuration.id ?? 'default'}@${configuration.version ?? 1}` } };
  if (result.contextual) {
    const resolution = resolveRepositoryConfiguration({ root: options.root ?? process.cwd(), packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), scope: options.scope });
    result.configuration = resolution; configuration = resolution.config;
    result.conventions = { naming: configuration.documentation?.naming, testing: configuration.testing, stories: configuration.workflow?.stories, commits: configuration.workflow?.commits, review: configuration.workflow?.review, owners: resolution.owners, provenance: { source: resolution.kind, layer: 'effective-repository', version: `${resolution.baseline.id}@${resolution.baseline.version}` } };
  }
  for (const [name, summary, subcommands, example] of commands) result.commands.push({
    id: `command.${name}`, name, summary, interface: 'cli', availability: 'available', reason: 'Implemented by the installed Stavel CLI; input readiness is evaluated when invoked.',
    prerequisites: name === 'help' ? [] : ['Complete Stavel package or skill export; command-specific input and authority.'], examples: [example],
    provenance: { source: `stavel:command.${name}`, version: distribution.version, layer: 'installed' }, ...(subcommands.length ? { subcommands } : {}),
  });
  if (!catalog) { const artifactsCommand = result.commands.find(command => command.id === 'command.artifacts')!; artifactsCommand.availability = 'unavailable'; artifactsCommand.reason = 'The installed portable artifact catalog/templates are missing or invalid; inspect the help notes and repair the package.'; }
  const exportCommand = result.commands.find(command => command.id === 'command.export-skill')!;
  const skillSource = distribution.catalog.skill?.source ?? 'skills/stavel';
  if (!fileBytes(distribution.root, `${skillSource}/SKILL.md`)?.toString('utf8').trim() || !fileBytes(distribution.root, 'dist/stavel.cli.cjs') || !fileBytes(distribution.root, 'dist/mdcomposer.cli.cjs')) {
    exportCommand.availability = 'unavailable';
    exportCommand.reason = 'Export requires the complete built source/npm package with canonical skill metadata and binaries; a relocated skill can run its tools but cannot re-export that source package.';
  }
  result.commands.find(command => command.id === 'command.packet')!.examples.push('stavel packet close --input docs/internal/product/capabilities/example/execution/change/packet.manifest.json');
  const selectedModes = configuration.workflow?.modes;
  if (selectedModes !== undefined && (!Array.isArray(selectedModes) || selectedModes.some(mode => typeof mode !== 'string' || !mode.trim()))) throw new Refused('workflow.modes must be an explicit array of mode names for contextual help');
  const normalized = (value: string): string => value.trim().toUpperCase().replace(/[-_]/g, ' ');
  for (const [id, name, summary, prerequisites] of modes) {
    const prompt = `docs/internal/process/prompts/${id}.prompt.md`;
    const portable = distribution.catalog.assets.some(asset => asset.source === prompt);
    const present = portable && Boolean(fileBytes(distribution.root, prompt)?.toString('utf8').trim());
    const enabled = !selectedModes || (selectedModes as string[]).some(mode => normalized(mode) === name || normalized(mode) === id.toUpperCase());
    result.modes.push({ id: `mode.${id}`, name, summary, interface: 'agent', availability: present && enabled ? 'available' : 'unavailable', reason: !present ? 'The required portable prompt is missing or empty; repair the package/export before using this mode.' : !enabled ? 'Excluded by the explicitly selected repository mode vocabulary.' : 'Portable guidance is installed; an agent performs the workflow within actual task authority.', prerequisites, examples: [`Ask your agent to use Stavel ${name} for the selected task.`], prompt,
      provenance: { source: !enabled ? 'workflow.modes' : prompt, version: distribution.version, layer: !enabled ? 'repository' : 'installed' } });
  }
  for (const mode of (selectedModes ?? []) as string[]) if (!modes.some(([id, name]) => normalized(mode) === name || normalized(mode) === id.toUpperCase())) result.modes.push({ id: `mode.custom.${mode}`, name: mode, summary: 'Repository-selected custom mode.', interface: 'agent', availability: 'unavailable', reason: 'No installed portable prompt is registered for this custom mode; consult its accepted repository owner.', prerequisites: ['An explicit repository-owned mode contract and guidance.'], examples: [], provenance: { source: 'workflow.modes', version: distribution.version, layer: 'repository' } });
  const selection = catalog ? queryArtifacts({ catalog, definitions: result.configuration?.definitions }) : { artifacts: [], omitted: [], unresolved: [] };
  if (selection.unresolved.length) result.notes.push(...selection.unresolved);
  for (const artifact of selection.artifacts) result.artifacts.push({ id: artifact.id, name: artifact.title, summary: `${artifact.family}: ${artifact.kind}; applicable to ${artifact.surfaces.join(', ')}.`, interface: 'artifact', availability: 'available', reason: 'Portable definition selected by effective configuration; actual facts, ownership and template inputs are checked before rendering.', prerequisites: artifact.requiredFacts.map(fact => `Aligned fact: ${fact}`), examples: ['stavel artifacts plan --input artifact-input.json'], provenance: { source: result.configuration?.provenance[`workflow.definitions.artifacts.${artifact.id}`]?.source ?? 'config/artifacts.catalog.json', version: String(artifact.version ?? catalog!.version), layer: result.configuration?.provenance[`workflow.definitions.artifacts.${artifact.id}`]?.layer ?? 'baseline' } });
  for (const omitted of selection.omitted.filter(item => item.id.startsWith('artifact.'))) result.artifacts.push({ id: omitted.id, name: catalog!.artifacts.find(artifact => artifact.id === omitted.id)?.title ?? omitted.id, summary: 'Omitted artifact definition.', interface: 'artifact', availability: 'unavailable', reason: omitted.reason, prerequisites: [], examples: [], provenance: { source: result.configuration?.provenance[`workflow.definitions.artifacts.${omitted.id}`]?.source ?? 'effective artifact selection', version: String(catalog!.version), layer: 'repository' } });
  if (!result.contextual) result.notes.push('Displayed conventions are packaged baseline defaults, not resolved target settings. Repositories can override accepted conventions; use contextual help to explain actual choices.', 'PLAN asks about story outputs by default. Init seeds an editable story template; seeding does not request generation.');
  else result.notes.push(`Effective story output policy: ${configuration.workflow?.stories?.generation ?? 'ask'}; task-specific user instructions remain controlling.`);
  return result;
}
