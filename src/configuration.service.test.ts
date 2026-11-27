import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { CONFIGURATION_ENTRYPOINT, directoryConfigurationFiles, packagedConfigurationDefinitions, resolveRepositoryConfiguration, type ConfigurationAmendment } from './configuration.service.js';
import { configurationForAnswers, createPlan } from './planning.service.js';
import { applyPlan, preflightPlan, resumeMigration, rollbackMigration } from './migration.service.js';
import { checkRepository } from './checking.service.js';
import { getQuestions, inspectRepository } from './decisions.service.js';
import { exportSkill } from './export.service.js';
import { locateDistribution } from './distribution.service.js';
import type { AnswersDocument, FrameworkConfig } from './framework.types.js';

const sourceRoot = process.cwd();
const fixture = () => { const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-config-')); return { directory, root: path.join(directory, 'target') }; };
const sha = (bytes: Buffer | string): string => crypto.createHash('sha256').update(bytes).digest('hex');
function write(root: string, name: string, value: unknown): void { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.isBuffer(value) || typeof value === 'string' ? value : JSON.stringify(value)); }
function snapshot(root: string): Record<string, string> { const result: Record<string, string> = {}; if (!fs.existsSync(root)) return result; const visit = (directory: string): void => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, entry.name); const name = path.relative(root, file).replace(/\\/g, '/'); if (entry.isDirectory()) { result[`${name}/`] = 'directory'; visit(file); } else if (!entry.isSymbolicLink()) result[name] = fs.readFileSync(file).toString('base64'); } }; visit(root); return result; }
const baseline = (): FrameworkConfig => ({ schemaVersion: 1, id: 'fixture', version: 2, documentation: { roots: ['handbook'], naming: { shape: 'typed', identifierCase: 'kebab' } }, source: { languages: ['typescript'] }, testing: { placement: 'colocated', fallback: 'ask', scopes: { importer: { placement: 'separate', roots: ['checks'], patterns: ['**/*_test.py'] } } }, workflow: { stories: { generation: 'never', template: 'team/story.template.md' } } });
function seed(root: string, profile = baseline(), topics: Record<string, unknown> = {}): void {
  const bytes = Buffer.from(JSON.stringify(profile)); write(root, '.stavel-config/baseline.profile.json', bytes);
  const refs: Record<string, string> = {};
  for (const [topic, value] of Object.entries(topics)) { refs[topic] = `${topic}.config.json`; write(root, `.stavel-config/${refs[topic]}`, { schemaVersion: 1, ...value as object }); }
  write(root, CONFIGURATION_ENTRYPOINT, { schemaVersion: 1, baseline: { id: profile.id ?? 'default', version: profile.version ?? 1, path: 'baseline.profile.json', sha256: sha(bytes) }, topics: refs });
}
const amendment = (overrides: Partial<ConfigurationAmendment> = {}): ConfigurationAmendment => ({ id: 'change-design', collection: 'artifacts', target: 'design', action: 'replace', value: { id: 'design', version: 2, title: 'Reviewed design' }, reason: 'User selected team terminology.', source: 'user:fixture:team-design', ...overrides });
const answers = (): AnswersDocument => ({ useDefaults: true, alignment: { confirmed: true, instruction: 'Fixture owner aligns the concrete repository configuration and migration.' }, answers: { 'project.name': 'Config fixture', 'project.intent': 'Preserve accepted configuration through adoption and migration.', 'source.languages': ['typescript'], 'verification.commands': 'npm test' } });
const plan = (root: string, extra: Partial<Parameters<typeof createPlan>[0]> = {}) => createPlan({ root, name: 'Config fixture', track: 'existing', sourceRoot, answers: answers(), ...extra });
function copiedSource(directory: string): string {
  const source = path.join(directory, 'policy-source'); const catalog = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'config/assets.catalog.json'), 'utf8'));
  for (const name of new Set<string>(['config/assets.catalog.json', 'config/decisions.catalog.json', 'config/default.profile.json', 'LICENSE', ...catalog.assets.map((asset: { source: string }) => asset.source)])) write(source, name, fs.readFileSync(path.join(sourceRoot, name)));
  write(source, 'VERSION', '0.2.0'); return source;
}

test('absent configuration is read-only and records both absent authorities', () => {
  const f = fixture(); const input = baseline(); const before = structuredClone(input);
  const result = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: input });
  assert.equal(result.kind, 'absent'); assert.deepEqual(result.config, before); assert.deepEqual(input, before);
  assert.deepEqual(result.inputs, { 'stavel.config.json': null, [CONFIGURATION_ENTRYPOINT]: null });
  assert.equal(result.provenance['testing.placement'].layer, 'baseline'); assert.equal(fs.existsSync(f.root), false);
});

test('design review preference is configurable without silently imposing a PR gate or accepting invalid policies', () => {
  const f = fixture();
  for (const design of ['recommended-for-substantial', 'required-for-substantial', 'none']) {
    const profile = baseline(); profile.workflow = { ...profile.workflow, review: { design, allowTaskException: false } };
    const result = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: profile }); assert.deepEqual(result.config.workflow!.review, { design, allowTaskException: false });
  }
  for (const review of [null, { design: 'always-force-PR' }, { design: 'none', allowTaskException: 'false' }, { design: 'recommended-for-substantial', requirePR: true }]) {
    const profile = baseline(); profile.workflow = { ...profile.workflow, review }; assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: profile }), /configuration object|design review policy|allowTaskException|unsupported/);
  }
  assert.equal(fs.existsSync(f.root), false);
});

