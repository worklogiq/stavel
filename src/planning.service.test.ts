import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createPlan, configurationForAnswers } from './planning.service.js';
import { applyPlan } from './migration.service.js';
import { checkRepository } from './checking.service.js';
import { getQuestions } from './decisions.service.js';
import type { AnswersDocument } from './framework.types.js';

const sourceRoot = process.cwd();
const templateName = 'docs/internal/templates/design/story.template.md';
const fixture = () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-stories-'));
  const root = path.join(directory, 'target');
  const answers: AnswersDocument = { useDefaults: true, alignment: { confirmed: true, instruction: 'Fixture owner accepts default framework settings and story policy.' }, answers: {
    'project.name': 'Story fixture', 'project.intent': 'Verify story policy and editable bootstrap templates.',
    'source.languages': ['typescript'], 'verification.commands': 'npm test',
  } };
  return { directory, root, answers };
};
const plan = (f: ReturnType<typeof fixture>, frameworkPath?: string) => createPlan({ root: f.root, sourceRoot, name: 'Story fixture', track: 'existing', answers: f.answers, frameworkPath });

test('configuration normalization keeps documentation, source and scoped conventions independent without changing the baseline', () => {
  const f = fixture();
  const base = { schemaVersion: 1, documentation: { naming: { shape: 'typed' as const, identifierCase: 'kebab' as const } }, source: { languages: ['javascript'], naming: { identifierCase: 'kebab' } } };
  const before = structuredClone(base);
  const scopes = { 'services/importer': { language: 'python', naming: { identifierCase: 'snake' }, roles: ['module'], rules: { 'file-length': false } } };
  const result = configurationForAnswers(base, f.answers, { 'documentation.naming.style': 'camelCase', 'source.naming.identifierCase': 'pascal', 'source.languages': ['ts', 'py', 'ts'], 'source.scopes': scopes });
  assert.equal(result.documentation!.naming!.shape, 'plain'); assert.equal(result.documentation!.naming!.identifierCase, 'camel');
  assert.equal((result.source!.naming as { identifierCase: string }).identifierCase, 'pascal');
  assert.deepEqual(result.source!.languages, ['typescript', 'python']); assert.deepEqual(result.source!.scopes, scopes); assert.deepEqual(base, before);
});

test('invalid source scope and language declarations refuse configuration normalization', () => {
  const f = fixture();
  for (const scopes of [{ '../outside': { language: 'python' } }, { src: { language: 'not a language' } }, { src: { roles: [] } }, { src: { naming: { identifierCase: 'invented' } } }, { src: { unexpected: true } }]) {
    assert.throws(() => configurationForAnswers({ schemaVersion: 1 }, f.answers, { 'source.scopes': scopes }));
  }
  assert.throws(() => configurationForAnswers({ schemaVersion: 1 }, f.answers, { 'source.languages': ['typescript', 'not a language'] }), /explicit language IDs/);
});

test('mapped taxonomy and selected optional tooling require their concrete configuration rather than implicit defaults', () => {
  const f = fixture();
  assert.throws(() => configurationForAnswers({ schemaVersion: 1 }, f.answers, { 'documentation.taxonomy': 'mapped' }), /roots and ownership/);
  assert.throws(() => configurationForAnswers({ schemaVersion: 1 }, f.answers, { 'tooling.modules': 'custom' }), /configuration.rules/);
  assert.throws(() => configurationForAnswers({ schemaVersion: 1 }, f.answers, { 'tooling.modules': 'markdown-and-javascript-typescript' }), /explicit .* configuration/);
  f.answers.configuration = { schemaVersion: 1, documentation: { roots: ['engineering'] }, rules: { 'file-length': { enabled: true, maxLines: 300 } } };
  f.answers.ownership = { requirements: 'engineering/requirements.requirements.md' };
  const result = configurationForAnswers({ schemaVersion: 1 }, f.answers, { 'documentation.taxonomy': 'mapped', 'tooling.modules': 'custom' });
  assert.deepEqual(result.documentation!.roots, ['engineering']); assert.deepEqual(result.rules!['file-length'], { enabled: true, maxLines: 300 });
});

test('init dry-run creates no files; actual init seeds an editable template and ask policy', () => {
  const f = fixture(); const input = path.join(f.directory, 'answers.json'); fs.writeFileSync(input, JSON.stringify(f.answers));
  const args = [path.resolve('dist/stavel.cli.cjs'), 'init', '--target', f.root, '--name', 'Story fixture', '--answers', input, '--source-root', sourceRoot];
  const preview = spawnSync(process.execPath, [...args, '--dry-run'], { encoding: 'utf8' }); assert.equal(preview.status, 0, preview.stderr); assert.equal(fs.existsSync(f.root), false);
  const applied = spawnSync(process.execPath, args, { encoding: 'utf8' }); assert.equal(applied.status, 0, applied.stderr);
  assert.ok(fs.readFileSync(path.join(f.root, templateName), 'utf8').includes('## Acceptance'));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.root, 'stavel.config.json'), 'utf8')).workflow.stories, { generation: 'ask', template: templateName });
  assert.equal(Object.hasOwn(JSON.parse(fs.readFileSync(path.join(f.root, '.stavel.json'), 'utf8')).files, templateName), false, 'repository template is not an immutable upstream asset');
});

