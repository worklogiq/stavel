import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { applyPlan, rollbackMigration } from './migration.service.js';
import { setLocalGitGuards, planRepositoryGitGuards, activateGitGuards, augmentGitGuardPlan, gitProtectionPolicy, inspectGitGuards, planGitGuardInstallation, recoverGitGuardInstallation, runGitHook, verifyGitGuardActivation } from './git-guard.service.js';
import { mutationPlan } from './effects.service.js';
import type { FrameworkConfig } from './framework.types.js';

const executable = (process.env.PATH ?? '').split(path.delimiter).map(directory => path.join(directory, process.platform === 'win32' ? 'git.exe' : 'git')).find(filename => fs.existsSync(filename))!;
const bundlePath = process.env.STAVEL_TEST_GUARD_BUNDLE ?? path.resolve('dist/stavel.git-hook.cjs');
const isolation = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-git-env-'));
process.env.GIT_CONFIG_GLOBAL = path.join(isolation, 'empty-global'); process.env.GIT_CONFIG_NOSYSTEM = '1';
const alignment = { confirmed: true, instruction: 'user:fixture:explicit-guard-assets-and-local-activation' };
const configuration = (hooksPath = '.stavel-hooks'): FrameworkConfig => ({ schemaVersion: 1, workflow: { gitProtection: { enabled: true, protectedBranches: ['main', 'release/stable'], hooksPath } } });
function g(root: string, args: string[], options: { allowFailure?: boolean; env?: NodeJS.ProcessEnv } = {}) {
  const result = spawnSync(executable, ['-C', root, ...args], { encoding: 'utf8', shell: false, windowsHide: true, timeout: 30000, env: options.env ?? process.env });
  if (!options.allowFailure) assert.equal(result.status, 0, `${args.join(' ')}\n${result.stderr}\n${result.error?.message ?? ''}`);
  return result;
}
function write(root: string, name: string, value: string | Buffer | object): void { const filename = path.join(root, name); fs.mkdirSync(path.dirname(filename), { recursive: true }); fs.writeFileSync(filename, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value, null, 2)); }
function fixture(t: { after(callback: () => void): void }, git = true) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-git-guard-')), root = path.join(directory, 'repo'); fs.mkdirSync(root);
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  if (git) { g(root, ['init', '--initial-branch=main']); g(root, ['config', 'user.name', 'Guard fixture']); g(root, ['config', 'user.email', 'guard@example.invalid']); write(root, 'seed.txt', 'seed'); g(root, ['add', 'seed.txt']); g(root, ['commit', '-m', 'fixture seed before guard installation']); }
  write(root, 'stavel.config.json', configuration()); return { root, directory };
}
function install(root: string) { const plan = planGitGuardInstallation({ root, bundlePath, alignment }); applyPlan(plan.assets); assert.equal(verifyGitGuardActivation(plan.activation!), true); return plan; }
function snapshot(root: string): Record<string, string> {
  const output: Record<string, string> = {}; const walk = (directory: string) => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const filename = path.join(directory, entry.name), name = path.relative(root, filename).replace(/\\/g, '/'); if (entry.isDirectory()) { output[`${name}/`] = ''; walk(filename); } else output[name] = fs.readFileSync(filename).toString('base64'); } }; walk(root); return output;
}

test('personal controls preview without writes and restore real commit/push protection without changing shared policy/hooks', t => {
  const { root, directory } = fixture(t); install(root);
  const policy = fs.readFileSync(path.join(root, 'stavel.config.json')), hooks = fs.readFileSync(path.join(root, '.stavel-hooks/ownership.json'));
  const before = snapshot(root); setLocalGitGuards({ root, enabled: false, dryRun: true }); assert.deepEqual(snapshot(root), before);
  g(root, ['config', '--local', 'other.fixture', 'keep']);
  setLocalGitGuards({ root, enabled: false }); assert.equal(inspectGitGuards({ root }).controls?.effectiveEnabled, false);
  const allowed = g(root, ['commit', '--allow-empty', '-m', 'explicit personal override']); assert.match(allowed.stderr, /explicitly disabled/);
  const remote = path.join(directory, 'personal.git'); fs.mkdirSync(remote); g(remote, ['init', '--bare']); g(root, ['push', remote, 'HEAD:refs/heads/main']);
  setLocalGitGuards({ root, enabled: true }); assert.notEqual(g(root, ['commit', '--allow-empty', '-m', 'blocked again'], { allowFailure: true }).status, 0);
  g(root, ['switch', '-c', 'task/restored']); g(root, ['commit', '--allow-empty', '-m', 'new task update']);
  assert.notEqual(g(root, ['push', remote, 'HEAD:refs/heads/main'], { allowFailure: true }).status, 0);
  assert.equal(g(root, ['config', '--local', '--get', 'other.fixture']).stdout.trim(), 'keep');
  assert.deepEqual(fs.readFileSync(path.join(root, 'stavel.config.json')), policy); assert.deepEqual(fs.readFileSync(path.join(root, '.stavel-hooks/ownership.json')), hooks);
});