test('explicit generic configuration choices agree between questions, effective policy and stored decision provenance', () => {
  const f = fixture(); const record = answers(); record.configuration = { schemaVersion: 1, workflow: { commits: { convention: 'none' } } };
  const questions = getQuestions({ root: f.root, sourceRoot, answers: record }); assert.equal((questions.resolved['configuration.workflow.commits'] as { convention: string }).convention, 'none');
  applyPlan(plan(f.root, { answers: record, configurationHome: 'directory' })); const resolved = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: { schemaVersion: 1 } });
  assert.deepEqual(questions.resolved['configuration.workflow.commits'], resolved.config.workflow!.commits); const decision = resolved.decisions.find(item => item.id === 'configuration.workflow.commits')!;
  assert.equal(decision.origin, 'explicit-answer'); assert.deepEqual(decision.declared, { convention: 'none' }); assert.deepEqual(decision.value, resolved.config.workflow!.commits);
  const inherited = getQuestions({ root: f.root, sourceRoot }); assert.deepEqual(inherited.resolved['configuration.workflow.commits'], resolved.config.workflow!.commits);
  const entry = JSON.parse(fs.readFileSync(path.join(f.root, CONFIGURATION_ENTRYPOINT), 'utf8')); const workflow = JSON.parse(fs.readFileSync(path.join(f.root, '.stavel-config', entry.topics.workflow), 'utf8')); assert.deepEqual(workflow.workflow.commits, { convention: 'none' });
  const invalid = answers(); invalid.configuration = { schemaVersion: 1, workflow: { commits: null } }; assert.throws(() => getQuestions({ root: fixture().root, sourceRoot, answers: invalid }), /configuration object/);
  const thin = configurationForAnswers({ schemaVersion: 1 }, answers(), { 'configuration.workflow.commits': { convention: 'conventional' } }); assert.deepEqual(thin.workflow!.commits, { convention: 'conventional' }, 'a selected catalog choice is materialized when a thin baseline lacks the field');
  const selectedRules: Record<string, unknown> = { 'tooling.modules': 'markdown-and-javascript-typescript' }; for (const id of ['api-client-usage', 'api-error-codes', 'frontend-i18n-copy', 'frontend-error-surfaces']) selectedRules[`configuration.rules.${id}`] = { enabled: false, reason: 'Actual aligned applicability choice.' };
  const configuredTools = configurationForAnswers({ schemaVersion: 1 }, answers(), selectedRules); assert.deepEqual(configuredTools.rules!['api-client-usage'], { enabled: false, reason: 'Actual aligned applicability choice.' });
});

test('an explicit review choice equal to the default stays a standing leaf after a baseline upgrade', () => {
  const f = fixture(); const record = answers(); record.configuration = { schemaVersion: 1, workflow: { review: { design: 'recommended-for-substantial' } } };
  applyPlan(plan(f.root, { answers: record, configurationHome: 'directory' })); const entry = JSON.parse(fs.readFileSync(path.join(f.root, CONFIGURATION_ENTRYPOINT), 'utf8')); const workflowPath = path.join(f.root, '.stavel-config', entry.topics.workflow);
  assert.deepEqual(JSON.parse(fs.readFileSync(workflowPath, 'utf8')).workflow.review, { design: 'recommended-for-substantial' });
  const source = copiedSource(f.directory); const next = JSON.parse(fs.readFileSync(path.join(source, 'config/default.profile.json'), 'utf8')); next.version += 1; next.workflow.review = { design: 'required-for-substantial', allowTaskException: false }; write(source, 'config/default.profile.json', next);
  const later = answers(); const upgradeQuestions = getQuestions({ root: f.root, sourceRoot: source, answers: later, upgradeBaseline: true }); assert.deepEqual(upgradeQuestions.resolved['configuration.workflow.review'], { design: 'recommended-for-substantial', allowTaskException: false });
  const upgrade = plan(f.root, { sourceRoot: source, answers: later, mode: 'migrate', upgradeBaseline: true }); applyPlan(upgrade); const resolved = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next });
  assert.deepEqual(resolved.config.workflow!.review, { design: 'recommended-for-substantial', allowTaskException: false }); assert.deepEqual(resolved.decisions.find(item => item.id === 'configuration.workflow.review')!.value, resolved.config.workflow!.review);
  assert.deepEqual(JSON.parse(fs.readFileSync(workflowPath, 'utf8')).workflow.review, { design: 'recommended-for-substantial' }); assert.equal(plan(f.root, { sourceRoot: source, answers: later, mode: 'migrate' }).operations.length, 0);
});

test('previous equal-baseline declarations survive repeat and upgrade until the actual topic removes them', () => {
  const f = fixture(); const original = baseline(); seed(f.root, original, { workflow: { workflow: { stories: { generation: 'never' } } } });
  const previous = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: original }); const repeated = directoryConfigurationFiles({ config: previous.config, baseline: previous.baselineProfile, previous }); assert.deepEqual(JSON.parse(repeated['.stavel-config/workflow.config.json'].toString()), { schemaVersion: 1, workflow: { stories: { generation: 'never' } } });
  const next = structuredClone(original); next.version = 3; next.workflow!.stories!.generation = 'always'; const upgraded = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next, upgradeBaseline: true }); assert.equal(upgraded.config.workflow!.stories!.generation, 'never');
  for (const [name, bytes] of Object.entries(directoryConfigurationFiles({ config: upgraded.config, baseline: upgraded.baselineProfile, previous: upgraded }))) write(f.root, name, bytes);
  write(f.root, '.stavel-config/workflow.config.json', { schemaVersion: 1 }); const cleared = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next }); assert.equal(cleared.config.workflow!.stories!.generation, 'always');
  const output = directoryConfigurationFiles({ config: cleared.config, baseline: cleared.baselineProfile, previous: cleared }); assert.deepEqual(JSON.parse(output['.stavel-config/workflow.config.json'].toString()), { schemaVersion: 1 });
});

