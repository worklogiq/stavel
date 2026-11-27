import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { applyPlan, preflightPlan, resumeMigration, rollbackMigration, verifyPlan } from './migration.service.js';
import { planDigest, validatePlan } from './planning.service.js';
import type { MigrationPlan, OperationKind } from './framework.types.js';

const hash = (value: Uint8Array): string => createHash('sha256').update(value).digest('hex');
const write = (root: string, name: string, value: string | Uint8Array): void => {
  const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value);
};
const rootFixture = (): string => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-migration-contract-')), 'target');
const read = (root: string, name: string): Buffer | null => fs.existsSync(path.join(root, name)) ? fs.readFileSync(path.join(root, name)) : null;
function snapshot(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  const walk = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else files[path.relative(root, file).replace(/\\/g, '/')] = fs.readFileSync(file).toString('base64');
    }
  };
  if (fs.existsSync(root)) walk(root);
  return files;
}
type Change = { kind: OperationKind; path: string; from?: string; value?: string | Uint8Array };
function fixturePlan(root: string, changes: Change[], untouched: string[] = []): MigrationPlan {
  const inputs: Record<string, string | null> = {};
  const beforeHash = (name: string) => { const bytes = read(root, name); return bytes === null ? null : hash(bytes); };
  const operations = changes.map((change, index) => {
    const source = change.from ?? change.path;
    for (const name of [source, change.path]) inputs[name] = beforeHash(name);
    const bytes = Buffer.from(change.value ?? '');
    return { id: `operation-${index + 1}`, kind: change.kind, path: change.path, ...(change.from ? { from: change.from } : {}), beforeHash: inputs[source], afterHash: change.kind === 'delete' ? null : hash(bytes), ...(change.kind === 'delete' ? {} : { content: bytes.toString('base64'), encoding: 'base64' as const }), reason: 'Explicit migration contract fixture' };
  });
  for (const name of untouched) inputs[name] = beforeHash(name);
  const plan: MigrationPlan = { product: 'stavel', schemaVersion: 2, id: '', root, frameworkVersion: '0.1.0', profileVersion: 'default@1', mode: 'migrate', track: 'existing', projectName: 'Contract fixture', alignment: { confirmed: true, instruction: 'Fixture owner authorizes exactly the described byte transitions.' }, decisions: {}, inputs, operations, diagnostics: [], createdAt: '2026-11-26T00:00:00.000Z' };
  plan.id = planDigest(plan); return plan;
}

test('preflight and dry-run preserve a nonexistent target; an empty plan creates no journal', () => {
  const root = rootFixture(); const plan = fixturePlan(root, [{ kind: 'create', path: 'nested/new.txt', value: 'new' }]);
  preflightPlan(plan); assert.equal(fs.existsSync(root), false);
  assert.deepEqual(applyPlan(plan, { dryRun: true }), { ok: true, changed: 1 }); assert.equal(fs.existsSync(root), false);
  assert.deepEqual(applyPlan(fixturePlan(root, [])), { ok: true, changed: 0 }); assert.equal(fs.existsSync(root), false);
});

