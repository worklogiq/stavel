import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { applyWorkPlan, bindWorkPlanInputs, planWorkCreate, planWorkMigration, planWorkUpdate, readWork, recoverWork, workOptionsForConfiguration, type WorkItem, type WorkOptions, type WorkPlan } from './work.service.js';

const now = '2026-11-26T12:00:00.000Z';
const registry = 'docs/work-index.json';
const statusFile = 'capabilities/cli/cli.status.json';
const capFile = 'docs/capabilities/cli/cli.status.json';
const lockFile = '.stavel/runtime/writer.lock';
const journalFile = '.stavel/runtime/work/journal.json';
function fixture(t: { after(callback: () => void): void }): WorkOptions {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-work-'));
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  put(target, 'docs/capabilities/cli/design.md', '# Real design\n');
  return { target, registryFile: registry, now };
}
function put(root: string, name: string, value: unknown): void {
  const absolute = path.join(root, name); fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
}
const item = (overrides: Partial<WorkItem> = {}): WorkItem => ({ id: 'guided', title: 'Guided work', status: 'active', phase: 'design', mode: 'DESIGN', implementationStatus: 'unstarted', record: 'design.md', nextAction: 'Review the actual design', blockers: [], history: [], ...overrides });
const create = (options: WorkOptions, work?: WorkItem) => planWorkCreate(options, { capabilityId: 'cli', statusFile, title: 'CLI', owner: 'maintainer', ...(work ? { item: work } : {}) });
function install(options: WorkOptions, work?: WorkItem): void { applyWorkPlan(create(options, work)); }
function read(root: string, file: string): any { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
function snapshot(root: string): Record<string, string> {
  const output: Record<string, string> = {};
  const visit = (relative: string) => { for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) { const name = relative ? `${relative}/${entry.name}` : entry.name; if (entry.isDirectory()) { output[`${name}/`] = ''; visit(name); } else if (entry.isSymbolicLink()) output[name] = fs.readlinkSync(path.join(root, name)); else output[name] = fs.readFileSync(path.join(root, name)).toString('base64'); } };
  visit(''); return output;
}
function interrupted(options: WorkOptions): WorkPlan {
  const plan = create(options, item()); const rename = fs.renameSync; let writes = 0;
  fs.renameSync = ((...args: Parameters<typeof fs.renameSync>) => { if (++writes === 2) throw new Error('fixture second rename failure'); return rename(...args); }) as typeof fs.renameSync;
  try { assert.throws(() => applyWorkPlan(plan), /partial changes may remain/); } finally { fs.renameSync = rename; }
  assert.ok(fs.existsSync(path.join(options.target, capFile))); assert.ok(!fs.existsSync(path.join(options.target, registry)));
  return plan;
}

test('query distinguishes absent registry, supported empty records, and actual work with immutable provenance', t => {
  const options = fixture(t); const before = snapshot(options.target);
  const missing = readWork(options); assert.equal(missing.state, 'missing'); assert.equal(missing.sources[0]!.sha256, null); assert.deepEqual(snapshot(options.target), before);
  install(options); const empty = readWork(options); assert.equal(empty.state, 'empty'); assert.deepEqual(empty.items, []);
  applyWorkPlan(planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: itemWithoutHistory(), add: true }));
  const baseline = snapshot(options.target); const result = readWork(options);
  assert.equal(result.state, 'ready'); assert.equal(result.items[0]!.sourceFile, capFile); assert.equal(result.items[0]!.capabilityId, 'cli');
  assert.equal(result.items[0]!.item.mode, 'DESIGN'); assert.equal(result.items[0]!.item.implementationStatus, 'unstarted');
  assert.ok(result.sources.find(source => source.path.endsWith('design.md'))?.sha256);
  const oldHash = result.sources.find(source => source.path.endsWith('design.md'))!.sha256;
  put(options.target, 'docs/capabilities/cli/design.md', '# Changed source\n');
  assert.notEqual(readWork(options).sources.find(source => source.path.endsWith('design.md'))!.sha256, oldHash);
  put(options.target, 'docs/capabilities/cli/design.md', '# Real design\n'); assert.deepEqual(snapshot(options.target), baseline);
});
function itemWithoutHistory(overrides: Partial<WorkItem> = {}): Record<string, unknown> { const { history: _history, ...value } = item(overrides); return value; }

