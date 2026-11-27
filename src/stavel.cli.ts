#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { listRules } from './rules/policy.service.js';
import { inspectRepository, getQuestions } from './decisions.service.js';
import { createPlan } from './planning.service.js';
import { applyPlan, preflightPlan, resumeMigration, rollbackMigration, verifyPlan } from './migration.service.js';
import { checkRepository } from './checking.service.js';
import { exportSkill } from './export.service.js';
import { jsonText, readJson, Refused, targetRoot } from './filesystem.service.js';
import type { AnswersDocument, MigrationPlan, Track } from './framework.types.js';
import { discoverScope, guidedInit } from './guided.service.js';
import { diagnoseRepository, previewRepairs } from './doctor.service.js';
import { annotateEffects, bindPlanInputs } from './effects.service.js';
import { resolveRepositoryConfiguration, packagedConfigurationDefinitions } from './configuration.service.js';
import { locateDistribution } from './distribution.service.js';
import { effectiveHelp } from './help.service.js';
import { loadArtifactCatalog, artifactBaselineDefinitions, previewArtifacts } from './artifact.service.js';
import { readWork, workOptionsForConfiguration, bindWorkPlanInputs, planWorkCreate, planWorkUpdate, planWorkMigration, applyWorkPlan, recoverWork } from './work.service.js';
import type { WorkPlan, WorkCreateInput, WorkUpdateInput } from './work.service.js';
import { planExecutionPacket, planPacketMigration, readExecutionPacket, planPacketArchive, planVibeCheckpoint, planSliceTransition } from './lifecycle.service.js';

const help = `Usage: stavel <command> [options]

Guided commands (detect project root; explicit --target always wins):
  init                     Ask questions, align choices, preview and offer setup.
  doctor                   Report findings, then offer a repair preview.
  help --json [--target PATH] Explain available CLI and agent capabilities.
  config explain           Explain effective configuration and provenance.
  work list|create|update|migrate|apply|recover   Manage pointer-indexed work.
  artifacts list|plan       Inspect templates or preview owner-aware documents.
  packet plan|migrate|read|update|close|archive|vibe    Manage delivery records.
  Use --input FILE for structured work/artifact/packet input, --apply to apply
  a concrete preview, --preview or --dry-run to inspect without target writes.
  --json and --non-interactive never wait; unresolved input exits 2.
  --performed-by agent --instruction SOURCE warns about nondeterministic
  AI-authored migrations/repairs. A deterministic applicator does not prove
  that an AI-authored transformation is deterministic or correct.

Read-only discovery and planning:
  inspect --target PATH [--track greenfield|existing|research]
  questions --target PATH [--answers FILE] [--track TRACK]
  plan --target PATH --name NAME --track TRACK --mode bootstrap|adopt|migrate --answers FILE
  check --target PATH [--framework-path RELATIVE]
  verify --plan FILE

Applying an aligned plan:
  apply --plan FILE [--target PATH] [--dry-run]
  init --target PATH --name NAME --track TRACK --answers FILE [--dry-run]
  migrate plan <plan options>
  migrate apply --plan FILE [--dry-run]
  migrate resume --target PATH --journal FILE
  migrate rollback --target PATH --journal FILE

Packaging:
  export-skill --output PATH [--dry-run]

Agent workflows (through the skill; these are not CLI execution subcommands):
  EXPERIMENT   Standalone experiments, proofs of concept and bounded learning.
  EXPLORE      Discuss requirements and understand the codebase; capture recon.
  DESIGN       Turn exploration, experiments or VIBE output into design docs.
  PLAN         Turn a design into execution slices and optional story outputs.
  EXECUTE      Carry out ready slices using STRICT MODE automatically.
  VIBE         Combine the activities, documenting as you go and honoring philosophies.
  REVIEW       Check actual results and close the requested execution scope.
Stories can enter EXPLORE/DESIGN or be produced by PLAN; choose per task or repo.
PLAN asks about story generation by default; always/never repository policy
suppresses that question. Init seeds an editable repository story template.
Direct STRICT MODE remains available. The CLI plan command above prepares
adoption/migration operations; it does not run the agent PLAN workflow.

Packaged tools:
  rules list               List available versioned rule modules.
  docs <mdcomposer args>   Run the bundled Markdown CLI; use docs --help.

Options:
  --source-root PATH       Explicit package asset root (normally auto-detected).
  --framework-path REL     Relocate adopted internal framework docs within target.
  --scope ID_OR_PATH       Select declared capability/source policy for read/workflow commands.
  --upgrade-baseline       Explicit aligned migrate operation to selected package defaults.
  --configuration-home root|directory   Select the supported policy representation.
  --answers FILE           JSON answers plus alignment.confirmed=true and the actual instruction reference.
  --dry-run                Preflight without creating files or directories.
  --help, -h               Show help.

Discovery/questions/plan print JSON to stdout and never generate target files.
Generation requires all applicable required decisions and user alignment. Existing
authorization counts; silence and preselected UI options are not answers.
Tools do not run application code, mutate Git, install packages, or contact services.
Inspection reads bounded local Git history when available and reports its limits.
Checks validate structural properties; document acceptance and application semantics require review.
`;