test('mixed byte transitions verify, report a changed result precisely and roll back originals', () => {
  const root = rootFixture(); const original = Buffer.from([0, 255, 128, 13, 10]);
  write(root, 'binary.bin', original); write(root, 'remove.txt', 'remove me'); write(root, 'old.txt', 'move me');
  const updated = Buffer.from([254, 1, 0]);
  const plan = fixturePlan(root, [{ kind: 'update', path: 'binary.bin', value: updated }, { kind: 'delete', path: 'remove.txt' }, { kind: 'move', from: 'old.txt', path: 'renamed.txt', value: 'moved result' }, { kind: 'create', path: 'nested/new.txt', value: 'new content' }]);
  const result = applyPlan(plan); assert.ok(result.journal);
  assert.deepEqual(read(root, 'binary.bin'), updated); assert.equal(read(root, 'remove.txt'), null); assert.equal(read(root, 'old.txt'), null);
  assert.equal(read(root, 'renamed.txt')!.toString(), 'moved result'); assert.deepEqual(verifyPlan(plan), { ok: true, diagnostics: [] });
  write(root, 'nested/new.txt', 'later user edit');
  const invalid = verifyPlan(plan); assert.equal(invalid.ok, false); assert.deepEqual(invalid.diagnostics.map(item => item.path), ['nested/new.txt']);
  const refusedState = snapshot(root);
  assert.throws(() => rollbackMigration({ root, journal: result.journal! }), /user work changed/);
  assert.deepEqual(snapshot(root), refusedState, 'refused rollback preserves every payload and journal byte');
  write(root, 'nested/new.txt', 'new content'); assert.equal(rollbackMigration({ root, journal: result.journal! }).state, 'rolled-back');
  assert.deepEqual(read(root, 'binary.bin'), original); assert.equal(read(root, 'remove.txt')!.toString(), 'remove me'); assert.equal(read(root, 'old.txt')!.toString(), 'move me');
  assert.equal(read(root, 'renamed.txt'), null); assert.equal(fs.existsSync(path.join(root, 'nested')), false);
  assert.throws(() => resumeMigration({ root, journal: result.journal! }), /rolled back/);
});

test('partial recovery protects untouched inspected inputs as well as planned destinations', () => {
  const root = rootFixture(); write(root, 'context.txt', 'original context');
  const plan = fixturePlan(root, [{ kind: 'create', path: 'a.txt', value: 'a' }, { kind: 'create', path: 'b.txt', value: 'b' }], ['context.txt']);
  const journal = '.stavel/journals/partial.json'; assert.throws(() => applyPlan(plan, { journalPath: journal, failAfterOperations: 1 }), /earlier writes may remain/);
  assert.equal(read(root, 'a.txt')!.toString(), 'a'); assert.equal(read(root, 'b.txt'), null);
  write(root, 'context.txt', 'user changed context'); const journalBefore = read(root, journal);
  const refusedState = snapshot(root);
  for (const recover of [resumeMigration, rollbackMigration]) {
    assert.throws(() => recover({ root, journal }), /unrelated source changed/);
    assert.deepEqual(snapshot(root), refusedState);
    assert.equal(read(root, 'b.txt'), null);
  }
  assert.deepEqual(read(root, journal), journalBefore); assert.equal(read(root, 'context.txt')!.toString(), 'user changed context'); assert.equal(read(root, 'a.txt')!.toString(), 'a');
  write(root, 'context.txt', 'original context'); assert.equal(resumeMigration({ root, journal }).state, 'complete'); assert.equal(read(root, 'b.txt')!.toString(), 'b');
});

test('recovery refuses a tampered snapshot before changing target content', () => {
  const root = rootFixture(); const plan = fixturePlan(root, [{ kind: 'create', path: 'result.txt', value: 'expected' }]);
  const result = applyPlan(plan); const journal = JSON.parse(read(root, result.journal!)!.toString()); journal.files[0].after = Buffer.from('injected').toString('base64'); write(root, result.journal!, JSON.stringify(journal));
  const refusedState = snapshot(root);
  assert.throws(() => resumeMigration({ root, journal: result.journal! }), /snapshot checksum mismatch/);
  assert.deepEqual(snapshot(root), refusedState);
  assert.equal(read(root, 'result.txt')!.toString(), 'expected');
});

