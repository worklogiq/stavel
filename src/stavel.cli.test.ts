import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function ideaCliFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-idea-cli-'));
  fs.mkdirSync(path.join(root, 'areas/cli'), { recursive: true });
  fs.writeFileSync(path.join(root, 'stavel.config.json'), JSON.stringify({ schemaVersion: 1, documentation: { owners: [{ id: 'cli', role: 'capability', path: 'areas/cli' }] }, workflow: { gitProtection: { enabled: false }, work: { registryFile: 'work.json' } } }));
  fs.writeFileSync(path.join(root, 'work.json'), JSON.stringify({ schemaVersion: 2, capabilities: [{ id: 'cli', statusFile: 'areas/cli/cli.status.json' }] }));
  fs.writeFileSync(path.join(root, 'areas/cli/cli.status.json'), JSON.stringify({ schemaVersion: 2, capabilityId: 'cli', title: 'CLI', owner: 'fixture-maintainer', updated: '2026-11-27', items: [] }));
  return root;
}
const ideaCli = (root: string, args: string[]) => spawnSync(process.execPath, [path.resolve('dist/stavel.cli.cjs'), ...args, '--target', root, '--json'], { encoding: 'utf8', timeout: 30000 });

test('idea CLI preview/capture/retry uses the same owner and work identity without a questionnaire', () => {
  const root = ideaCliFixture();
  const before = fs.readFileSync(path.join(root, 'areas/cli/cli.status.json'));
  const args = ['idea', 'Keep the original thought\nincluding its detail.', '--request-id', 'cli-capture-1'];
  const preview = ideaCli(root, [...args, '--preview']); assert.equal(preview.status, 0, preview.stderr);
  const proposed = JSON.parse(preview.stdout); assert.equal(proposed.state, 'preview');
  assert.deepEqual(fs.readFileSync(path.join(root, 'areas/cli/cli.status.json')), before);
  assert.equal(fs.existsSync(path.join(root, proposed.recordPath)), false);
  const captured = ideaCli(root, args); assert.equal(captured.status, 0, captured.stderr);
  const first = JSON.parse(captured.stdout); assert.equal(first.state, 'captured'); assert.equal(first.id, proposed.id);
  const recorded = fs.readFileSync(path.join(root, first.recordPath));
  const status = fs.readFileSync(path.join(root, 'areas/cli/cli.status.json'));
  const repeated = ideaCli(root, args); assert.equal(repeated.status, 0, repeated.stderr); assert.equal(JSON.parse(repeated.stdout).state, 'existing');
  assert.deepEqual(fs.readFileSync(path.join(root, first.recordPath)), recorded);
  assert.deepEqual(fs.readFileSync(path.join(root, 'areas/cli/cli.status.json')), status);
  const queried = ideaCli(root, ['work', 'list']); assert.equal(queried.status, 0, queried.stderr);
  const item = JSON.parse(queried.stdout).items[0].item; assert.equal(item.id, first.id); assert.equal(item.mode, 'IDEA');
});

test('idea CLI refuses conflicting sources and reports setup/text gaps without bootstrap or waiting', () => {
  const root = ideaCliFixture();
  fs.writeFileSync(path.join(root, 'capture.json'), JSON.stringify({ text: 'Structured original' }));
  const conflict = ideaCli(root, ['idea', 'Different text', '--input', path.join(root, 'capture.json')]);
  assert.equal(conflict.status, 1); assert.match(conflict.stderr, /cannot be combined/);
  const empty = ideaCli(root, ['idea']); assert.equal(empty.status, 2, empty.stderr); assert.equal(JSON.parse(empty.stdout).questions[0].id, 'text');
  const unadopted = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-idea-unadopted-'));
  const missing = ideaCli(unadopted, ['idea', 'Remember this']); assert.equal(missing.status, 2, missing.stderr);
  assert.equal(JSON.parse(missing.stdout).state, 'setup-needed'); assert.deepEqual(fs.readdirSync(unadopted), []);
  assert.equal(fs.existsSync(path.join(root, 'areas/cli/ideas')), false);
});

test('bare init recognizes the validated source adoption without an installer manifest or questions', () => {
  const root = process.cwd(); const before = fs.readFileSync(path.join(root, '.git/config'));
  assert.equal(fs.existsSync(path.join(root, '.stavel.json')), false);
  const result = ideaCli(root, ['init', '--non-interactive']); assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).state, 'already-initialized');
  assert.equal(fs.existsSync(path.join(root, '.stavel.json')), false); assert.deepEqual(fs.readFileSync(path.join(root, '.git/config')), before);
});

