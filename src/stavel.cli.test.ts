import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