test('query supports multiple authoritative owners without caching their status in registry', t => {
  const options = fixture(t); install(options, item());
  put(options.target, 'docs/capabilities/skill/design.md', '# Skill design');
  applyWorkPlan(planWorkCreate(options, { capabilityId: 'skill', statusFile: 'capabilities/skill/skill.status.json', title: 'Skill', owner: 'other', item: item({ mode: 'EXPLORE', phase: 'exploration', status: 'paused' }) }));
  const result = readWork(options); assert.equal(result.items.length, 2);
  assert.deepEqual(result.items.map(value => [value.capabilityId, value.item.status]), [['cli', 'active'], ['skill', 'paused']]);
  assert.deepEqual(Object.keys(read(options.target, registry)).sort(), ['capabilities', 'schemaVersion']);
  assert.deepEqual(Object.keys(read(options.target, registry).capabilities[0]).sort(), ['id', 'statusFile']);
});

test('malformed, unavailable, unsupported, duplicated and cached registry data are invalid rather than empty', t => {
  const options = fixture(t); install(options); const good = fs.readFileSync(path.join(options.target, registry), 'utf8');
  for (const value of ['{broken', { schemaVersion: 77, capabilities: [] }, { schemaVersion: 2, capabilities: [], status: 'healthy' }, { schemaVersion: 2, capabilities: [{ id: 'cli', statusFile }, { id: 'CLI', statusFile: 'other.json' }] }, { schemaVersion: 2, capabilities: [{ id: 'cli', statusFile: 'missing.json' }] }, { schemaVersion: 2, capabilities: [{ id: 'cli', statusFile: '../../../outside.json' }] }]) {
    put(options.target, registry, value); const before = snapshot(options.target); const report = readWork(options);
    assert.equal(report.state, 'invalid'); assert.ok(report.issues.length); assert.deepEqual(snapshot(options.target), before);
  }
  put(options.target, registry, good);
  const cap = read(options.target, capFile);
  for (const replacement of [{ ...cap, capabilityId: 'other' }, { ...cap, items: [item(), item()] }, { ...cap, items: [item({ record: 'missing.md' })] }, { ...cap, items: [item({ mode: 'invented' })] }, { ...cap, schemaVersion: 3 }]) { put(options.target, capFile, replacement); assert.equal(readWork(options).state, 'invalid'); }
});

test('configured phases/modes are explicit and owning references may traverse inside the repository', t => {
  const options = fixture(t); put(options.target, 'docs/shared.md', '# Real shared owner');
  const custom = { ...options, phases: ['triage'], modes: ['TEAM-REVIEW'] };
  install(custom, item({ phase: 'triage', mode: 'TEAM-REVIEW', record: '../../shared.md' }));
  assert.equal(readWork(custom).state, 'ready'); assert.equal(readWork(options).state, 'invalid');
});

test('shared configuration routing supports explicit work vocabularies and rejects conflicting or invalid aliases', t => {
  const options = fixture(t);
  const selected = workOptionsForConfiguration(options.target, { schemaVersion: 1, documentation: { roots: ['handbook'] }, workflow: { work: { registryFile: registry, modes: ['TEAM-REVIEW'], phases: ['triage'], statuses: ['triaged'] }, modes: ['TEAM-REVIEW'], phases: ['triage'] } });
  assert.equal(selected.registryFile, registry); assert.deepEqual(selected.modes, ['TEAM-REVIEW']); assert.deepEqual(selected.phases, ['triage']); assert.deepEqual(selected.statuses, ['triaged']);
  install({ ...selected, now }, item({ mode: 'TEAM-REVIEW', phase: 'triage', status: 'triaged' })); assert.equal(readWork(selected).state, 'ready');
  assert.equal(workOptionsForConfiguration(options.target, { schemaVersion: 1, documentation: { roots: ['handbook'] } }).registryFile, 'handbook/work-index.json');
  assert.equal(workOptionsForConfiguration(options.target, { schemaVersion: 1, workflow: { workRegistry: registry } }).registryFile, registry);
  for (const workflow of [{ workRegistry: 'old.json', work: { registryFile: 'new.json' } }, { modes: ['DESIGN'], work: { modes: ['TEAM-REVIEW'] } }, { phases: ['design'], work: { phases: ['triage'] } }, { work: { modes: [] } }, { work: { phases: ['triage', 'triage'] } }, { work: { statuses: 'active' } }, { work: { registryFile: '../outside.json' } }]) assert.throws(() => workOptionsForConfiguration(options.target, { schemaVersion: 1, workflow }));
});