test('aligned CLI init activates real hooks that reject protected commits and destination pushes', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-guard-cli-'));
  const root = path.join(directory, 'target'), remote = path.join(directory, 'remote.git');
  const git = (args: string[], cwd = root) => spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 30000 });
  const initialized = spawnSync('git', ['init', '-b', 'main', root], { encoding: 'utf8' }); assert.equal(initialized.status, 0, initialized.stderr);
  assert.equal(git(['config', 'user.name', 'Stavel fixture']).status, 0);
  assert.equal(git(['config', 'user.email', 'fixture@example.invalid']).status, 0);
  const answers = path.join(directory, 'answers.json');
  fs.writeFileSync(answers, JSON.stringify({ useDefaults: true, answers: { 'project.name': 'Guard fixture', 'project.intent': 'Verify actual configured guard effects.', 'source.languages': ['typescript'], 'verification.commands': 'npm test', 'product.audience': 'Contributors', 'product.scope': 'Temporary repository', 'product.outcomes': 'Protected writes are prevented' }, alignment: { confirmed: true, instruction: 'user:fixture:aligned-guard-setup' } }));
  const init = spawnSync(process.execPath, [path.resolve('dist/stavel.cli.cjs'), 'init', '--target', root, '--answers', answers, '--apply', '--json'], { cwd: directory, encoding: 'utf8', timeout: 45000, maxBuffer: 8 * 1024 * 1024 });
  assert.equal(init.status, 0, init.stderr + init.stdout.slice(-1200)); assert.equal(JSON.parse(init.stdout).state, 'applied');
  assert.equal(git(['config', '--local', '--get', 'core.hooksPath']).stdout.trim(), '.stavel-hooks');
  const repeated = ideaCli(root, ['init', '--non-interactive']); assert.equal(repeated.status, 0, repeated.stderr); assert.equal(JSON.parse(repeated.stdout).state, 'already-initialized');
  fs.writeFileSync(path.join(root, 'example.txt'), 'A fixture change\n'); assert.equal(git(['add', 'example.txt']).status, 0);
  const blocked = git(['commit', '-m', 'test: refuse main']); assert.notEqual(blocked.status, 0); assert.match(blocked.stderr, /blocked commit on protected branch main/);
  assert.notEqual(git(['rev-parse', '--verify', 'HEAD']).status, 0);
  assert.equal(git(['switch', '-c', 'feat/guard-fixture']).status, 0);
  const allowed = git(['commit', '-m', 'test: allow task branch']); assert.equal(allowed.status, 0, allowed.stderr);
  assert.equal(spawnSync('git', ['init', '--bare', remote], { encoding: 'utf8' }).status, 0);
  const refusedPush = git(['push', remote, 'HEAD:refs/heads/main']); assert.notEqual(refusedPush.status, 0); assert.match(refusedPush.stderr, /blocked push.*protected destination/);
  assert.notEqual(git(['--git-dir', remote, 'rev-parse', '--verify', 'refs/heads/main']).status, 0);
  const allowedPush = git(['push', remote, 'HEAD:refs/heads/feat/guard-fixture']); assert.equal(allowedPush.status, 0, allowedPush.stderr);
});

test('CLI help explains distinct agent workflows outside a repo without advertising execution subcommands', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-workflow-help-'));
  const cli = path.resolve('dist/stavel.cli.cjs');
  for (const option of ['help', '--help', '-h']) {
    const child = spawnSync(process.execPath, [cli, option], { cwd: root, encoding: 'utf8' });
    assert.equal(child.status, 0, child.stderr);
    assert.equal(child.stderr, '');
    for (const mode of ['EXPERIMENT', 'EXPLORE', 'DESIGN', 'PLAN', 'EXECUTE', 'VIBE', 'REVIEW', 'STRICT MODE']) assert.ok(child.stdout.includes(mode), mode);
    assert.ok(child.stdout.includes('not CLI execution subcommands'));
    assert.ok(child.stdout.includes('Stories can enter EXPLORE/DESIGN or be produced by PLAN'));
  }
  const unsupported = spawnSync(process.execPath, [cli, 'execute'], { cwd: root, encoding: 'utf8' });
  assert.equal(unsupported.status, 1);
  assert.match(unsupported.stderr, /unknown command/);
  assert.deepEqual(fs.readdirSync(root), []);
});

test('guided headless init reports all required input as one JSON result and creates no target files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-headless-'));
  const cli = path.resolve('dist/stavel.cli.cjs');
  for (const flags of [['--json'], ['--non-interactive']]) {
    const child = spawnSync(process.execPath, [cli, 'init', ...flags], { cwd: root, encoding: 'utf8', timeout: 15000 });
    assert.equal(child.status, 2, child.stderr); const result = JSON.parse(child.stdout);
    assert.equal(result.state, 'input-required'); assert.ok(result.questions.length > 1);
    assert.ok(result.questions.some((item: { id: string }) => item.id === 'project.name'));
    assert.deepEqual(fs.readdirSync(root), []);
  }
});