test('native command boolean permits one real commit and respects false, duplicates and invalid values', t => {
  const { root } = fixture(t); install(root);
  for (const settings of [[], ['-c', 'stavel.allow=false'], ['-c', 'stavel.allow=true', '-c', 'stavel.allow=false'], ['-c', 'stavel.allow=some reason']]) {
    const result = g(root, [...settings, 'commit', '--allow-empty', '-m', 'must remain protected'], { allowFailure: true });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /blocked commit|must be true or false/);
  }
  const config = fs.readFileSync(path.join(root, '.git/config')), receipts = fs.readdirSync(path.join(root, '.git/stavel-guards'));
  const allowed = g(root, ['-c', 'stavel.allow=false', '-c', 'stavel.allow=true', 'commit', '--allow-empty', '-m', 'explicit invocation']);
  assert.match(allowed.stderr, /Explicit git -c stavel.allow=true/);
  assert.notEqual(g(root, ['commit', '--allow-empty', '-m', 'next invocation protected'], { allowFailure: true }).status, 0);
  assert.deepEqual(fs.readFileSync(path.join(root, '.git/config')), config); assert.deepEqual(fs.readdirSync(path.join(root, '.git/stavel-guards')), receipts);
});

test('native command boolean permits the selected push and never persists into subsequent pushes', t => {
  const { root, directory } = fixture(t), remote = path.join(directory, 'native.git'); fs.mkdirSync(remote); g(remote, ['init', '--bare']);
  g(root, ['remote', 'add', 'origin', remote]); g(root, ['push', 'origin', 'main']); install(root); g(root, ['switch', '-c', 'task/native']); g(root, ['commit', '--allow-empty', '-m', 'task update']);
  assert.notEqual(g(root, ['-c', 'stavel.allow=false', 'push', 'origin', 'HEAD:main'], { allowFailure: true }).status, 0);
  const allowed = g(root, ['-c', 'stavel.allow=true', 'push', 'origin', 'HEAD:main']); assert.match(allowed.stderr, /Explicit git -c stavel.allow=true/);
  g(root, ['commit', '--allow-empty', '-m', 'later task update']);
  assert.notEqual(g(root, ['push', 'origin', 'HEAD:main'], { allowFailure: true }).status, 0);
  assert.notEqual(g(root, ['-c', 'stavel.allow=false', 'push', 'origin', 'HEAD:main'], { allowFailure: true }).status, 0);
});

test('persisted local/global stavel.allow never grants an invocation exception and true still checks owned integrity', t => {
  const { root, directory } = fixture(t); install(root); g(root, ['config', '--local', 'stavel.allow', 'true']);
  const global = path.join(directory, 'global.gitconfig'); fs.writeFileSync(global, '[stavel]\n allow = true\n');
  const env = { ...process.env, GIT_CONFIG_GLOBAL: global };
  assert.notEqual(g(root, ['commit', '--allow-empty', '-m', 'persistent values ignored'], { allowFailure: true, env }).status, 0);
  assert.notEqual(g(root, ['-c', 'stavel.allow=false', 'commit', '--allow-empty', '-m', 'explicit false'], { allowFailure: true, env }).status, 0);
  assert.equal(inspectGitGuards({ root }).controls?.commandAllow, undefined);
  fs.appendFileSync(path.join(root, '.stavel-hooks/stavel.git-hook.cjs'), '\n// modified\n');
  const changed = g(root, ['-c', 'stavel.allow=true', 'commit', '--allow-empty', '-m', 'integrity still required'], { allowFailure: true });
  assert.notEqual(changed.status, 0); assert.match(changed.stderr, /asset missing\/modified/);
});