test('always and never suppress the PLAN question without suppressing template bootstrap', () => {
  for (const generation of ['always', 'never']) {
    const f = fixture(); f.answers.answers['workflow.stories.generation'] = generation; applyPlan(plan(f));
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, 'stavel.config.json'), 'utf8')).workflow.stories.generation, generation);
    assert.equal(fs.existsSync(path.join(f.root, templateName)), true);
  }
});

test('repeated init retains template edits byte-for-byte and a stale template plan refuses', () => {
  const f = fixture(); applyPlan(plan(f)); const target = path.join(f.root, templateName);
  const customized = fs.readFileSync(target, 'utf8') + '\n## Team-specific review\nRequire the recorded consumer review.\n'; fs.writeFileSync(target, customized);
  const repeat = plan(f); assert.equal(repeat.operations.length, 0); applyPlan(repeat); assert.equal(fs.readFileSync(target, 'utf8'), customized);
  const stale = plan(f); fs.appendFileSync(target, '\nAnother user edit.\n'); assert.throws(() => applyPlan(stale), /changed|stale/i);
  assert.equal(fs.readFileSync(target, 'utf8'), customized + '\nAnother user edit.\n');
  fs.mkdirSync(path.join(f.root, 'src')); fs.writeFileSync(path.join(f.root, 'src/database.ts'), 'export const schema = 1;\n');
  assert.ok(getQuestions({ root: f.root, sourceRoot, answers: f.answers }).unresolved.includes('data.ownership'), 'real application persistence still triggers its question');
});

test('configured existing template overrides the default and validates outside the template directory', async () => {
  const f = fixture(); fs.mkdirSync(path.join(f.root, 'team'), { recursive: true });
  const custom = fs.readFileSync(path.join(sourceRoot, templateName), 'utf8') + '\n## Local story extension\nTeam-specific content.\n';
  fs.writeFileSync(path.join(f.root, 'team/story.template.md'), custom);
  f.answers.answers['workflow.stories.template'] = 'team\\story.template.md'; applyPlan(plan(f));
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, 'stavel.config.json'), 'utf8')).workflow.stories.template, 'team/story.template.md');
  assert.equal(fs.readFileSync(path.join(f.root, 'team/story.template.md'), 'utf8'), custom);
  assert.equal(fs.existsSync(path.join(f.root, templateName)), true);
  const result = await checkRepository({ root: f.root, sourceRoot }); assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
  fs.unlinkSync(path.join(f.root, 'team/story.template.md'));
  assert.ok((await checkRepository({ root: f.root, sourceRoot })).diagnostics.some(item => item.ruleId === 'story-template'));
  fs.writeFileSync(path.join(f.root, 'team/story.template.md'), custom.replace('kind: template', 'kind: story'));
  assert.ok((await checkRepository({ root: f.root, sourceRoot })).diagnostics.some(item => item.ruleId === 'story-template'));
});

test('default template reference follows mapped framework home and chosen document naming', () => {
  const f = fixture(); f.answers.answers['documentation.naming.style'] = 'camelCase'; applyPlan(plan(f, 'engineering/stavel'));
  const settings = JSON.parse(fs.readFileSync(path.join(f.root, 'stavel.config.json'), 'utf8')).workflow.stories;
  assert.equal(settings.template, 'engineering/stavel/templates/design/story.md'); assert.equal(fs.existsSync(path.join(f.root, settings.template)), true);
});

test('invalid policy, missing custom template and unsafe template paths refuse without target writes', () => {
  for (const value of ['../escape.md', 'missing.template.md']) {
    const f = fixture(); f.answers.answers['workflow.stories.template'] = value; assert.throws(() => plan(f)); assert.equal(fs.existsSync(f.root), false);
  }
  const f = fixture(); f.answers.answers['workflow.stories.generation'] = 'invented'; assert.throws(() => plan(f)); assert.equal(fs.existsSync(f.root), false);
});

test('accepted profile story settings survive default selections; init does not ask the PLAN output question', () => {
  const f = fixture();
  const base = { schemaVersion: 1, workflow: { stories: { generation: 'never' as const, template: 'team/story.template.md' } } };
  assert.deepEqual(configurationForAnswers(base, f.answers, { 'workflow.stories.generation': 'profile-default' }).workflow?.stories, base.workflow.stories);
  assert.equal(getQuestions({ root: f.root, sourceRoot, answers: f.answers }).resolved['workflow.stories.generation'], 'profile-default');
});