function humanPreview(plan: MigrationPlan): string {
  return `Preview ${plan.id.slice(0, 12)} for ${plan.root}\n${plan.operations.length} file operations; no changes applied. Use --json for the full serialized plan.\n\n${plan.operations.map(operation => `${operation.kind.padEnd(6)} ${operation.path} (${operation.reason})`).join('\n')}\n`;
}

interface Parsed { command: string; subcommand?: string; values: Record<string, string>; flags: Set<string> }
function parse(argv: string[]): Parsed {
  const tokens = [...argv];
  const command = tokens.shift() ?? 'help';
  const subcommand = ['migrate', 'work', 'config', 'artifacts', 'packet'].includes(command) && tokens[0] && !tokens[0].startsWith('-') ? tokens.shift() : undefined;
  const values: Record<string, string> = {};
  const flags = new Set<string>();
  const options = new Set(['target', 'name', 'track', 'mode', 'answers', 'plan', 'journal', 'output', 'framework-path', 'source-root', 'input', 'instruction', 'performed-by', 'configuration-home', 'registry', 'scope', 'capability', 'status-file', 'title', 'owner']);
  while (tokens.length) {
    const token = tokens.shift()!;
    if (['--help', '-h', '--dry-run', '--json', '--non-interactive', '--preview', '--apply', '--repair', '--reset-session', '--upgrade-baseline'].includes(token)) { flags.add(token.replace(/^--?/, '')); continue; }
    if (!token.startsWith('--')) throw new Refused(`unexpected argument: ${token}`);
    const [name, ...equals] = token.slice(2).split('=');
    if (!options.has(name)) throw new Refused(`unknown option: --${name}`);
    const value = equals.length ? equals.join('=') : tokens.shift();
    if (!value || value.startsWith('--')) throw new Refused(`missing value for --${name}`);
    values[name] = value;
  }
  return { command, subcommand, values, flags };
}