test('repository toggles preserve pinned policy, preview/stale refusal and restore actual guard behavior', t => {
  const { root } = fixture(t); install(root); const original = fs.readFileSync(path.join(root, 'stavel.config.json'));
  const plan = planRepositoryGitGuards({ root, enabled: false, alignment }); applyPlan(plan, { dryRun: true }); assert.deepEqual(fs.readFileSync(path.join(root, 'stavel.config.json')), original);
  applyPlan(plan); assert.equal(inspectGitGuards({ root }).state, 'disabled'); g(root, ['commit', '--allow-empty', '-m', 'repository selected off']);
  const enable = planRepositoryGitGuards({ root, enabled: true, alignment }); applyPlan(enable); assert.notEqual(g(root, ['commit', '--allow-empty', '-m', 'restored policy'], { allowFailure: true }).status, 0);
  const stale = planRepositoryGitGuards({ root, enabled: false, alignment }); fs.appendFileSync(path.join(root, 'stavel.config.json'), '\n'); const changed = fs.readFileSync(path.join(root, 'stavel.config.json'));
  assert.throws(() => applyPlan(stale), /stale|changed/); assert.deepEqual(fs.readFileSync(path.join(root, 'stavel.config.json')), changed);
});

test('controls preserve foreign locks and refuse runtimes without control support', t => {
  const { root } = fixture(t); install(root); write(root, '.git/config.lock', 'foreign'); const before = snapshot(root);
  assert.throws(() => setLocalGitGuards({ root, enabled: false }), /foreign Git config.lock/); assert.deepEqual(snapshot(root), before);
  fs.unlinkSync(path.join(root, '.git/config.lock'));
  const old = JSON.parse(fs.readFileSync(path.join(root, '.stavel-hooks/ownership.json'), 'utf8')); delete old.controlsVersion; write(root, '.stavel-hooks/ownership.json', old);
  assert.throws(() => setLocalGitGuards({ root, enabled: false }), /predates explicit controls/);
});

test('exact policy identities reject patterns, full refs and reserved case aliases; absent/disabled stays unselected', () => {
  assert.equal(gitProtectionPolicy({ schemaVersion: 1 }).state, 'absent'); assert.equal(gitProtectionPolicy({ schemaVersion: 1, workflow: { gitProtection: { enabled: false } } }).state, 'disabled');
  for (const branch of ['refs/heads/main', 'release/*', 'main..old', 'bad name']) assert.throws(() => gitProtectionPolicy({ schemaVersion: 1, workflow: { gitProtection: { enabled: true, protectedBranches: [branch] } } }));
  for (const hooksPath of ['../outside', '.GIT/hooks', '.STAVEL/runtime/hooks']) assert.throws(() => gitProtectionPolicy(configuration(hooksPath)));
});

test('unadopted inspection never selects the packaged default policy and performs no adoption writes', t => {
  const { root } = fixture(t); fs.unlinkSync(path.join(root, 'stavel.config.json')); const before = snapshot(root), report = inspectGitGuards({ root, bundlePath });
  assert.equal(report.policy.state, 'absent'); assert.equal(report.state, 'not-selected'); assert.equal(report.active, false); assert.equal(report.git.state, 'ordinary'); assert.deepEqual(report.assets, []); assert.deepEqual(snapshot(root), before);
});

test('preview/diagnosis are read-only; serialized apply activates last and healthy repeat changes nothing', t => {
  const { root } = fixture(t); const before = snapshot(root); const report = inspectGitGuards({ root, bundlePath }); assert.equal(report.active, false); assert.equal(report.repairable, true);
  const selected = planGitGuardInstallation({ root, bundlePath, alignment }); assert.deepEqual(snapshot(root), before); applyPlan(selected.assets, { dryRun: true }); assert.deepEqual(snapshot(root), before);
  const serialized = JSON.parse(JSON.stringify(selected.assets)); applyPlan(serialized); assert.equal(inspectGitGuards({ root, bundlePath }).ready, true); assert.equal(g(root, ['config', '--local', '--get', 'core.hooksPath']).stdout.trim(), '.stavel-hooks');
  const installed = snapshot(root), repeated = planGitGuardInstallation({ root, bundlePath, alignment }); assert.equal(repeated.assets.operations.length, 0); applyPlan(repeated.assets); assert.deepEqual(snapshot(root), installed);
  assert.equal(activateGitGuards(selected.activation!).changed, false); assert.ok(fs.existsSync(path.join(root, '.git/stavel-guards')));
});