test('one packaged registry makes section and adoption-question amendments usable by every existing consumer', async () => {
  const f = fixture(); const distribution = locateDistribution(sourceRoot); const definitions = packagedConfigurationDefinitions(distribution);
  const sectionId = 'section.product-overview.purpose-and-outcomes'; const questionId = 'project.intent';
  const amendments: ConfigurationAmendment[] = [
    { id: 'custom-purpose-section', collection: 'sections', target: sectionId, action: 'replace', value: { ...definitions.sections![sectionId], title: 'Problem and measurable outcomes', guidance: 'Preserve the actual accepted project intent.' }, reason: 'The owner selected a local section convention.', source: 'user:fixture:purpose-section' },
    { id: 'custom-intent-question', collection: 'questions', target: questionId, action: 'replace', value: { ...definitions.questions![questionId], prompt: 'Explain the concrete operator value.' }, reason: 'The owner selected a clearer setup question.', source: 'user:fixture:intent-question' },
  ];
  seed(f.root, distribution.config, { workflow: { workflow: { amendments } } }); const before = snapshot(f.root);
  const inspected = inspectRepository({ root: f.root, sourceRoot }); assert.equal(inspected.configuration.definitions.sections![sectionId].title, 'Problem and measurable outcomes');
  const questions = getQuestions({ root: f.root, sourceRoot }); assert.equal(questions.questions.find(question => question.id === questionId)!.prompt, 'Explain the concrete operator value.'); assert.equal(questions.unresolved.some(id => id.startsWith('question.artifact.')), false);
  const explained = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution) }); assert.equal(explained.definitions.questions![questionId].prompt, 'Explain the concrete operator value.'); assert.equal(explained.definitions.questions!['question.artifact.fact.purpose'].questionStage, 'artifact');
  const adoption = plan(f.root, { mode: 'migrate' }); assert.deepEqual(snapshot(f.root), before); assert.equal((await checkRepository({ root: f.root, sourceRoot })).ok, false, 'missing framework remains a real finding, not a seed-resolution exception');
  applyPlan(adoption); assert.equal((await checkRepository({ root: f.root, sourceRoot })).ok, true); assert.equal(inspectRepository({ root: f.root, sourceRoot }).configuration.definitions.sections![sectionId].guidance, 'Preserve the actual accepted project intent.');
});

test('optional packaged metadata preserves old sources and refuses malformed catalogs without reading template bodies', () => {
  const f = fixture(); const source = path.join(f.directory, 'source'); write(source, 'config/assets.catalog.json', { product: 'stavel', schemaVersion: 1, assets: [] }); write(source, 'config/default.profile.json', { schemaVersion: 1 }); write(source, 'config/decisions.catalog.json', { schemaVersion: 1, questions: [{ id: 'fixture.intent', group: 'project', type: 'text', prompt: 'Actual intent?' }] });
  const distribution = locateDistribution(source); const old = packagedConfigurationDefinitions(distribution); assert.equal(old.questions!['fixture.intent'].questionStage, 'adoption'); assert.deepEqual(old.artifacts, {}); assert.equal(inspectRepository({ root: f.root, sourceRoot: source }).configuration.kind, 'absent');
  const catalog = { product: 'stavel', schemaVersion: 1, version: 1, artifacts: [{ id: 'artifact.demo', version: 1, template: 'missing.template.md' }], sections: [], questions: [] };
  write(source, 'config/artifacts.catalog.json', catalog); assert.equal(packagedConfigurationDefinitions(distribution).artifacts!['artifact.demo'].template, 'missing.template.md');
  for (const invalid of [{ ...catalog, schemaVersion: 2 }, { ...catalog, artifacts: {} }, { ...catalog, artifacts: [{ id: 'artifact.demo', version: null }] }, { ...catalog, sections: [{ id: 'section.demo' }, { id: 'section.demo' }] }, { ...catalog, questions: [{ id: 'question.demo', prompt: 'Question?', fact: 'title', requiredFor: null }] }]) {
    write(source, 'config/artifacts.catalog.json', invalid); assert.throws(() => inspectRepository({ root: f.root, sourceRoot: source }), /unsupported|invalid|duplicate/); assert.equal(fs.existsSync(f.root), false);
  }
});

test('pinned topics replace arrays, preserve unrelated choices and report actual origins offline', () => {
  const f = fixture(); seed(f.root, baseline(), { taxonomy: { documentation: { roots: ['engineering'], owners: [{ id: 'product', role: 'product', path: 'engineering/product' }, { id: 'cli', role: 'capability', parent: 'product', path: 'engineering/cli' }] } }, workflow: { workflow: { stories: { generation: 'always' } } } });
  const before = snapshot(f.root); const newer = { ...baseline(), version: 99, testing: { placement: 'separate' as const, fallback: 'language-convention' as const } };
  const result = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: newer });
  assert.deepEqual(result.config.documentation!.roots, ['engineering']); assert.equal(result.config.workflow!.stories!.generation, 'always'); assert.equal(result.config.workflow!.stories!.template, 'team/story.template.md');
  assert.deepEqual(result.config.testing, baseline().testing); assert.equal(result.baseline.version, 2); assert.equal(result.owners[1].parent, 'product');
  assert.equal(result.provenance['documentation.roots'].source, '.stavel-config/taxonomy.config.json'); assert.equal(result.provenance['testing.placement'].source, '.stavel-config/baseline.profile.json');
  for (const name of [CONFIGURATION_ENTRYPOINT, '.stavel-config/baseline.profile.json', '.stavel-config/taxonomy.config.json', '.stavel-config/workflow.config.json']) assert.equal(result.inputs[name], sha(fs.readFileSync(path.join(f.root, name))));
  assert.deepEqual(snapshot(f.root), before);
});