test('policy read sets bind immutable work previews and refuse later config creation/edits or conflicting hashes', t => {
  const options = fixture(t); const initial = create(options); const original = structuredClone(initial);
  const configFile = '.stavel-config/workflow.config.json'; put(options.target, configFile, { schemaVersion: 1, workflow: { workRegistry: registry } });
  const sha = createHash('sha256').update(fs.readFileSync(path.join(options.target, configFile))).digest('hex'); const baseline = snapshot(options.target);
  const bound = bindWorkPlanInputs(initial, { [configFile]: sha, 'stavel.config.json': null }); assert.notEqual(bound.id, initial.id); assert.deepEqual(initial, original); assert.deepEqual(snapshot(options.target), baseline);
  assert.equal(bound.sources.find(source => source.path === configFile)?.sha256, sha); applyWorkPlan(bound, { dryRun: true });
  assert.throws(() => bindWorkPlanInputs(initial, { [registry]: '0'.repeat(64) }), /conflicting/);
  assert.throws(() => bindWorkPlanInputs(initial, { [configFile]: 'invalid' }), /invalid.*hash/);
  fs.appendFileSync(path.join(options.target, configFile), '\nChanged policy'); const changed = snapshot(options.target); assert.throws(() => applyWorkPlan(bound), /stale/); assert.deepEqual(snapshot(options.target), changed);
  put(options.target, configFile, { schemaVersion: 1, workflow: { workRegistry: registry } }); put(options.target, 'stavel.config.json', '{}'); assert.throws(() => applyWorkPlan(bound), /stale/);
});

test('create preview and dry-run leave target directories, runtime locks and bytes unchanged', t => {
  const options = fixture(t); const before = snapshot(options.target); const plan = create(options, item());
  assert.deepEqual(snapshot(options.target), before); assert.equal(plan.changes.length, 2); assert.equal(plan.mechanism, 'deterministic');
  assert.deepEqual(applyWorkPlan(plan, { dryRun: true }), { ok: true, changed: 2, dryRun: true }); assert.deepEqual(snapshot(options.target), before);
  const absent = path.join(options.target, 'uncreated'); const other = { ...options, target: absent };
  const emptyPlan = planWorkCreate(other, { capabilityId: 'cli', statusFile, title: 'CLI', owner: 'maintainer' });
  applyWorkPlan(emptyPlan, { dryRun: true }); assert.equal(fs.existsSync(absent), false);
});

test('create/register repeat is idempotent and refuses conflicting owners/files/items', t => {
  const options = fixture(t); install(options, item()); const before = snapshot(options.target);
  assert.equal(create(options, item()).changes.length, 0); assert.equal(applyWorkPlan(create(options)).changed, 0); assert.deepEqual(snapshot(options.target), before);
  assert.throws(() => create(options, item({ title: 'Conflicting work' })), /conflicts/);
  assert.throws(() => planWorkCreate(options, { capabilityId: 'cli', statusFile, title: 'Changed', owner: 'maintainer' }), /conflicts/);
  assert.throws(() => planWorkCreate(options, { capabilityId: 'other', statusFile, title: 'Other', owner: 'maintainer' }), /already exists or is registered/);
  assert.throws(() => planWorkCreate(options, { capabilityId: 'bad', statusFile: '../docs/work-index.json', title: 'Bad', owner: 'maintainer' }));
  assert.deepEqual(snapshot(options.target), before);
});

test('updates retain unknown fields/history, append actual changes, and no-op does not fabricate timestamps', t => {
  const options = fixture(t); install(options, item({ decisionSources: ['design.md'], custom: { keep: true } }));
  const before = snapshot(options.target); const noop = planWorkUpdate({ ...options, now: '2030-01-01' }, { capabilityId: 'cli', itemId: 'guided', changes: { mode: 'DESIGN' } });
  assert.equal(noop.changes.length, 0); applyWorkPlan(noop); assert.deepEqual(snapshot(options.target), before);
  const update = planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { mode: 'PLAN', phase: 'planning', nextAction: 'Slice reviewed design' } });
  assert.equal(update.changes.length, 1); assert.equal(update.changes[0]!.path, capFile); applyWorkPlan(update);
  const work = read(options.target, capFile).items[0]; assert.deepEqual(work.custom, { keep: true }); assert.deepEqual(work.decisionSources, ['design.md']);
  assert.equal(work.history.length, 1); assert.equal(work.history[0].operation, 'update'); assert.equal(work.history[0].changes.mode, 'PLAN'); assert.equal(work.implementationStatus, 'unstarted');
  assert.throws(() => planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { history: [] } }), /cannot replace history/);
  assert.throws(() => planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { id: 'different' } }), /stable/);
});