test('real Git blocks main commits, allows task commits, and refuses detached HEAD without changing protected HEAD', t => {
  const { root } = fixture(t); install(root); const before = g(root, ['rev-parse', 'HEAD']).stdout.trim();
  const blocked = g(root, ['commit', '--allow-empty', '-m', 'protected attempt'], { allowFailure: true }); assert.notEqual(blocked.status, 0); assert.match(blocked.stderr, /Stavel blocked commit.*main/); assert.equal(g(root, ['rev-parse', 'HEAD']).stdout.trim(), before);
  g(root, ['switch', '-c', 'task/guard']); g(root, ['commit', '--allow-empty', '-m', 'allowed task change']); const taskHead = g(root, ['rev-parse', 'HEAD']).stdout.trim(); assert.notEqual(taskHead, before);
  g(root, ['checkout', '--detach']); const detached = g(root, ['commit', '--allow-empty', '-m', 'detached attempt'], { allowFailure: true }); assert.notEqual(detached.status, 0); assert.match(detached.stderr, /detached-HEAD/); assert.equal(g(root, ['rev-parse', 'HEAD']).stdout.trim(), taskHead);
});

test('real local pushes reject protected destinations including multi-ref/deletion and permit ordinary task push', t => {
  const { root, directory } = fixture(t), remote = path.join(directory, 'remote.git'); fs.mkdirSync(remote); g(remote, ['init', '--bare', '--initial-branch=main']); g(root, ['remote', 'add', 'origin', remote]); g(root, ['push', 'origin', 'main']);
  const protectedBefore = g(remote, ['rev-parse', 'refs/heads/main']).stdout.trim(); install(root); g(root, ['switch', '-c', 'task/push']); g(root, ['commit', '--allow-empty', '-m', 'task update']);
  for (const refs of [['task/push:refs/heads/main'], ['task/push:refs/heads/task/also', 'task/push:refs/heads/main'], [':refs/heads/main'], ...(process.platform === 'win32' ? [['task/push:refs/heads/MAIN']] : [])]) {
    const blocked = g(root, ['push', 'origin', ...refs], { allowFailure: true }); assert.notEqual(blocked.status, 0); assert.match(blocked.stderr, /Stavel blocked push.*protected destination refs\/heads\/(?:main|MAIN)/); assert.equal(g(remote, ['rev-parse', 'refs/heads/main']).stdout.trim(), protectedBefore);
  }
  assert.notEqual(g(remote, ['rev-parse', '--verify', 'refs/heads/task/also'], { allowFailure: true }).status, 0);
  g(root, ['push', 'origin', 'task/push:refs/heads/task/push']); assert.equal(g(remote, ['rev-parse', 'refs/heads/task/push']).stdout.trim(), g(root, ['rev-parse', 'HEAD']).stdout.trim());
});

test('relocated installed guard needs no source package; missing policy and changed owned runtime fail closed', t => {
  const { root, directory } = fixture(t), standalone = path.join(directory, 'standalone.cjs'); fs.copyFileSync(bundlePath, standalone);
  const selected = planGitGuardInstallation({ root, bundlePath: standalone, alignment }); applyPlan(selected.assets); fs.unlinkSync(standalone); g(root, ['switch', '-c', 'task/offline']); g(root, ['commit', '--allow-empty', '-m', 'offline task']);
  const config = fs.readFileSync(path.join(root, 'stavel.config.json')); fs.unlinkSync(path.join(root, 'stavel.config.json'));
  const missing = g(root, ['commit', '--allow-empty', '-m', 'no policy'], { allowFailure: true }); assert.notEqual(missing.status, 0); assert.match(missing.stderr, /configuration is missing/);
  write(root, 'stavel.config.json', config); fs.appendFileSync(path.join(root, '.stavel-hooks/stavel.git-hook.cjs'), '\n// user change\n');
  const changed = g(root, ['commit', '--allow-empty', '-m', 'changed runtime'], { allowFailure: true }); assert.notEqual(changed.status, 0); assert.match(changed.stderr, /guard asset missing\/modified/); assert.equal(inspectGitGuards({ root, bundlePath }).state, 'conflict');
});