test('directory serialization records only actual overrides and inherits unchanged pinned values', () => {
  const f = fixture(); const base = baseline();
  const fresh = directoryConfigurationFiles({ config: base, baseline: base });
  assert.deepEqual(Object.keys(fresh).sort(), [CONFIGURATION_ENTRYPOINT, '.stavel-config/baseline.profile.json'].sort()); assert.deepEqual(JSON.parse(fresh[CONFIGURATION_ENTRYPOINT].toString()).topics, {});
  const selected = structuredClone(base); selected.documentation!.roots = ['engineering']; selected.testing!.placement = 'separate'; selected.testing!.roots = ['verification']; selected.workflow!.stories!.generation = 'always';
  const files = directoryConfigurationFiles({ config: selected, baseline: base });
  assert.deepEqual(JSON.parse(files['.stavel-config/taxonomy.config.json'].toString()), { schemaVersion: 1, documentation: { roots: ['engineering'] } });
  assert.deepEqual(JSON.parse(files['.stavel-config/tooling.config.json'].toString()), { schemaVersion: 1, testing: { placement: 'separate', roots: ['verification'] } });
  assert.deepEqual(JSON.parse(files['.stavel-config/workflow.config.json'].toString()), { schemaVersion: 1, workflow: { stories: { generation: 'always' } } });
  for (const [name, bytes] of Object.entries(files)) write(f.root, name, bytes);
  const resolved = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: { schemaVersion: 1 } }); assert.deepEqual(resolved.config, selected); assert.equal(resolved.provenance['testing.fallback'].layer, 'baseline'); assert.equal(resolved.provenance['testing.placement'].layer, 'repository');
  assert.equal(resolved.provenance['workflow.stories.template'].layer, 'baseline');
});

test('compact serialization preserves exact pins and active custom paths without deleting empty topics', () => {
  const f = fixture(); const base = baseline(); seed(f.root, base, { workflow: { workflow: { stories: { generation: 'always' } } }, decisions: { decisions: [] } });
  const entry = JSON.parse(fs.readFileSync(path.join(f.root, CONFIGURATION_ENTRYPOINT), 'utf8')); fs.mkdirSync(path.join(f.root, '.stavel-config/custom')); fs.renameSync(path.join(f.root, '.stavel-config/workflow.config.json'), path.join(f.root, '.stavel-config/custom/team-workflow.json')); entry.topics.workflow = 'custom/team-workflow.json'; write(f.root, CONFIGURATION_ENTRYPOINT, entry);
  const previous = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: base }); const original = fs.readFileSync(path.join(f.root, '.stavel-config/baseline.profile.json'));
  const files = directoryConfigurationFiles({ config: base, baseline: base, previous });
  assert.deepEqual(files['.stavel-config/baseline.profile.json'], original); assert.deepEqual(JSON.parse(files['.stavel-config/custom/team-workflow.json'].toString()), { schemaVersion: 1, workflow: { stories: { generation: 'never' } } });
  assert.deepEqual(JSON.parse(files['.stavel-config/decisions.config.json'].toString()), { schemaVersion: 1, decisions: [] }); assert.equal(files['.stavel-config/workflow.config.json'], undefined);
  for (const [name, bytes] of Object.entries(files)) write(f.root, name, bytes); assert.deepEqual(resolveRepositoryConfiguration({ root: f.root, packagedBaseline: base }).config, base);
  write(f.root, '.stavel-config/custom/team-workflow.json', { schemaVersion: 1 }); const cleared = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: base }); const clearedFiles = directoryConfigurationFiles({ config: base, baseline: base, previous: cleared }); assert.deepEqual(JSON.parse(clearedFiles['.stavel-config/custom/team-workflow.json'].toString()), { schemaVersion: 1 }, 'only actual source removal clears declared override presence');
});

test('explicit profile identity overrides remain distinct from the pinned baseline identity', () => {
  const f = fixture(); const base = baseline(); const selected = { ...base, id: 'repository-profile', version: 3 }; const files = directoryConfigurationFiles({ config: selected, baseline: base });
  for (const [name, bytes] of Object.entries(files)) write(f.root, name, bytes);
  const result = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: { schemaVersion: 1 } }); assert.equal(result.config.id, 'repository-profile'); assert.equal(result.config.version, 3); assert.equal(result.baseline.id, 'fixture'); assert.equal(result.baseline.version, 2);
});

