import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { artifactBaselineDefinitions, createArtifactPlan, loadArtifactCatalog, previewArtifacts, queryArtifacts, renderArtifactTemplate, suggestArtifactOwners } from './artifact.service.js';
import type { ArtifactOwner, ArtifactPreviewOptions } from './artifact.service.js';
import { applyPlan } from './migration.service.js';
import { digest } from './filesystem.service.js';
import { resolveRepositoryConfiguration } from './configuration.service.js';
import { mutationPlan } from './effects.service.js';

const sourceRoot = process.cwd();
const roots: string[] = [];
const fixture = (): string => { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-artifact-')); roots.push(root); return root; };
test.after(() => { for (const root of roots) fs.rmSync(root, { recursive: true, force: true }); });
function write(root: string, name: string, text: string): void { fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true }); fs.writeFileSync(path.join(root, name), text); }
const owners: ArtifactOwner[] = [{ id: 'app', role: 'product', path: 'docs/internal/product' }, { id: 'cli', role: 'capability', path: 'docs/internal/product/capabilities/cli', parent: 'app' }];
const facts = { title: 'Fixture product', owner: 'Fixture team', purpose: 'Make an actual repeated task reliable.', audience: 'Maintainers and users.', scope: 'The currently supported library and command.', outcomes: 'A user can complete the supported task.' };
function options(root = fixture()): ArtifactPreviewOptions { return { root, sourceRoot, owners, productId: 'app', ownerId: 'cli', identifier: 'GuidedSetup', facts, selectedIds: ['artifact.product-overview', 'artifact.design'], alignment: { confirmed: true, instruction: 'Use these facts and mapped owners for this fixture.' } }; }

test('portable catalog closes real template membership and exposes stable family/section identities', () => {
  const catalog = loadArtifactCatalog(sourceRoot);
  assert.equal(catalog.artifacts.length, 23);
  assert(catalog.artifacts.some(artifact => artifact.id === 'artifact.idea' && artifact.kind === 'recon'));
  assert.equal(new Set(catalog.sections.map(item => item.id)).size, catalog.sections.length);
  for (const family of ['product', 'requirements', 'backend', 'interface', 'architecture', 'decisions', 'tests', 'accessibility', 'authorization', 'observability', 'documentation', 'execution', 'story']) assert(catalog.artifacts.some(item => item.family === family), family);
  assert(catalog.artifacts.every(artifact => artifact.sections.every(id => catalog.sections.some(section => section.id === id))));
});

test('surface selection distinguishes UI, backend and CLI/library families and explains omissions', () => {
  const ui = queryArtifacts({ sourceRoot, surfaces: ['ui'] });
  assert(ui.artifacts.some(item => item.id === 'artifact.interface'));
  assert(!ui.artifacts.some(item => item.id === 'artifact.backend'));
  assert.match(ui.omitted.find(item => item.id === 'artifact.backend')!.reason, /Not applicable/);
  const backend = queryArtifacts({ sourceRoot, surfaces: ['backend'] });
  assert(backend.artifacts.some(item => item.id === 'artifact.backend'));
  assert(!backend.artifacts.some(item => item.id === 'artifact.interface'));
  for (const surface of ['cli', 'library']) assert(!queryArtifacts({ sourceRoot, surfaces: [surface] }).artifacts.some(item => item.id === 'artifact.backend'));
  const mixed = queryArtifacts({ sourceRoot, surfaces: ['ui', 'backend'] });
  assert(mixed.artifacts.some(item => item.id === 'artifact.interface') && mixed.artifacts.some(item => item.id === 'artifact.backend'));
});