export async function runCli(argv: string[], io: { out?: (text: string) => void; error?: (text: string) => void; ask?: (prompt: string) => Promise<string> } = {}): Promise<number> {
  const out = io.out ?? ((text: string) => process.stdout.write(text));
  const error = io.error ?? ((text: string) => process.stderr.write(text));
  try {
    if (argv[0] === 'docs') {
      const candidates = [path.resolve(typeof __dirname === 'string' ? __dirname : path.dirname(process.argv[1] ?? '.'), 'mdcomposer.cli.cjs'), path.resolve(process.cwd(), 'dist/mdcomposer.cli.cjs')];
      const executable = candidates.find(candidate => fs.existsSync(candidate));
      if (!executable) throw new Refused('packaged mdcomposer CLI is missing; rebuild or reinstall the complete package');
      const result = spawnSync(process.execPath, [executable, ...argv.slice(1)], { encoding: 'utf8', shell: false });
      if (result.stdout) out(result.stdout);
      if (result.stderr) error(result.stderr);
      if (result.error) throw new Refused(`cannot run packaged mdcomposer: ${result.error.message}`);
      return result.status ?? 1;
    }
    if (argv[0] === 'rules' && argv[1] === 'list') {
      if (argv.length !== 2) throw new Refused('rules list takes no extra arguments');
      out(jsonText(listRules())); return 0;
    }
    const parsed = parse(argv);
    const { values, flags } = parsed;
    if (['help', '--help', '-h'].includes(parsed.command) || flags.has('help') || flags.has('h')) {
      if (flags.has('json') || values.target || values.scope) {
        const context = values.target || values.scope ? discoverScope({ target: values.target }) : undefined;
        if (context?.state === 'ambiguous') { out(jsonText({ state: 'input-required', questions: [{ id: 'scope', prompt: 'Select a repository boundary with --target for contextual help.', candidates: context.candidates }] })); return 2; }
        out(jsonText(effectiveHelp({ root: context?.root, sourceRoot: values['source-root'], contextual: Boolean(context), scope: values.scope })));
      }
      else {
        const records = effectiveHelp({ sourceRoot: values['source-root'] });
        const start = help.indexOf('Agent workflows ('); const end = help.indexOf('Stories can enter');
        const modes = 'Agent workflows (through the skill; these are not CLI execution subcommands):\n' + records.modes.map(mode => `  ${mode.name.padEnd(12)} ${mode.summary}${mode.availability === 'unavailable' ? ` [unavailable: ${mode.reason}]` : ''}`).join('\n') + '\n';
        out(help.slice(0, start) + modes + help.slice(end) + '\nCommand summaries (shared capability records):\n' + records.commands.map(command => `  ${command.name.padEnd(14)} ${command.summary}${command.availability === 'unavailable' ? ` [unavailable: ${command.reason}]` : ''}`).join('\n') + '\n');
      }
      return 0;
    }
    const required = (name: string): string => { const value = values[name]; if (!value) throw new Refused(`--${name} is required`); return value; };
    const root = values.target ?? process.cwd();
    const sourceRoot = values['source-root'];
    if (values['configuration-home'] && !['root', 'directory'].includes(values['configuration-home'])) throw new Refused('--configuration-home must be root or directory');
    if (values.mode && !['bootstrap', 'adopt', 'migrate'].includes(values.mode)) throw new Refused('--mode must be bootstrap, adopt or migrate');
    if (flags.has('apply') && flags.has('preview')) throw new Refused('--apply conflicts with --preview');
    const track = (values.track ?? 'existing') as Track;
    if (!['greenfield', 'existing', 'research'].includes(track)) throw new Refused(`invalid track: ${track}`);
    const answers = values.answers ? readJson<AnswersDocument>(path.resolve(values.answers)) : undefined;
    const ask = flags.has('json') || flags.has('non-interactive') ? undefined : io.ask ?? (process.stdin.isTTY ? async (prompt: string): Promise<string> => { const terminal = createInterface({ input: process.stdin, output: process.stderr }); try { return await terminal.question(prompt + '\n> '); } finally { terminal.close(); } } : undefined);
    const authorKind = values['performed-by'] === 'agent' ? 'agent-assisted' as const : 'deterministic' as const;
    if (values['performed-by'] && !['agent', 'deterministic'].includes(values['performed-by'])) throw new Refused('--performed-by must be agent or deterministic');
    const reportProvenance = (plan: MigrationPlan): MigrationPlan => {
      const result = authorKind === 'agent-assisted' ? annotateEffects(plan, authorKind, values.instruction) : plan;
      for (const warning of result.execution?.warnings ?? []) error(`Warning: ${warning}\n`);
      return result;
    };
    const selectedScope = async (): Promise<string | undefined> => {
      const scope = discoverScope({ target: values.target });
      if (scope.state === 'selected') return scope.root;
      if (ask) {
        const answer = await ask(`Select the project scope:\n${scope.candidates.map((candidate, index) => `${index + 1}. ${candidate.path} (${candidate.evidence.join(', ')})`).join('\n')}\nEnter its number:`);
        const index = Number(answer.trim()) - 1;
        if (!Number.isInteger(index) || index < 0 || index >= scope.candidates.length) throw new Refused('scope selection must match a listed candidate');
        return scope.candidates[index].path;
      }
      out(jsonText({ state: 'input-required', questions: [{ id: 'scope', prompt: 'Select a project root using --target.', candidates: scope.candidates }] }));
      return undefined;
    };
    const input = <T,>(): T => readJson<T>(path.resolve(required('input')));
    let configurationInputs: Record<string, string | null> = {};
    const applyOrPreview = (plan: MigrationPlan): void => { const reviewed = reportProvenance(bindPlanInputs(plan, configurationInputs)); out(jsonText(flags.has('apply') ? applyPlan(reviewed, { dryRun: flags.has('dry-run') }) : reviewed)); };
    if (values.scope && ['init', 'bootstrap', 'adopt', 'plan', 'migrate'].includes(parsed.command)) throw new Refused('--scope selects workflow/check views; adoption writes repository policy and require a project --target instead');
    if (parsed.command === 'init' && (!answers || !values.name)) {
      const result = await guidedInit({ target: values.target, sourceRoot, name: values.name, track: values.track as Track | undefined, answers, ask, resetSession: flags.has('reset-session'), frameworkPath: values['framework-path'], configurationHome: values['configuration-home'] as 'root' | 'directory' | undefined, mode: values.mode as 'bootstrap' | 'adopt' | 'migrate' | undefined, upgradeBaseline: flags.has('upgrade-baseline') });
      if (!result.plan) { out(jsonText(result)); return 2; }
      const plan = reportProvenance(result.plan);
      if (flags.has('dry-run')) { out(jsonText({ state: 'preview', root: result.root, plan, preflight: applyPlan(plan, { dryRun: true }) })); return 0; }
      if (ask) error(humanPreview(plan));
      const applied = flags.has('apply') || ask && !flags.has('preview') && (await ask('Apply this exact preview? Type apply to continue; any other response leaves the repository unchanged.')).trim() === 'apply';
      if (!applied) { out(jsonText(ask ? { state: 'preview', root: result.root, plannedOperations: plan.operations.length, changed: 0 } : { state: 'preview', root: result.root, plan })); return 0; }
      const appliedResult = applyPlan(plan);
      const verification = await checkRepository({ root: result.root!, sourceRoot });
      out(jsonText({ state: verification.ok ? 'applied' : 'applied-with-findings', root: result.root, ...(!ask ? { plan } : {}), result: appliedResult, verification }));
      return verification.ok ? 0 : 1;
    }
    if (parsed.command === 'doctor') {
      const selected = await selectedScope(); if (!selected) return 2;
      const report = await diagnoseRepository({ root: selected, sourceRoot, scope: values.scope });
      if (ask) error(jsonText(report));
      if (!report.repairable.length || !flags.has('repair') && !flags.has('preview') && (!ask || (await ask('Show a repair preview? Type preview to continue.')).trim() !== 'preview')) { out(jsonText(report)); return report.mechanicalPassed ? 0 : 1; }
      const plan = reportProvenance(previewRepairs({ root: selected, sourceRoot, report, alignment: { confirmed: true, instruction: values.instruction ?? 'terminal:requested-doctor-repair-preview' }, kind: authorKind, source: values.instruction }));
      if (flags.has('dry-run')) { out(jsonText({ report, repair: { plan, preflight: applyPlan(plan, { dryRun: true }) } })); return 0; }
      if (ask) error(humanPreview(plan));
      if (flags.has('apply') && !values.instruction) throw new Refused('headless repair application requires --instruction SOURCE for the accepted concrete scope');
      if (flags.has('apply') || ask && !flags.has('preview') && (await ask('Apply this exact repair preview? Type apply to continue.')).trim() === 'apply') { const result = applyPlan(plan); const verification = await diagnoseRepository({ root: selected, sourceRoot, scope: values.scope }); out(jsonText({ report, repair: { plan, result }, verification })); return verification.mechanicalPassed ? 0 : 1; }
      out(jsonText({ report, repair: { plan } }));
      return report.mechanicalPassed ? 0 : 1;
    }
    if (['config', 'work', 'artifacts', 'packet'].includes(parsed.command)) {
      const selected = await selectedScope(); if (!selected) return 2;
      const distribution = locateDistribution(sourceRoot);
      const resolution = resolveRepositoryConfiguration({ root: selected, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), scope: values.scope });
      configurationInputs = resolution.inputs;
      if (parsed.command === 'config') { if (parsed.subcommand !== 'explain') throw new Refused('use config explain'); out(jsonText(resolution)); return 0; }
      if (parsed.command === 'work') {
        const workOptions = { ...workOptionsForConfiguration(selected, resolution.config), ...(values.registry ? { registryFile: values.registry } : {}) };
        if (authorKind === 'agent-assisted' && parsed.subcommand !== 'list') throw new Refused('work writers accept supported deterministic operations; AI-authored semantic changes need an agent-assisted migration/repair preview with a warning');
        if (parsed.subcommand === 'list' || !parsed.subcommand) { const report = readWork(workOptions); out(jsonText(report)); return report.state === 'invalid' ? 1 : 0; }
        if (parsed.subcommand === 'recover') { out(jsonText(recoverWork(workOptions, { dryRun: flags.has('dry-run') }))); return 0; }
        if (parsed.subcommand === 'apply') { const plan = readJson<WorkPlan>(path.resolve(required('plan'))); if (targetRoot(plan.target) !== selected || plan.registryFile !== workOptions.registryFile) throw new Refused('work plan target or registry conflicts with selected scope/policy'); out(jsonText(applyWorkPlan(plan, { dryRun: flags.has('dry-run') }))); return 0; }
        const plan = parsed.subcommand === 'create' ? planWorkCreate(workOptions, values.input ? input<WorkCreateInput>() : { capabilityId: required('capability'), statusFile: required('status-file'), title: required('title'), owner: required('owner') }) : parsed.subcommand === 'update' ? planWorkUpdate(workOptions, input<WorkUpdateInput>()) : parsed.subcommand === 'migrate' ? planWorkMigration(workOptions) : undefined;
        if (!plan) throw new Refused('unknown work operation');
        const bound = bindWorkPlanInputs(plan, resolution.inputs);
        out(jsonText(flags.has('apply') ? applyWorkPlan(bound, { dryRun: flags.has('dry-run') }) : bound)); return 0;

      }
      if (parsed.command === 'artifacts') {
        if (parsed.subcommand === 'list' || !parsed.subcommand) { out(jsonText(loadArtifactCatalog(sourceRoot))); return 0; }
        if (parsed.subcommand !== 'plan') throw new Refused('unknown artifacts operation');
        const result = previewArtifacts({ ...input<Parameters<typeof previewArtifacts>[0]>(), root: selected, resolution, sourceRoot });
        if (result.plan && flags.has('apply')) applyOrPreview(result.plan); else out(jsonText(result)); return result.ready ? 0 : 2;
      }
      const operation = parsed.subcommand;
      if (operation === 'migrate') { applyOrPreview(planPacketMigration({ ...input<Parameters<typeof planPacketMigration>[0]>(), root: selected })); return 0; }
      if (operation === 'close') {
        const packet = readExecutionPacket(selected, required('input'));
        const verification = await diagnoseRepository({ root: selected, sourceRoot, scope: values.scope });
        out(jsonText({ state: packet.closed && verification.mechanicalPassed ? 'scope-closed' : 'incomplete', packet, verification, note: 'Closure validates recorded result/check/review evidence and runs packaged checks; it does not grant PR, merge or publication permission.' }));
        return packet.closed && verification.mechanicalPassed ? 0 : 1;
      }
      if (operation === 'read') { out(jsonText(readExecutionPacket(selected, required('input')))); return 0; }
      if (operation === 'plan') { const result = planExecutionPacket({ ...input<Parameters<typeof planExecutionPacket>[0]>(), root: selected, config: resolution.config, resolution, sourceRoot }); if (result.plan) applyOrPreview(result.plan); else out(jsonText(result)); return result.state === 'input-required' ? 2 : 0; }
      if (operation === 'update') {
        const selectedInput = input<Parameters<typeof planSliceTransition>[0]>();
        if (selectedInput.status === 'complete') { const checks = await checkRepository({ root: selected, sourceRoot, scope: values.scope }); if (!checks.ok) { out(jsonText({ state: 'verification-failed', checks })); return 1; } }
        applyOrPreview(planSliceTransition({ ...selectedInput, root: selected }));
      }
      else if (operation === 'archive') applyOrPreview(planPacketArchive({ ...input<Parameters<typeof planPacketArchive>[0]>(), root: selected, config: resolution.config, sourceRoot }));
      else if (operation === 'vibe') applyOrPreview(planVibeCheckpoint({ ...input<Parameters<typeof planVibeCheckpoint>[0]>(), root: selected }));
      else throw new Refused('unknown packet operation');
      return 0;
    }
    const command = parsed.command === 'migrate' ? parsed.subcommand ?? 'plan' : parsed.command;
    if (command === 'inspect') out(jsonText(inspectRepository({ root, track, sourceRoot, scope: values.scope })));
    else if (command === 'questions') out(jsonText(getQuestions({ root, track, sourceRoot, answers, scope: values.scope })));
    else if (command === 'plan' || command === 'init' || command === 'bootstrap' || command === 'adopt') {
      if (!answers) throw new Refused('--answers FILE with complete aligned decisions is required; run inspect and questions first');
      const mode = parsed.command === 'migrate' ? 'migrate' : command === 'bootstrap' ? 'bootstrap' : command === 'adopt' ? 'adopt' : (values.mode ?? (track === 'greenfield' ? 'bootstrap' : 'adopt'));
      if (!['bootstrap', 'adopt', 'migrate'].includes(mode)) throw new Refused(`invalid mode: ${mode}`);
      const plan = reportProvenance(createPlan({ root, name: required('name'), track, mode: mode as 'bootstrap' | 'adopt' | 'migrate', answers, sourceRoot, frameworkPath: values['framework-path'], configurationHome: values['configuration-home'] as 'root' | 'directory' | undefined, upgradeBaseline: flags.has('upgrade-baseline') }));
      if (command === 'init' && !flags.has('preview')) out(jsonText(applyPlan(plan, { dryRun: flags.has('dry-run') })));
      else out(jsonText(plan));
    } else if (command === 'apply') {
      const plan = readJson<MigrationPlan>(path.resolve(required('plan')));
      if (values.target && targetRoot(values.target) !== targetRoot(plan.root)) throw new Refused('--target conflicts with the plan repository');
      out(jsonText(applyPlan(reportProvenance(plan), { dryRun: flags.has('dry-run') })));
    } else if (command === 'resume' || command === 'rollback') out(jsonText(command === 'resume' ? resumeMigration({ root, journal: required('journal') }) : rollbackMigration({ root, journal: required('journal') })));
    else if (command === 'verify') {
      const result = verifyPlan(readJson<MigrationPlan>(path.resolve(required('plan')))); out(jsonText(result)); return result.ok ? 0 : 1;
    } else if (command === 'check') {
      const result = await checkRepository({ root, sourceRoot, frameworkPath: values['framework-path'], scope: values.scope }); out(jsonText(result)); return result.ok ? 0 : 1;
    } else if (command === 'export-skill') out(jsonText(exportSkill({ output: required('output'), sourceRoot, dryRun: flags.has('dry-run') })));
    else throw new Refused(`unknown command: ${command}`);
    return 0;
  } catch (failure) { error(`Refused: ${(failure as Error).message}\n`); return 1; }
}

void runCli(process.argv.slice(2)).then(code => { process.exitCode = code; });
