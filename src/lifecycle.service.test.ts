import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { planExecutionPacket, planPacketMigration, readExecutionPacket, planSliceTransition, planPacketArchive, planVibeCheckpoint, type DeliverySlice, type ProvisionalPacketMapping, type ProvisionalSliceMapping } from './lifecycle.service.js';
import { applyPlan, resumeMigration } from './migration.service.js';
import { markdownLinks } from './markdown.service.js';
import type { FrameworkConfig, MigrationPlan } from './framework.types.js';
import { checkPolicy, ruleModules } from './rules/policy.service.js';
import { parseMetadata } from '@worklogiq/mdcomposer';
import { AI_EFFECT_WARNING } from './effects.service.js';
import { applyWorkPlan, planWorkCreate, readWork } from './work.service.js';
import { directoryConfigurationFiles, packagedConfigurationDefinitions, resolveRepositoryConfiguration } from './configuration.service.js';
import { loadArtifactCatalog } from './artifact.service.js';
import { locateDistribution } from './distribution.service.js';

const ownerPath = 'docs/internal/product/capabilities/cli';
const home = `${ownerPath}/execution/delivery`;
const manifestFile = `${home}/packet.manifest.json`;
const design = `${ownerPath}/design.md`;
const verification = `${ownerPath}/verification.md`;
const alignment = { confirmed: true, instruction: 'Fixture owner accepts the actual bounded packet preview.' };
const config: FrameworkConfig = { schemaVersion: 1, documentation: { roots: ['docs/internal'], archive: { root: 'docs/internal/_archive' } }, workflow: { stories: { generation: 'ask', template: 'docs/internal/templates/story.template.md' } } };
const slices: DeliverySlice[] = [
  { id: 'first', title: 'First delivery', objective: 'Deliver one independently coherent contract', endpoint: 'Query works with no later slice needed', checks: ['Query source is correct'] },
  { id: 'second', title: 'Second delivery', objective: 'Extend the working query', endpoint: 'Extension is independently usable', dependencies: ['first'], checks: ['Extension keeps query contract'] },
];
function fixture(t: { after(callback: () => void): void }): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-lifecycle-')); t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  put(root, design, '# Actual accepted design\n\n## Contract\n\nHuman reviewed design scope.\n');
  put(root, verification, '# Actual verification evidence\n\nFixture checks and human review.\n');
  put(root, 'docs/internal/templates/story.template.md', '# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\nstate: draft\naudience: internal\n-->\n\nCustom team marker 🧪\n\n{{ACCEPTANCE}}\n\n[Source design](../product/capabilities/cli/design.md#contract)\n');
  return root;
}
function put(root: string, name: string, content: unknown): void { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content, null, 2)); }
function json(root: string, name: string): any { return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8')); }
function options(root: string) { return { root, packetId: 'delivery', ownerPath, owner: 'maintainer', title: 'Coherent delivery', designs: [design], review: { kind: 'accepted-design' as const, source: verification }, slices: structuredClone(slices), alignment, config, stories: false }; }
function prepare(root: string): MigrationPlan { return planExecutionPacket(options(root)).plan!; }
function install(root: string): void { applyPlan(prepare(root)); }
function snapshot(root: string): Record<string, string> {
  const result: Record<string, string> = {}; const visit = (relative: string) => { for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) { const name = relative ? `${relative}/${entry.name}` : entry.name; if (entry.isDirectory()) { result[`${name}/`] = ''; visit(name); } else result[name] = fs.readFileSync(path.join(root, name)).toString('base64'); } }; visit(''); return result;
}
function alterBlock(root: string, sliceFile: string, modify: (value: any) => void): void {
  const file = path.join(root, sliceFile); const text = fs.readFileSync(file, 'utf8');
  const match = text.match(/<!-- stavel:execution\s*\n([\s\S]*?)\n-->/)!; const value = JSON.parse(match[1]!); modify(value);
  fs.writeFileSync(file, text.replace(match[0], `<!-- stavel:execution\n${JSON.stringify(value, null, 2)}\n-->`));
}
function complete(root: string, id: string, packetFile = manifestFile): void {
  applyPlan(planSliceTransition({ root, manifestFile: packetFile, sliceId: id, status: 'in-progress', alignment }));
  applyPlan(planSliceTransition({ root, manifestFile: packetFile, sliceId: id, status: 'complete', alignment, result: 'Actual independently coherent result', evidence: [verification], checks: [{ id: 'check-1', state: 'passed', required: true, evidence: verification }], review: { state: 'passed', source: verification } }));
}
function provisional(root: string, packetId = 'legacy', ids = ['FND-01']): ProvisionalPacketMapping {
  const directory = `${ownerPath}/execution/${packetId}`, macro = `${directory}/${packetId}.macro-execution.md`;
  put(root, macro, '# Original tracker\n\n<!-- mdcomposer:meta\nkind: macro-execution\nstate: draft\naudience: internal\n-->\n\nOriginal tracker prose and [source](../../design.md).\n\n| Slice | Old projection |\n| --- | --- |\n| original | planned |\n');
  const mappings = ids.map((id, index): ProvisionalSliceMapping => {
    const file = `${directory}/legacy-${index + 1}.execution-slice.md`;
    put(root, file, `# Original ${id}\n\n<!-- mdcomposer:meta\nkind: execution-slice\nstate: draft\naudience: internal\nacceptance: original-reference-only\n-->\n\nslice-id: ${id}\nexecution-status: planned\nreadiness: explicit-original-value\n\n## Original implementation evidence\n\nKeep this body, Unicode 🧪, and [actual source](../../design.md#contract).\n`);
    return { id, path: file, dependencies: [], status: 'planned', evidence: [], checks: [{ id: 'original-check', description: 'Explicit original verification concern', required: true, state: 'unavailable', evidence: 'No check outcome is fabricated during migration.' }] };
  });
  return { packetId, ownerPath, macro, manifestFile: `${directory}/packet.manifest.json`, designs: [design], review: { kind: 'accepted-design', source: verification }, slices: mappings };
}
function provisionalStatus(root: string, slice: ProvisionalSliceMapping, status: ProvisionalSliceMapping['status'], original = status as string): void {
  const text = fs.readFileSync(path.join(root, slice.path), 'utf8'); put(root, slice.path, text.replace(/^execution-status:.*$/m, `execution-status: ${original}`)); slice.status = status;
  if (status === 'complete') { slice.result = 'Actual recorded independently verified outcome'; slice.evidence = [verification]; slice.checks[0] = { ...slice.checks[0]!, state: 'passed', evidence: verification }; slice.review = { state: 'passed', source: verification }; }
  if (status === 'cancelled') slice.result = 'Actual owner cancellation of the selected scope.';
}
function dependentPackets(root: string) {
  const a = planExecutionPacket({ ...options(root), packetId: 'prerequisite', slices: [{ ...slices[0]!, id: 'base' }] }); applyPlan(a.plan!);
  const aFile = `${ownerPath}/execution/prerequisite/packet.manifest.json`; complete(root, 'base', aFile);
  const b = planExecutionPacket({ ...options(root), packetId: 'consumer', slices: [{ ...slices[0]!, id: 'next', dependencies: ['prerequisite/base'] }], prerequisiteEvidence: { 'prerequisite/base': a.manifest!.slices[0]!.path } }); applyPlan(b.plan!);
  return { aFile, bFile: `${ownerPath}/execution/consumer/packet.manifest.json`, a: a.manifest!, b: b.manifest! };
}
function renderedConfiguration(root: string, customRoot = false): FrameworkConfig {
  const catalog = loadArtifactCatalog(process.cwd()), artifact = catalog.artifacts.find(item => item.id === 'artifact.execution-slice')!;
  const steps = catalog.sections.find(item => item.id === 'section.execution-slice.steps-and-verification')!, macro = catalog.sections.find(item => item.id === 'section.macro-execution.accepted-scope')!, story = catalog.sections.find(item => item.id === 'section.story.outcome-and-scope')!;
  put(root, 'custom/execution.template.md', '# Team execution {{SLICE}}\n\n<!-- mdcomposer:meta\nkind: template\nstate: draft\naudience: internal\n-->\n\nTEAM CUSTOM EXECUTION TEMPLATE\n\nexecution-status: planned. Mode: STRICT MODE. Branch/revision: {{BRANCH}}.\n\n## Scope and authority\n\n{{OBJECTIVE}}\n\n[Actual design](../docs/internal/product/capabilities/cli/design.md#contract)\n\n## Contract to preserve\n\n{{ENDPOINT}}\n\n## Steps and verification\n\nOriginal team steps to be replaced by selected section guidance.\n\n## Result\n\nRecord actual evidence after execution.\n');
  const configuration: FrameworkConfig = { ...config, documentation: { ...config.documentation, ...(customRoot ? { roots: ['handbook'], archive: { root: 'handbook/_archive' } } : {}) }, workflow: { ...config.workflow, amendments: [
    { id: 'replace-execution-template', collection: 'artifacts', target: artifact.id, action: 'replace', value: { ...artifact, template: 'custom/execution.template.md', templateSource: 'repository' }, reason: 'Actual repository execution contract.', source: 'user:standing-execution-template' },
    { id: 'replace-execution-steps', collection: 'sections', target: steps.id, action: 'replace', value: { ...steps, guidance: 'TEAM STANDING STEPS: preserve our explicit verification obligations.' }, reason: 'Actual repository verification guidance.', source: 'user:standing-execution-steps' },
    { id: 'replace-macro-scope', collection: 'sections', target: macro.id, action: 'replace', value: { ...macro, guidance: 'TEAM MACRO GUIDANCE: retain our delivery boundaries.' }, reason: 'Actual tracker context.', source: 'user:standing-macro-context' },
    { id: 'replace-story-scope', collection: 'sections', target: story.id, action: 'replace', value: { ...story, guidance: 'TEAM STORY GUIDANCE: keep the actual consumer outcome explicit.' }, reason: 'Actual local story convention.', source: 'user:standing-story-context' },
  ] } };
  for (const [name, bytes] of Object.entries(directoryConfigurationFiles({ config: configuration, baseline: config }))) { fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true }); fs.writeFileSync(path.join(root, name), bytes); }
  return configuration;
}
function renderingResolution(root: string) { return resolveRepositoryConfiguration({ root, packagedBaseline: config, packagedDefinitions: packagedConfigurationDefinitions(locateDistribution(process.cwd())) }); }