test('explicit selection, reasoned omissions, unknown IDs and dependency refusal remain distinct', () => {
  const catalog = loadArtifactCatalog(sourceRoot);
  assert.equal(queryArtifacts({ catalog, selectedIds: ['artifact.backend'], omissions: [{ id: 'artifact.backend', reason: 'No server behavior is changed.' }] }).artifacts.length, 0);
  assert.throws(() => queryArtifacts({ catalog, omissions: [{ id: 'artifact.backend', reason: '' }] }), /reasons/);
  assert.match(queryArtifacts({ catalog, selectedIds: ['artifact.unknown'] }).unresolved.join(' '), /Unknown/);
  const definitions = artifactBaselineDefinitions(catalog);
  (definitions.artifacts!['artifact.backend'] as { required?: boolean }).required = true;
  assert.throws(() => queryArtifacts({ catalog, definitions, omissions: [{ id: 'artifact.backend', reason: 'Skip' }] }), /required artifact/);
  (definitions.artifacts!['artifact.backend'] as { dependencies?: string[] }).dependencies = ['artifact.design'];
  assert.match(queryArtifacts({ catalog, definitions, selectedIds: ['artifact.backend'] }).unresolved.join(' '), /requires selected artifact/);
});

test('missing product, ambiguous products, absent aligned facts and no alignment cause no writes', () => {
  const root = fixture();
  for (const variant of [
    { owners: [], productId: undefined, ownerId: undefined },
    { owners: [...owners, { id: 'another', role: 'product' as const, path: 'other' }], productId: undefined },
    { facts: { ...facts, purpose: '' } },
    { alignment: { confirmed: false, instruction: '' } },
  ]) {
    const preview = previewArtifacts({ ...options(root), ...variant });
    assert.equal(preview.ready, false); assert(preview.unresolved.length); assert.equal(preview.plan, undefined);
  }
  assert.deepEqual(fs.readdirSync(root), []);
});

test('unaligned discovery validates facts and paths without issuing an applicable plan', () => {
  const opts = { ...options(), alignment: { confirmed: false, instruction: '' }, discoveryOnly: true };
  const preview = previewArtifacts(opts);
  assert.equal(preview.ready, true, preview.unresolved.join(' '));
  assert.equal(preview.plan, undefined);
  assert(preview.artifacts.every(artifact => artifact.action === 'create'));
  assert.deepEqual(fs.readdirSync(opts.root), []);
  const missing = previewArtifacts({ ...opts, facts: { ...facts, purpose: '' } });
  assert.equal(missing.ready, false); assert(missing.questions.some(question => question.fact === 'purpose'));
  assert.equal(previewArtifacts({ ...opts, discoveryOnly: false }).ready, false);
  assert.throws(() => createArtifactPlan(opts), /unresolved/);
});

test('default owner-aware preview is draft, meaningful and link-valid; dry-run/apply/repeat preserve bytes', () => {
  const opts = options();
  const preview = previewArtifacts(opts);
  assert.equal(preview.ready, true, preview.unresolved.join('\n'));
  assert.deepEqual(fs.readdirSync(opts.root), []);
  assert.match(preview.artifacts[0].content!, /Make an actual repeated task reliable/);
  assert.match(preview.artifacts[0].content!, /audience: internal/);
  assert.match(preview.artifacts[0].content!, /state: draft/);
  assert(!preview.plan!.operations.some(operation => /product\/fixture-product/.test(operation.path)));
  assert.equal(applyPlan(preview.plan!, { dryRun: true }).changed, preview.plan!.operations.length);
  assert.deepEqual(fs.readdirSync(opts.root), []);
  applyPlan(preview.plan!);
  const overview = 'docs/internal/product/product.overview.md';
  assert.match(fs.readFileSync(path.join(opts.root, 'docs/internal/product/index.md'), 'utf8'), /\[Product overview\]\(product.overview.md\)/);
  const bytes = fs.readFileSync(path.join(opts.root, overview));
  const repeated = previewArtifacts(opts);
  assert.equal(repeated.plan!.operations.length, 0);
  assert(repeated.artifacts.every(artifact => artifact.action === 'preserve'));
  assert(fs.readFileSync(path.join(opts.root, overview)).equals(bytes));
});

