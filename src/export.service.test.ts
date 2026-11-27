import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { exportSkill } from './export.service.js';

function write(root: string, name: string, contents: string): void { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, contents); }
function snapshot(root: string): Record<string, string> {
  const result: Record<string, string> = {}; if (!fs.existsSync(root)) return result;
  const visit = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name); const name = path.relative(root, file).replace(/\\/g, '/');
      if (entry.isDirectory()) { result[`${name}/`] = 'directory'; visit(file); } else result[name] = fs.readFileSync(file).toString('base64');
    }
  }; visit(root); return result;
}
function fixture(omit: string[] = []): { sourceRoot: string; output: string } {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-export-')); const sourceRoot = path.join(directory, 'source');
  const files: Record<string, string> = {
    'config/assets.catalog.json': JSON.stringify({ product: 'stavel', schemaVersion: 1, assets: [{ source: 'docs/internal/example.guide.md', target: 'docs/internal/example.guide.md', role: 'documentation' }], skill: { source: 'skills/stavel' } }),
    'config/default.profile.json': JSON.stringify({ schemaVersion: 1, id: 'fixture', version: 3 }),
    'config/decisions.catalog.json': JSON.stringify({ schemaVersion: 1, questions: [] }),
    VERSION: '0.1.0\n', LICENSE: 'MIT fixture license\n',
    'skills/stavel/SKILL.md': '---\nname: stavel\ndescription: Fixture skill\n---\n\n# Fixture\n',
    'skills/stavel/agents/openai.yaml': 'display_name: Stavel fixture\n',
    'skills/stavel/scripts/local-helper.cjs': 'module.exports = "fixture helper";\n',
    'dist/stavel.cli.cjs': '// fixture executable bytes\n',
    'dist/mdcomposer.cli.cjs': '// fixture markdown executable bytes\n',
    'dist/runtime.LEGAL.txt': 'Fixture dependency license\n',
    'dist/THIRD-PARTY-NOTICES.txt': 'Fixture notices\n',
    'docs/internal/example.guide.md': '# Portable example\n',
    'docs/internal/dev/framework-origins.overview.md': '# Origins\n\n[Portable guide](../example.guide.md)\n',
    'docs/internal/private.overview.md': 'Private source content must not escape the asset catalog.\n',
  };
  for (const [name, contents] of Object.entries(files)) if (!omit.includes(name) && !(omit.includes('skills/stavel') && name.startsWith('skills/stavel/'))) write(sourceRoot, name, contents);
  return { sourceRoot, output: path.join(directory, 'export') };
}
const expected = [
  'assets/framework/docs/internal/example.guide.md', 'assets/framework/config/default.profile.json', 'assets/framework/config/decisions.catalog.json',
  'assets/framework/config/assets.catalog.json', 'assets/framework/VERSION', 'assets/VERSION', 'LICENSE', 'assets/framework/LICENSE',
  'SKILL.md', 'agents/openai.yaml', 'scripts/local-helper.cjs', 'scripts/stavel.cli.cjs', 'scripts/mdcomposer.cli.cjs',
  'scripts/runtime.LEGAL.txt', 'scripts/THIRD-PARTY-NOTICES.txt', 'ORIGINS.md', 'assets/manifest.json',
].sort();

test('export dry-run reads the complete selection but creates no output or source changes', () => {
  const f = fixture(); const before = snapshot(f.sourceRoot);
  const result = exportSkill({ ...f, dryRun: true });
  assert.deepEqual([...result.created].sort(), expected);
  assert.deepEqual(result.reused, []);
  assert.equal(fs.existsSync(f.output), false);
  assert.deepEqual(snapshot(f.sourceRoot), before);
});

