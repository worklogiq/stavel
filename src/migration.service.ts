import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { FileTransition, MigrationJournal, MigrationPlan } from './framework.types.js';
import { assertNoLinks, contained, digest, fileBytes, fileHash, jsonText, readJson, Refused, relativeName, targetRoot, validateDestinations } from './filesystem.service.js';
import { validatePlan } from './planning.service.js';
import { loadManifest } from './decisions.service.js';

const writerLockName = '.stavel/runtime/writer.lock';
const recoveryLockName = '.stavel/runtime/migration-recovery.lock';
type Journal = MigrationJournal & { directoryInputs?: Record<string, boolean>; snapshotSha256?: string };
function writerStopped(pid: unknown): void {
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) throw new Refused('uncertain writer identity; cannot prove writer stopped');
  if (pid === process.pid) return; // Explicit synchronous recovery after this caller observed a failure.
  try { process.kill(pid, 0); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ESRCH') return; throw new Refused(`cannot prove writer stopped: ${(error as Error).message}`); }
  throw new Refused('matching migration writer is still running; concurrent recovery refused');
}
function migrationLock(root: string, plan: MigrationPlan, journal: string, recovering = false): void {
  const name = contained(root, writerLockName);
  fs.mkdirSync(path.dirname(name), { recursive: true });
  if (fs.existsSync(name)) {
    if (recovering) {
      const lock = readJson<{ kind?: string; planId?: string; journal?: string; pid?: number }>(name);
      if (lock.kind === 'migration' && lock.planId === plan.id && lock.journal === journal) { writerStopped(lock.pid); return; }
    }
    throw new Refused('another writer or uncertain writer lock exists; inspect and use explicit recovery');
  }
  fs.writeFileSync(name, jsonText({ schemaVersion: 1, kind: 'migration', planId: plan.id, journal, pid: process.pid }), { flag: 'wx' });
}
function releaseMigrationLock(root: string, plan: MigrationPlan, journal: string): void {
  const name = contained(root, writerLockName);
  const lock = readJson<{ kind?: string; planId?: string; journal?: string }>(name);
  if (lock.kind !== 'migration' || lock.planId !== plan.id || lock.journal !== journal) throw new Refused('writer lock changed; explicit recovery required');
  fs.unlinkSync(name);
}

export function preflightPlan(plan: MigrationPlan): void {
  validatePlan(plan);
  const root = targetRoot(plan.root);
  loadManifest(root);
  for (const [name, expected] of Object.entries(plan.inputs)) {
    if (fileHash(root, name) !== expected) throw new Refused(`stale plan; source changed since inspection: ${name}`);
  }
  const sources = new Set(plan.operations.filter(operation => operation.kind === 'move').map(operation => operation.from!));
  const existingCases = new Map(Object.keys(plan.inputs).map(name => [name.normalize('NFC').toLowerCase(), name]));
  for (const operation of plan.operations) {
    contained(root, operation.path);
    for (const name of [operation.path, ...(operation.from ? [operation.from] : [])]) if (name.toLowerCase() === '.stavel/runtime' || name.toLowerCase().startsWith('.stavel/runtime/')) throw new Refused(`planned files must be separate from runtime writer/recovery state: ${name}`);
    if (!(operation.path in plan.inputs)) throw new Refused(`plan is missing destination precondition: ${operation.path}`);
    const existingName = existingCases.get(operation.path.normalize('NFC').toLowerCase());
    if (existingName && existingName !== operation.path && !sources.has(existingName)) throw new Refused(`case-insensitive destination conflicts with existing file: ${operation.path} and ${existingName}`);
    const source = operation.kind === 'move' ? operation.from! : operation.path;
    if (fileHash(root, source) !== operation.beforeHash) throw new Refused(`operation source precondition changed: ${source}`);
    if (operation.kind === 'create' && fileBytes(root, operation.path)) throw new Refused(`create destination already exists: ${operation.path}`);
  }
}

