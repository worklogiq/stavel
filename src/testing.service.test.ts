import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { effectiveTestingLayout, inspectTestLayout, recommendTestingLayout, resolveTestingConfig } from './testing.service.js';
import { getQuestions } from './decisions.service.js';
import type { AnswersDocument } from './framework.types.js';

test('placement defaults preserve repository intent without selecting an observed convention', () => {
  assert.deepEqual(resolveTestingConfig(undefined), { placement: 'follow-repository', fallback: 'language-convention' });
  const base = { placement: 'colocated', fallback: 'ask', patterns: ['**/*.test.ts'] } as const;
  const result = resolveTestingConfig({ ...base, patterns: [...base.patterns] }, 'profile-default');
  assert.deepEqual(result, base);
  result.patterns!.push('**/*.spec.ts');
  assert.deepEqual(base.patterns, ['**/*.test.ts']);
});

test('separate placement and scoped custom layouts have explicit contained locations', () => {
  assert.deepEqual(resolveTestingConfig(undefined, 'separate'), { placement: 'separate', fallback: 'language-convention', roots: ['tests'] });
  assert.deepEqual(resolveTestingConfig(undefined, 'colocated', { scopes: { 'apps/backend': { placement: 'custom', roots: ['src/test'], patterns: ['**/*Test.java'] } } }), {
    placement: 'colocated', fallback: 'language-convention', scopes: { 'apps/backend': { placement: 'custom', roots: ['src/test'], patterns: ['**/*Test.java'] } },
  });
});

test('custom layouts require roots and patterns and reject unsafe or unknown fields', () => {
  assert.throws(() => resolveTestingConfig(undefined, 'custom'), /needs roots and patterns/);
  for (const details of [{ roots: ['../outside'], patterns: ['**/*.ts'] }, { roots: ['test'], patterns: ['C:/outside'] }, { roots: ['test'], patterns: [] }, { scopes: { '../outside': { placement: 'colocated' } } }, { force: true }]) {
    assert.throws(() => resolveTestingConfig(undefined, 'custom', details));
  }
  assert.throws(() => resolveTestingConfig(undefined, 'invented'), /unsupported/);
  assert.deepEqual(resolveTestingConfig(undefined, 'custom', { roots: ['checks'], patterns: ['**/*.spec.ts'] }), { placement: 'custom', fallback: 'language-convention', roots: ['checks'], patterns: ['**/*.spec.ts'] });
});

test('invalid baseline and scoped policies cannot silently become defaults', () => {
  assert.throws(() => resolveTestingConfig({ placement: 'colocated', fallback: 'unknown' } as never), /fallback/);
  assert.throws(() => resolveTestingConfig({ placement: 'custom', fallback: 'ask' }), /needs roots and patterns/);
  assert.throws(() => resolveTestingConfig(undefined, 'colocated', { scopes: { src: { placement: 'colocated', force: true } } }), /unsupported/);
});

test('test layout inspection distinguishes paired siblings, separate roots and uncertain files', () => {
  assert.deepEqual(inspectTestLayout(['src\\item.ts', 'src\\item.test.ts', 'tests/item.test.ts', 'orphan.spec.ts', 'package.json', 'package.test.ts']), {
    layout: 'mixed', colocated: ['package.test.ts', 'src/item.test.ts'], separate: ['tests/item.test.ts'], unclassified: ['orphan.spec.ts'],
  });
});

test('inspection recognizes Python and Go siblings without asserting a community preference', () => {
  assert.deepEqual(inspectTestLayout(['math.py', 'test_math.py', 'sum.go', 'sum_test.go']), { layout: 'colocated', colocated: ['sum_test.go', 'test_math.py'], separate: [], unclassified: [] });
  assert.equal(inspectTestLayout(['src/main.ts']).layout, 'none');
  assert.equal(inspectTestLayout(['orphan.test.ts']).layout, 'unknown');
});