test('PLAN asks unanswered story choice and creates a read-only preview with qualified dependency readiness', t => {
  const root = fixture(t); const before = snapshot(root);
  assert.equal(planExecutionPacket({ ...options(root), stories: undefined }).state, 'input-required'); assert.deepEqual(snapshot(root), before);
  const plan = prepare(root); applyPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(root), before);
  applyPlan(plan); const packet = readExecutionPacket(root, manifestFile);
  assert.deepEqual(packet.ready, ['first']); assert.equal(packet.closed, false); assert.equal(packet.manifest.id, 'delivery');
  assert.equal(packet.states[0]!.status, 'planned'); assert.deepEqual(packet.manifest.stories, []);
  assert.throws(() => planSliceTransition({ root, manifestFile, sliceId: 'second', status: 'in-progress', alignment }), /prerequisites/);
  assert.throws(() => planExecutionPacket(options(root)), /already exists/);
});

test('default direct design-to-PLAN records selection without accepted-review or exception claims', t => {
  const root = fixture(t), before = snapshot(root);
  const result = planExecutionPacket({ ...options(root), review: undefined, substantial: true }); assert.equal(result.state, 'preview'); assert.deepEqual(snapshot(root), before);
  assert.deepEqual(result.manifest!.review, { kind: 'design-selection', source: design, sha256: createHash('sha256').update(fs.readFileSync(path.join(root, design))).digest('hex') });
  applyPlan(result.plan!); const packet = readExecutionPacket(root, manifestFile); assert.equal(packet.manifest.review.kind, 'design-selection'); assert.equal(packet.states[0]!.review, undefined); assert.deepEqual(packet.ready, ['first']);
  applyPlan(planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'in-progress', alignment }));
  assert.throws(() => planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'complete', alignment, result: 'Actual result', evidence: [verification], checks: [{ id: 'check-1', state: 'passed', required: true, evidence: verification }] }), /completion.*review/);
});

test('explicit required substantial review policy refuses missing/fake selection but retains actual review and task exceptions', t => {
  const root = fixture(t), required: FrameworkConfig = { ...config, workflow: { ...config.workflow, review: { design: 'required-for-substantial' } } }; const before = snapshot(root);
  assert.throws(() => planExecutionPacket({ ...options(root), config: required, review: undefined }), /repository policy requires actual design review/);
  assert.throws(() => planExecutionPacket({ ...options(root), config: { ...required, workflow: { ...required.workflow, review: { design: ['required-for-substantial'] } } }, review: undefined }), /unsupported design-review policy/);
  assert.throws(() => planExecutionPacket({ ...options(root), config: required, review: { kind: 'design-selection', source: design } }), /requires actual design review/); assert.deepEqual(snapshot(root), before);
  assert.equal(planExecutionPacket({ ...options(root), config: required }).manifest!.review.kind, 'accepted-design');
  assert.equal(planExecutionPacket({ ...options(root), config: required, review: { kind: 'task-exception', source: verification } }).manifest!.review.kind, 'task-exception');
});

test('small scope can go directly to PLAN under required-for-substantial and configurable none never forces review', t => {
  for (const policy of ['required-for-substantial', 'recommended-for-substantial', 'none']) {
    const root = fixture(t), selected: FrameworkConfig = { ...config, workflow: { ...config.workflow, review: { design: policy } } };
    const result = planExecutionPacket({ ...options(root), config: selected, review: undefined, substantial: policy === 'required-for-substantial' ? false : true });
    assert.equal(result.state, 'preview'); assert.equal(result.manifest!.review.kind, 'design-selection');
    applyPlan(result.plan!); assert.equal(readExecutionPacket(root, manifestFile).manifest.review.source, design);
  }
});