test('adding case-variant item identities refuses instead of writing a record that its own reader rejects', t => {
  const options = fixture(t); install(options, item()); const baseline = snapshot(options.target);
  assert.throws(() => planWorkUpdate(options, { capabilityId: 'cli', itemId: 'GUIDED', changes: itemWithoutHistory({ id: 'GUIDED' }), add: true }), /duplicate|case|identity/);
  assert.deepEqual(snapshot(options.target), baseline); assert.equal(readWork(options).state, 'ready');
});

test('completion requires explicit existing closure evidence and remains caller-reviewed rather than semantic proof', t => {
  const options = fixture(t); install(options, item());
  assert.throws(() => planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { status: 'completed' } }), /closure evidence/);
  assert.throws(() => planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { status: 'completed' }, closureEvidence: ['missing.md'] }), /unavailable/);
  put(options.target, 'docs/capabilities/cli/verification.md', '# Actual human-reviewed fixture evidence');
  const plan = planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { status: 'completed' }, closureEvidence: ['verification.md'] });
  put(options.target, 'docs/capabilities/cli/verification.md', '# Evidence changed'); assert.throws(() => applyWorkPlan(plan), /stale/);
  const fresh = planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { status: 'completed' }, closureEvidence: ['verification.md'] }); applyWorkPlan(fresh);
  assert.equal(read(options.target, capFile).items[0].history[0].semanticAcceptance, 'caller-reviewed');
});

test('stale registry, target, owning record and evidence changes refuse before any runtime mutation', t => {
  for (const source of [registry, capFile, 'docs/capabilities/cli/design.md']) {
    const options = fixture(t); install(options, item());
    const plan = planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { mode: 'PLAN' } });
    fs.appendFileSync(path.join(options.target, source), '\n'); const before = snapshot(options.target);
    assert.throws(() => applyWorkPlan(plan), /stale/); assert.deepEqual(snapshot(options.target), before); assert.equal(fs.existsSync(path.join(options.target, lockFile)), false);
  }
});

test('another command/process writer lock is never stolen, including dry-run', t => {
  const options = fixture(t); const plan = create(options);
  const script = `const fs=require('node:fs'),p=require('node:path'); fs.mkdirSync(p.dirname(process.argv[1]),{recursive:true}); fs.writeFileSync(process.argv[1],'other migration writer',{flag:'wx'});`;
  const processResult = spawnSync(process.execPath, ['-e', script, path.join(options.target, lockFile)], { encoding: 'utf8' }); assert.equal(processResult.status, 0, processResult.stderr);
  const before = snapshot(options.target); assert.throws(() => applyWorkPlan(plan), /lock\/journal/); assert.throws(() => applyWorkPlan(plan, { dryRun: true }), /lock\/journal/); assert.deepEqual(snapshot(options.target), before);
});

test('partial multi-file creation retains journal and explicit recovery completes without duplicating history', t => {
  const options = fixture(t); interrupted(options); const partial = snapshot(options.target);
  const preview = recoverWork(options, { dryRun: true }); assert.equal(preview.changed, 1); assert.deepEqual(snapshot(options.target), partial);
  const recovered = recoverWork(options); assert.equal(recovered.changed, 1); assert.equal(recovered.recovered, true); assert.equal(readWork(options).state, 'ready');
  assert.equal(fs.existsSync(path.join(options.target, lockFile)), false); assert.equal(fs.existsSync(path.join(options.target, journalFile)), false);
  assert.equal(read(options.target, capFile).items[0].history.length, 0);
});

test('recovery refuses user edits and journal tampering without overwriting either source', t => {
  const options = fixture(t); interrupted(options); fs.appendFileSync(path.join(options.target, capFile), '\nuser edits');
  const before = snapshot(options.target); assert.throws(() => recoverWork(options), /intervening/); assert.deepEqual(snapshot(options.target), before);
  const another = fixture(t); interrupted(another); fs.appendFileSync(path.join(another.target, journalFile), '\n');
  const tampered = snapshot(another.target); assert.throws(() => recoverWork(another), /checksum/); assert.deepEqual(snapshot(another.target), tampered);
});

test('recovery refuses a live different process and missing/uncertain lock metadata', t => {
  const options = fixture(t); interrupted(options);
  const child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { stdio: 'ignore' });
  t.after(() => child.kill()); assert.ok(child.pid);
  const lock = read(options.target, lockFile); put(options.target, lockFile, { ...lock, pid: child.pid });
  const before = snapshot(options.target); assert.throws(() => recoverWork(options), /still running|cannot prove/); assert.deepEqual(snapshot(options.target), before);
  fs.unlinkSync(path.join(options.target, lockFile)); assert.throws(() => recoverWork(options), /original lock and journal/);
});