test('retained platform/product/groups and separately located shared contracts use semantic mappings', () => {
  const root = fixture();
  const mapped: ArtifactOwner[] = [
    { id: 'suite', role: 'grouping', path: 'docs/internal/platform' },
    { id: 'app', role: 'product', path: 'docs/internal/platform/products/application', parent: 'suite' },
    { id: 'areas', role: 'grouping', path: 'docs/internal/platform/products/application/features', parent: 'app' },
    { id: 'cli', role: 'capability', path: 'docs/internal/platform/products/application/features/commands', parent: 'areas' },
    { id: 'config', role: 'contract-topic', path: 'docs/internal/platform/products/application/contracts/configuration', parent: 'app' },
  ];
  const preview = previewArtifacts({ ...options(root), owners: mapped });
  assert.equal(preview.ready, true, preview.unresolved.join(' '));
  assert(preview.plan!.operations.some(item => item.path === 'docs/internal/platform/products/application/features/commands/guided-setup.design.md'));
  assert(!preview.plan!.operations.some(item => item.path.startsWith('docs/internal/product/')));
  assert(!preview.plan!.operations.some(item => item.path.includes('/contracts/')));
  const contract = previewArtifacts({ ...options(root), owners: mapped, ownerId: 'config', selectedIds: ['artifact.requirements'] });
  assert.equal(contract.artifacts[0].path, 'docs/internal/platform/products/application/contracts/configuration/guided-setup.requirements.md');
});

test('typed identifier cases and plain output names avoid cross-artifact filename collisions', () => {
  for (const [identifierCase, expected] of [['camel', 'guidedSetup'], ['snake', 'guided_setup'], ['pascal', 'GuidedSetup']] as const) {
    const preview = previewArtifacts({ ...options(), config: { schemaVersion: 1, documentation: { naming: { shape: 'typed', identifierCase } } } });
    assert(preview.ready, preview.unresolved.join(' '));
    assert(preview.artifacts.some(item => item.path.endsWith(`${expected}.design.md`)));
  }
  const preview = previewArtifacts({ ...options(), config: { schemaVersion: 1, documentation: { naming: { shape: 'plain', identifierCase: 'snake' } } }, selectedIds: ['artifact.product-overview', 'artifact.design', 'artifact.requirements'] });
  assert(preview.ready, preview.unresolved.join(' '));
  assert.deepEqual(preview.artifacts.map(item => path.posix.basename(item.path)), ['product.md', 'guided_setup_requirements.md', 'guided_setup_design.md']);
});

test('canonical existing docs outside conventional owner paths preserve custom prose and amendments', () => {
  const opts = options(); write(opts.root, 'docs/retained.md', '# Existing product\n\nLocally amended authoritative prose.\n');
  const preview = previewArtifacts({ ...opts, facts: { title: facts.title, owner: facts.owner }, selectedIds: ['artifact.product-overview'], canonical: { 'artifact.product-overview': 'docs/retained.md' } });
  assert(preview.ready, preview.unresolved.join(' '));
  assert.equal(preview.artifacts[0].action, 'preserve');
  assert(!preview.plan!.operations.some(item => item.path === 'docs/retained.md'));
  assert.match(Buffer.from(preview.plan!.operations[0].content!, 'base64').toString('utf8'), /\(\.\.\/\.\.\/retained.md\)/);
  const missing = previewArtifacts({ ...opts, canonical: { 'artifact.product-overview': 'docs/missing.md' } });
  assert.equal(missing.ready, false); assert.match(missing.unresolved.join(' '), /Mapped canonical artifact does not exist/);
});

test('custom story template remains authoritative, rebases real links and stale input refuses apply', () => {
  const opts = options();
  write(opts.root, 'docs/templates/local.template.md', '# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\nstate: accepted\nowner: "{{OWNER}}"\n-->\n\n## Our acceptance\n\nKeep our custom story format. [Policy](../policy.md#contract)\n');
  write(opts.root, 'docs/policy.md', '# Contract\n');
  const custom = { ...opts, selectedIds: ['artifact.story'], config: { schemaVersion: 1, workflow: { stories: { generation: 'never' as const, template: 'docs/templates/local.template.md' } } } };
  const preview = previewArtifacts(custom);
  assert(preview.ready, preview.unresolved.join(' '));
  assert.match(preview.artifacts[0].content!, /Keep our custom story format/);
  assert(!preview.artifacts[0].content!.includes('## Outcome and scope'));
  assert.match(preview.artifacts[0].content!, /kind: story/);
  assert.match(preview.artifacts[0].content!, /state: draft/);
  assert.equal(preview.plan!.inputs['docs/templates/local.template.md'], digest(fs.readFileSync(path.join(opts.root, 'docs/templates/local.template.md'))));
  write(opts.root, 'docs/templates/local.template.md', '# Edited after preview\n');
  assert.throws(() => applyPlan(preview.plan!), /stale plan/);
  assert.equal(fs.existsSync(path.join(opts.root, preview.artifacts[0].path)), false);
});