test('design-selection provenance cannot point at a different source and stale explicit review hashes refuse', t => {
  const root = fixture(t); const result = planExecutionPacket({ ...options(root), review: undefined }); applyPlan(result.plan!);
  const manifest = json(root, manifestFile); manifest.review = { kind: 'design-selection', source: verification, sha256: createHash('sha256').update(fs.readFileSync(path.join(root, verification))).digest('hex') }; put(root, manifestFile, manifest);
  assert.throws(() => readExecutionPacket(root, manifestFile), /first explicit design baseline/);
  const another = fixture(t); assert.throws(() => planExecutionPacket({ ...options(another), review: { kind: 'accepted-design', source: verification, sha256: '0'.repeat(64) } }), /changed since explicit selection/);
});

test('optional PLAN review does not turn explicit provisional migration mapping into unreviewed auto-conversion', t => {
  const root = fixture(t), packet = provisional(root); packet.review = { kind: 'design-selection', source: design };
  const before = snapshot(root); assert.throws(() => planPacketMigration({ root, alignment, packets: [packet] }), /actual reviewed design/); assert.deepEqual(snapshot(root), before);
});

test('story rendering uses actual repository template bytes and rebases its source links', t => {
  const root = fixture(t); const template = fs.readFileSync(path.join(root, config.workflow!.stories!.template), 'utf8');
  const result = planExecutionPacket({ ...options(root), stories: true }); applyPlan(result.plan!);
  assert.equal(result.manifest!.stories.length, 2);
  for (const file of result.manifest!.stories) {
    const content = fs.readFileSync(path.join(root, file), 'utf8'); assert.match(content, /Custom team marker 🧪/); assert.match(content, /kind: story/); assert.doesNotMatch(content, /\{\{/);
    assert.deepEqual(markdownLinks(root, file).diagnostics, []); assert.ok(markdownLinks(root, file).targets.includes(design));
  }
  assert.equal(fs.readFileSync(path.join(root, config.workflow!.stories!.template), 'utf8'), template);
});

test('plain camel/snake/kebab/Pascal/any names keep story, slice and tracker roles distinct even when IDs match', t => {
  const cases = [
    ['camel', 'firstExecutionSlice.md', 'firstStory.md', 'firstMacroExecution.md'],
    ['snake', 'first_execution_slice.md', 'first_story.md', 'first_macro_execution.md'],
    ['kebab', 'first-execution-slice.md', 'first-story.md', 'first-macro-execution.md'],
    ['pascal', 'FirstExecutionSlice.md', 'FirstStory.md', 'FirstMacroExecution.md'],
    ['any', 'first-execution-slice.md', 'first-story.md', 'first-macro-execution.md'],
  ] as const;
  for (const [identifierCase, sliceName, storyName, macroName] of cases) {
    const root = fixture(t); const selected: FrameworkConfig = { ...config, documentation: { ...config.documentation, naming: { shape: 'plain', identifierCase } } };
    const result = planExecutionPacket({ ...options(root), packetId: 'first', slices: [slices[0]!], stories: true, config: selected }); applyPlan(result.plan!);
    const packet = readExecutionPacket(root, `${ownerPath}/execution/first/packet.manifest.json`);
    assert.equal(path.posix.basename(packet.manifest.slices[0]!.path), sliceName); assert.equal(path.posix.basename(packet.manifest.stories[0]!), storyName); assert.equal(path.posix.basename(packet.manifest.macro), macroName);
    for (const file of [packet.manifest.slices[0]!.path, packet.manifest.stories[0]!, packet.manifest.macro]) assert.deepEqual(markdownLinks(root, file).diagnostics, []);
  }
});

test('PLAN rejects dependency cycles, unknown prerequisites and stale design inputs without output', t => {
  const root = fixture(t); const baseline = snapshot(root);
  const cycle = structuredClone(slices); cycle[0]!.dependencies = ['second']; assert.throws(() => planExecutionPacket({ ...options(root), slices: cycle }), /cycle/);
  const unknown = structuredClone(slices); unknown[0]!.dependencies = ['elsewhere/first']; assert.throws(() => planExecutionPacket({ ...options(root), slices: unknown }), /unknown|unverified/);
  assert.deepEqual(snapshot(root), baseline);
  const plan = prepare(root); fs.appendFileSync(path.join(root, design), '\nMaterial design change'); const changed = snapshot(root);
  assert.throws(() => applyPlan(plan), /stale/); assert.deepEqual(snapshot(root), changed);
});

test('read rejects malformed/tampered manifest schemas, empty packets and unsafe tracker ownership', t => {
  const root = fixture(t); install(root); const original = json(root, manifestFile);
  for (const replacement of [{ ...original, schemaVersion: 50 }, { ...original, slices: [] }, { ...original, designs: [] }, { ...original, review: { kind: 'invented', source: verification } }, { ...original, macro: design }, { ...original, slices: original.slices.map((value: any) => ({ ...value, dependencies: ['unknown/slice'] })) }]) {
    put(root, manifestFile, replacement); const baseline = snapshot(root); assert.throws(() => readExecutionPacket(root, manifestFile)); assert.deepEqual(snapshot(root), baseline);
  }
});

test('reader rejects malformed execution checks/evidence and forged completion instead of treating it closed', t => {
  const root = fixture(t); install(root); const manifest = json(root, manifestFile); const original = fs.readFileSync(path.join(root, manifest.slices[0].path), 'utf8');
  const replacements = [
    (value: any) => { value.checks = [{ id: 'check-1', state: 'fictional', required: 'yes', evidence: 10 }]; },
    (value: any) => { value.evidence = [17]; },
    (value: any) => { value.status = 'complete'; value.result = 'Claimed complete'; value.evidence = []; value.checks = []; value.review = { state: 'passed', source: 'missing.md' }; },
  ];
  for (const replacement of replacements) { put(root, manifest.slices[0].path, original); alterBlock(root, manifest.slices[0].path, replacement); assert.throws(() => readExecutionPacket(root, manifestFile)); }
});

test('read refuses changed canonical design and changed external prerequisite evidence', t => {
  const root = fixture(t);
  const externalResult = planExecutionPacket({ ...options(root), packetId: 'external', slices: [{ ...slices[0]!, id: 'verified' }] }); applyPlan(externalResult.plan!);
  complete(root, 'verified', `${ownerPath}/execution/external/packet.manifest.json`);
  const external = externalResult.manifest!.slices[0]!.path;
  const selected = structuredClone(slices); selected[0]!.dependencies = ['external/verified'];
  applyPlan(planExecutionPacket({ ...options(root), slices: selected, prerequisiteEvidence: { 'external/verified': external } }).plan!);
  assert.deepEqual(readExecutionPacket(root, manifestFile).ready, ['first']);
  fs.appendFileSync(path.join(root, external), '\nExternal evidence changed materially'); assert.throws(() => readExecutionPacket(root, manifestFile), /changed|stale|checksum|prerequisite/);
  fs.appendFileSync(path.join(root, design), '\nDesign changed materially'); assert.throws(() => readExecutionPacket(root, manifestFile), /changed|stale/);
});

test('EXECUTE closure requires result, actual evidence, passed required checks and actual review before readiness advances', t => {
  const root = fixture(t); install(root);
  applyPlan(planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'in-progress', alignment }));
  const baseline = snapshot(root);
  assert.throws(() => planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'complete', alignment }), /completion/);
  assert.throws(() => planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'complete', alignment, result: 'Done', evidence: [verification], checks: [{ id: 'check-1', state: 'unavailable', required: true, evidence: 'Unavailable check' }], review: { state: 'passed', source: verification } }), /completion/);
  assert.throws(() => planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'complete', alignment, result: 'Done', evidence: [verification], checks: [{ id: 'check-1', state: 'passed', required: true, evidence: verification }], review: { state: 'passed', source: 'missing-review.md' } }), /review|missing|source/);
  assert.throws(() => planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'complete', alignment, result: 'Done', evidence: [verification], checks: [{ id: 'check-1', state: 'skipped', required: false, evidence: 'Skip a defining check' }], review: { state: 'passed', source: verification } }), /required.*downgraded|amendment/);
  assert.deepEqual(snapshot(root), baseline);
  complete(root, 'first'); assert.deepEqual(readExecutionPacket(root, manifestFile).ready, ['second']);
  assert.throws(() => planSliceTransition({ root, manifestFile, sliceId: 'first', status: 'in-progress', alignment }), /reopening|transition/);
});