test('effective layout selects the most specific containing scope and preserves relative custom paths', () => {
  const config = { schemaVersion: 1, testing: { placement: 'colocated' as const, fallback: 'ask' as const, scopes: { apps: { placement: 'separate' as const, roots: ['checks'] }, 'apps/web': { placement: 'custom' as const, roots: ['verification'], patterns: ['**/*.spec.ts'] } } } };
  const before = structuredClone(config); const result = effectiveTestingLayout(config, 'apps\\web\\src');
  assert.deepEqual(result, { source: 'scope', scope: 'apps/web', fallback: 'ask', layout: { placement: 'custom', roots: ['verification'], patterns: ['**/*.spec.ts'] } });
  result.layout.roots!.push('other'); assert.deepEqual(config, before);
  assert.equal(effectiveTestingLayout(config, 'apps/webview').scope, 'apps'); assert.equal(effectiveTestingLayout(config, 'modules').source, 'repository'); assert.equal(effectiveTestingLayout(config).layout.placement, 'colocated');
  assert.throws(() => effectiveTestingLayout(config, '../outside'), /contained relative path/);
  assert.throws(() => resolveTestingConfig(undefined, 'colocated', { scopes: { 'apps/web': { placement: 'colocated' }, 'apps\\web': { placement: 'separate' } } }), /conflicting normalized/);
});

test('repository evidence precedes declared language guidance and remains a proposal', () => {
  const result = recommendTestingLayout({ files: ['src/item.ts', 'src/item.test.ts'], language: 'typescript', recommendations: [{ language: 'typescript', layout: { placement: 'separate', roots: ['checks'] }, source: 'fixture:toolchain-guidance' }] });
  assert.equal(result.state, 'proposal'); assert.equal(result.source, 'repository-evidence'); assert.equal(result.layout!.placement, 'colocated'); assert.equal(result.needsAlignment, true); assert.deepEqual(result.sources, ['src/item.test.ts']);
});

test('mixed or uncertain observations ask while an explicit layout remains authoritative', () => {
  const files = ['src/item.ts', 'src/item.test.ts', 'tests/other.test.ts'];
  assert.equal(recommendTestingLayout({ files, language: 'typescript' }).state, 'input-required');
  assert.equal(recommendTestingLayout({ files: ['orphan.test.ts'] }).state, 'input-required');
  const configured = recommendTestingLayout({ config: { placement: 'colocated', fallback: 'ask' }, files }); assert.equal(configured.state, 'configured'); assert.equal(configured.layout!.placement, 'colocated'); assert.equal(configured.needsAlignment, false); assert.equal(configured.evidence.layout, 'mixed');
});

test('unsupported language consensus and undeclared toolchains ask without inventing a default', () => {
  assert.equal(recommendTestingLayout({ language: 'python', files: [] }).state, 'input-required');
  const recommendations = [{ language: 'java', toolchain: 'maven', layout: { placement: 'custom' as const, roots: ['src/test/java'], patterns: ['**/*Test.java'] }, source: 'fixture:primary-toolchain-layout' }];
  assert.equal(recommendTestingLayout({ language: 'java', recommendations }).state, 'input-required');
  const selected = recommendTestingLayout({ language: 'java', toolchain: 'maven', recommendations }); assert.equal(selected.state, 'proposal'); assert.equal(selected.source, 'declared-guidance'); assert.deepEqual(selected.layout, recommendations[0].layout); assert.deepEqual(selected.sources, ['fixture:primary-toolchain-layout']); assert.equal(selected.needsAlignment, true);
  assert.equal(recommendTestingLayout({ config: { placement: 'follow-repository', fallback: 'ask' }, language: 'java', toolchain: 'maven', recommendations }).state, 'input-required');
});

test('conflicting or unsourced recommendations cannot become an accepted language policy', () => {
  const declarations = [{ language: 'go', layout: { placement: 'colocated' as const }, source: 'fixture:one' }, { language: 'go', layout: { placement: 'separate' as const }, source: 'fixture:two' }];
  const result = recommendTestingLayout({ language: 'go', recommendations: declarations }); assert.equal(result.state, 'input-required'); assert.match(result.reason, /conflicts/);
  assert.throws(() => recommendTestingLayout({ language: 'go', recommendations: [{ ...declarations[0], source: '' }] }), /explicit language and source/);
  assert.throws(() => recommendTestingLayout({ language: 'go', recommendations: [{ ...declarations[0], layout: { placement: 'follow-repository' } }] }), /concrete layout/);
});