test('unknown template fields and broken local links return unresolved input without creating files', () => {
  const opts = options();
  for (const body of ['{{CUSTOM_ANSWER}}', '[Missing](missing.md)', '[Ref][missing]']) {
    write(opts.root, 'custom.template.md', `# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n-->\n\n${body}\n`);
    const preview = previewArtifacts({ ...opts, selectedIds: ['artifact.story'], config: { schemaVersion: 1, workflow: { stories: { generation: 'ask', template: 'custom.template.md' } } } });
    assert.equal(preview.ready, false); assert(preview.unresolved.length); assert.equal(preview.plan, undefined);
  }
  assert.deepEqual(fs.readdirSync(opts.root), ['custom.template.md']);
});

test('semantic owner traversal, duplicate paths, cycles and wrong-product selections refuse before writes', () => {
  const opts = options();
  for (const mapped of [
    [{ ...owners[0], path: '../outside' }],
    [owners[0], { ...owners[1], path: owners[0].path }],
    [{ ...owners[0], parent: 'cli' }, owners[1]],
    [owners[0], { ...owners[1], path: 'unrelated/path' }],
  ]) assert.throws(() => previewArtifacts({ ...opts, owners: mapped }), /relative path|duplicate|collision|cyclic|outside/);
  assert.throws(() => previewArtifacts({ ...opts, owners: [owners[0], { ...owners[1], parent: undefined }] }), /not within/);
  assert.deepEqual(fs.readdirSync(opts.root), []);
});

test('ownership discovery reports actual CLI and skill surfaces without creating or asserting feature owners', () => {
  const root = fixture(); write(root, 'package.json', JSON.stringify({ bin: { tool: 'cli.cjs' } })); write(root, 'skills/work/SKILL.md', '# Skill\n');
  const suggestions = suggestArtifactOwners(root, []);
  assert.deepEqual(suggestions.map(item => item.surface), ['cli', 'skill']);
  assert.deepEqual(suggestions[1].evidence, ['skills/work/SKILL.md']);
  assert.equal(suggestArtifactOwners(root, [...owners, { id: 'skill', role: 'capability', path: 'docs/internal/product/capabilities/skill', parent: 'app' }]).length, 0);
  assert.equal(fs.existsSync(path.join(root, 'docs')), false);
});

