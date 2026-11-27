import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { contained, digest, fileBytes, fileHash, jsonText, readJson, relativeName, targetRoot, validateDestinations, walkFiles, writeExclusive } from './filesystem.service.js';

const fixture = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-filesystem-contract-'));
function write(root: string, name: string, content: string): void {
  const destination = path.join(root, name); fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, content);
}

test('relative names normalize Windows separators while refusing escapes and ambiguous segments', () => {
  assert.equal(relativeName('docs\\feature\\design.md'), 'docs/feature/design.md');
  assert.equal(relativeName('docs/a file.md'), 'docs/a file.md');
  for (const name of ['', '.', '../escape', 'docs/../escape', './docs/file', 'docs//file', 'docs/', '/outside', '\\outside', 'C:\\outside', 'C:relative', '\\\\server\\share', 'bad\0name', 'bad\nname', 'bad\rname']) {
    assert.throws(() => relativeName(name), /contained relative path/, JSON.stringify(name));
  }
});

test('target roots canonicalize aliases without creating missing targets and reject files', () => {
  const root = fixture(); fs.mkdirSync(path.join(root, 'child'));
  assert.equal(targetRoot(path.join(root, 'child', '..')), fs.realpathSync.native(root));
  const missing = path.join(root, 'not-created', 'nested');
  assert.equal(targetRoot(missing), path.resolve(missing)); assert.equal(fs.existsSync(missing), false);
  write(root, 'plain.txt', 'original');
  assert.throws(() => targetRoot(path.join(root, 'plain.txt')), /not a directory/);
  assert.equal(fs.readFileSync(path.join(root, 'plain.txt'), 'utf8'), 'original');
});

test('contained reads distinguish missing files, directories and parent-file collisions', () => {
  const root = fixture(); write(root, 'parent.txt', 'unchanged'); fs.mkdirSync(path.join(root, 'directory'));
  assert.equal(contained(root, 'new/child.txt'), path.join(root, 'new/child.txt'));
  assert.equal(fileBytes(root, 'missing.txt'), null); assert.equal(fileHash(root, 'missing.txt'), null);
  assert.throws(() => fileBytes(root, 'directory'), /expected a file/);
  assert.throws(() => contained(root, 'parent.txt/child'), /parent is a file/);
  assert.equal(fs.existsSync(path.join(root, 'new')), false);
  assert.equal(fs.readFileSync(path.join(root, 'parent.txt'), 'utf8'), 'unchanged');
});

test('symlink and Windows junction traversal cannot read or write through a target boundary', () => {
  const scratch = fixture(); const root = path.join(scratch, 'target'); const outside = path.join(scratch, 'outside');
  fs.mkdirSync(root); fs.mkdirSync(outside); write(outside, 'original.txt', 'retain outside bytes');
  fs.symlinkSync(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => contained(root, 'linked/original.txt'), /symlink or junction/);
  assert.throws(() => targetRoot(path.join(root, 'linked')), /symlink or junction/);
  assert.throws(() => writeExclusive(root, 'linked/new.txt', Buffer.from('must not appear')), /symlink or junction/);
  assert.throws(() => walkFiles(root), /symlink or junction/);
  assert.equal(fs.readFileSync(path.join(outside, 'original.txt'), 'utf8'), 'retain outside bytes');
  assert.equal(fs.existsSync(path.join(outside, 'new.txt')), false);
});

test('destination validation catches duplicates, Unicode/case aliases and ancestor files', () => {
  assert.doesNotThrow(() => validateDestinations(['docs/a.md', 'docs/b.md', 'other/child.md']));
  for (const paths of [
    ['docs/a.md', 'docs/a.md'], ['docs/Topic.md', 'docs/topic.md'],
    ['docs/caf\u00e9.md', 'docs/cafe\u0301.md'], ['docs', 'docs/child.md'], ['docs/child.md', 'docs'],
  ]) assert.throws(() => validateDestinations(paths), /collision|duplicate|parent/);
});

test('exclusive creation makes contained parents once and never overwrites an existing file', () => {
  const root = fixture(); writeExclusive(root, 'nested/result.bin', Buffer.from([0, 1, 255]));
  assert.deepEqual(fileBytes(root, 'nested/result.bin'), Buffer.from([0, 1, 255]));
  assert.throws(() => writeExclusive(root, 'nested/result.bin', Buffer.from('replacement')), /EEXIST/);
  assert.deepEqual(fs.readFileSync(path.join(root, 'nested/result.bin')), Buffer.from([0, 1, 255]));
});

test('canonical JSON preserves array order, sorts nested object keys and hashes exact bytes', () => {
  const text = jsonText({ z: { b: 2, a: 1 }, a: [{ z: 3, a: 4 }, 5] });
  assert.equal(text, '{\n  "a": [\n    {\n      "a": 4,\n      "z": 3\n    },\n    5\n  ],\n  "z": {\n    "a": 1,\n    "b": 2\n  }\n}\n');
  assert.equal(digest('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const root = fixture(); write(root, 'bytes.txt', 'abc'); assert.equal(fileHash(root, 'bytes.txt'), digest('abc'));
  write(root, 'bom.json', '\uFEFF{"ok":true}'); assert.deepEqual(readJson(path.join(root, 'bom.json')), { ok: true });
  write(root, 'invalid.json', '{'); assert.throws(() => readJson(path.join(root, 'invalid.json')), /cannot read JSON.*invalid\.json/);
  assert.throws(() => readJson(path.join(root, 'absent.json')), /cannot read JSON.*absent\.json/);
});

test('walking excludes generated/dependency state and handles hidden directories explicitly', () => {
  const root = fixture();
  for (const name of ['z.txt', 'a/child.txt', '.root-settings', '.github/workflows/ci.yml', '.private/settings.json', '.git/config', 'node_modules/vendor.txt', 'dist/bundle.js', '.cache/local.txt', '.generated/output.txt', 'coverage/result.txt']) write(root, name, name);
  assert.deepEqual(walkFiles(root), ['.github/workflows/ci.yml', '.root-settings', 'a/child.txt', 'z.txt']);
  assert.deepEqual(walkFiles(root, '', { includeHidden: true }), ['.github/workflows/ci.yml', '.private/settings.json', '.root-settings', 'a/child.txt', 'z.txt']);
  assert.deepEqual(walkFiles(path.join(root, 'absent')), []);
  assert.throws(() => walkFiles(root, 'z.txt'), /expected directory/);
});
