import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectFiles, diagnostic, globToRegExp, inside, matchesAny, posix, stringList } from './shared.service.js';

function fixture(t: TestContext): string {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-rule-shared-unit-')));
  assert.equal(path.dirname(root), fs.realpathSync(os.tmpdir()));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function write(root: string, name: string): void {
  const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, 'fixture\n');
}

test('glob matching distinguishes recursive paths, one segment, one character and literal punctuation', () => {
  const recursive = globToRegExp('**/*.ts');
  assert.equal(recursive.test('entry.ts'), true); assert.equal(recursive.test('src/nested/entry.ts'), true);
  assert.equal(recursive.test('entry.tsx'), false);
  const oneSegment = globToRegExp('src/*.ts');
  assert.equal(oneSegment.test('src/entry.ts'), true); assert.equal(oneSegment.test('src/nested/entry.ts'), false);
  const oneCharacter = globToRegExp('a?.ts');
  assert.equal(oneCharacter.test('ab.ts'), true); assert.equal(oneCharacter.test('a.ts'), false); assert.equal(oneCharacter.test('abc.ts'), false);
  const literal = globToRegExp('src/[spec]+.test.ts');
  assert.equal(literal.test('src/[spec]+.test.ts'), true); assert.equal(literal.test('src/specc.test.ts'), false);
});

test('path separators normalize for rule patterns and empty candidate patterns do not match', () => {
  assert.equal(posix('src\\nested\\file.ts'), 'src/nested/file.ts');
  assert.equal(matchesAny('src\\nested\\file.ts', ['other/**', 'src\\**\\*.ts']), true);
  assert.equal(matchesAny('src/file.tsx', ['src/**/*.ts']), false);
  assert.equal(matchesAny('src/file.ts', []), false);
});

test('containment accepts the repository and canonical children but rejects sibling prefixes and parent escapes', t => {
  const root = fixture(t);
  assert.equal(inside(root, root), true);
  assert.equal(inside(root, path.join(root, 'src', '..', 'file.ts')), true);
  assert.equal(inside(root, `${root}-other`), false);
  assert.equal(inside(root, path.dirname(root)), false);
});

test('collection returns unique sorted real files and respects excluded or generated subtrees', t => {
  const root = fixture(t);
  for (const name of ['src/z.ts', 'src/nested/a.ts', 'src/ignored/skip.ts', 'node_modules/dependency.ts', '.cache/temporary.ts', 'dist/generated.ts', 'vendor/library.ts']) write(root, name);
  const result = collectFiles(root, ['.', 'src', 'src/z.ts', 'missing'], ['src/ignored/**']);
  assert.deepEqual(result, [path.join(root, 'src/nested/a.ts'), path.join(root, 'src/z.ts')].sort());
  assert.deepEqual(collectFiles(root, ['src/z.ts']), [path.join(root, 'src/z.ts')]);
});

test('explicit scan roots outside the repository refuse without reading or modifying an outside file', t => {
  const root = fixture(t); const outside = fixture(t); write(outside, 'private.ts');
  const before = fs.readFileSync(path.join(outside, 'private.ts'));
  assert.throws(() => collectFiles(root, [outside]), /leaves repository/);
  assert.throws(() => collectFiles(root, ['..']), /leaves repository/);
  assert.deepEqual(fs.readFileSync(path.join(outside, 'private.ts')), before);
});

test('collection refuses symlink or junction traversal even when the target is inside the repository', t => {
  const root = fixture(t); write(root, 'actual/file.ts');
  try { fs.symlinkSync(path.join(root, 'actual'), path.join(root, 'alias'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) {
    if (['EPERM', 'EACCES', 'ENOSYS'].includes(String((error as NodeJS.ErrnoException).code))) { t.skip('Host does not permit symlink/junction fixture creation.'); return; }
    throw error;
  }
  assert.throws(() => collectFiles(root, ['.']), /symlink or junction/);
  assert.throws(() => collectFiles(root, ['alias']), /symlink or junction/);
  assert.equal(fs.readFileSync(path.join(root, 'actual/file.ts'), 'utf8'), 'fixture\n');
});

test('diagnostics preserve rule, message, located line and configured severity with normalized paths', () => {
  assert.deepEqual(diagnostic('contract', 'src\\file.ts', 'Expected failure'), { ruleId: 'contract', path: 'src/file.ts', message: 'Expected failure', severity: 'error' });
  assert.deepEqual(diagnostic('contract', 'src/file.ts', 'Review warning', { severity: 'warning' }, 7), { ruleId: 'contract', path: 'src/file.ts', message: 'Review warning', severity: 'warning', line: 7 });
});

test('string-list normalization retains explicit empty lists and refuses partial mixed arrays', () => {
  const fallback = ['default'];
  assert.deepEqual(stringList(['src', 'docs'], fallback), ['src', 'docs']);
  assert.deepEqual(stringList([], fallback), []);
  for (const input of [undefined, null, 'src', { roots: ['src'] }, ['src', 1]]) assert.deepEqual(stringList(input, fallback), ['default']);
  assert.deepEqual(stringList(false), []);
});