test('resolved definitions support stable artifact additions, replacements and section omission', () => {
  const catalog = loadArtifactCatalog(sourceRoot), definitions = artifactBaselineDefinitions(catalog);
  const design = definitions.artifacts!['artifact.design'] as { sections: string[]; template: string; title: string };
  const id = design.sections[0];
  (definitions.sections![id] as { title: string; guidance: string }).guidance = 'Repository-specific accepted boundary questions.';
  delete definitions.sections![design.sections[1]];
  definitions.sections!['section.design.threat-model'] = { id: 'section.design.threat-model', title: 'Threat model', guidance: 'Describe applicable threats and evidence.' };
  design.sections.push('section.design.threat-model');
  const preview = previewArtifacts({ ...options(), definitions, selectedIds: ['artifact.design'] });
  assert(preview.ready, preview.unresolved.join(' '));
  assert.match(preview.artifacts[0].content!, /Repository-specific accepted boundary questions/);
  assert.match(preview.artifacts[0].content!, /## Threat model/);
  assert(!preview.artifacts[0].content!.includes('## Data flow and responsibilities'));
  delete definitions.artifacts!['artifact.backend'];
  assert.match(queryArtifacts({ catalog, definitions }).omitted.find(item => item.id === 'artifact.backend')!.reason, /effective resolved/);
});

test('common configuration resolver applies real repo/task amendments before rendering and captures stale config', () => {
  const opts = options(); const catalog = loadArtifactCatalog(sourceRoot);
  write(opts.root, 'stavel.config.json', JSON.stringify({ schemaVersion: 1, documentation: { owners }, workflow: { amendments: [{ id: 'local.design-section', collection: 'sections', target: 'section.design.contract-and-context', action: 'replace', value: { id: 'section.design.contract-and-context', title: 'Contract and context', guidance: 'Use the accepted repository contract.' }, reason: 'Keep the local contract explicit.', source: 'user instruction' }] } }));
  const resolution = resolveRepositoryConfiguration({ root: opts.root, packagedBaseline: { schemaVersion: 1 }, packagedDefinitions: artifactBaselineDefinitions(catalog) });
  const preview = previewArtifacts({ ...opts, owners: undefined, resolution, selectedIds: ['artifact.design'] });
  assert(preview.ready, preview.unresolved.join(' '));
  assert.match(preview.artifacts[0].content!, /Use the accepted repository contract/);
  write(opts.root, 'stavel.config.json', JSON.stringify({ schemaVersion: 1 }));
  assert.throws(() => applyPlan(preview.plan!), /stale plan/);
});

test('explicit all-family rendering creates drafts with no unresolved tokens or application-specific seeds', () => {
  const opts = options();
  const preview = previewArtifacts({ ...opts, facts: { ...facts, revision: 'fixture-revision', branch: 'fixture-task', originalText: 'Remember the original fixture idea.', source: 'user:fixture:explicit-idea', capturedAt: '2026-11-27T00:00:00.000Z' }, selectedIds: loadArtifactCatalog(sourceRoot).artifacts.map(artifact => artifact.id) });
  assert(preview.ready, preview.unresolved.join(' '));
  const content = preview.artifacts.map(artifact => artifact.content ?? '').join('\n');
  assert(!/\{\{[^}]+\}\}/.test(content));
  assert(!/tenant_id|VITE_ENABLE_OTEL|HelpComponent|\/admin\b/.test(content));
  assert(preview.artifacts.some(artifact => artifact.id === 'artifact.story'));
  assert.notEqual(preview.artifacts.find(artifact => artifact.id === 'artifact.idea')!.path, preview.artifacts.find(artifact => artifact.id === 'artifact.recon')!.path);
  assert.throws(() => createArtifactPlan({ ...opts, facts: { ...facts, purpose: '' } }), /unresolved/);
  const wrongKinds = previewArtifacts({ ...opts, selectedIds: ['artifact.design'], config: { schemaVersion: 1, documentation: { kinds: ['overview'] } } });
  assert.equal(wrongKinds.ready, false);
  assert.match(wrongKinds.unresolved.join(' '), /registering document kind design/);
});

test('existing product navigation is extended without replacing prose and participates in stale preconditions', () => {
  const opts = options(); const existing = '# Local navigation\n\nOur curated content.\n';
  write(opts.root, 'docs/internal/product/index.md', existing);
  const preview = previewArtifacts({ ...opts, selectedIds: ['artifact.product-overview'] });
  assert(preview.ready, preview.unresolved.join(' '));
  const index = preview.plan!.operations.find(item => item.path.endsWith('/index.md'))!;
  assert.equal(index.kind, 'update');
  assert(Buffer.from(index.content!, 'base64').toString('utf8').startsWith(existing));
  applyPlan(preview.plan!);
  assert.equal(previewArtifacts({ ...opts, selectedIds: ['artifact.product-overview'] }).plan!.operations.length, 0);
});