test('export copies only its declared artifact set and produces verifiable integrity/provenance', () => {
  const f = fixture();
  write(f.sourceRoot, 'skills/stavel/SKILL.md', '---\r\nname: stavel\r\ndescription: "Café fixture"\r\n---\r\n\r\n# Fixture\r\n');
  const before = snapshot(f.sourceRoot); const result = exportSkill(f);
  assert.deepEqual([...result.created].sort(), expected);
  assert.deepEqual(Object.keys(snapshot(f.output)).filter(name => !name.endsWith('/')).sort(), expected);
  assert.equal(fs.existsSync(path.join(f.output, 'assets/framework/docs/internal/private.overview.md')), false);
  assert.equal(fs.readFileSync(path.join(f.output, 'scripts/local-helper.cjs'), 'utf8'), 'module.exports = "fixture helper";\n');
  for (const [source, target] of [['skills/stavel/SKILL.md', 'SKILL.md'], ['skills/stavel/agents/openai.yaml', 'agents/openai.yaml'], ['dist/stavel.cli.cjs', 'scripts/stavel.cli.cjs'], ['dist/mdcomposer.cli.cjs', 'scripts/mdcomposer.cli.cjs'], ['LICENSE', 'LICENSE'], ['dist/runtime.LEGAL.txt', 'scripts/runtime.LEGAL.txt']]) {
    assert.ok(fs.readFileSync(path.join(f.output, target)).equals(fs.readFileSync(path.join(f.sourceRoot, source))), target);
  }
  assert.match(fs.readFileSync(path.join(f.output, 'ORIGINS.md'), 'utf8'), /\]\((?:\.\/)?assets\/framework\/docs\/internal\/example\.guide\.md\)/);
  const manifest = JSON.parse(fs.readFileSync(path.join(f.output, 'assets/manifest.json'), 'utf8'));
  assert.equal(manifest.product, 'stavel'); assert.equal(manifest.framework_version, '0.1.0'); assert.equal(manifest.profile_version, 'fixture@3');
  assert.deepEqual(Object.keys(manifest.files).sort(), expected.filter(name => name !== 'assets/manifest.json'));
  for (const [name, hash] of Object.entries(manifest.files)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(f.output, name))).digest('hex'), hash, name);
  const exportedCatalog = JSON.parse(fs.readFileSync(path.join(f.output, 'assets/framework/config/assets.catalog.json'), 'utf8'));
  assert.deepEqual(exportedCatalog.assets, [{ source: 'docs/internal/example.guide.md', target: 'docs/internal/example.guide.md', role: 'documentation' }]);
  assert.deepEqual(snapshot(f.sourceRoot), before);
});

test('identical repeat and repeat preview reuse every byte without rewriting the export', () => {
  const f = fixture(); exportSkill(f); const before = snapshot(f.output);
  for (const dryRun of [true, false]) {
    const result = exportSkill({ ...f, dryRun }); assert.deepEqual(result.created, []); assert.deepEqual([...result.reused].sort(), expected); assert.deepEqual(snapshot(f.output), before);
  }
});

test('a differing early or late output refuses the whole export preflight and preserves unrelated work', () => {
  for (const name of ['assets/framework/docs/internal/example.guide.md', 'assets/manifest.json']) {
    const f = fixture(); write(f.output, name, 'repository-owned output bytes\n'); write(f.output, 'unrelated.txt', 'user work\n'); const before = snapshot(f.output);
    assert.throws(() => exportSkill(f), /no files written.*differing export destination/);
    assert.deepEqual(snapshot(f.output), before);
  }
});

test('missing declared assets, metadata or executables refuse before creating the export', () => {
  for (const name of ['docs/internal/example.guide.md', 'LICENSE', 'skills/stavel', 'skills/stavel/SKILL.md', 'dist/stavel.cli.cjs', 'dist/mdcomposer.cli.cjs', 'config/default.profile.json', 'config/decisions.catalog.json']) {
    const f = fixture([name]); const before = snapshot(f.sourceRoot);
    assert.throws(() => exportSkill(f), /missing|source package|cannot read JSON/, name);
    assert.equal(fs.existsSync(f.output), false, name);
    assert.deepEqual(snapshot(f.sourceRoot), before);
  }
});

test('empty or whitespace-only skill entrypoints refuse without creating a partial export', () => {
  for (const contents of ['', ' \r\n\t', '\uFEFF \n']) {
    const f = fixture(); write(f.sourceRoot, 'skills/stavel/SKILL.md', contents); const before = snapshot(f.sourceRoot);
    assert.throws(() => exportSkill(f), /missing|empty/);
    assert.equal(fs.existsSync(f.output), false);
    assert.deepEqual(snapshot(f.sourceRoot), before);
  }
});

test('an injected write failure reports partial state honestly and preserves actual earlier writes', t => {
  const f = fixture(); const original = fs.writeFileSync;
  const blocked = path.join(f.output, 'scripts/mdcomposer.cli.cjs');
  t.mock.method(fs, 'writeFileSync', (...args: Parameters<typeof fs.writeFileSync>) => {
    if (String(args[0]) === blocked) throw Object.assign(new Error('fixture write denied'), { code: 'EACCES' });
    return original(...args);
  });
  try { assert.throws(() => exportSkill(f), /export stopped.*earlier writes may remain/); }
  finally { t.mock.restoreAll(); }
  assert.equal(fs.readFileSync(path.join(f.output, 'assets/framework/docs/internal/example.guide.md'), 'utf8'), '# Portable example\n');
  assert.equal(fs.existsSync(blocked), false);
  assert.equal(fs.existsSync(path.join(f.output, 'assets/manifest.json')), false);
});
