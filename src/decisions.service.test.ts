import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectRepository, getQuestions } from './decisions.service.js';

const fixture = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-inspection-'));
const snapshot = (root: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const walk = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { result[`${path.relative(root, file).replace(/\\/g, '/')}/`] = 'directory'; walk(file); }
      else result[path.relative(root, file).replace(/\\/g, '/')] = fs.readFileSync(file).toString('base64');
    }
  };
  walk(root); return result;
};
const packageNotes = (notes: string[]): string[] => notes.filter(note => note.startsWith('package.json:'));
const cli = (): string => process.env.STAVEL_FND01_CLI ?? path.resolve('dist/stavel.cli.cjs');

test('inspection distinguishes missing or valid-empty package metadata from malformed JSON without writes', () => {
  for (const content of [undefined, '{}', '{"scripts": {}}', '{"scripts": {"test": "do-not-execute-this-command"}}']) {
    const root = fixture();
    if (content !== undefined) fs.writeFileSync(path.join(root, 'package.json'), content);
    const before = snapshot(root); const result = inspectRepository({ root });
    assert.deepEqual(packageNotes(result.notes), []);
    assert.deepEqual(result.packageScripts, content?.includes('do-not-execute') ? { test: 'do-not-execute-this-command' } : {});
    assert.deepEqual(snapshot(root), before);
  }
  for (const content of ['', '{"scripts":', '{ "scripts": {}, }']) {
    const root = fixture(); fs.writeFileSync(path.join(root, 'package.json'), content); const before = snapshot(root);
    const result = inspectRepository({ root }); const notes = packageNotes(result.notes);
    assert.equal(notes.length, 1, 'malformed package input needs one located finding');
    assert.match(notes[0], /JSON|Unexpected|Expected/);
    assert.deepEqual(result.packageScripts, {});
    assert.deepEqual(snapshot(root), before);
  }
});

test('the built inspect process reports malformed metadata with successful read-only discovery semantics', () => {
  const root = fixture(); const malformed = '{"scripts": {"test": "never-run"}';
  fs.writeFileSync(path.join(root, 'package.json'), malformed); fs.writeFileSync(path.join(root, 'untouched.txt'), 'user-owned bytes\n');
  const before = snapshot(root);
  const child = spawnSync(process.execPath, [cli(), 'inspect', '--target', root], { encoding: 'utf8', cwd: root });
  assert.equal(child.status, 0, child.stderr);
  assert.equal(child.stderr, '');
  const report = JSON.parse(child.stdout);
  assert.equal(report.schemaVersion, 1);
  assert.deepEqual(report.packageScripts, {});
  assert.equal(packageNotes(report.notes).length, 1);
  assert.match(packageNotes(report.notes)[0], /JSON|Unexpected|Expected/);
  assert.deepEqual(snapshot(root), before);
});

test('the question surface retains the located package observation without accepting or executing it', () => {
  const root = fixture(); fs.writeFileSync(path.join(root, 'package.json'), '{'); const before = snapshot(root);
  const result = getQuestions({ root, sourceRoot: process.cwd() });
  assert.equal(packageNotes(result.observations).length, 1);
  assert.ok(result.unresolved.includes('project.intent'));
  assert.deepEqual(snapshot(root), before);
});

test('non-file package input remains an actionable refusal instead of an empty successful package', () => {
  const root = fixture(); fs.mkdirSync(path.join(root, 'package.json')); const before = snapshot(root);
  assert.throws(() => inspectRepository({ root }), /package\.json/);
  const child = spawnSync(process.execPath, [cli(), 'inspect', '--target', root], { encoding: 'utf8', cwd: root });
  assert.equal(child.status, 1);
  assert.match(child.stderr, /package\.json/);
  assert.deepEqual(snapshot(root), before);
});

test('unreadable package input preserves filesystem refusal when permissions are enforceable', { skip: process.platform === 'win32' || process.getuid?.() === 0 }, () => {
  const root = fixture(); const file = path.join(root, 'package.json'); fs.writeFileSync(file, '{}'); fs.chmodSync(file, 0);
  try { assert.throws(() => inspectRepository({ root }), /EACCES|permission/i); }
  finally { fs.chmodSync(file, 0o600); }
});