test('definition additions can use an existing repository template and stable question overrides are exposed', () => {
  const opts = options(), catalog = loadArtifactCatalog(sourceRoot), definitions = artifactBaselineDefinitions(catalog);
  write(opts.root, 'local.template.md', '# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n-->\n\n## Local review\n\n{{PURPOSE}}\n');
  definitions.artifacts!['artifact.local-review'] = { id: 'artifact.local-review', family: 'review', title: 'Local review', kind: 'design', template: 'local.template.md', templateSource: 'repository', surfaces: ['any'], requiredFacts: ['title', 'owner', 'purpose'], sections: [] };
  definitions.questions!['question.artifact.fact.purpose'] = { id: 'question.artifact.fact.purpose', fact: 'purpose', prompt: 'What local operational outcome is intended?' };
  const missing = previewArtifacts({ ...opts, definitions, facts: { ...facts, purpose: '' }, selectedIds: ['artifact.local-review'] });
  assert.equal(missing.questions[0].id, 'question.artifact.fact.purpose');
  assert.equal(missing.questions[0].prompt, 'What local operational outcome is intended?');
  const preview = previewArtifacts({ ...opts, definitions, selectedIds: ['artifact.local-review'] });
  assert(preview.ready, preview.unresolved.join(' '));
  assert.match(preview.artifacts[0].content!, /## Local review/);
  assert.equal(preview.plan!.inputs['local.template.md'], digest(fs.readFileSync(path.join(opts.root, 'local.template.md'))));
});

test('metadata quoting preserves literal replacement characters and normalizes generated audience/state', () => {
  const preview = previewArtifacts({ ...options(), facts: { ...facts, title: 'A "quoted" $& title', owner: 'Team "A" $1' } });
  assert(preview.ready, preview.unresolved.join(' '));
  assert.match(preview.artifacts[0].content!, /title: "A \\"quoted\\" \$& title: Product overview"/);
  assert.match(preview.artifacts[0].content!, /owner: "Team \\"A\\" \$1"/);
});

test('real symlink or Windows junction owner paths refuse without touching external content', context => {
  const opts = options(), outside = fixture(); write(outside, 'marker.txt', 'Keep outside bytes.');
  const link = path.join(opts.root, 'docs');
  try { fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes((error as NodeJS.ErrnoException).code ?? '')) { context.skip('Host cannot create a real directory symlink/junction.'); return; } throw error; }
  assert.throws(() => previewArtifacts(opts), /symlink|junction/);
  assert.equal(fs.readFileSync(path.join(outside, 'marker.txt'), 'utf8'), 'Keep outside bytes.');
  assert.deepEqual(fs.readdirSync(outside), ['marker.txt']);
});

test('low-level renderer honors common-union section and adoption-question amendments without owner inference or writes', () => {
  const root = fixture();
  write(root, 'package.json', '{not an application manifest}');
  write(root, 'stavel.config.json', JSON.stringify({ schemaVersion: 1, workflow: { amendments: [
    { id: 'local.slice-context', collection: 'sections', target: 'section.execution-slice.scope-and-authority', action: 'replace', value: { id: 'section.execution-slice.scope-and-authority', title: 'Scope and authority', guidance: 'Actual objective: {{OBJECTIVE}}. Endpoint: {{ENDPOINT}}.' }, reason: 'Keep the accepted local execution context.', source: 'user:fixture:execution-context' },
    { id: 'local.owner-question', collection: 'questions', target: 'project.owner', action: 'replace', value: { id: 'project.owner', group: 'project', prompt: 'Who owns this fixture?', type: 'text', required: true }, reason: 'Local question wording.', source: 'user:fixture:owner-question' },
  ] } }));
  const before = fs.readFileSync(path.join(root, 'stavel.config.json'));
  const configured = JSON.parse(before.toString('utf8'));
  const rendered = renderArtifactTemplate({ root, sourceRoot, config: configured, artifactId: 'artifact.execution-slice', destination: 'delivery/x-01.execution-slice.md', facts: { title: 'Actual slice', owner: 'Maintainers', branch: 'Not selected; this is a draft packet.', objective: 'Preserve the synchronous API', endpoint: 'All required contract cases pass' }, alignment: options(root).alignment });
  assert.match(rendered.content, /Actual objective: Preserve the synchronous API/);
  assert.match(rendered.content, /Endpoint: All required contract cases pass/);
  assert.match(rendered.content, /kind: execution-slice/); assert.match(rendered.content, /state: draft/);
  assert.equal(rendered.artifact.id, 'artifact.execution-slice');
  assert.equal(rendered.inputs['stavel.config.json'], digest(before));
  assert.equal(rendered.inputs['delivery/x-01.execution-slice.md'], null);
  assert.equal(fs.existsSync(path.join(root, 'delivery')), false);
  assert(fs.readFileSync(path.join(root, 'stavel.config.json')).equals(before));
});