test('journal collision refuses before writes and rollback retains later unplanned files in created directories', () => {
  const root = rootFixture(); write(root, 'journal.json', 'unrelated existing journal marker');
  const plan = fixturePlan(root, [{ kind: 'create', path: 'nested/result.txt', value: 'result' }]);
  assert.throws(() => applyPlan(plan, { journalPath: 'journal.json' }), /journal already exists/); assert.equal(fs.existsSync(path.join(root, 'nested')), false); assert.equal(read(root, 'journal.json')!.toString(), 'unrelated existing journal marker');
  const result = applyPlan(plan); write(root, 'nested/user.txt', 'retain me'); rollbackMigration({ root, journal: result.journal! });
  assert.equal(read(root, 'nested/result.txt'), null); assert.equal(read(root, 'nested/user.txt')!.toString(), 'retain me');
});

test('integrity validation rejects re-signed invalid operations and stale plans before mutation', () => {
  const root = rootFixture(); const plan = fixturePlan(root, [{ kind: 'create', path: 'result.txt', value: 'result' }]);
  for (const alter of [(p: MigrationPlan) => { p.operations[0].path = '../outside.txt'; }, (p: MigrationPlan) => { p.operations[0].afterHash = '0'.repeat(64); }, (p: MigrationPlan) => { p.inputs['result.txt'] = 'invalid digest'; }]) {
    const invalid = structuredClone(plan); alter(invalid); invalid.id = planDigest(invalid); assert.throws(() => validatePlan(invalid)); assert.equal(fs.existsSync(root), false);
  }
  write(root, 'result.txt', 'new user content'); assert.throws(() => preflightPlan(plan), /stale plan/); assert.equal(read(root, 'result.txt')!.toString(), 'new user content');
});

test('initial journal creation failure releases only its own lock before any planned record is written', t => {
  const root = rootFixture(); t.after(() => fs.rmSync(path.dirname(root), { recursive: true, force: true }));
  write(root, 'source.txt', 'original'); const plan = fixturePlan(root, [{ kind: 'update', path: 'source.txt', value: 'planned' }]);
  const rename = fs.renameSync;
  fs.renameSync = ((...args: Parameters<typeof fs.renameSync>) => { if (String(args[1]).endsWith(`${plan.id}.json`)) throw new Error('fixture initial journal rename denied'); return rename(...args); }) as typeof fs.renameSync;
  try { assert.throws(() => applyPlan(plan), /no planned records|before any planned/); } finally { fs.renameSync = rename; }
  assert.equal(read(root, 'source.txt')!.toString(), 'original'); assert.equal(read(root, '.stavel/runtime/writer.lock'), null);
  assert.equal(read(root, `.stavel/journals/${plan.id}.json`), null);
});

test('source edits between preflight and snapshot are not adopted as authorized before bytes', t => {
  const root = rootFixture(); t.after(() => fs.rmSync(path.dirname(root), { recursive: true, force: true }));
  write(root, 'source.txt', 'original'); const plan = fixturePlan(root, [{ kind: 'update', path: 'source.txt', value: 'planned' }]);
  const readFile = fs.readFileSync; let reads = 0;
  fs.readFileSync = ((...args: Parameters<typeof fs.readFileSync>) => { if (String(args[0]) === path.join(root, 'source.txt') && ++reads === 5) write(root, 'source.txt', 'intervening user edit'); return readFile(...args); }) as typeof fs.readFileSync;
  try { assert.throws(() => applyPlan(plan), /stale|source.*changed|snapshot.*changed/); } finally { fs.readFileSync = readFile; }
  assert.equal(read(root, 'source.txt')!.toString(), 'intervening user edit'); assert.equal(read(root, '.stavel/runtime/writer.lock'), null);
});

test('source edits while the temporary result is written refuse before rename and remain recoverable refusals', t => {
  const root = rootFixture(); t.after(() => fs.rmSync(path.dirname(root), { recursive: true, force: true }));
  write(root, 'source.txt', 'original'); const plan = fixturePlan(root, [{ kind: 'update', path: 'source.txt', value: 'planned' }]);
  const writeFile = fs.writeFileSync;
  fs.writeFileSync = ((...args: Parameters<typeof fs.writeFileSync>) => { const result = writeFile(...args); if (String(args[0]).startsWith(path.join(root, 'source.txt') + '.stavel-')) writeFile(path.join(root, 'source.txt'), 'user edit during temporary write'); return result; }) as typeof fs.writeFileSync;
  try { assert.throws(() => applyPlan(plan), /changed|earlier writes/); } finally { fs.writeFileSync = writeFile; }
  assert.equal(read(root, 'source.txt')!.toString(), 'user edit during temporary write');
  assert.throws(() => resumeMigration({ root, journal: `.stavel/journals/${plan.id}.json` }), /user work changed/);
});