test('explicit baseline preview inherits new defaults while preserving actual local topics, scopes and decisions', () => {
  const f = fixture(); const previous = baseline(); previous.version = 1; previous.documentation!.roots = ['old/internal'];
  seed(f.root, previous, { tooling: { testing: { placement: 'custom', roots: ['checks'], patterns: ['**/*.spec.ts'] } }, workflow: { workflow: { stories: { generation: 'always', template: 'team/custom.template.md' }, scopes: [{ id: 'importer', path: 'services/importer', configuration: { schemaVersion: 1, source: { naming: { identifierCase: 'snake' } } } }] } }, decisions: { decisions: [{ id: 'project.intent', value: 'Existing accepted purpose', scope: 'repository', source: 'user:fixture:original-intent', status: 'accepted' }] } });
  const next = structuredClone(previous); next.version = 2; next.documentation!.roots = ['new/internal']; next.documentation!.publication = { requirePublicMarkerForCrossRoot: true }; next.source = { ...next.source, maxLines: 777 };
  const before = snapshot(f.root); const ordinary = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next }); assert.equal(ordinary.baseline.version, 1); assert.deepEqual(ordinary.config.documentation!.roots, ['old/internal']);
  const upgrade = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next, upgradeBaseline: true }); assert.equal(upgrade.baseline.version, 2); assert.deepEqual(upgrade.config.documentation!.roots, ['new/internal']); assert.equal(upgrade.config.source!.maxLines, 777); assert.deepEqual(upgrade.config.testing, { ...previous.testing, placement: 'custom', roots: ['checks'], patterns: ['**/*.spec.ts'] }); assert.equal(upgrade.config.workflow!.stories!.template, 'team/custom.template.md'); assert.equal(upgrade.config.workflow!.stories!.generation, 'always'); assert.equal(upgrade.decisions[0].source, 'user:fixture:original-intent');
  assert.ok(upgrade.baselineUpgrade!.changes.some(change => change.path === 'documentation.roots' && change.kind === 'update')); assert.ok(upgrade.baselineUpgrade!.changes.some(change => change.path === 'documentation.publication' && change.kind === 'add'));
  assert.equal(upgrade.inputs['.stavel-config/baseline.profile.json'], sha(fs.readFileSync(path.join(f.root, '.stavel-config/baseline.profile.json')))); assert.deepEqual(snapshot(f.root), before);
  const scoped = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next, upgradeBaseline: true, scope: 'services/importer/jobs' }); assert.equal((scoped.config.source!.naming as { identifierCase: string }).identifierCase, 'snake'); assert.deepEqual(snapshot(f.root), before);
  fs.appendFileSync(path.join(f.root, '.stavel-config/baseline.profile.json'), ' '); assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next, upgradeBaseline: true }), /checksum mismatch/);
});

test('baseline upgrade plans require aligned migration, retain local choices and refuse stale old pins', () => {
  const f = fixture(); const record = answers(); record.answers['workflow.stories.generation'] = 'never'; record.answers['workflow.stories.template'] = 'team/story.template.md'; record.answers['verification.testPlacement'] = 'colocated'; write(f.root, 'team/story.template.md', fs.readFileSync(path.join(sourceRoot, 'docs/internal/templates/design/story.template.md')));
  applyPlan(plan(f.root, { configurationHome: 'directory', answers: record }));
  const source = path.join(f.directory, 'next-source'); const catalog = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'config/assets.catalog.json'), 'utf8'));
  for (const name of new Set<string>(['config/assets.catalog.json', 'config/decisions.catalog.json', 'config/default.profile.json', 'LICENSE', ...catalog.assets.map((asset: { source: string }) => asset.source)])) write(source, name, fs.readFileSync(path.join(sourceRoot, name)));
  write(source, 'VERSION', '0.2.0'); const next = JSON.parse(fs.readFileSync(path.join(source, 'config/default.profile.json'), 'utf8')); const oldVersion = next.version; next.version += 1; next.source.maxLines = 777; next.source.naming.identifierCase = 'camel'; next.documentation.naming.identifierCase = 'snake'; next.documentation.naming.generatedIdentifierCase = 'snake'; next.documentation.publication = { requirePublicMarkerForCrossRoot: true }; write(source, 'config/default.profile.json', next);
  const before = snapshot(f.root); assert.throws(() => plan(f.root, { sourceRoot: source, answers: record, upgradeBaseline: true }), /mode migrate/);
  const unaligned = structuredClone(record); unaligned.alignment = { confirmed: false, instruction: '' }; assert.throws(() => plan(f.root, { sourceRoot: source, answers: unaligned, mode: 'migrate', upgradeBaseline: true }), /alignment record/); assert.deepEqual(snapshot(f.root), before);
  const preview = plan(f.root, { sourceRoot: source, answers: record, mode: 'migrate', upgradeBaseline: true }); assert.equal(preview.profileVersion, `default@${oldVersion + 1}`); assert.equal(resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next }).baseline.version, oldVersion); applyPlan(preview, { dryRun: true }); assert.deepEqual(snapshot(f.root), before);
  const pin = path.join(f.root, '.stavel-config/baseline.profile.json'); const original = fs.readFileSync(pin); fs.appendFileSync(pin, ' '); const edited = snapshot(f.root); assert.throws(() => preflightPlan(preview), /source changed.*baseline/); assert.deepEqual(snapshot(f.root), edited); fs.writeFileSync(pin, original);
  applyPlan(preview); const upgraded = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: next }); assert.equal(upgraded.baseline.version, oldVersion + 1); assert.equal(upgraded.config.source!.maxLines, 777); assert.equal((upgraded.config.source!.naming as { identifierCase: string }).identifierCase, 'camel'); assert.equal(upgraded.config.documentation!.naming!.identifierCase, 'snake'); assert.equal(upgraded.config.testing!.placement, 'colocated'); assert.equal(upgraded.config.workflow!.stories!.generation, 'never'); assert.equal(upgraded.config.workflow!.stories!.template, 'team/story.template.md');
  const naming = upgraded.decisions.find(decision => decision.id === 'documentation.naming.identifierCase')!; assert.equal(naming.value, 'snake'); assert.equal(naming.origin, 'profile-default'); assert.equal(upgraded.decisions.find(decision => decision.id === 'workflow.stories.generation')!.origin, 'explicit-answer');
  assert.equal(plan(f.root, { sourceRoot: source, answers: record, mode: 'migrate' }).operations.length, 0, 'ordinary later planning does not replay old profile defaults');
});

