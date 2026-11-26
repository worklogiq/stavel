import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { FileTransition, MigrationJournal, MigrationPlan } from './framework.types.js';
import { assertNoLinks, contained, digest, fileBytes, fileHash, jsonText, readJson, Refused, relativeName, targetRoot, validateDestinations } from './filesystem.service.js';
import { validatePlan } from './planning.service.js';
import { loadManifest } from './decisions.service.js';

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
  return plannedAfter(plan).map(item => ({ path: item.path, ...(item.beforePath ? { beforePath: item.beforePath } : {}), before: fileBytes(plan.root, item.beforePath ?? item.path)?.toString('base64') ?? null, after: item.content }));
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
  fs.writeFileSync(temporary, jsonText(journal), { flag: 'wx' });
  fs.renameSync(temporary, destination);
}

function readJournal(rootValue: string, name: string): { root: string; name: string; journal: MigrationJournal } {
  const root = targetRoot(rootValue);
  loadManifest(root);
  const relative = path.isAbsolute(name) ? path.relative(root, name).replace(/\\/g, '/') : relativeName(name);
  const journal = readJson<MigrationJournal>(contained(root, relative));
  if (!journal || journal.schemaVersion !== 1 || !Array.isArray(journal.files) || !Array.isArray(journal.completedPaths) || !Array.isArray(journal.createdDirectories)) throw new Refused('unsupported migration journal');
  validatePlan(journal.plan);
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
  for (const directory of journal.createdDirectories) contained(root, directory);
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
    try { assertNoLinks(destination); fs.renameSync(temporary, destination); }
    catch (error) { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); throw error; }
  }
  journal.completedPaths.push(file.path);
  saveJournal(root, journalName, journal);
}

export function applyPlan(plan: MigrationPlan, options: { dryRun?: boolean; journalPath?: string; failAfterOperations?: number } = {}): { ok: true; changed: number; journal?: string } {
  preflightPlan(plan);
  if (options.dryRun || plan.operations.length === 0) return { ok: true, changed: plan.operations.length };
  const root = targetRoot(plan.root);
  const journalName = relativeName(options.journalPath ?? `.stavel/journals/${plan.id}.json`);
  const journalFile = contained(root, journalName);
  if (fs.existsSync(journalFile)) throw new Refused(`migration journal already exists; use resume or rollback: ${journalName}`);
  const journal: MigrationJournal = { schemaVersion: 1, plan, state: 'applying', files: transitionsFor(plan), completedPaths: [], createdDirectories: [] };
  fs.mkdirSync(root, { recursive: true });
  saveJournal(root, journalName, journal);
  try {
    let completed = 0;
    for (const file of journal.files) {
      if (options.failAfterOperations !== undefined && completed >= options.failAfterOperations) throw new Error('injected filesystem failure');
      applyTransition(root, file, 'after', journal, journalName); completed += 1;
    }
    journal.state = 'complete'; saveJournal(root, journalName, journal);
  } catch (error) { throw new Refused(`apply stopped; earlier writes may remain. Resume or rollback using ${journalName}: ${(error as Error).message}`); }
  return { ok: true, changed: plan.operations.length, journal: journalName };
}

export function resumeMigration(options: { root: string; journal: string }): { ok: true; state: string } {
  const { root, name, journal } = readJournal(options.root, options.journal);
  if (journal.state === 'rolled-back' || journal.state === 'rolling-back') throw new Refused('this journal is rolling back or already rolled back; finish rollback or create a fresh plan');
  preflightJournal(root, journal);
  for (const file of journal.files) applyTransition(root, file, 'after', journal, name);
  journal.state = 'complete'; saveJournal(root, name, journal);
  return { ok: true, state: journal.state };
}

export function rollbackMigration(options: { root: string; journal: string }): { ok: true; state: string } {
  const { root, name, journal } = readJournal(options.root, options.journal);
  preflightJournal(root, journal);
  journal.state = 'rolling-back'; saveJournal(root, name, journal);
  for (const file of [...journal.files].reverse()) applyTransition(root, file, 'before', journal, name);
  for (const directory of [...new Set(journal.createdDirectories)].reverse()) {
    const absolute = contained(root, directory);
    if (fs.existsSync(absolute) && fs.readdirSync(absolute).length === 0) fs.rmdirSync(absolute);
  }
  journal.state = 'rolled-back'; saveJournal(root, name, journal);
  return { ok: true, state: journal.state };
}

export function verifyPlan(plan: MigrationPlan): { ok: boolean; diagnostics: Array<{ ruleId: string; severity: 'error'; path: string; message: string }> } {
  validatePlan(plan);
  const diagnostics: Array<{ ruleId: string; severity: 'error'; path: string; message: string }> = [];
  for (const item of plannedAfter(plan)) if (fileHash(plan.root, item.path) !== encodedHash(item.content) || (item.content !== null && !exactFilename(plan.root, item.path))) diagnostics.push({ ruleId: 'migration-verification', severity: 'error', path: item.path, message: 'current file does not match the planned result' });
  return { ok: diagnostics.length === 0, diagnostics };
}
