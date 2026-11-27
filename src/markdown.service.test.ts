import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { headingSlugs, markdownLinks, rewriteMarkdownLinks } from './markdown.service.js';
import { Refused } from './filesystem.service.js';

function fixture(t: TestContext): string {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-markdown-unit-')));
  assert.equal(path.dirname(root), fs.realpathSync(os.tmpdir()));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function write(root: string, name: string, content: string): void {
  const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content);
}

test('heading fragments reflect Markdown text, duplicates and setext headings rather than fenced examples', () => {
  const content = '# A *formatted* heading!\n\n## Repeat\n## Repeat\n\nSetext title\n------------\n\n```md\n# Not a heading\n```\n';
  assert.deepEqual([...headingSlugs(content)], ['a-formatted-heading', 'repeat', 'repeat-1', 'setext-title']);
});

test('link diagnostics distinguish unresolved references, missing files and missing fragments with source locations', t => {
  const root = fixture(t); write(root, 'target.md', '# Existing heading\n');
  const text = '[missing](absent.md)\n[fragment](target.md#absent)\n[reference][unknown]\n';
  const result = markdownLinks(root, 'source.md', text);
  assert.deepEqual(result.targets, ['target.md']);
  assert.deepEqual(result.diagnostics.map(({ ruleId, path: file, line }) => ({ ruleId, path: file, line })), [
    { ruleId: 'markdown-links', path: 'source.md', line: 1 },
    { ruleId: 'markdown-fragments', path: 'source.md', line: 2 },
    { ruleId: 'markdown-links', path: 'source.md', line: 3 },
  ]);
  assert.match(result.diagnostics[0].message, /missing local link/);
  assert.match(result.diagnostics[1].message, /missing heading fragment/);
  assert.match(result.diagnostics[2].message, /no matching definition/);
});

test('link targets are repository-relative and unique; external, template and code-example destinations are not local reads', t => {
  const root = fixture(t); write(root, 'docs/target.md', '# Target\n'); write(root, 'assets/image.png', 'image fixture');
  const text = '[one](target.md#target)\n[two](target.md?raw=1#target)\n![image](/assets/image.png#arbitrary-image-fragment)\n[remote](https://example.invalid/missing.md)\n[mail](mailto:reader@example.invalid)\n[cdn](//example.invalid/image.png)\n[template]({{OWNER_PATH}})\n`[inline](missing-inline.md)`\n\n```md\n[fence](missing-fenced.md)\n```\n';
  const result = markdownLinks(root, 'docs/source.md', text);
  assert.deepEqual(result.targets, ['docs/target.md', 'assets/image.png']);
  assert.deepEqual(result.diagnostics, []);
});

test('encoded names, escaped punctuation, query strings and duplicate-heading fragments resolve to actual files', t => {
  const root = fixture(t);
  write(root, 'docs/a file.md', '# Repeat\n\n# Repeat\n'); write(root, 'docs/name(1).md', '# Other\n');
  const result = markdownLinks(root, 'docs/source.md', '[space](a%20file.md?view=1#repeat-1)\n[punctuation](name\\(1\\).md#other)\n');
  assert.deepEqual(result.targets, ['docs/a file.md', 'docs/name(1).md']);
  assert.deepEqual(result.diagnostics, []);
});

test('unsafe and malformed encoded local destinations are located refusals rather than false missing-file success', t => {
  const root = fixture(t);
  const result = markdownLinks(root, 'docs/source.md', '[escape](../../outside.md)\n[bad escape](%E0%A4%A.md)\n');
  assert.deepEqual(result.targets, []);
  assert.equal(result.diagnostics.length, 2);
  assert.ok(result.diagnostics.every(item => item.ruleId === 'markdown-links' && item.path === 'docs/source.md'));
  assert.match(result.diagnostics[0].message, /unsafe|leaves repository/);
  assert.match(result.diagnostics[1].message, /invalid encoded Markdown link/);
  assert.throws(() => rewriteMarkdownLinks('[bad](%E0%A4%A.md)', 'docs/source.md', 'docs/source.md', {}), Refused);
});

test('disk-based link validation reads BOM-prefixed content without modifying source bytes', t => {
  const root = fixture(t); const original = '\uFEFF# A title\n\n[self](#a-title)\n'; write(root, 'source.md', original);
  assert.deepEqual(markdownLinks(root, 'source.md'), { targets: ['source.md'], diagnostics: [] });
  assert.equal(fs.readFileSync(path.join(root, 'source.md'), 'utf8'), original);
});

test('rebasing preserves query, fragment, title and code while relocating actual document and image links', () => {
  const original = '[spec](./old.md?raw=1#contract "Design")\n![image](./image.png)\n\n```md\n[example](./old.md)\n```\n';
  const actual = rewriteMarkdownLinks(original, 'docs/source.md', 'docs/new/source.md', { 'docs/old.md': 'docs/new/renamed.md' });
  assert.equal(actual, '[spec](./renamed.md?raw=1#contract "Design")\n![image](../image.png)\n\n```md\n[example](./old.md)\n```\n');
});

test('composition and reference destinations rebase while unchanged mappings preserve byte-exact source', () => {
  const source = '<!-- @include(./shared.md) -->\n[reference][shared]\n\n[shared]: ./shared.md#section\n\n```md\n<!-- @include(./shared.md) -->\n```\n';
  const result = rewriteMarkdownLinks(source, 'docs/source.md', 'docs/new/source.md', { 'docs/shared.md': 'docs/new/contract.md' });
  assert.equal(result, '<!-- @include(./contract.md) -->\n[reference][shared]\n\n[shared]: ./contract.md#section\n\n```md\n<!-- @include(./shared.md) -->\n```\n');
  const untouched = '# Original\r\n\r\n[unaffected](./stable.md)\r\n';
  assert.equal(rewriteMarkdownLinks(untouched, 'docs/source.md', 'docs/source.md', { 'docs/other.md': 'docs/new/other.md' }), untouched);
});