test('concurrent recovery refuses its exclusive guard and retained guard is never stolen', t => {
  const options = fixture(t); interrupted(options);
  put(options.target, '.stavel/runtime/work-recovery.lock', 'another recovery owns this');
  const before = snapshot(options.target); assert.throws(() => recoverWork(options), /exclusive work recovery lock/); assert.deepEqual(snapshot(options.target), before);
  fs.unlinkSync(path.join(options.target, '.stavel/runtime/work-recovery.lock')); recoverWork(options); assert.equal(readWork(options).state, 'ready');
});

test('v1 migration preview retains all actual fields, IDs, histories and policy choices without updating old timestamps', t => {
  const options = fixture(t);
  put(options.target, registry, { schemaVersion: 1, capabilities: [{ id: 'cli', statusFile }] });
  const old = { schemaVersion: 1, capabilityId: 'cli', title: 'CLI', owner: 'original-maintainer', updated: '2024-01-01', decisionSources: ['real-decision'], localPolicy: { platform: 'modules', preserve: true }, history: [{ actual: 'old cap history' }], items: [item({ history: [{ actual: 'past choice', mode: 'DESIGN' }], custom: ['untouched'] })] };
  put(options.target, capFile, old); assert.equal(readWork(options).state, 'migration-needed'); assert.throws(() => planWorkUpdate(options, { capabilityId: 'cli', itemId: 'guided', changes: { mode: 'PLAN' } }), /migrat/);
  const before = snapshot(options.target); const plan = planWorkMigration(options); assert.equal(plan.changes.length, 2); applyWorkPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(options.target), before);
  applyWorkPlan(plan); const upgraded = read(options.target, capFile);
  assert.equal(upgraded.schemaVersion, 2); assert.equal(upgraded.updated, old.updated); assert.deepEqual(upgraded.localPolicy, old.localPolicy); assert.deepEqual(upgraded.history, old.history); assert.deepEqual(upgraded.decisionSources, old.decisionSources);
  const { history, ...fields } = upgraded.items[0]; const { history: oldHistory, ...oldFields } = old.items[0]!; assert.deepEqual(fields, oldFields); assert.deepEqual(history.slice(0, -1), oldHistory);
  assert.equal(history.at(-1).operation, 'schema-migration'); assert.equal(history.at(-1).mechanism, 'deterministic'); assert.equal(readWork(options).state, 'ready');
  const current = snapshot(options.target); assert.equal(planWorkMigration(options).changes.length, 0); assert.deepEqual(snapshot(options.target), current);
});

test('v1 empty and absent item histories migrate explicitly; unknown newer formats never overwrite', t => {
  const options = fixture(t); put(options.target, registry, { schemaVersion: 1, capabilities: [{ id: 'cli', statusFile }] });
  const oldItem = itemWithoutHistory({ phase: 'slice-planning', mode: 'REVIEW' }); put(options.target, capFile, { schemaVersion: 1, capabilityId: 'cli', title: 'CLI', owner: 'maintainer', updated: now, items: [oldItem] });
  applyWorkPlan(planWorkMigration(options)); assert.equal(read(options.target, capFile).items[0].history.length, 1); assert.equal(read(options.target, capFile).items[0].phase, 'slice-planning'); assert.equal(read(options.target, capFile).items[0].mode, 'REVIEW');
  put(options.target, capFile, { ...read(options.target, capFile), schemaVersion: 8 }); const before = snapshot(options.target);
  assert.throws(() => planWorkMigration(options), /unsupported work schema/); assert.deepEqual(snapshot(options.target), before);
});

test('plan checksum, effects provenance, escaped paths and symlink destinations refuse without writes', t => {
  const options = fixture(t); const plan = create(options); const before = snapshot(options.target);
  const tampered = structuredClone(plan); tampered.changes[0]!.content += '\n'; assert.throws(() => applyWorkPlan(tampered), /checksum/);
  const agent = { ...plan, mechanism: 'agent-assisted' } as unknown as WorkPlan; assert.throws(() => applyWorkPlan(agent), /nondeterministic.*warning.*review/); assert.deepEqual(snapshot(options.target), before);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-work-outside-')); t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.symlinkSync(outside, path.join(options.target, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => planWorkCreate(options, { capabilityId: 'unsafe', statusFile: '../linked/unsafe.json', title: 'Unsafe', owner: 'maintainer' }), /symlink|junction/);
  assert.deepEqual(fs.readdirSync(outside), []);
  const final = snapshot(options.target); assert.throws(() => planWorkCreate(options, { capabilityId: 'unsafe', statusFile: '../../escape.json', title: 'Unsafe', owner: 'maintainer' })); assert.deepEqual(snapshot(options.target), final);
});