test('completed evidence hashes are rechecked before dependency readiness and archive closure', t => {
  const root = fixture(t); install(root); complete(root, 'first');
  fs.appendFileSync(path.join(root, verification), '\nChanged claimed proof'); const baseline = snapshot(root);
  assert.throws(() => readExecutionPacket(root, manifestFile), /evidence changed|review evidence changed/); assert.throws(() => planPacketArchive({ root, manifestFile, config, alignment })); assert.deepEqual(snapshot(root), baseline);
});

test('archive refuses active packets and mirrors closed packets with canonical identity and historical links', t => {
  const root = fixture(t); install(root); const index = `${ownerPath}/index.md`;
  put(root, index, '# Capability\n\n## Active delivery\n\n[Execution](execution/delivery/first.execution-slice.md)\n');
  assert.throws(() => planPacketArchive({ root, manifestFile, config, alignment }), /complete or cancelled/);
  complete(root, 'first'); complete(root, 'second'); const baseline = snapshot(root);
  const plan = planPacketArchive({ root, manifestFile, config, alignment }); applyPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(root), baseline);
  applyPlan(plan); const archivedHome = 'docs/internal/_archive/product/capabilities/cli/execution/delivery';
  const result = readExecutionPacket(root, `${archivedHome}/packet.manifest.json`); assert.equal(result.closed, true); assert.equal(result.manifest.id, 'delivery');
  assert.equal(fs.existsSync(path.join(root, manifestFile)), false); const updated = fs.readFileSync(path.join(root, index), 'utf8');
  const [active, historical] = updated.split('## Historical context (archived)'); assert.doesNotMatch(active!, /\]\([^)]*_archive/); assert.match(historical!, /_archive/);
  assert.deepEqual(markdownLinks(root, index).diagnostics, []);
  for (const slice of result.manifest.slices) assert.deepEqual(markdownLinks(root, slice.path).diagnostics, []);
});

test('archived metadata follows actual complete/cancelled outcomes and passes the packaged archive rule', async t => {
  const root = fixture(t); const prepared = planExecutionPacket({ ...options(root), stories: true }); applyPlan(prepared.plan!);
  complete(root, 'first'); applyPlan(planSliceTransition({ root, manifestFile, sliceId: 'second', status: 'cancelled', alignment, result: 'Owner explicitly cancelled this remaining scope.' }));
  const firstPath = prepared.manifest!.slices[0]!.path;
  fs.writeFileSync(path.join(root, firstPath), fs.readFileSync(path.join(root, firstPath), 'utf8').replace('state: draft', 'state: draft\nacceptance: actual-existing-review-record'));
  const originalFirst = fs.readFileSync(path.join(root, firstPath));
  put(root, `${home}/retained.recon.md`, '# Retained exploration\n\n<!-- mdcomposer:meta\nstate: draft\naudience: internal\nacceptance: original-source-is-retained\n-->\n');
  applyPlan(planPacketArchive({ root, manifestFile, config, alignment }));
  const archivedHome = 'docs/internal/_archive/product/capabilities/cli/execution/delivery'; const packet = readExecutionPacket(root, `${archivedHome}/packet.manifest.json`);
  const state = (file: string) => parseMetadata(fs.readFileSync(path.join(root, file), 'utf8')).data;
  assert.equal(state(packet.manifest.slices[0]!.path).state, 'complete'); assert.equal(state(packet.manifest.slices[1]!.path).state, 'deprecated'); assert.equal(state(packet.manifest.macro).state, 'deprecated');
  assert.equal(state(packet.manifest.stories[0]!).state, 'complete'); assert.equal(state(packet.manifest.stories[1]!).state, 'deprecated');
  assert.equal(state(packet.manifest.slices[0]!.path).acceptance, 'actual-existing-review-record');
  assert.equal(state(`${archivedHome}/retained.recon.md`).state, 'deprecated'); assert.equal(state(`${archivedHome}/retained.recon.md`).acceptance, 'original-source-is-retained');
  assert.equal(packet.manifest.archive!.sourceHashes[firstPath], createHash('sha256').update(originalFirst).digest('hex'));
  const policy = await checkPolicy({ root, config: { ...config, rules: Object.fromEntries(ruleModules.map(rule => [rule.id, rule.id === 'doc-archive'])) } }); assert.deepEqual(policy.diagnostics, []); assert.equal(policy.ok, true);
});