test('foreign active/default hooks and worktrees/bare repositories preserve all existing integration', t => {
  const foreign = fixture(t); write(foreign.root, '.git/hooks/pre-commit', '#!/bin/sh\nexit 0\n'); const before = snapshot(foreign.root);
  assert.equal(inspectGitGuards({ root: foreign.root, bundlePath }).state, 'conflict'); assert.throws(() => planGitGuardInstallation({ root: foreign.root, bundlePath, alignment }), /preserves existing integration/); assert.deepEqual(snapshot(foreign.root), before);
  const manager = fixture(t); g(manager.root, ['config', 'core.hooksPath', '.husky/_']); const managerBefore = snapshot(manager.root); assert.throws(() => planGitGuardInstallation({ root: manager.root, bundlePath, alignment }), /foreign\/shared/); assert.deepEqual(snapshot(manager.root), managerBefore);
  const worktree = fixture(t), linked = path.join(worktree.directory, 'linked'); g(worktree.root, ['worktree', 'add', '-b', 'task/linked', linked]); write(linked, 'stavel.config.json', configuration()); assert.equal(inspectGitGuards({ root: linked, bundlePath }).git.state, 'worktree'); assert.throws(() => planGitGuardInstallation({ root: linked, bundlePath, alignment }), /does not support worktree/);
  const bare = path.join(worktree.directory, 'bare.git'); fs.mkdirSync(bare); g(bare, ['init', '--bare']); write(bare, 'stavel.config.json', configuration()); assert.equal(inspectGitGuards({ root: bare, bundlePath }).git.state, 'bare');
});

test('nonGit stages only selected assets and retains pending activation without git init; old pins select nothing', t => {
  const { root } = fixture(t, false), before = snapshot(root); const selected = planGitGuardInstallation({ root, bundlePath, alignment }); assert.equal(selected.inspection.state, 'pending-git'); assert.equal(selected.activation, undefined); applyPlan(selected.assets); assert.equal(fs.existsSync(path.join(root, '.git')), false); assert.ok(fs.existsSync(path.join(root, '.stavel-hooks/pre-commit')));
  const legacy = fixture(t, false); write(legacy.root, 'stavel.config.json', { schemaVersion: 1 }); const old = planGitGuardInstallation({ root: legacy.root, alignment, bundlePath: path.join(root, 'absent') }); assert.equal(old.assets.operations.length, 0); assert.equal(old.inspection.policy.state, 'absent'); assert.deepEqual(snapshot(legacy.root), { 'stavel.config.json': fs.readFileSync(path.join(legacy.root, 'stavel.config.json')).toString('base64') }); assert.ok(Object.keys(before).length);
});

test('stale config/foreign Git lock refuse without activating or removing locks', t => {
  const { root } = fixture(t); const selected = planGitGuardInstallation({ root, bundlePath, alignment }); g(root, ['config', 'fixture.changed', 'user-edit']); const before = snapshot(root); assert.throws(() => applyPlan(selected.assets), /config changed|stale/); assert.deepEqual(snapshot(root), before);
  const fresh = planGitGuardInstallation({ root, bundlePath, alignment }); write(root, '.git/config.lock', 'foreign writer'); const locked = snapshot(root); assert.throws(() => applyPlan(fresh.assets), /config.lock|foreign|incomplete/); assert.equal(fs.readFileSync(path.join(root, '.git/config.lock'), 'utf8'), 'foreign writer'); assert.equal(g(root, ['config', '--get', 'core.hooksPath'], { allowFailure: true }).status, 1); assert.ok(Object.keys(locked).length);
});

test('injected activation interruption retains private journal and resumes; rollback restores config before removing owned assets', t => {
  const { root } = fixture(t); const originalConfig = fs.readFileSync(path.join(root, '.git/config')), selected = planGitGuardInstallation({ root, bundlePath, alignment });
  const rename = fs.renameSync; fs.renameSync = ((...args: Parameters<typeof fs.renameSync>) => { if (String(args[1]) === path.join(root, '.git/config')) throw new Error('fixture activation rename interrupted'); return rename(...args); }) as typeof fs.renameSync;
  try { assert.throws(() => applyPlan(selected.assets), /activation incomplete|hooks resume/); } finally { fs.renameSync = rename; }
  assert.deepEqual(fs.readFileSync(path.join(root, '.git/config')), originalConfig); assert.ok(fs.existsSync(path.join(root, '.git/config.lock'))); assert.ok(fs.existsSync(path.join(root, '.git/stavel-guards')));
  const pending = inspectGitGuards({ root, bundlePath }); assert.equal(pending.ready, false); assert.equal(pending.repairable, false); assert.ok(pending.issues.some(issue => issue.code === 'activation-pending'));
  const before = snapshot(root); recoverGitGuardInstallation({ root, mode: 'resume', dryRun: true }); assert.deepEqual(snapshot(root), before);
  recoverGitGuardInstallation({ root, mode: 'resume' }); assert.equal(verifyGitGuardActivation(selected.activation!), true); assert.equal(fs.existsSync(path.join(root, '.git/config.lock')), false);
  recoverGitGuardInstallation({ root, mode: 'rollback', activation: selected.activation }); assert.deepEqual(fs.readFileSync(path.join(root, '.git/config')), originalConfig); assert.equal(fs.existsSync(path.join(root, '.stavel-hooks/pre-commit')), false);
});