test('legacy root remains exact and explicit API config bypasses malformed JSON without pretending fallback', () => {
  const f = fixture(); const legacy = { schemaVersion: 1, testing: baseline().testing, workflow: baseline().workflow, teamExtension: { retain: true } };
  write(f.root, 'stavel.config.json', legacy); const result = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() });
  assert.equal(result.kind, 'legacy-root'); assert.deepEqual(result.config, legacy);
  write(f.root, 'stavel.config.json', '{ invalid'); const before = snapshot(f.root);
  assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }), /JSON/);
  const explicit = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline(), explicitConfig: { schemaVersion: 1 } });
  assert.equal(explicit.kind, 'explicit'); assert.deepEqual(explicit.config, { schemaVersion: 1 }); assert.deepEqual(snapshot(f.root), before);
  assert.throws(() => directoryConfigurationFiles({ config: legacy, baseline: legacy }), /teamExtension.*mapping/);
});

test('competing homes, corrupt pins, malformed topics and unsupported schemas refuse without changes', () => {
  for (const defect of ['homes', 'pin', 'missing', 'topic', 'version', 'identity', 'unknown']) {
    const f = fixture(); seed(f.root, baseline(), { workflow: { workflow: { stories: { generation: 'never' } } } });
    if (defect === 'homes') write(f.root, 'stavel.config.json', baseline());
    if (defect === 'pin') fs.appendFileSync(path.join(f.root, '.stavel-config/baseline.profile.json'), ' ');
    if (defect === 'missing') fs.unlinkSync(path.join(f.root, '.stavel-config/baseline.profile.json'));
    if (defect === 'topic') write(f.root, '.stavel-config/workflow.config.json', '{');
    if (defect === 'version') write(f.root, '.stavel-config/workflow.config.json', { schemaVersion: 2 });
    if (defect === 'unknown') write(f.root, '.stavel-config/workflow.config.json', { schemaVersion: 1, executableHook: 'never execute' });
    if (defect === 'identity') { const file = path.join(f.root, CONFIGURATION_ENTRYPOINT); const entry = JSON.parse(fs.readFileSync(file, 'utf8')); entry.baseline.version = 3; write(f.root, CONFIGURATION_ENTRYPOINT, entry); }
    const before = snapshot(f.root); assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }), /conflicting|checksum|missing|JSON|schemaVersion|identity|unsupported/); assert.deepEqual(snapshot(f.root), before);
  }
});

test('unsafe topic references and real junction traversal refuse before outside bytes are consumed', () => {
  for (const reference of ['../outside.json', 'C:\\outside.json', '/outside.json']) {
    const f = fixture(); seed(f.root); const entry = JSON.parse(fs.readFileSync(path.join(f.root, CONFIGURATION_ENTRYPOINT), 'utf8')); entry.topics = { workflow: reference }; write(f.root, CONFIGURATION_ENTRYPOINT, entry); const before = snapshot(f.root);
    assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }), /contained relative path/); assert.deepEqual(snapshot(f.root), before);
  }
  const f = fixture(); seed(f.root); const outside = path.join(f.directory, 'outside'); fs.mkdirSync(outside); write(outside, 'workflow.config.json', { schemaVersion: 1 });
  fs.symlinkSync(outside, path.join(f.root, '.stavel-config/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const entry = JSON.parse(fs.readFileSync(path.join(f.root, CONFIGURATION_ENTRYPOINT), 'utf8')); entry.topics = { workflow: 'linked/workflow.config.json' }; write(f.root, CONFIGURATION_ENTRYPOINT, entry); const bytes = fs.readFileSync(path.join(outside, 'workflow.config.json'));
  assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }), /symlink|junction/); assert.deepEqual(fs.readFileSync(path.join(outside, 'workflow.config.json')), bytes);
});

test('owner identities reject missing parents and cycles without imposing a product path', () => {
  for (const owners of [[{ id: 'feature', role: 'feature', path: 'modules/orders', parent: 'absent' }], [{ id: 'a', role: 'grouping', path: 'platform', parent: 'b' }, { id: 'b', role: 'product', path: 'modules', parent: 'a' }]]) {
    const f = fixture(); seed(f.root, baseline(), { taxonomy: { documentation: { owners } } }); assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }), /missing or cyclic/);
  }
});

