import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { checkRepository } from './checking.service.js';
import type { FrameworkConfig } from './framework.types.js';
import { loadArtifactCatalog } from './artifact.service.js';

const sourceRoot = process.cwd();
const entries = { index: 'docs/internal/index.md', constitution: 'docs/internal/process/development-constitution.policy.md', profile: 'docs/internal/dev/project-profile.overview.md' };
const document = (kind: string, body = ''): string => `# Fixture\n\n<!-- mdcomposer:meta\ntitle: Fixture\nkind: ${kind}\nstate: draft\naudience: internal\nowner: fixture-maintainer\nupdated: 2026-11-26\n-->\n\n${body}\n`;
function write(root: string, name: string, contents: string): void { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, contents); }
function snapshot(root: string): Record<string, string> {
  const result: Record<string, string> = {};
  const visit = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name); const relative = path.relative(root, file).replace(/\\/g, '/');
      if (entry.isDirectory()) { result[`${relative}/`] = 'directory'; visit(file); }
      else result[relative] = fs.readFileSync(file).toString('base64');
    }
  }; visit(root); return result;
}
function fixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-checking-'));
  write(root, entries.index, document('overview'));
  write(root, entries.constitution, document('policy'));
  write(root, entries.profile, document('overview'));
  write(root, 'docs/internal/templates/design/story.template.md', document('template', '{{STORY_TITLE}}'));
  write(root, 'AGENTS.md', `[Index](${entries.index})\n[Constitution](${entries.constitution})\n`);
  return root;
}
const config = (): FrameworkConfig => ({ schemaVersion: 1, documentation: { roots: ['docs/internal'], kinds: ['overview', 'policy', 'guide', 'template'] }, rules: { 'docs-impact': false, readme: false } });

test('checking accepts structurally valid uninstalled input without creating adoption state', async () => {
  const root = fixture(); const before = snapshot(root);
  const result = await checkRepository({ root, sourceRoot });
  assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
  assert.deepEqual(result.diagnostics, []);
  assert.deepEqual(result.notes, []);
  assert.deepEqual(snapshot(root), before);
  assert.equal(fs.existsSync(path.join(root, '.stavel.json')), false);
});

test('checking reports missing structure, broken routing, links and canonical placeholders independently', async () => {
  const root = fixture(); fs.unlinkSync(path.join(root, entries.profile));
  write(root, entries.index, document('overview', '[Missing](missing.guide.md)\n{{UNRESOLVED}}'));
  write(root, 'AGENTS.md', '# Root instructions without framework links\n'); const before = snapshot(root);
  const result = await checkRepository({ root, sourceRoot, config: config() });
  assert.equal(result.ok, false);
  const has = (ruleId: string, file: string): boolean => result.diagnostics.some(item => item.ruleId === ruleId && item.path === file);
  assert.ok(has('framework-structure', entries.profile));
  assert.ok(has('framework-routing', 'AGENTS.md'));
  assert.ok(has('markdown-links', entries.index));
  assert.ok(has('framework-tokens', entries.index));
  assert.deepEqual(snapshot(root), before);
});

test('installed file absence is a diagnostic while local amendments remain honest review notes', async () => {
  const root = fixture(); const extra = 'docs/internal/extra.guide.md'; write(root, extra, document('guide'));
  const names = [entries.index, entries.constitution, entries.profile, extra];
  const files = Object.fromEntries(names.map(name => [name, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name))).digest('hex')]));
  write(root, '.stavel.json', JSON.stringify({ product: 'stavel', format: 2, track: 'existing', framework_path: 'docs/internal', entrypoint: 'AGENTS.md', entrypoints: entries, files }));
  fs.appendFileSync(path.join(root, entries.profile), '\nLocal profile amendment.\n');
  fs.appendFileSync(path.join(root, entries.constitution), '\nOther local amendment.\n'); fs.unlinkSync(path.join(root, extra)); const before = snapshot(root);
  const result = await checkRepository({ root, sourceRoot, config: config() });
  assert.equal(result.ok, false);
  assert.ok(result.diagnostics.some(item => item.ruleId === 'framework-manifest' && item.path === extra));
  assert.ok(result.notes.some(note => note.includes('local profile customized') && note.includes(entries.profile)));
  assert.ok(result.notes.some(note => note.includes('locally modified') && note.includes(entries.constitution)));
  assert.ok(result.notes.some(note => note.includes('semantic conformance require review')));
  assert.deepEqual(snapshot(root), before);
});

test('malformed configuration refuses actionably and an explicit configuration remains authoritative', async () => {
  const root = fixture(); write(root, 'stavel.config.json', '{ invalid'); const before = snapshot(root);
  await assert.rejects(checkRepository({ root, sourceRoot }), /JSON.*stavel\.config\.json|stavel\.config\.json.*JSON/);
  const overridden = await checkRepository({ root, sourceRoot, config: config() });
  assert.equal(overridden.ok, true, JSON.stringify(overridden.diagnostics));
  assert.deepEqual(snapshot(root), before);
});

test('manifest identity and declared-home conflicts refuse instead of becoming empty successful checks', async () => {
  const root = fixture(); write(root, '.stavel.json', JSON.stringify({ product: 'other', format: 2 }));
  await assert.rejects(checkRepository({ root, sourceRoot, config: config() }), /manifest/);
  write(root, '.stavel.json', JSON.stringify({ product: 'stavel', format: 2, track: 'existing', framework_path: 'docs/internal', entrypoint: 'AGENTS.md', entrypoints: entries, files: {} })); const before = snapshot(root);
  await assert.rejects(checkRepository({ root, sourceRoot, config: config(), frameworkPath: 'different/home' }), /conflicts/);
  assert.deepEqual(snapshot(root), before);
});

test('an unsafe explicitly configured template cannot escape the repository during checking', async () => {
  const root = fixture(); const before = snapshot(root);
  const unsafe = { ...config(), workflow: { stories: { generation: 'ask' as const, template: '../outside.template.md' } } };
  await assert.rejects(checkRepository({ root, sourceRoot, config: unsafe }), /contained relative path|leaves target/);
  assert.deepEqual(snapshot(root), before);
});
test('declared repository artifact templates outside the standard template directory retain placeholders without becoming canonical-token errors', async () => {
  const root = fixture(), selected = config();
  const artifact = loadArtifactCatalog(sourceRoot).artifacts.find(item => item.id === 'artifact.execution-slice')!;
  const template = 'docs/internal/blueprints/steps.template.md';
  write(root, template, document('template', '{{TITLE}}\n\n[Chosen implementation]({{LINK}})\n'));
  selected.workflow = { definitions: { artifacts: { [artifact.id]: { ...artifact, templateSource: 'repository', template } } } };
  const before = snapshot(root), result = await checkRepository({ root, sourceRoot, config: selected });
  assert.equal(result.ok, true, JSON.stringify(result.diagnostics)); assert.deepEqual(snapshot(root), before);
  write(root, template, document('guide', '{{TITLE}}'));
  const invalid = await checkRepository({ root, sourceRoot, config: selected });
  assert.ok(invalid.diagnostics.some(item => item.ruleId === 'artifact-template' && item.path === template));
});