const filesystemKey = (name: string): string => process.platform === 'win32' ? name.normalize('NFC').toLowerCase() : name;
function plannedAfter(plan: MigrationPlan): Array<{ path: string; content: string | null; beforePath?: string }> {
  const after = new Map<string, { path: string; content: string | null; beforePath?: string }>();
  for (const operation of plan.operations) if (operation.kind === 'move') after.set(filesystemKey(operation.from!), { path: operation.from!, content: null });
  for (const operation of plan.operations) {
    const caseOnly = operation.kind === 'move' && operation.from !== operation.path && filesystemKey(operation.from!) === filesystemKey(operation.path);
    after.set(filesystemKey(operation.path), { path: operation.path, content: operation.kind === 'delete' ? null : operation.content!, ...(caseOnly ? { beforePath: operation.from } : {}) });
  }
  return [...after.values()].sort((a, b) => a.path.localeCompare(b.path, 'en'));
}
function transitionsFor(plan: MigrationPlan): FileTransition[] {
  return plannedAfter(plan).map(item => {
    const source = item.beforePath ?? item.path, bytes = fileBytes(plan.root, source);
    if ((bytes === null ? null : digest(bytes)) !== plan.inputs[source]) throw new Refused(`snapshot source changed after preflight: ${source}`);
    return { path: item.path, ...(item.beforePath ? { beforePath: item.beforePath } : {}), before: bytes?.toString('base64') ?? null, after: item.content };
  });
}
const encodedHash = (content: string | null): string | null => content === null ? null : digest(Buffer.from(content, 'base64'));
function exactFilename(root: string, name: string): boolean {
  const absolute = contained(root, name);
  return fs.existsSync(path.dirname(absolute)) && fs.readdirSync(path.dirname(absolute)).includes(path.basename(absolute));
}