test('repository, selected scope and task amendments compose with provenance without persistence or replay', () => {
  const f = fixture(); const profile = baseline(); profile.workflow = { ...profile.workflow, definitions: { artifacts: { design: { id: 'design', version: 1, title: 'Base design' }, backend: { id: 'backend', version: 1 } } }, amendments: [amendment()] , scopes: [{ id: 'web', path: 'apps/web', configuration: { schemaVersion: 1, workflow: { stories: { generation: 'always', template: 'web/story.template.md' } } }, amendments: [amendment({ id: 'web-design', value: { id: 'design', version: 3, title: 'Web design' } })] }] };
  seed(f.root, profile); const before = snapshot(f.root);
  const result = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline(), scope: 'apps/web/ui', taskAmendments: [amendment({ id: 'task-omit', target: 'backend', action: 'omit', value: undefined })] });
  assert.equal(result.definitions.artifacts!.design.title, 'Web design'); assert.equal(result.definitions.artifacts!.backend, undefined); assert.equal(result.config.workflow!.stories!.generation, 'always');
  assert.equal(result.provenance['workflow.definitions.artifacts.design'].layer, 'scope'); assert.equal(result.provenance['workflow.definitions.artifacts.backend'].layer, 'task'); assert.deepEqual(snapshot(f.root), before);
  assert.equal(resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }).definitions.artifacts!.backend.id, 'backend', 'task omission never became a standing rule');
  const files = directoryConfigurationFiles({ config: profile, baseline: baseline() }); for (const [name, bytes] of Object.entries(files)) write(f.root, name, bytes);
  assert.equal(resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }).definitions.artifacts!.design.title, 'Reviewed design', 'persisted policy applies its amendment exactly once');
});

test('conflicts, removed targets, incompatible versions, required omissions and unmet dependencies refuse', () => {
  const base = baseline(); base.workflow = { ...base.workflow, definitions: { artifacts: { design: { id: 'design', version: 1 }, required: { id: 'required', required: true } } } };
  for (const amendments of [
    [amendment(), amendment({ id: 'second' })], [amendment({ target: 'removed', action: 'omit' })], [amendment({ baseVersion: 99 })], [amendment({ target: 'required', action: 'omit', value: undefined })],
    [amendment({ value: { id: 'design', dependencies: ['missing'] } })], [amendment({ value: { id: 'design', dependencies: ['design'] } })],
  ]) { const f = fixture(); seed(f.root, base, { workflow: { workflow: { amendments } } }); const before = snapshot(f.root); assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }), /conflict|missing|removed|required|version|dependency/); assert.deepEqual(snapshot(f.root), before); }
});

test('packaged stable definitions support scoped additions and refuse direct required-concern downgrades', () => {
  const f = fixture(); const profile = baseline(); profile.workflow = { ...profile.workflow, amendments: [amendment({ action: 'add', target: 'threat', value: { id: 'threat', title: 'Threat model' } })] }; seed(f.root, profile);
  const result = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline(), packagedDefinitions: { artifacts: { design: { id: 'design', required: true } } } });
  assert.equal(result.definitions.artifacts!.design.required, true); assert.equal(result.definitions.artifacts!.threat.title, 'Threat model');
  profile.workflow = { ...profile.workflow, definitions: { artifacts: { design: { id: 'design', required: false } } } }; seed(f.root, profile);
  assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline(), packagedDefinitions: { artifacts: { design: { id: 'design', required: true } } } }), /required concern/);
});

test('directory bootstrap and repeated adoption preserve editable template bytes and pinned configuration', async () => {
  const f = fixture(); const initial = plan(f.root, { configurationHome: 'directory' }); const before = snapshot(f.root); applyPlan(initial, { dryRun: true }); assert.deepEqual(snapshot(f.root), before);
  applyPlan(initial); assert.equal(fs.existsSync(path.join(f.root, 'stavel.config.json')), false);
  const configured = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }); const template = configured.config.workflow!.stories!.template;
  fs.appendFileSync(path.join(f.root, template), '\n## Team review\nPreserve this local convention.\n'); const customized = fs.readFileSync(path.join(f.root, template));
  const repeated = plan(f.root); assert.equal(repeated.operations.length, 0); assert.deepEqual(fs.readFileSync(path.join(f.root, template)), customized);
  assert.equal((await checkRepository({ root: f.root, sourceRoot })).ok, true);
  assert.equal(Object.hasOwn(JSON.parse(fs.readFileSync(path.join(f.root, '.stavel.json'), 'utf8')).files, template), false);
});

test('root-to-directory migration is explicit, hash-bound and recoverable while preserving user templates', () => {
  const f = fixture(); applyPlan(plan(f.root)); const template = 'docs/internal/templates/design/story.template.md'; fs.appendFileSync(path.join(f.root, template), '\nLocal owner template.\n');
  const original = fs.readFileSync(path.join(f.root, 'stavel.config.json')); const customized = fs.readFileSync(path.join(f.root, template));
  assert.throws(() => plan(f.root, { configurationHome: 'directory' }), /mode migrate/);
  const migration = plan(f.root, { mode: 'migrate', configurationHome: 'directory' }); assert.ok(migration.operations.some(operation => operation.kind === 'delete' && operation.path === 'stavel.config.json'));
  applyPlan(migration, { dryRun: true }); assert.deepEqual(fs.readFileSync(path.join(f.root, 'stavel.config.json')), original);
  const applied = applyPlan(migration); assert.equal(fs.existsSync(path.join(f.root, 'stavel.config.json')), false); assert.deepEqual(fs.readFileSync(path.join(f.root, template)), customized);
  const converted = resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }); assert.equal(converted.kind, 'configured-directory'); assert.equal(converted.baseline.origin, 'legacy-root');
  const upgradedPackage = { ...converted.baselineProfile, version: (converted.baselineProfile.version ?? 1) + 1 }; const protectedFiles = snapshot(f.root); assert.throws(() => resolveRepositoryConfiguration({ root: f.root, packagedBaseline: upgradedPackage, upgradeBaseline: true }), /review and map its standing choices/); assert.deepEqual(snapshot(f.root), protectedFiles);
  rollbackMigration({ root: f.root, journal: applied.journal! }); assert.deepEqual(fs.readFileSync(path.join(f.root, 'stavel.config.json')), original); assert.equal(fs.existsSync(path.join(f.root, CONFIGURATION_ENTRYPOINT)), false); assert.deepEqual(fs.readFileSync(path.join(f.root, template)), customized);
});