test('scoped recommendation evidence excludes unrelated project tests and does not mutate inputs', () => {
  const files = ['backend/item.ts', 'backend/item.test.ts', 'apps/web/main.ts']; const before = [...files];
  const result = recommendTestingLayout({ scope: 'apps/web', files }); assert.equal(result.evidence.layout, 'none'); assert.equal(result.state, 'input-required'); assert.deepEqual(files, before);
});

const answers = (placement: string): AnswersDocument => ({ useDefaults: true, alignment: { confirmed: true, instruction: 'Fixture user accepts the presented conventions and selected test placement.' }, answers: {
  'project.name': 'Placement fixture', 'project.intent': 'Verify aligned test policy without moving user files.',
  'source.languages': ['typescript'], 'verification.commands': 'npm test', 'observability.expectations': 'Local fixture diagnostics.',
  'verification.testPlacement': placement,
} });

test('questions expose placement and require the actual custom detail before initialization', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-test-questions-'));
  const unaligned = getQuestions({ root, sourceRoot: process.cwd() });
  assert.ok(unaligned.questions.some(question => question.id === 'verification.testPlacement'));
  const custom = answers('custom');
  assert.ok(getQuestions({ root, sourceRoot: process.cwd(), answers: custom }).unresolved.includes('verification.testLayout'));
  custom.answers['verification.testLayout'] = { roots: ['checks'], patterns: ['**/*.test.ts'] };
  assert.deepEqual(getQuestions({ root, sourceRoot: process.cwd(), answers: custom }).unresolved, []);
  assert.deepEqual(fs.readdirSync(root), []);
});

test('actual init previews then persists selected placement without relocating existing tests', () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-test-init-'));
  const root = path.join(scratch, 'target'); fs.mkdirSync(path.join(root, 'tests'), { recursive: true });
  const original = '// Existing user test remains here until a separate migration is authorized.\n';
  fs.writeFileSync(path.join(root, 'tests/existing.test.ts'), original);
  const input = path.join(scratch, 'answers.json'); fs.writeFileSync(input, JSON.stringify(answers('colocated')));
  const args = [path.resolve('dist/stavel.cli.cjs'), 'init', '--target', root, '--name', 'Placement fixture', '--track', 'existing', '--answers', input, '--source-root', process.cwd()];
  const run = (extra: string[]) => spawnSync(process.execPath, [...args, ...extra], { encoding: 'utf8' });
  const preview = run(['--dry-run']); assert.equal(preview.status, 0, preview.stderr);
  assert.deepEqual(fs.readdirSync(root), ['tests']);
  const applied = run([]); assert.equal(applied.status, 0, applied.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'stavel.config.json'), 'utf8')).testing, { placement: 'colocated', fallback: 'language-convention' });
  assert.equal(fs.readFileSync(path.join(root, 'tests/existing.test.ts'), 'utf8'), original);
});

test('accepted profile defaults preserve explicit configuration when the optional placement answer is absent', () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-test-profile-'));
  const root = path.join(scratch, 'target');
  const record = answers('profile-default'); delete record.answers['verification.testPlacement'];
  const testing = { placement: 'custom', fallback: 'ask', roots: ['checks'], patterns: ['**/*.spec.ts'] } as const;
  record.configuration = { schemaVersion: 1, testing: { ...testing, roots: [...testing.roots], patterns: [...testing.patterns] } };
  const input = path.join(scratch, 'answers.json'); fs.writeFileSync(input, JSON.stringify(record));
  const child = spawnSync(process.execPath, [path.resolve('dist/stavel.cli.cjs'), 'init', '--target', root, '--name', 'Placement fixture', '--track', 'existing', '--answers', input, '--source-root', process.cwd()], { encoding: 'utf8' });
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'stavel.config.json'), 'utf8')).testing, testing);
});