test('low-level default execution plan invents no slices and accepts an actual orchestrator-owned slice index', () => {
  const root = fixture();
  const opts = { root, sourceRoot, config: { schemaVersion: 1 }, artifactId: 'artifact.execution-plan', destination: 'delivery/change.execution-plan.md', facts: { title: 'A bounded change', owner: 'Maintainers' }, alignment: options(root).alignment };
  const draft = renderArtifactTemplate(opts);
  assert.match(draft.content, /No execution slices have been selected/);
  assert(!draft.content.includes('| S-01 | R-01 |'));
  const actual = renderArtifactTemplate({ ...opts, facts: { ...opts.facts, slice_index: '| Slice | Endpoint |\n| --- | --- |\n| [X-01](x-01.execution-slice.md) | Synchronous contract preserved |' } });
  assert.match(actual.content, /\[X-01\]\(x-01.execution-slice.md\)/);
  assert.equal(actual.inputs['delivery/x-01.execution-slice.md'], null);
  assert.deepEqual(fs.readdirSync(root), []);
});

test('low-level artifact replacement uses repository template and sections, rebases links and guards stale template before apply', () => {
  const root = fixture(), catalog = loadArtifactCatalog(sourceRoot), definitions = artifactBaselineDefinitions(catalog);
  const template = '# Local {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\nstate: accepted\nowner: "{{OWNER}}"\n-->\n\n[Context](../context.md#baseline)\n\n## Slices\n\nLocal fallback.\n';
  write(root, 'docs/templates/local.template.md', template); write(root, 'docs/context.md', '# Baseline\n');
  definitions.artifacts!['artifact.execution-plan'] = { ...definitions.artifacts!['artifact.execution-plan'], template: 'docs/templates/local.template.md', templateSource: 'repository' };
  definitions.sections!['section.execution-plan.slices'] = { id: 'section.execution-plan.slices', title: 'Slices', guidance: 'Local accepted index: {{SLICE_INDEX}}' };
  const rendered = renderArtifactTemplate({ root, sourceRoot, config: { schemaVersion: 1 }, definitions, artifactId: 'artifact.execution-plan', destination: 'delivery/change.execution-plan.md', facts: { title: 'Local change', owner: 'Local owner', sliceIndex: 'X-01 is the actual selected slice.' }, alignment: options(root).alignment });
  assert.match(rendered.content, /# Local Local change/);
  assert.match(rendered.content, /Local accepted index: X-01 is the actual selected slice/);
  assert.match(rendered.content, /\[Context\]\(\.\.\/docs\/context.md#baseline\)/);
  assert(!rendered.content.includes('Local fallback.'));
  assert.equal(rendered.inputs['docs/templates/local.template.md'], digest(template));
  assert.equal(rendered.inputs['docs/context.md'], digest('# Baseline\n'));
  assert.equal(fs.readFileSync(path.join(root, 'docs/templates/local.template.md'), 'utf8'), template);
  const plan = mutationPlan({ root, alignment: options(root).alignment, inputs: rendered.inputs, changes: [{ path: 'delivery/change.execution-plan.md', content: rendered.content, reason: 'Render the selected amended template.' }] });
  write(root, 'docs/templates/local.template.md', template + '\nEdited after render.\n');
  assert.throws(() => applyPlan(plan), /stale plan/);
  assert.equal(fs.existsSync(path.join(root, 'delivery')), false);
});

test('low-level story rendering uses the editable repository template without modifying it', () => {
  const root = fixture(); const template = '# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n-->\n\n## Team-specific delivery\n\nActual story {{STORY_ID}}.\n';
  write(root, 'team-story.template.md', template);
  const rendered = renderArtifactTemplate({ root, sourceRoot, config: { schemaVersion: 1, workflow: { stories: { generation: 'never', template: 'team-story.template.md' } } }, artifactId: 'artifact.story', destination: 'delivery/work.story.md', facts: { title: 'Requested local story', owner: 'Maintainers', story_id: 'ACTUAL-42' }, alignment: options(root).alignment });
  assert.match(rendered.content, /Team-specific delivery/); assert.match(rendered.content, /ACTUAL-42/);
  assert(!rendered.content.includes('## Outcome and scope'));
  assert.equal(fs.readFileSync(path.join(root, 'team-story.template.md'), 'utf8'), template);
  assert.equal(fs.existsSync(path.join(root, 'delivery')), false);
});

test('aligned inline story content retains selected-template preconditions and effective section behavior', () => {
  const root = fixture(), definitions = artifactBaselineDefinitions(loadArtifactCatalog(sourceRoot));
  const selected = '# Selected {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n-->\n\n{{TEAM_SPECIFIC_UNANSWERED}}\n';
  write(root, 'team-story.template.md', selected);
  definitions.sections!['section.story.acceptance'] = { id: 'section.story.acceptance', title: 'Acceptance', guidance: 'Actual local acceptance: {{ACCEPTANCE}}' };
  const rendered = renderArtifactTemplate({ root, sourceRoot, config: { schemaVersion: 1, workflow: { stories: { generation: 'ask', template: 'team-story.template.md' } } }, definitions, artifactId: 'artifact.story', destination: 'delivery/work.story.md', facts: { title: 'Aligned inline story', owner: 'Maintainers', acceptance: 'All declared contract cases pass.' }, alignment: options(root).alignment, templateContent: '# {{TITLE}}\n\n## Acceptance\n\nInline fallback.\n' });
  assert.match(rendered.content, /<!-- mdcomposer:meta/); assert.match(rendered.content, /kind: story/);
  assert.match(rendered.content, /Actual local acceptance: All declared contract cases pass/);
  assert(!rendered.content.includes('TEAM_SPECIFIC_UNANSWERED')); assert(!rendered.content.includes('Inline fallback'));
  assert.equal(rendered.inputs['team-story.template.md'], digest(selected));
  assert.equal(fs.readFileSync(path.join(root, 'team-story.template.md'), 'utf8'), selected);
  assert.equal(fs.existsSync(path.join(root, 'delivery')), false);
});

test('low-level renderer refuses unaligned, missing facts, omitted artifacts, unsafe destinations and incomplete templates', () => {
  const root = fixture(), catalog = loadArtifactCatalog(sourceRoot), definitions = artifactBaselineDefinitions(catalog);
  const opts = { root, sourceRoot, config: { schemaVersion: 1 }, artifactId: 'artifact.execution-slice', destination: 'delivery/work.execution-slice.md', facts: { title: 'Change', owner: 'Maintainers' }, alignment: options(root).alignment };
  assert.throws(() => renderArtifactTemplate({ ...opts, alignment: { confirmed: false, instruction: '' } }), /aligned decisions/);
  assert.throws(() => renderArtifactTemplate(opts), /needs aligned facts: branch/);
  assert.throws(() => renderArtifactTemplate({ ...opts, destination: '../outside.md' }), /relative path/);
  delete definitions.artifacts!['artifact.execution-slice'];
  assert.throws(() => renderArtifactTemplate({ ...opts, definitions }), /unknown or omitted artifact/);
  write(root, 'incomplete.template.md', '# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n-->\n\n{{UNANSWERED_LOCAL_FIELD}}\n');
  const restored = artifactBaselineDefinitions(catalog);
  restored.artifacts!['artifact.execution-slice'] = { ...restored.artifacts!['artifact.execution-slice'], template: 'incomplete.template.md', templateSource: 'repository' };
  assert.throws(() => renderArtifactTemplate({ ...opts, definitions: restored, facts: { ...opts.facts, branch: 'Not selected for the draft.' } }), /unanswered template fields/);
  assert.equal(fs.existsSync(path.join(root, 'delivery')), false);
});