test('hidden config edits and newly competing homes invalidate plan preconditions before mutation', () => {
  const f = fixture(); applyPlan(plan(f.root, { configurationHome: 'directory' }));
  const prepared = plan(f.root); const topic = '.stavel-config/tooling.config.json'; const original = fs.readFileSync(path.join(f.root, topic)); fs.appendFileSync(path.join(f.root, topic), ' '); const before = snapshot(f.root);
  assert.throws(() => preflightPlan(prepared), /source changed.*tooling/); assert.deepEqual(snapshot(f.root), before);
  fs.writeFileSync(path.join(f.root, topic), original); const fresh = plan(f.root); write(f.root, 'stavel.config.json', { schemaVersion: 1 }); const conflict = snapshot(f.root);
  assert.throws(() => preflightPlan(fresh), /source changed.*stavel\.config/); assert.deepEqual(snapshot(f.root), conflict);
});

test('interrupted configuration migration resumes only against unchanged inspected policy', () => {
  const f = fixture(); applyPlan(plan(f.root)); const migration = plan(f.root, { mode: 'migrate', configurationHome: 'directory' });
  assert.throws(() => applyPlan(migration, { failAfterOperations: 2 }), /apply stopped/); const journal = `.stavel/journals/${migration.id}.json`;
  const legacy = path.join(f.root, 'stavel.config.json'); const original = fs.readFileSync(legacy); fs.appendFileSync(legacy, ' '); const before = snapshot(f.root);
  assert.throws(() => resumeMigration({ root: f.root, journal }), /source changed|user work changed/); assert.deepEqual(snapshot(f.root), before);
  fs.writeFileSync(legacy, original); resumeMigration({ root: f.root, journal }); assert.equal(resolveRepositoryConfiguration({ root: f.root, packagedBaseline: baseline() }).kind, 'configured-directory');
});

test('questions reuse sourced standing decisions while task omissions affect only their current question set', () => {
  const f = fixture(); seed(f.root, baseline(), { decisions: { decisions: [{ id: 'project.intent', value: 'Accepted repository intent', scope: 'repository', source: 'user:fixture:intent', status: 'accepted' }] } });
  const before = snapshot(f.root); const report = getQuestions({ root: f.root, sourceRoot }); assert.equal(report.resolved['project.intent'], 'Accepted repository intent');
  const task: ConfigurationAmendment = { id: 'omit-optional-story-question', collection: 'questions', target: 'workflow.stories.generation', action: 'omit', reason: 'Already decided for this task.', source: 'user:fixture:stories' };
  const amended = getQuestions({ root: f.root, sourceRoot, taskAmendments: [task] }); assert.equal(amended.questions.some(question => question.id === task.target), false);
  assert.equal(getQuestions({ root: f.root, sourceRoot }).questions.some(question => question.id === task.target), true); assert.deepEqual(snapshot(f.root), before);
  assert.equal(inspectRepository({ root: f.root, sourceRoot }).configuration.kind, 'configured-directory');
});

test('selected check amendments alter mechanical findings and unsupported checks refuse honestly', async () => {
  const f = fixture(); applyPlan(plan(f.root, { configurationHome: 'directory' })); write(f.root, 'docs/internal/BadName.guide.md', '# Missing metadata\n');
  const normal = await checkRepository({ root: f.root, sourceRoot }); assert.ok(normal.diagnostics.some(item => item.ruleId === 'doc-naming'));
  const omitted: ConfigurationAmendment = { id: 'omit-doc-name', collection: 'checks', target: 'doc-naming', action: 'omit', reason: 'Bounded fixture checks other findings.', source: 'user:fixture:check' };
  const amended = await checkRepository({ root: f.root, sourceRoot, taskAmendments: [omitted] }); assert.equal(amended.diagnostics.some(item => item.ruleId === 'doc-naming'), false); assert.ok(amended.diagnostics.some(item => item.ruleId === 'doc-metadata'));
  await assert.rejects(checkRepository({ root: f.root, sourceRoot, taskAmendments: [{ ...omitted, id: 'unknown', action: 'add', target: 'unknown', value: { id: 'unknown', ruleId: 'missing-tool' } }] }), /check is unavailable/);
});

test('source export uses portable package defaults rather than source-local repository policy', () => {
  const f = fixture(); const source = path.join(f.directory, 'source'); const output = path.join(f.directory, 'export');
  write(source, 'config/assets.catalog.json', { product: 'stavel', schemaVersion: 1, assets: [] }); write(source, 'config/default.profile.json', { schemaVersion: 1, id: 'portable', version: 1 }); write(source, 'config/decisions.catalog.json', { schemaVersion: 1, questions: [] }); write(source, 'skills/stavel/SKILL.md', '# Portable skill\n'); write(source, 'LICENSE', 'Fixture license\n'); write(source, 'dist/stavel.cli.cjs', 'fixture runtime\n'); write(source, 'dist/mdcomposer.cli.cjs', 'fixture markdown\n');
  seed(source, baseline()); write(source, 'stavel.config.json', { schemaVersion: 1, localSecret: 'must not export' }); exportSkill({ sourceRoot: source, output });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(output, 'assets/framework/config/default.profile.json'), 'utf8')), { schemaVersion: 1, id: 'portable', version: 1 });
  assert.equal(Object.keys(snapshot(output)).some(name => name.includes('.stavel-config') || name === 'stavel.config.json'), false);
});