test('archive moves reference-style evidence links into historical context as well as inline links', t => {
  const root = fixture(t); install(root); complete(root, 'first'); complete(root, 'second');
  const index = `${ownerPath}/index.md`; put(root, index, '# Capability\n\n## Active delivery\n\n[Delivery evidence][delivery]\n\n[delivery]: execution/delivery/first.execution-slice.md\n');
  const plan = planPacketArchive({ root, manifestFile, config, alignment }); applyPlan(plan);
  const updated = fs.readFileSync(path.join(root, index), 'utf8'); assert.match(updated, /## Historical context \(archived\)/);
  assert.deepEqual(markdownLinks(root, index).diagnostics, []);
});

test('archive preserves every binary/hidden packet file and rebases packet-local evidence without losing original provenance', t => {
  const root = fixture(t); install(root);
  const bytes = Buffer.from([0, 255, 13, 10, 128, 0, 31]); const attachment = `${home}/.cache/results.bin`; fs.mkdirSync(path.dirname(path.join(root, attachment)), { recursive: true }); fs.writeFileSync(path.join(root, attachment), bytes);
  const localProof = `${home}/result.verification.md`; put(root, localProof, '# Real result\n\n[Design](../../design.md#contract)\n');
  for (const sliceId of ['first', 'second']) {
    applyPlan(planSliceTransition({ root, manifestFile, sliceId, status: 'in-progress', alignment }));
    applyPlan(planSliceTransition({ root, manifestFile, sliceId, status: 'complete', alignment, result: 'Recorded real result', evidence: [localProof], checks: [{ id: 'check-1', state: 'passed', required: true, evidence: localProof }], review: { state: 'passed', source: verification } }));
  }
  const plan = planPacketArchive({ root, manifestFile, config, alignment }); applyPlan(plan);
  const archivedHome = 'docs/internal/_archive/product/capabilities/cli/execution/delivery';
  assert.deepEqual(fs.readFileSync(path.join(root, `${archivedHome}/.cache/results.bin`)), bytes);
  const packet = readExecutionPacket(root, `${archivedHome}/packet.manifest.json`);
  assert.equal(packet.states[0]!.evidence[0], `${archivedHome}/result.verification.md`); assert.equal(packet.closed, true);
  assert.deepEqual(markdownLinks(root, `${archivedHome}/result.verification.md`).diagnostics, []);
});

test('archive updates canonical design/review links while retaining their pre-archive source hashes', t => {
  const root = fixture(t);
  fs.appendFileSync(path.join(root, design), '\n[Delivery](execution/delivery/first.execution-slice.md)\n');
  fs.appendFileSync(path.join(root, verification), '\n[Delivery](execution/delivery/first.execution-slice.md)\n');
  install(root); complete(root, 'first'); complete(root, 'second');
  const original = readExecutionPacket(root, manifestFile); applyPlan(planPacketArchive({ root, manifestFile, config, alignment }));
  const archivedFile = 'docs/internal/_archive/product/capabilities/cli/execution/delivery/packet.manifest.json';
  const archived = readExecutionPacket(root, archivedFile); assert.equal(archived.closed, true);
  assert.notEqual(archived.manifest.designs[0]!.sha256, original.manifest.designs[0]!.sha256);
  assert.match(fs.readFileSync(path.join(root, design), 'utf8'), /Historical context \(archived\)/);
});

test('archive collision and stale previews refuse without overwriting either destination or new edits', t => {
  const root = fixture(t); install(root); complete(root, 'first'); complete(root, 'second');
  const collision = 'docs/internal/_archive/product/capabilities/cli/execution/delivery/first.execution-slice.md'; put(root, collision, '# Existing user archive'); const baseline = snapshot(root);
  assert.throws(() => planPacketArchive({ root, manifestFile, config, alignment }), /collision/); assert.deepEqual(snapshot(root), baseline);
  fs.unlinkSync(path.join(root, collision)); const plan = planPacketArchive({ root, manifestFile, config, alignment });
  fs.appendFileSync(path.join(root, json(root, manifestFile).slices[0].path), '\nIntervening user edit'); const changed = snapshot(root);
  assert.throws(() => applyPlan(plan), /stale/); assert.deepEqual(snapshot(root), changed);
});

test('interrupted packet creation retains actual partial state and resumes journal without replacing unrelated work', t => {
  const root = fixture(t); const plan = prepare(root);
  assert.throws(() => applyPlan(plan, { failAfterOperations: 1 }), /earlier writes may remain/);
  put(root, 'unrelated.txt', 'User work after interruption');
  resumeMigration({ root, journal: `.stavel/journals/${plan.id}.json` }); assert.equal(readExecutionPacket(root, manifestFile).states.length, 2); assert.equal(fs.readFileSync(path.join(root, 'unrelated.txt'), 'utf8'), 'User work after interruption');
});

test('VIBE checkpoint records actual trigger, source and next action without overwriting existing identity', t => {
  const root = fixture(t); const plan = planVibeCheckpoint({ root, ownerPath, id: 'bounded-outcome', trigger: 'outcome', summary: 'Actual bounded outcome and decision context', sources: [design], nextAction: 'Review observed result', alignment });
  const baseline = snapshot(root); applyPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(root), baseline); applyPlan(plan);
  const name = `${ownerPath}/bounded-outcome.recon.md`; const content = fs.readFileSync(path.join(root, name), 'utf8'); assert.match(content, /Trigger: outcome/); assert.match(content, /Review observed result/); assert.deepEqual(markdownLinks(root, name).diagnostics, []);
  assert.throws(() => planVibeCheckpoint({ root, ownerPath, id: 'bounded-outcome', trigger: 'handoff', summary: 'Replace old', sources: [design], nextAction: 'New action', alignment }), /exists/);
});

test('explicit provisional migration preserves uppercase identity/body/hash and subsequent tracker refresh preserves history', t => {
  const root = fixture(t), packet = provisional(root), original = fs.readFileSync(path.join(root, packet.slices[0]!.path), 'utf8'); const before = snapshot(root);
  const plan = planPacketMigration({ root, alignment, packets: [packet] }); assert.equal(plan.execution?.kind, 'agent-assisted'); assert.deepEqual(plan.execution?.warnings, [AI_EFFECT_WARNING]); assert.equal(plan.execution?.source, verification);
  applyPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(root), before); applyPlan(plan);
  const result = readExecutionPacket(root, packet.manifestFile); assert.deepEqual(result.ready, ['FND-01']); assert.equal(result.closed, false); assert.equal(result.states[0]!.status, 'planned'); assert.equal(result.states[0]!.review, undefined);
  const text = fs.readFileSync(path.join(root, packet.slices[0]!.path), 'utf8'); assert.doesNotMatch(text, /^execution-status:/m); assert.match(text, /slice-id: FND-01/); assert.ok(text.startsWith(original.replace(/^execution-status:[^\r\n]*(?:\r?\n|$)/m, ''))); assert.match(text, /stavel:migration/); assert.match(text, /Keep this body, Unicode 🧪/);
  assert.equal(result.manifest.migration!.sources[packet.slices[0]!.path], createHash('sha256').update(original).digest('hex'));
  assert.equal(parseMetadata(text).data.acceptance, 'original-reference-only');
  applyPlan(planSliceTransition({ root, manifestFile: packet.manifestFile, sliceId: 'FND-01', status: 'in-progress', alignment }));
  const macro = fs.readFileSync(path.join(root, packet.macro), 'utf8'); assert.match(macro, /Original tracker prose/); assert.match(macro, /Provisional tracker snapshot/); assert.match(macro, /\| \[FND-01\][^\n]+in-progress/);
  assert.throws(() => planPacketMigration({ root, alignment, packets: [packet] }), /already exists/);
});

test('batch migration supports packet-level cycles when the qualified slice graph is acyclic and binds final source bytes', t => {
  const root = fixture(t), setup = provisional(root, 'setup', ['SET-01', 'SET_02']), work = provisional(root, 'work', ['WRK-01']);
  for (const slice of [...setup.slices, ...work.slices]) provisionalStatus(root, slice, 'complete');
  work.slices[0]!.dependencies = ['setup/SET-01']; setup.slices[1]!.dependencies = ['work/WRK-01'];
  const plan = planPacketMigration({ root, alignment, packets: [setup, work] }); applyPlan(plan);
  const a = readExecutionPacket(root, setup.manifestFile), b = readExecutionPacket(root, work.manifestFile); assert.equal(a.closed, true); assert.equal(b.closed, true);
  assert.deepEqual(a.states.map(state => state.sliceId), ['SET-01', 'SET_02']);
  assert.equal(a.manifest.prerequisiteEvidence['work/WRK-01']!.sha256, createHash('sha256').update(fs.readFileSync(path.join(root, work.slices[0]!.path))).digest('hex'));
  assert.equal(b.manifest.prerequisiteEvidence['setup/SET-01']!.sha256, createHash('sha256').update(fs.readFileSync(path.join(root, setup.slices[0]!.path))).digest('hex'));
});