function saveJournal(root: string, journalName: string, journal: MigrationJournal): void {
  const destination = contained(root, journalName);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp-${crypto.randomBytes(6).toString('hex')}`;
  assertNoLinks(temporary);
  try { fs.writeFileSync(temporary, jsonText(journal), { flag: 'wx' }); fs.renameSync(temporary, destination); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

function snapshotHash(journal: Journal): string { return digest(jsonText({ planId: journal.plan.id, files: journal.files, directoryInputs: journal.directoryInputs })); }
function directoryInputs(root: string, files: FileTransition[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const file of files) for (const filename of [file.path, ...(file.beforePath ? [file.beforePath] : [])]) {
    let directory = path.posix.dirname(filename);
    while (directory !== '.') { result[directory] = fs.existsSync(contained(root, directory)); directory = path.posix.dirname(directory); }
  }
  return result;
}
function validateJournalLocation(plan: MigrationPlan, journalName: string): void {
  const key = (name: string) => name.normalize('NFC').toLowerCase();
  const journal = key(journalName);
  if (journal === key(writerLockName) || journal === key(recoveryLockName)) throw new Refused('journal collides with a runtime writer/recovery lock');
  const planned = plan.operations.flatMap(operation => [operation.path, ...(operation.from ? [operation.from] : [])]);
  for (const filename of planned) {
    const name = key(filename);
    if (journal === name || journal.startsWith(`${name}/`) || name.startsWith(`${journal}/`)) throw new Refused(`journal collides with a planned file: ${filename}`);
  }
}

function readJournal(rootValue: string, name: string): { root: string; name: string; journal: Journal } {
  const root = targetRoot(rootValue);
  loadManifest(root);
  const relative = path.isAbsolute(name) ? path.relative(root, name).replace(/\\/g, '/') : relativeName(name);
  const journal = readJson<Journal>(contained(root, relative));
  if (!journal || journal.schemaVersion !== 1 || !Array.isArray(journal.files) || !Array.isArray(journal.completedPaths) || !Array.isArray(journal.createdDirectories)) throw new Refused('unsupported migration journal');
  validatePlan(journal.plan);
  validateJournalLocation(journal.plan, relative);
  if (!['applying', 'complete', 'rolling-back', 'rolled-back'].includes(journal.state)) throw new Refused('invalid migration journal state');
  if (targetRoot(journal.plan.root) !== root) throw new Refused('journal belongs to a different repository');
  if (new Set(journal.files.map(file => file.path)).size !== journal.files.length) throw new Refused('duplicate journal file path');
  // On case-sensitive filesystems a case-only move has a source tombstone and
  // a separate destination. Validate each filesystem state independently: the
  // source and destination do not coexist in either completed state.
  validateDestinations(journal.files.filter(file => file.before !== null).map(file => file.beforePath ?? file.path));
  validateDestinations(journal.files.filter(file => file.after !== null).map(file => file.path));
  const expectedAfter = new Map(plannedAfter(journal.plan).map(item => [item.path, { hash: encodedHash(item.content), beforePath: item.beforePath }]));
  if (expectedAfter.size !== journal.files.length) throw new Refused('journal file set does not match the migration plan');
  for (const file of journal.files) {
    contained(root, file.path);
    const expected = expectedAfter.get(file.path);
    if (!expected || expected.beforePath !== file.beforePath || encodedHash(file.after) !== expected.hash || encodedHash(file.before) !== journal.plan.inputs[file.beforePath ?? file.path]) throw new Refused(`journal snapshot checksum mismatch: ${file.path}`);
  }
  const ancestors = new Set<string>();
  for (const file of journal.files) for (const filename of [file.path, ...(file.beforePath ? [file.beforePath] : [])]) {
    let directory = path.posix.dirname(filename);
    while (directory !== '.') { ancestors.add(directory); directory = path.posix.dirname(directory); }
  }
  if ((journal.directoryInputs === undefined) !== (journal.snapshotSha256 === undefined)) throw new Refused('incomplete migration journal directory snapshot');
  if (journal.directoryInputs !== undefined) {
    if (!journal.directoryInputs || typeof journal.directoryInputs !== 'object' || Array.isArray(journal.directoryInputs) || Object.keys(journal.directoryInputs).length !== ancestors.size || Object.entries(journal.directoryInputs).some(([directory, existed]) => !ancestors.has(directory) || typeof existed !== 'boolean') || snapshotHash(journal) !== journal.snapshotSha256) throw new Refused('migration journal directory/snapshot checksum mismatch');
  }
  if (new Set(journal.createdDirectories).size !== journal.createdDirectories.length) throw new Refused('duplicate created directory in migration journal');
  for (const directory of journal.createdDirectories) {
    contained(root, directory);
    if (!ancestors.has(directory) || journal.directoryInputs?.[directory] === true) throw new Refused(`journal created directory is not an originally missing planned ancestor: ${directory}`);
  }
  if (journal.completedPaths.some(name => !journal.files.some(file => file.path === name))) throw new Refused('journal completed path does not belong to planned transitions');
  return { root, name: relative, journal };
}

function preflightJournal(root: string, journal: MigrationJournal): void {
  for (const file of journal.files) {
    const current = fileHash(root, file.path);
    if (current !== encodedHash(file.before) && current !== encodedHash(file.after)) throw new Refused(`user work changed after migration; recovery refuses to overwrite: ${file.path}`);
  }
  const touched = new Set(journal.files.flatMap(file => [file.path, ...(file.beforePath ? [file.beforePath] : [])]));
  for (const [name, hash] of Object.entries(journal.plan.inputs)) {
    if (!touched.has(name) && fileHash(root, name) !== hash) throw new Refused(`unrelated source changed after planning; review before recovery: ${name}`);
  }
}

function ensureDirectories(root: string, filename: string, journal: MigrationJournal): void {
  const pieces = filename.split('/');
  let directory = '';
  for (const piece of pieces.slice(0, -1)) {
    directory = directory ? `${directory}/${piece}` : piece;
    const absolute = contained(root, directory);
    if (!fs.existsSync(absolute)) { fs.mkdirSync(absolute); journal.createdDirectories.push(directory); }
  }
}

function applyTransition(root: string, file: FileTransition, target: 'before' | 'after', journal: MigrationJournal, journalName: string): void {
  const desired = file[target];
  const writtenName = target === 'before' ? file.beforePath ?? file.path : file.path;
  if (fileHash(root, file.path) === encodedHash(desired) && (desired === null || exactFilename(root, writtenName))) return;
  const current = fileHash(root, file.path);
  if (current !== encodedHash(file.before) && current !== encodedHash(file.after)) throw new Refused(`file changed during recovery/apply: ${file.path}`);
  const destination = contained(root, writtenName);
  if (desired === null) {
    if (fs.existsSync(destination)) fs.unlinkSync(destination);
  } else {
    ensureDirectories(root, writtenName, journal);
    saveJournal(root, journalName, journal);
    const temporaryName = `${writtenName}.stavel-${crypto.randomBytes(6).toString('hex')}.tmp`;
    const temporary = contained(root, temporaryName);
    fs.writeFileSync(temporary, Buffer.from(desired, 'base64'), { flag: 'wx' });
    try {
      assertNoLinks(destination);
      if (fileHash(root, file.path) !== current) throw new Refused(`file changed during temporary write; refusing overwrite: ${file.path}`);
      fs.renameSync(temporary, destination);
    }
    catch (error) { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); throw error; }
  }
  journal.completedPaths.push(file.path);
  saveJournal(root, journalName, journal);
}

export function applyPlan(plan: MigrationPlan, options: { dryRun?: boolean; journalPath?: string; failAfterOperations?: number } = {}): { ok: true; changed: number; journal?: string } {
  preflightPlan(plan);
  const root = targetRoot(plan.root);
  const journalName = relativeName(options.journalPath ?? `.stavel/journals/${plan.id}.json`);
  validateJournalLocation(plan, journalName);
  if (options.dryRun || plan.operations.length === 0) return { ok: true, changed: plan.operations.length };
  const journalFile = contained(root, journalName);
  if (fs.existsSync(journalFile)) throw new Refused(`migration journal already exists; use resume or rollback: ${journalName}`);
  migrationLock(root, plan, journalName);
  let journal: Journal;
  try {
    preflightPlan(plan);
    const files = transitionsFor(plan);
    journal = { schemaVersion: 1, plan, state: 'applying', files, completedPaths: [], createdDirectories: [], directoryInputs: directoryInputs(root, files) };
    journal.snapshotSha256 = snapshotHash(journal);
    fs.mkdirSync(root, { recursive: true }); saveJournal(root, journalName, journal);
  } catch (error) {
    if (fs.existsSync(journalFile)) throw new Refused(`initial migration setup stopped; no planned records written; inspect the retained journal and writer lock: ${(error as Error).message}`);
    releaseMigrationLock(root, plan, journalName);
    throw new Refused(`migration setup stopped before any planned records were written: ${(error as Error).message}`);
  }
  try {
    let completed = 0;
    for (const file of journal.files) {
      if (options.failAfterOperations !== undefined && completed >= options.failAfterOperations) throw new Error('injected filesystem failure');
      applyTransition(root, file, 'after', journal, journalName); completed += 1;
    }
    journal.state = 'complete'; saveJournal(root, journalName, journal);
  } catch (error) { throw new Refused(`apply stopped; earlier writes may remain. Resume or rollback using ${journalName}: ${(error as Error).message}`); }
  releaseMigrationLock(root, plan, journalName);
  return { ok: true, changed: plan.operations.length, journal: journalName };
}

function recover(options: { root: string; journal: string }, direction: 'before' | 'after'): { ok: true; state: string } {
  const { root, name, journal } = readJournal(options.root, options.journal);
  if (direction === 'after' && ['rolled-back', 'rolling-back'].includes(journal.state)) throw new Refused('this journal is rolling back or already rolled back; finish rollback or create a fresh plan');
  preflightJournal(root, journal);
  const beforeJournalHash = fileHash(root, name);
  const guard = contained(root, recoveryLockName);
  fs.mkdirSync(path.dirname(guard), { recursive: true });
  try { fs.writeFileSync(guard, jsonText({ pid: process.pid, planId: journal.plan.id, journal: name }), { flag: 'wx' }); }
  catch (error) { throw new Refused(`cannot acquire exclusive migration recovery lock; never steal uncertain recovery state: ${(error as Error).message}`); }
  let previousLock: Buffer | null = null;
  let acquired = false, changed = false;
  try {
    previousLock = fileBytes(root, writerLockName);
    migrationLock(root, journal.plan, name, true); acquired = true;
    if (fileHash(root, name) !== beforeJournalHash) throw new Refused('migration journal changed while acquiring recovery lock');
    readJournal(root, name); preflightJournal(root, journal);
    if (direction === 'before') { changed = true; journal.state = 'rolling-back'; saveJournal(root, name, journal); }
    for (const file of direction === 'before' ? [...journal.files].reverse() : journal.files) { changed = true; applyTransition(root, file, direction, journal, name); }
    if (direction === 'before') for (const directory of [...journal.createdDirectories].reverse()) {
      // Older journals lack an independently checksummed directory snapshot.
      // Their bytes can be restored, but uncertain empty directories are retained.
      if (journal.directoryInputs?.[directory] !== false) continue;
      const absolute = contained(root, directory);
      if (fs.existsSync(absolute) && fs.readdirSync(absolute).length === 0) fs.rmdirSync(absolute);
    }
    journal.state = direction === 'before' ? 'rolled-back' : 'complete'; saveJournal(root, name, journal);
    releaseMigrationLock(root, journal.plan, name); acquired = false;
    return { ok: true, state: journal.state };
  } catch (error) {
    if (acquired && !changed && previousLock === null) releaseMigrationLock(root, journal.plan, name);
    throw new Refused(`migration recovery refused/stopped; ${changed ? `partial changes may remain; journal retained at ${name}` : 'no planned records written'}: ${(error as Error).message}`);
  } finally { fs.unlinkSync(guard); }
}
export function resumeMigration(options: { root: string; journal: string }): { ok: true; state: string } { return recover(options, 'after'); }
export function rollbackMigration(options: { root: string; journal: string }): { ok: true; state: string } { return recover(options, 'before'); }

export function verifyPlan(plan: MigrationPlan): { ok: boolean; diagnostics: Array<{ ruleId: string; severity: 'error'; path: string; message: string }> } {
  validatePlan(plan);
  const diagnostics: Array<{ ruleId: string; severity: 'error'; path: string; message: string }> = [];
  for (const item of plannedAfter(plan)) if (fileHash(plan.root, item.path) !== encodedHash(item.content) || (item.content !== null && !exactFilename(plan.root, item.path))) diagnostics.push({ ruleId: 'migration-verification', severity: 'error', path: item.path, message: 'current file does not match the planned result' });
  return { ok: diagnostics.length === 0, diagnostics };
}