test('recovery preserves intervening local config/asset changes and tampered private receipts', t => {
  for (const what of ['config', 'asset', 'journal']) {
    const { root } = fixture(t), selected = install(root);
    if (what === 'config') g(root, ['config', 'fixture.later', 'preserve']);
    if (what === 'asset') fs.appendFileSync(path.join(root, '.stavel-hooks/pre-push'), '\n# user change\n');
    if (what === 'journal') { const name = fs.readdirSync(path.join(root, '.git/stavel-guards'))[0]!; fs.appendFileSync(path.join(root, '.git/stavel-guards', name), '\ncorrupt'); }
    const before = snapshot(root); assert.throws(() => recoverGitGuardInstallation({ root, mode: 'rollback', activation: selected.activation })); assert.deepEqual(snapshot(root), before);
  }
});

test('saved receipt retry preserves a foreign empty Git lock and never leaves a false own writer claim', t => {
  const { root } = fixture(t), beforeConfig = fs.readFileSync(path.join(root, '.git/config')), selected = install(root);
  write(root, '.git/config', beforeConfig); write(root, '.git/config.lock', Buffer.alloc(0)); const before = snapshot(root);
  assert.throws(() => activateGitGuards(selected.activation!), /foreign Git config.lock/); assert.deepEqual(snapshot(root), before);
  assert.equal(fs.existsSync(path.join(root, '.stavel/runtime/writer.lock')), false); assert.equal(fs.readFileSync(path.join(root, '.git/config.lock')).length, 0);
});

test('a fresh real clone recognizes missing local activation without replacing committed owned assets', t => {
  const { root, directory } = fixture(t); install(root); g(root, ['switch', '-c', 'task/checkout']); g(root, ['add', 'stavel.config.json', '.stavel-hooks']); g(root, ['commit', '-m', 'fixture owned guard assets']);
  const clone = path.join(directory, 'clone'); g(directory, ['clone', '--branch', 'task/checkout', root, clone]);
  const before = fs.readFileSync(path.join(clone, '.stavel-hooks/stavel.git-hook.cjs')), report = inspectGitGuards({ root: clone, bundlePath }); assert.equal(report.active, false); assert.equal(report.ready, false); assert.equal(report.repairable, true);
  const selected = planGitGuardInstallation({ root: clone, bundlePath, alignment }); assert.equal(selected.assets.operations.length, 0); applyPlan(selected.assets); assert.equal(verifyGitGuardActivation(selected.activation!), true); assert.deepEqual(fs.readFileSync(path.join(clone, '.stavel-hooks/stavel.git-hook.cjs')), before);
});

test('real Git adapter refuses missing Node without creating a commit', t => {
  const { root, directory } = fixture(t); install(root); g(root, ['switch', '-c', 'task/runtime']); const before = g(root, ['rev-parse', 'HEAD']).stdout.trim();
  const empty = path.join(directory, 'no-node'); fs.mkdirSync(empty);
  const gitRoot = path.resolve(g(root, ['--exec-path']).stdout.trim(), '../../..'), gitTools = path.join(gitRoot, 'usr/bin');
  const isolatedPath = process.platform === 'win32' && fs.existsSync(gitTools) ? `${empty}${path.delimiter}${gitTools}` : empty;
  const blocked = g(root, ['commit', '--allow-empty', '-m', 'missing Node'], { allowFailure: true, env: { ...process.env, PATH: isolatedPath } }); assert.notEqual(blocked.status, 0); assert.match(blocked.stderr, /Stavel refused: Node runtime is missing/); assert.equal(g(root, ['rev-parse', 'HEAD']).stdout.trim(), before);
});

test('missing runtime package bytes are unavailable instead of offering an impossible repair preview', t => {
  const { root } = fixture(t); const before = snapshot(root), report = inspectGitGuards({ root, bundlePath: path.join(root, 'missing-runtime.cjs') }); assert.equal(report.repairable, false); assert.ok(report.issues.some(issue => issue.code === 'missing-runtime-bundle')); assert.deepEqual(snapshot(root), before);
  assert.throws(() => planGitGuardInstallation({ root, bundlePath: path.join(root, 'missing-runtime.cjs'), alignment }), /runtime is unavailable/); assert.deepEqual(snapshot(root), before);
});