test('provisional migration cannot infer completion, replace identity, accept ambiguous fields or overwrite a canonical source', t => {
  for (const variant of ['completion', 'identity', 'duplicate-status', 'unknown-status', 'canonical-block', 'existing-manifest'] as const) {
    const root = fixture(t), packet = provisional(root); const slice = packet.slices[0]!;
    if (variant === 'completion') { slice.status = 'complete'; slice.result = 'An unsupported inferred outcome'; slice.evidence = [verification]; slice.review = { state: 'passed', source: verification }; slice.checks[0]!.state = 'passed'; slice.checks[0]!.evidence = verification; }
    if (variant === 'identity') slice.id = 'OTHER-ID';
    if (variant === 'duplicate-status') fs.appendFileSync(path.join(root, slice.path), '\nexecution-status: planned\n');
    if (variant === 'unknown-status') put(root, slice.path, fs.readFileSync(path.join(root, slice.path), 'utf8').replace('execution-status: planned', 'execution-status: invented'));
    if (variant === 'canonical-block') fs.appendFileSync(path.join(root, slice.path), '\n<!-- stavel:execution\n{}\n-->\n');
    if (variant === 'existing-manifest') put(root, packet.manifestFile, '{}');
    const before = snapshot(root); assert.throws(() => planPacketMigration({ root, alignment, packets: [packet] })); assert.deepEqual(snapshot(root), before);
  }
});

test('explicit active/partial normalization retains in-progress state and cancelled mappings retain actual reason', t => {
  const root = fixture(t), packet = provisional(root, 'normalization', ['ACTIVE', 'PARTIAL', 'CANCELLED']);
  provisionalStatus(root, packet.slices[0]!, 'in-progress', 'active'); provisionalStatus(root, packet.slices[1]!, 'in-progress', 'partial'); provisionalStatus(root, packet.slices[2]!, 'cancelled');
  applyPlan(planPacketMigration({ root, alignment, packets: [packet] })); const result = readExecutionPacket(root, packet.manifestFile);
  assert.deepEqual(result.states.map(state => state.status), ['in-progress', 'in-progress', 'cancelled']); assert.equal(result.states[2]!.result, 'Actual owner cancellation of the selected scope.'); assert.equal(result.closed, false);
});

test('completed mappings require actual source/check/review records and cannot use rewritten packet state as proof', t => {
  for (const variant of ['missing-proof', 'missing-review', 'unavailable-check', 'generated-proof'] as const) {
    const root = fixture(t), packet = provisional(root); provisionalStatus(root, packet.slices[0]!, 'complete'); const slice = packet.slices[0]!;
    if (variant === 'missing-proof') slice.evidence = ['missing.md'];
    if (variant === 'missing-review') slice.review!.source = 'missing-review.md';
    if (variant === 'unavailable-check') slice.checks[0]!.state = 'unavailable';
    if (variant === 'generated-proof') slice.evidence = [slice.path];
    const before = snapshot(root); assert.throws(() => planPacketMigration({ root, alignment, packets: [packet] })); assert.deepEqual(snapshot(root), before);
  }
});

test('batch graph rejects true cross-packet cycles, unknown edges, contradictory state and duplicate destinations', t => {
  for (const variant of ['cycle', 'unknown', 'contradiction', 'duplicate-path'] as const) {
    const root = fixture(t), a = provisional(root, 'packet-a', ['A']), b = provisional(root, 'packet-b', ['B']);
    a.slices[0]!.dependencies = ['packet-b/B'];
    if (variant === 'cycle') b.slices[0]!.dependencies = ['packet-a/A'];
    if (variant === 'unknown') a.slices[0]!.dependencies = ['missing/B'];
    if (variant === 'contradiction') provisionalStatus(root, a.slices[0]!, 'in-progress', 'partial');
    if (variant === 'duplicate-path') b.slices[0]!.path = a.slices[0]!.path;
    const before = snapshot(root); assert.throws(() => planPacketMigration({ root, alignment, packets: [a, b] })); assert.deepEqual(snapshot(root), before);
  }
});

test('migrated planned external dependencies remain visibly unready without inventing complete evidence', t => {
  const root = fixture(t), a = provisional(root, 'packet-a', ['A']), b = provisional(root, 'packet-b', ['B']); a.slices[0]!.dependencies = ['packet-b/B'];
  applyPlan(planPacketMigration({ root, alignment, packets: [a, b] }));
  assert.deepEqual(readExecutionPacket(root, a.manifestFile).ready, []); assert.deepEqual(readExecutionPacket(root, b.manifestFile).ready, ['B']);
  assert.throws(() => planSliceTransition({ root, manifestFile: a.manifestFile, sliceId: 'A', status: 'in-progress', alignment }), /prerequisites/);
});

test('provisional migration protects stale source/proof inputs and resumes a partial batch without dropping bodies', t => {
  const root = fixture(t), packet = provisional(root); const stale = planPacketMigration({ root, alignment, packets: [packet] }); fs.appendFileSync(path.join(root, packet.slices[0]!.path), '\nUser work after preview');
  const changed = snapshot(root); assert.throws(() => applyPlan(stale), /stale/); assert.deepEqual(snapshot(root), changed);
  const plan = planPacketMigration({ root, alignment, packets: [packet] }); assert.throws(() => applyPlan(plan, { failAfterOperations: 1 }), /earlier writes/);
  resumeMigration({ root, journal: `.stavel/journals/${plan.id}.json` }); assert.equal(readExecutionPacket(root, packet.manifestFile).states[0]!.status, 'planned'); assert.match(fs.readFileSync(path.join(root, packet.slices[0]!.path), 'utf8'), /User work after preview/);
});

test('a migrated closed packet remains readable after archival while original migration paths/hashes stay historical', t => {
  const root = fixture(t), packet = provisional(root); provisionalStatus(root, packet.slices[0]!, 'complete');
  applyPlan(planPacketMigration({ root, alignment, packets: [packet] })); const migrated = readExecutionPacket(root, packet.manifestFile);
  applyPlan(planPacketArchive({ root, manifestFile: packet.manifestFile, config, alignment }));
  const archived = readExecutionPacket(root, 'docs/internal/_archive/product/capabilities/cli/execution/legacy/packet.manifest.json');
  assert.equal(archived.closed, true); assert.deepEqual(archived.manifest.migration, migrated.manifest.migration); assert.ok(archived.manifest.migration!.sources[packet.slices[0]!.path]);
});