test('doctor and effective help distinguish mechanical failures, semantic review and agent guidance without adopting', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-headless-doctor-'));
  const cli = path.resolve('dist/stavel.cli.cjs');
  const child = spawnSync(process.execPath, [cli, 'doctor', '--json'], { cwd: root, encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 1, child.stderr); const report = JSON.parse(child.stdout);
  assert.equal(report.mechanicalPassed, false); assert.equal(report.readyForClosure, false);
  assert.ok(report.findings.some((finding: { state: string }) => finding.state === 'review-required'));
  const help = spawnSync(process.execPath, [cli, 'help', '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr); const capabilities = JSON.parse(help.stdout);
  assert.ok(JSON.stringify(capabilities).includes('conventional'));
  assert.ok(JSON.stringify(capabilities).includes('EXECUTE'));
  assert.deepEqual(fs.readdirSync(root), []);
});

test('new writer flag conflicts and malformed structured input refuse without target changes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-cli-refusal-'));
  const cli = path.resolve('dist/stavel.cli.cjs');
  for (const args of [['init', '--configuration-home', 'invalid'], ['doctor', '--apply', '--preview'], ['packet', 'plan', '--input', 'absent.json']]) {
    const child = spawnSync(process.execPath, [cli, ...args, '--json'], { cwd: root, encoding: 'utf8', timeout: 15000 });
    assert.equal(child.status, 1); assert.match(child.stderr, /Refused:/); assert.deepEqual(fs.readdirSync(root), []);
  }
});

test('work CLI exposes pointer-owned status with read-only missing state and explicit creation', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-cli-work-'));
  const cli = path.resolve('dist/stavel.cli.cjs');
  const invoke = (args: string[]) => spawnSync(process.execPath, [cli, 'work', ...args, '--target', root, '--json'], { cwd: root, encoding: 'utf8', timeout: 15000 });
  const missing = invoke(['list']); assert.equal(missing.status, 0, missing.stderr); assert.equal(JSON.parse(missing.stdout).state, 'missing'); assert.deepEqual(fs.readdirSync(root), []);
  const args = ['create', '--capability', 'cli', '--status-file', 'product/capabilities/cli/cli.status.json', '--title', 'CLI', '--owner', 'fixture'];
  const preview = invoke([...args, '--dry-run']); assert.equal(preview.status, 0, preview.stderr); assert.deepEqual(fs.readdirSync(root), []);
  const applied = invoke([...args, '--apply']); assert.equal(applied.status, 0, applied.stderr);
  const listed = invoke(['list']); assert.equal(listed.status, 0, listed.stderr); const report = JSON.parse(listed.stdout);
  assert.equal(report.state, 'empty'); assert.equal(report.capabilities.length, 1); assert.equal(report.items.length, 0);
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/internal/work-index.json'), 'utf8'));
  assert.deepEqual(Object.keys(registry).sort(), ['capabilities', 'schemaVersion']);
});
test('legacy aligned init honors preview even when explicit name and answers select compatibility adapter', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-legacy-preview-')), root = path.join(directory, 'target');
  const answerFile = path.join(directory, 'answers.json');
  fs.writeFileSync(answerFile, JSON.stringify({ useDefaults: true, answers: { 'project.name': 'Preview fixture', 'project.intent': 'Test preview preservation.', 'source.languages': ['typescript'], 'verification.commands': 'npm test' }, alignment: { confirmed: true, instruction: 'user:fixture:preview-only' } }));
  const result = spawnSync(process.execPath, [path.resolve('dist/stavel.cli.cjs'), 'init', '--target', root, '--name', 'Preview fixture', '--track', 'greenfield', '--answers', answerFile, '--preview', '--json'], { cwd: directory, encoding: 'utf8', timeout: 15000 });
  assert.equal(result.status, 0, result.stderr); const preview = JSON.parse(result.stdout);
  assert.equal(preview.product, 'stavel'); assert.ok(preview.operations.length > 0); assert.equal(fs.existsSync(root), false);
});
test('explicit capability scope selects the same effective override in configuration and contextual help without writes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-cli-scope-'));
  const config = { schemaVersion: 1, workflow: { commits: { convention: 'conventional' }, scopes: [{ id: 'backend', configuration: { schemaVersion: 1, workflow: { commits: { convention: 'none' } } } }] } };
  const file = path.join(root, 'stavel.config.json'); fs.writeFileSync(file, JSON.stringify(config)); const original = fs.readFileSync(file);
  const cli = path.resolve('dist/stavel.cli.cjs');
  const explain = spawnSync(process.execPath, [cli, 'config', 'explain', '--scope', 'backend', '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(explain.status, 0, explain.stderr); assert.equal(JSON.parse(explain.stdout).config.workflow.commits.convention, 'none');
  const help = spawnSync(process.execPath, [cli, 'help', '--scope', 'backend', '--json'], { cwd: root, encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr); assert.equal(JSON.parse(help.stdout).conventions.commits.convention, 'none');
  assert.deepEqual(fs.readFileSync(file), original); assert.deepEqual(fs.readdirSync(root), ['stavel.config.json']);
});