test('Windows existing protected branch case aliases cannot move the protected branch HEAD', { skip: process.platform !== 'win32' }, t => {
  const { root } = fixture(t); install(root); const before = g(root, ['rev-parse', 'refs/heads/main']).stdout.trim(); const switched = g(root, ['switch', 'MAIN'], { allowFailure: true });
  if (switched.status !== 0) return;
  const blocked = g(root, ['commit', '--allow-empty', '-m', 'case alias attempt'], { allowFailure: true }); assert.notEqual(blocked.status, 0, blocked.stderr); assert.equal(g(root, ['rev-parse', 'refs/heads/main']).stdout.trim(), before);
});

test('reftable keeps distinct case identities even when working-tree ignoreCase is selected', t => {
  const { root } = fixture(t, false); const initialized = g(root, ['init', '--initial-branch=main', '--ref-format=reftable'], { allowFailure: true });
  if (initialized.status !== 0) { t.skip('Installed Git does not support reftable initialization.'); return; }
  g(root, ['config', 'user.name', 'Guard fixture']); g(root, ['config', 'user.email', 'guard@example.invalid']); g(root, ['config', 'core.ignoreCase', 'true']); g(root, ['add', 'stavel.config.json']); g(root, ['commit', '-m', 'fixture seed before guard']); const protectedHead = g(root, ['rev-parse', 'refs/heads/main']).stdout.trim();
  install(root); g(root, ['switch', '-c', 'MAIN']); g(root, ['commit', '--allow-empty', '-m', 'distinct reftable identity']); assert.equal(g(root, ['rev-parse', 'refs/heads/main']).stdout.trim(), protectedHead); assert.notEqual(g(root, ['rev-parse', 'HEAD']).stdout.trim(), protectedHead);
});

test('augmentation binds after-policy/config assets and generic rollback restores activation as well as files', t => {
  const { root } = fixture(t); const config = configuration('.tools/owned hooks'); const base = mutationPlan({ root, alignment, changes: [{ path: 'stavel.config.json', content: JSON.stringify(config), reason: 'explicit selected policy change' }] });
  const selected = augmentGitGuardPlan(base, { config, bundlePath }); assert.equal(selected.plan.gitGuardActivation!.hooksPath, '.tools/owned hooks');
  const result = applyPlan(selected.plan); assert.equal(verifyGitGuardActivation(selected.activation!), true); assert.equal(inspectGitGuards({ root, bundlePath }).active, true);
  rollbackMigration({ root, journal: result.journal! }); assert.equal(g(root, ['config', '--get', 'core.hooksPath'], { allowFailure: true }).status, 1); assert.equal(fs.existsSync(path.join(root, '.tools/owned hooks/pre-commit')), false);
});

test('pre-push malformed records refuse; an explicit disabled policy permits task operations without an invented exception', t => {
  const { root } = fixture(t); install(root); assert.throws(() => runGitHook({ cwd: root, hook: 'pre-push', stdin: 'malformed input' }), /malformed/);
  write(root, 'stavel.config.json', { schemaVersion: 1, workflow: { gitProtection: { enabled: false } } }); const allowed = g(root, ['commit', '--allow-empty', '-m', 'explicit disabled policy fixture']); assert.equal(allowed.status, 0);
});