test('archive refreshes dependent manifest refs/hashes and preserves arbitrary application JSON and acceptance', t => {
  const root = fixture(t), records = dependentPackets(root), prior = readExecutionPacket(root, records.bFile);
  const oldSource = records.a.slices[0]!.path, oldHash = prior.manifest.prerequisiteEvidence['prerequisite/base']!.sha256;
  put(root, 'application.json', `{"reference":${JSON.stringify(oldSource)},"owner":"application"}\n`); const appBytes = fs.readFileSync(path.join(root, 'application.json'));
  const before = snapshot(root), plan = planPacketArchive({ root, manifestFile: records.aFile, config, alignment }); applyPlan(plan, { dryRun: true }); assert.deepEqual(snapshot(root), before);
  applyPlan(plan); const consumer = readExecutionPacket(root, records.bFile); assert.deepEqual(consumer.ready, ['next']); assert.equal(consumer.states[0]!.status, 'planned');
  const reference = consumer.manifest.prerequisiteEvidence['prerequisite/base']!; assert.match(reference.path, /_archive/); assert.equal(reference.sha256, createHash('sha256').update(fs.readFileSync(path.join(root, reference.path))).digest('hex'));
  assert.ok(consumer.manifest.referenceHistory!.some(event => event.changes.some(change => change.from.path === oldSource && change.from.sha256 === oldHash && change.to.path === reference.path)));
  assert.deepEqual(consumer.manifest.review, prior.manifest.review); assert.deepEqual(fs.readFileSync(path.join(root, 'application.json')), appBytes);
});

test('archive preview binds dependent manifests/slices and refuses intervening edits before moving source', t => {
  for (const changedPart of ['manifest', 'slice', 'other-doc']) {
    const root = fixture(t), records = dependentPackets(root); put(root, 'docs/internal/unrelated.recon.md', '# Existing document with no prior delivery link');
    const plan = planPacketArchive({ root, manifestFile: records.aFile, config, alignment });
    const filename = changedPart === 'manifest' ? records.bFile : changedPart === 'slice' ? records.b.slices[0]!.path : 'docs/internal/unrelated.recon.md'; fs.appendFileSync(path.join(root, filename), `\nUser edit after preview [new dependency](${records.a.slices[0]!.path})`); const before = snapshot(root);
    assert.throws(() => applyPlan(plan), /stale/); assert.deepEqual(snapshot(root), before); assert.equal(fs.existsSync(path.join(root, records.aFile)), true); assert.equal(fs.existsSync(path.join(root, '.stavel/runtime/writer.lock')), false);
  }
});

test('archive rebases authoritative work record/tracker pointers with factual history and no lifecycle reassignment', t => {
  const root = fixture(t), records = dependentPackets(root);
  applyWorkPlan(planWorkCreate({ target: root }, { capabilityId: 'cli', statusFile: 'product/capabilities/cli/cli.status.json', title: 'CLI', owner: 'maintainer', item: { id: 'delivery', title: 'Delivery scope', status: 'active', phase: 'verification', mode: 'REVIEW', implementationStatus: 'complete', record: 'execution/prerequisite/base.execution-slice.md', tracker: 'execution/prerequisite/prerequisite.macro-execution.md', nextAction: 'Human closure decision', blockers: [], history: [] } }));
  const registryBytes = fs.readFileSync(path.join(root, 'docs/internal/work-index.json'));
  applyPlan(planPacketArchive({ root, manifestFile: records.aFile, config, alignment })); const work = readWork({ target: root }); assert.equal(work.state, 'ready');
  const item = work.items[0]!.item; assert.match(item.record, /_archive/); assert.match(String(item.tracker), /_archive/); assert.equal(item.status, 'active'); assert.equal(item.phase, 'verification'); assert.equal(item.mode, 'REVIEW'); assert.equal(item.nextAction, 'Human closure decision');
  assert.equal((item.history!.at(-1) as { operation: string }).operation, 'archive-reference-rebase'); assert.deepEqual(fs.readFileSync(path.join(root, 'docs/internal/work-index.json')), registryBytes);
});

test('archive rebases supported decisions-topic provenance while preserving accepted values and original source hashes', t => {
  const root = fixture(t), records = dependentPackets(root), source = records.a.slices[0]!.path;
  const files = directoryConfigurationFiles({ config, baseline: config, decisions: [{ id: 'delivery.choice', value: { keep: 'actual selected value' }, scope: 'repository', source: `${source}#original-evidence`, status: 'accepted' }] });
  for (const [name, bytes] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true }); fs.writeFileSync(path.join(root, name), bytes); }
  const sourceHash = createHash('sha256').update(fs.readFileSync(path.join(root, source))).digest('hex');
  applyPlan(planPacketArchive({ root, manifestFile: records.aFile, config, alignment })); const selected = resolveRepositoryConfiguration({ root, packagedBaseline: config }); const decision = selected.decisions[0]!;
  assert.equal(decision.status, 'accepted'); assert.deepEqual(decision.value, { keep: 'actual selected value' }); assert.match(decision.source, /_archive.*#original-evidence$/);
  const history = decision.referenceHistory as Array<{ from: string; sourceSha256: string }>; assert.equal(history[0]!.from, `${source}#original-evidence`); assert.equal(history[0]!.sourceSha256, sourceHash);
});

test('archive conservatively refuses current owner authority moves and unsupported self-referential proof graphs before writes', t => {
  const root = fixture(t), records = dependentPackets(root);
  const ownerConfig: FrameworkConfig = { ...config, documentation: { ...config.documentation, owners: [{ id: 'actual-product', role: 'product', path: ownerPath, canonical: { 'artifact.product-overview': records.a.slices[0]!.path } }] } };
  const before = snapshot(root); assert.throws(() => planPacketArchive({ root, manifestFile: records.aFile, config: ownerConfig, alignment }), /owner authority|owner mapping/); assert.deepEqual(snapshot(root), before);
  // A manually authored provisional proof graph can be readable as unfinished
  // state while its own manifest hashes that state. Do not guess a fixed point.
  alterBlock(root, records.b.slices[0]!.path, value => { value.evidence = [records.bFile]; });
  const manifest = json(root, records.bFile); manifest.designs = [{ path: records.b.slices[0]!.path, sha256: createHash('sha256').update(fs.readFileSync(path.join(root, records.b.slices[0]!.path))).digest('hex') }]; put(root, records.bFile, manifest);
  assert.equal(readExecutionPacket(root, records.bFile).closed, false); const cyclic = snapshot(root);
  assert.throws(() => planPacketArchive({ root, manifestFile: records.aFile, config, alignment }), /cycle.*explicit|cycle.*proof/); assert.deepEqual(snapshot(root), cyclic);
});

test('unsupported reference-history shapes refuse rather than coercing existing provenance during refresh', t => {
  const root = fixture(t), records = dependentPackets(root); const original = fs.readFileSync(path.join(root, records.bFile), 'utf8');
  const manifest = JSON.parse(original); manifest.referenceHistory = 'custom existing data'; put(root, records.bFile, manifest); const before = snapshot(root);
  assert.throws(() => planPacketArchive({ root, manifestFile: records.aFile, config, alignment }), /reference history/); assert.deepEqual(snapshot(root), before);
  put(root, records.bFile, original); alterBlock(root, records.b.slices[0]!.path, value => { value.referenceHistory = [{ kind: 'future-unsupported-format' }]; }); const invalid = snapshot(root);
  assert.throws(() => readExecutionPacket(root, records.bFile), /reference history/); assert.deepEqual(snapshot(root), invalid);
});

