#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { listRules } from './rules/policy.service.js';
import { inspectRepository, getQuestions } from './decisions.service.js';
import { createPlan } from './planning.service.js';
import { applyPlan, preflightPlan, resumeMigration, rollbackMigration, verifyPlan } from './migration.service.js';
import { checkRepository } from './checking.service.js';
import { exportSkill } from './export.service.js';
import { jsonText, readJson, Refused, targetRoot } from './filesystem.service.js';
import type { AnswersDocument, MigrationPlan, Track } from './framework.types.js';

const help = `Usage: stavel <command> [options]

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

Packaged tools:
  rules list               List available versioned rule modules.
  docs <mdcomposer args>   Run the bundled Markdown CLI; use docs --help.

Options:
  --source-root PATH       Explicit package asset root (normally auto-detected).
  --framework-path REL     Relocate adopted internal framework docs within target.
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

interface Parsed { command: string; subcommand?: string; values: Record<string, string>; flags: Set<string> }
function parse(argv: string[]): Parsed {
  const tokens = [...argv];
  const command = tokens.shift() ?? 'help';
  const subcommand = command === 'migrate' ? tokens.shift() : undefined;
  const values: Record<string, string> = {};
  const flags = new Set<string>();
  const options = new Set(['target', 'name', 'track', 'mode', 'answers', 'plan', 'journal', 'output', 'framework-path', 'source-root']);
  while (tokens.length) {
    const token = tokens.shift()!;
    if (['--help', '-h', '--dry-run'].includes(token)) { flags.add(token.replace(/^--?/, '')); continue; }
    if (!token.startsWith('--')) throw new Refused(`unexpected argument: ${token}`);
    const [name, ...equals] = token.slice(2).split('=');
    if (!options.has(name)) throw new Refused(`unknown option: --${name}`);
    const value = equals.length ? equals.join('=') : tokens.shift();
    if (!value || value.startsWith('--')) throw new Refused(`missing value for --${name}`);
    values[name] = value;
  }
  return { command, subcommand, values, flags };
}

export async function runCli(argv: string[], io: { out?: (text: string) => void; error?: (text: string) => void } = {}): Promise<number> {
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
    if (['help', '--help', '-h'].includes(parsed.command) || flags.has('help') || flags.has('h')) { out(help); return 0; }
    const required = (name: string): string => { const value = values[name]; if (!value) throw new Refused(`--${name} is required`); return value; };
    const root = values.target ?? process.cwd();
    const sourceRoot = values['source-root'];
    const track = (values.track ?? 'existing') as Track;
    if (!['greenfield', 'existing', 'research'].includes(track)) throw new Refused(`invalid track: ${track}`);
    const answers = values.answers ? readJson<AnswersDocument>(path.resolve(values.answers)) : undefined;
    const command = parsed.command === 'migrate' ? parsed.subcommand ?? 'plan' : parsed.command;
    if (command === 'inspect') out(jsonText(inspectRepository({ root, track })));
    else if (command === 'questions') out(jsonText(getQuestions({ root, track, sourceRoot, answers })));
    else if (command === 'plan' || command === 'init' || command === 'bootstrap' || command === 'adopt') {
      if (!answers) throw new Refused('--answers FILE with complete aligned decisions is required; run inspect and questions first');
      const mode = parsed.command === 'migrate' ? 'migrate' : command === 'bootstrap' ? 'bootstrap' : command === 'adopt' ? 'adopt' : (values.mode ?? (track === 'greenfield' ? 'bootstrap' : 'adopt'));
      if (!['bootstrap', 'adopt', 'migrate'].includes(mode)) throw new Refused(`invalid mode: ${mode}`);
      const plan = createPlan({ root, name: required('name'), track, mode: mode as 'bootstrap' | 'adopt' | 'migrate', answers, sourceRoot, frameworkPath: values['framework-path'] });
      if (command === 'init') out(jsonText(applyPlan(plan, { dryRun: flags.has('dry-run') })));
      else out(jsonText(plan));
    } else if (command === 'apply') {
      const plan = readJson<MigrationPlan>(path.resolve(required('plan')));
      if (values.target && targetRoot(values.target) !== targetRoot(plan.root)) throw new Refused('--target conflicts with the plan repository');
      out(jsonText(applyPlan(plan, { dryRun: flags.has('dry-run') })));
    } else if (command === 'resume' || command === 'rollback') out(jsonText(command === 'resume' ? resumeMigration({ root, journal: required('journal') }) : rollbackMigration({ root, journal: required('journal') })));
    else if (command === 'verify') {
      const result = verifyPlan(readJson<MigrationPlan>(path.resolve(required('plan')))); out(jsonText(result)); return result.ok ? 0 : 1;
    } else if (command === 'check') {
      const result = await checkRepository({ root, sourceRoot, frameworkPath: values['framework-path'] }); out(jsonText(result)); return result.ok ? 0 : 1;
    } else if (command === 'export-skill') out(jsonText(exportSkill({ output: required('output'), sourceRoot, dryRun: flags.has('dry-run') })));
    else throw new Refused(`unknown command: ${command}`);
    return 0;
  } catch (failure) { error(`Refused: ${(failure as Error).message}\n`); return 1; }
}

void runCli(process.argv.slice(2)).then(code => { process.exitCode = code; });