test('explicit runtime upgrade previews owned updates, runs the upgraded guard and rolls back exact assets without rewriting private config', t => {
  const { root, directory } = fixture(t), oldBundle = path.join(directory, 'old.cjs'), newBundle = path.join(directory, 'new.cjs');
  fs.copyFileSync(bundlePath, oldBundle); fs.writeFileSync(newBundle, Buffer.concat([fs.readFileSync(bundlePath), Buffer.from('\n// fixture upgraded distribution\n')]));
  g(root, ['config', 'fixture.private', 'PRIVATE_UPGRADE_FIXTURE']);
  const original = planGitGuardInstallation({ root, bundlePath: oldBundle, alignment }); applyPlan(original.assets);
  const oldRuntime = fs.readFileSync(path.join(root, '.stavel-hooks/stavel.git-hook.cjs')), oldOwnership = fs.readFileSync(path.join(root, '.stavel-hooks/ownership.json')), oldConfig = fs.readFileSync(path.join(root, '.git/config'));
  const receipts = fs.readdirSync(path.join(root, '.git/stavel-guards'));
  const before = snapshot(root), pinned = planGitGuardInstallation({ root, bundlePath: newBundle, alignment });
  assert.equal(pinned.assets.operations.length, 0); assert.deepEqual(snapshot(root), before);
  const selected = planGitGuardInstallation({ root, bundlePath: newBundle, alignment, upgradeRuntime: true });
  assert.deepEqual(selected.assets.operations.map(operation => operation.path).sort(), ['.stavel-hooks/ownership.json', '.stavel-hooks/stavel.git-hook.cjs']);
  assert.equal(JSON.stringify(selected.assets).includes('PRIVATE_UPGRADE_FIXTURE'), false); assert.deepEqual(snapshot(root), before);
  applyPlan(selected.assets, { dryRun: true }); assert.deepEqual(snapshot(root), before);
  const result = applyPlan(JSON.parse(JSON.stringify(selected.assets)));
  assert.deepEqual(fs.readFileSync(path.join(root, '.stavel-hooks/stavel.git-hook.cjs')), fs.readFileSync(newBundle));
  assert.equal(verifyGitGuardActivation(selected.activation!), true); assert.deepEqual(fs.readFileSync(path.join(root, '.git/config')), oldConfig);
  assert.deepEqual(fs.readdirSync(path.join(root, '.git/stavel-guards')), receipts);
  const protectedHead = g(root, ['rev-parse', 'HEAD']).stdout.trim();
  assert.notEqual(g(root, ['commit', '--allow-empty', '-m', 'upgraded main refusal'], { allowFailure: true }).status, 0); assert.equal(g(root, ['rev-parse', 'HEAD']).stdout.trim(), protectedHead);
  g(root, ['switch', '-c', 'task/upgraded']); g(root, ['commit', '--allow-empty', '-m', 'upgraded task works']);
  rollbackMigration({ root, journal: result.journal! });
  assert.deepEqual(fs.readFileSync(path.join(root, '.stavel-hooks/stavel.git-hook.cjs')), oldRuntime); assert.deepEqual(fs.readFileSync(path.join(root, '.stavel-hooks/ownership.json')), oldOwnership);
  assert.deepEqual(fs.readFileSync(path.join(root, '.git/config')), oldConfig); assert.deepEqual(fs.readdirSync(path.join(root, '.git/stavel-guards')), receipts);
  assert.equal(verifyGitGuardActivation(original.activation!), true); g(root, ['commit', '--allow-empty', '-m', 'rolled back task works']);
});

test('runtime upgrades preserve stale/user changes and cannot replace missing pins or unavailable package bytes', t => {
  for (const changed of ['stavel.git-hook.cjs', 'ownership.json']) {
    const { root, directory } = fixture(t), newer = path.join(directory, 'new.cjs'); install(root); fs.writeFileSync(newer, Buffer.concat([fs.readFileSync(bundlePath), Buffer.from('\n// newer fixture\n')]));
    const selected = planGitGuardInstallation({ root, bundlePath: newer, alignment, upgradeRuntime: true });
    fs.appendFileSync(path.join(root, '.stavel-hooks', changed), '\n// user edit\n'); const before = snapshot(root);
    assert.throws(() => applyPlan(selected.assets), /stale|changed|modified|invalid/); assert.deepEqual(snapshot(root), before);
    assert.throws(() => planGitGuardInstallation({ root, bundlePath: newer, alignment, upgradeRuntime: true })); assert.deepEqual(snapshot(root), before);
  }
  const { root, directory } = fixture(t); install(root); const missingBundle = path.join(directory, 'absent.cjs'), before = snapshot(root);
  assert.throws(() => planGitGuardInstallation({ root, bundlePath: missingBundle, alignment, upgradeRuntime: true }), /selected package bundle/); assert.deepEqual(snapshot(root), before);
  fs.unlinkSync(path.join(root, '.stavel-hooks/stavel.git-hook.cjs')); const missing = snapshot(root);
  assert.throws(() => planGitGuardInstallation({ root, bundlePath, alignment, upgradeRuntime: true }), /intact owned assets/); assert.deepEqual(snapshot(root), missing);
  const repair = planGitGuardInstallation({ root, bundlePath, alignment }); assert.deepEqual(repair.assets.operations.map(operation => operation.path), ['.stavel-hooks/stavel.git-hook.cjs']); applyPlan(repair.assets); assert.equal(inspectGitGuards({ root, bundlePath }).ready, true);
});