test('tampered journal cannot remove an unrelated empty directory during rollback', t => {
  const root = rootFixture(); t.after(() => fs.rmSync(path.dirname(root), { recursive: true, force: true }));
  const plan = fixturePlan(root, [{ kind: 'create', path: 'nested/result.txt', value: 'result' }]); const result = applyPlan(plan);
  fs.mkdirSync(path.join(root, 'unrelated-user-directory')); const journal = JSON.parse(read(root, result.journal!)!.toString()); journal.createdDirectories.push('unrelated-user-directory'); write(root, result.journal!, JSON.stringify(journal));
  const before = snapshot(root); assert.throws(() => rollbackMigration({ root, journal: result.journal! }), /directory|journal/);
  assert.equal(fs.existsSync(path.join(root, 'unrelated-user-directory')), true); assert.deepEqual(snapshot(root), before);
});

test('recovery refuses matching locks from a live different writer and concurrent recovery guards', t => {
  const root = rootFixture(); t.after(() => fs.rmSync(path.dirname(root), { recursive: true, force: true }));
  const plan = fixturePlan(root, [{ kind: 'create', path: 'result.txt', value: 'result' }]); const result = applyPlan(plan);
  const child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { stdio: 'ignore' }); t.after(() => child.kill()); assert.ok(child.pid);
  write(root, '.stavel/runtime/writer.lock', JSON.stringify({ schemaVersion: 1, kind: 'migration', planId: plan.id, journal: result.journal, pid: child.pid }));
  const before = snapshot(root); assert.throws(() => resumeMigration({ root, journal: result.journal! }), /live|running|cannot prove/); assert.deepEqual(snapshot(root), before);
  fs.unlinkSync(path.join(root, '.stavel/runtime/writer.lock')); write(root, '.stavel/runtime/migration-recovery.lock', 'another recovery'); const concurrent = snapshot(root);
  assert.throws(() => rollbackMigration({ root, journal: result.journal! }), /recovery.*lock|concurrent/); assert.deepEqual(snapshot(root), concurrent);
});

test('journal destination cannot coincide with a planned file or its ancestor', t => {
  const root = rootFixture(); t.after(() => fs.rmSync(path.dirname(root), { recursive: true, force: true }));
  const plan = fixturePlan(root, [{ kind: 'create', path: 'nested/result.txt', value: 'result' }]);
  for (const journalPath of ['nested/result.txt', 'nested']) { assert.throws(() => applyPlan(plan, { journalPath }), /journal.*collid|journal.*planned/); assert.equal(fs.existsSync(root), false); }
});

test('older supported journals restore bytes while retaining directories whose original existence is unproven', t => {
  const root = rootFixture(); t.after(() => fs.rmSync(path.dirname(root), { recursive: true, force: true }));
  const plan = fixturePlan(root, [{ kind: 'create', path: 'nested/result.txt', value: 'result' }]); const result = applyPlan(plan);
  const oldJournal = JSON.parse(read(root, result.journal!)!.toString()); delete oldJournal.directoryInputs; delete oldJournal.snapshotSha256;
  write(root, result.journal!, JSON.stringify(oldJournal)); assert.equal(rollbackMigration({ root, journal: result.journal! }).state, 'rolled-back');
  assert.equal(read(root, 'nested/result.txt'), null); assert.equal(fs.existsSync(path.join(root, 'nested')), true);
});