test('PLAN renders effective execution plan/slice/macro/story templates and retains amended guidance through transition/archive', t => {
  const root = fixture(t); renderedConfiguration(root, true); const resolution = renderingResolution(root), selectedOwner = 'handbook/product/capabilities/tool';
  const result = planExecutionPacket({ ...options(root), ownerPath: selectedOwner, config: resolution.config, resolution, sourceRoot: process.cwd(), review: undefined, stories: true });
  assert.equal(result.manifest!.review.kind, 'design-selection'); assert.equal(result.manifest!.plan, `${selectedOwner}/execution/delivery/delivery.execution-plan.md`);
  assert.ok(result.plan!.inputs['custom/execution.template.md']); assert.ok(result.plan!.inputs['.stavel-config/workflow.config.json']); applyPlan(result.plan!);
  const packetFile = `${selectedOwner}/execution/delivery/packet.manifest.json`, packet = readExecutionPacket(root, packetFile);
  const sliceText = fs.readFileSync(path.join(root, packet.manifest.slices[0]!.path), 'utf8');
  assert.match(sliceText, /TEAM CUSTOM EXECUTION TEMPLATE/); assert.match(sliceText, /TEAM STANDING STEPS/); assert.doesNotMatch(sliceText, /Original team steps/); assert.doesNotMatch(sliceText, /^execution-status:/m);
  assert.match(sliceText, /Mode: STRICT MODE/); assert.match(sliceText, /Branch\/revision: Not selected \(working tree\)/); assert.equal([...sliceText.matchAll(/<!-- stavel:execution\n/g)].length, 1);
  const planText = fs.readFileSync(path.join(root, packet.manifest.plan!), 'utf8'); assert.match(planText, /first\.execution-slice\.md/); assert.match(planText, /second\.execution-slice\.md/); assert.doesNotMatch(planText, /\b(?:S01|R01)\b/); assert.match(planText, /SHA-256/);
  assert.match(fs.readFileSync(path.join(root, packet.manifest.stories[0]!), 'utf8'), /TEAM STORY GUIDANCE/);
  complete(root, 'first', packetFile); assert.match(fs.readFileSync(path.join(root, packet.manifest.macro), 'utf8'), /TEAM MACRO GUIDANCE/); complete(root, 'second', packetFile);
  applyPlan(planPacketArchive({ root, manifestFile: packetFile, config: resolution.config, alignment }));
  const archived = readExecutionPacket(root, 'handbook/_archive/product/capabilities/tool/execution/delivery/packet.manifest.json'); assert.ok(archived.manifest.plan); assert.equal(parseMetadata(fs.readFileSync(path.join(root, archived.manifest.plan!), 'utf8')).data.state, 'complete');
  assert.match(fs.readFileSync(path.join(root, archived.manifest.slices[0]!.path), 'utf8'), /TEAM STANDING STEPS/); assert.match(fs.readFileSync(path.join(root, archived.manifest.macro), 'utf8'), /TEAM MACRO GUIDANCE/);
  for (const file of [archived.manifest.plan!, archived.manifest.macro, ...archived.manifest.slices.map(slice => slice.path), ...archived.manifest.stories]) assert.deepEqual(markdownLinks(root, file).diagnostics, []);
});

test('rendered packet previews pin actual custom template and selected workflow-topic bytes', t => {
  for (const filename of ['custom/execution.template.md', '.stavel-config/workflow.config.json']) {
    const root = fixture(t); renderedConfiguration(root); const resolution = renderingResolution(root);
    const result = planExecutionPacket({ ...options(root), config: resolution.config, resolution, sourceRoot: process.cwd() });
    fs.appendFileSync(path.join(root, filename), '\nUser work after rendering preview'); const before = snapshot(root);
    assert.throws(() => applyPlan(result.plan!), /stale/); assert.deepEqual(snapshot(root), before); assert.equal(fs.existsSync(path.join(root, manifestFile)), false);
  }
});

test('PLAN refuses omitted mandatory roles with amendment provenance and effective kind collisions before writes', t => {
  const root = fixture(t), catalog = loadArtifactCatalog(process.cwd());
  const omitted: FrameworkConfig = { ...config, workflow: { ...config.workflow, amendments: [{ id: 'omit-plan', collection: 'artifacts', target: 'artifact.execution-plan', action: 'omit', reason: 'Fixture checks this cannot silently remove a command requirement.', source: 'user:explicit-plan-omission' }] } };
  const before = snapshot(root); assert.throws(() => planExecutionPacket({ ...options(root), config: omitted, sourceRoot: process.cwd() }), /mandatory.*execution-plan.*user:explicit-plan-omission/); assert.deepEqual(snapshot(root), before);
  const planArtifact = catalog.artifacts.find(artifact => artifact.id === 'artifact.execution-plan')!;
  const collision: FrameworkConfig = { ...config, workflow: { ...config.workflow, amendments: [{ id: 'colliding-plan-kind', collection: 'artifacts', target: planArtifact.id, action: 'replace', value: { ...planArtifact, kind: 'macro-execution' }, reason: 'Fixture checks actual kind application.', source: 'user:colliding-kind' }] } };
  assert.throws(() => planExecutionPacket({ ...options(root), config: collision, sourceRoot: process.cwd() }), /duplicate planned file|collision/); assert.deepEqual(snapshot(root), before);
});

test('aligned inline story content still passes through effective story-section and metadata rendering', t => {
  const root = fixture(t); renderedConfiguration(root); const resolution = renderingResolution(root);
  const result = planExecutionPacket({ ...options(root), config: resolution.config, resolution, sourceRoot: process.cwd(), stories: true, storyContent: '# Inline {{TITLE}}\n\nINLINE USER STORY CONTEXT\n\n## Outcome and scope\n\nOriginal inline guidance.\n' }); applyPlan(result.plan!);
  const story = fs.readFileSync(path.join(root, result.manifest!.stories[0]!), 'utf8'); assert.match(story, /INLINE USER STORY CONTEXT/); assert.match(story, /TEAM STORY GUIDANCE/); assert.doesNotMatch(story, /Original inline guidance/); assert.equal(parseMetadata(story).data.kind, 'story'); assert.equal(parseMetadata(story).data.state, 'draft');
});

test('provisional migration can register an existing actual execution plan without replacing its body', t => {
  const root = fixture(t), packet = provisional(root); packet.plan = `${ownerPath}/execution/legacy/legacy.execution-plan.md`; put(root, packet.plan, '# Existing execution plan\n\nActual selected slices and preserved source context.\n'); const original = fs.readFileSync(path.join(root, packet.plan));
  applyPlan(planPacketMigration({ root, alignment, packets: [packet] })); const result = readExecutionPacket(root, packet.manifestFile);
  assert.equal(result.manifest.plan, packet.plan); assert.deepEqual(fs.readFileSync(path.join(root, packet.plan)), original); assert.equal(result.manifest.migration!.sources[packet.plan], createHash('sha256').update(original).digest('hex'));
});
