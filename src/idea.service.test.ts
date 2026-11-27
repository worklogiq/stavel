import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { captureIdea, planIdeaCapture } from './idea.service.js';
import type { IdeaCaptureOptions } from './idea.service.js';
import { applyPlan, resumeMigration, rollbackMigration } from './migration.service.js';
import { applyWorkPlan, planWorkUpdate, readWork, workOptionsForConfiguration } from './work.service.js';
import { digest } from './filesystem.service.js';
import { markdownLinks } from './markdown.service.js';
import type { FrameworkConfig } from './framework.types.js';
import { parseMetadata } from '@worklogiq/mdcomposer';
import { directoryConfigurationFiles } from './configuration.service.js';

const sourceRoot = process.cwd(), registry = 'docs/internal/work-index.json', capPath = 'docs/internal/product/capabilities/cli', featurePath = `${capPath}/capture`, now = '2026-11-27T20:00:00.000Z';
const roots: string[] = [];
test.after(() => { for (const root of roots) fs.rmSync(root, { recursive: true, force: true }); });
function put(root: string, name: string, value: unknown): void { const filename = path.join(root, name); fs.mkdirSync(path.dirname(filename), { recursive: true }); fs.writeFileSync(filename, typeof value === 'string' ? value : JSON.stringify(value, null, 2)); }
function read(root: string, name: string): any { return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8')); }
function configuration(): FrameworkConfig { return { schemaVersion: 1, documentation: { roots: ['docs/internal'], naming: { shape: 'typed', identifierCase: 'kebab' }, kinds: ['recon'], owners: [{ id: 'product', role: 'product', path: 'docs/internal/product' }, { id: 'cli', role: 'capability', parent: 'product', path: capPath }, { id: 'capture', role: 'feature', parent: 'cli', path: featurePath }] }, workflow: { work: { registryFile: registry } } }; }
function fixture(config = configuration(), installRegistry = true): { root: string; config: FrameworkConfig; options: IdeaCaptureOptions } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-idea-')); roots.push(root);
  put(root, 'stavel.config.json', config); if (installRegistry) put(root, registry, { schemaVersion: 2, capabilities: [] });
  return { root, config, options: { root, sourceRoot, text: 'Capture original user intent before designing a feature.', source: 'user:fixture:idea', now } };
}
function snapshot(root: string): Record<string, string> { const output: Record<string, string> = {}; const walk = (directory: string): void => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const filename = path.join(directory, entry.name); if (entry.isDirectory()) walk(filename); else output[path.relative(root, filename)] = fs.readFileSync(filename).toString('base64'); } }; walk(root); return output; }
function payload(root: string, record: string): any { const content = fs.readFileSync(path.join(root, record), 'utf8'); const match = /<!-- stavel:idea\n([\s\S]*?)\n-->/.exec(content); assert(match); return JSON.parse(match[1]); }
function customIdeaFixture(template: string): ReturnType<typeof fixture> {
  const config = configuration(), catalog = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'config/artifacts.catalog.json'), 'utf8'));
  const idea = catalog.artifacts.find((item: any) => item.id === 'artifact.idea'); assert(idea);
  config.workflow!.amendments = [{ id: 'local.idea-template', collection: 'artifacts', target: 'artifact.idea', action: 'replace', value: { ...idea, template: 'docs/local/idea.template.md', templateSource: 'repository' }, reason: 'Retain the local idea format.', source: 'user:fixture:template-choice' }];
  const f = fixture(config); put(f.root, 'docs/local/idea.template.md', template); return f;
}

test('capture uses effective repository idea templates and stable section amendments while preserving exact identity', () => {
  const template = '# Local {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\nreviewer: "Local team"\n-->\n\n## Original idea\n\nLocal fallback.\n\n## Source\n\n{{SOURCE}} at {{CAPTURED_AT}}.\n';
  const f = customIdeaFixture(template); f.config.documentation!.defaultAudience = 'public';
  (f.config.workflow!.amendments as any[]).push({ id: 'local.idea-original', collection: 'sections', target: 'section.idea.original', action: 'replace', value: { id: 'section.idea.original', title: 'Original idea', guidance: 'Accepted local projection:\n<pre>{{ORIGINAL_TEXT}}</pre>' }, reason: 'Show literal input in the repository layout.', source: 'user:fixture:section-choice' });
  put(f.root, 'stavel.config.json', f.config);
  const text = '  Arbitrary {{TOKENS}} [links](missing.md) <script> & original\nwith trailing spaces  ', title = 'A "quoted" : <title> {{TITLE}}';
  const before = snapshot(f.root), preview = planIdeaCapture({ ...f.options, text, title, requestId: 'custom-template' }); assert.deepEqual(snapshot(f.root), before);
  assert.equal(preview.plan!.inputs['docs/local/idea.template.md'], digest(template));
  applyPlan(preview.plan!);
  const content = fs.readFileSync(path.join(f.root, preview.recordPath!), 'utf8'), metadata = parseMetadata(content); assert.deepEqual(metadata.issues, []);
  assert.equal(metadata.data.audience, 'internal'); assert.equal(metadata.data.kind, 'recon'); assert.equal(metadata.data.state, 'draft'); assert.equal(metadata.data.reviewer, 'Local team');
  assert.match(content, /# Local A/); assert.match(content, /Accepted local projection:/); assert(!content.includes('Local fallback.'));
  assert(!content.includes('{{TOKENS}}')); assert.deepEqual(markdownLinks(f.root, preview.recordPath!).diagnostics, []);
  assert.deepEqual(payload(f.root, preview.recordPath!).originalText, text); assert.equal(payload(f.root, preview.recordPath!).title, title);
  assert.equal((content.match(/<!-- stavel:idea\n/g) ?? []).length, 1);
  assert.equal(captureIdea({ ...f.options, text, title, requestId: 'custom-template' }).state, 'existing');
});

test('an edited selected idea template invalidates the composed preview before any capture write', () => {
  const template = '# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n-->\n\n## Original idea\n\n<pre>{{ORIGINAL_TEXT}}</pre>\n\n## Source\n\n{{SOURCE}}\n';
  const f = customIdeaFixture(template), preview = planIdeaCapture(f.options);
  put(f.root, 'docs/local/idea.template.md', template + '\nA subsequent local edit.\n'); const before = snapshot(f.root);
  assert.throws(() => applyPlan(preview.plan!), /stale plan/); assert.deepEqual(snapshot(f.root), before);
  assert.equal(readWork(workOptionsForConfiguration(f.root, f.config)).items.length, 0);
});

test('missing idea role and templates with unknown facts or fabricated identity refuse without partial records', () => {
  const config = configuration(); config.workflow!.amendments = [{ id: 'local.no-ideas', collection: 'artifacts', target: 'artifact.idea', action: 'omit', reason: 'This repository intentionally disables capture templates.', source: 'user:fixture:omit' }];
  const omitted = fixture(config), before = snapshot(omitted.root); assert.throws(() => planIdeaCapture(omitted.options), /artifact.idea definition is missing or omitted/); assert.deepEqual(snapshot(omitted.root), before);
  for (const body of ['{{UNANSWERED_LOCAL_FACT}}', '<!-- stavel:idea\n{"id":"invented"}\n-->']) {
    const f = customIdeaFixture('# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n-->\n\n' + body + '\n'), initial = snapshot(f.root);
    assert.throws(() => planIdeaCapture(f.options), /unanswered template fields|literal original-text identity block/); assert.deepEqual(snapshot(f.root), initial);
  }
});

test('malformed or duplicate custom template metadata refuses before creating the idea and status', () => {
  for (const metadata of ['reviewer: [unfinished', 'reviewer: Local\nreviewer: Duplicate']) {
    const f = customIdeaFixture('# {{TITLE}}\n\n<!-- mdcomposer:meta\nkind: template\n' + metadata + '\n-->\n\n{{ORIGINAL_TEXT}}\n'), before = snapshot(f.root);
    assert.throws(() => planIdeaCapture(f.options), /IDEA template metadata is invalid/); assert.deepEqual(snapshot(f.root), before);
  }
});

test('capture previews one record plus shared status/registry without writes and applies discoverable IDEA work', () => {
  const f = fixture(), before = snapshot(f.root), preview = planIdeaCapture(f.options);
  assert.equal(preview.state, 'preview'); assert.equal(preview.capabilityId, 'cli'); assert.equal(preview.ownerId, 'cli');
  assert.equal(preview.plan!.operations.length, 3); assert.deepEqual(snapshot(f.root), before);
  applyPlan(preview.plan!, { dryRun: true }); assert.deepEqual(snapshot(f.root), before);
  applyPlan(preview.plan!);
  const report = readWork(workOptionsForConfiguration(f.root, f.config)); assert.equal(report.state, 'ready'); assert.equal(report.items.length, 1);
  const entry = report.items[0]; assert.equal(entry.item.id, preview.id); assert.equal(entry.item.mode, 'IDEA'); assert.equal(entry.item.phase, 'exploration'); assert.equal(entry.item.status, 'planned'); assert.equal(entry.item.workType, 'idea');
  assert.equal(entry.sourceFile, `${capPath}/cli.status.json`);
  assert.deepEqual(Object.keys(read(f.root, registry)).sort(), ['capabilities', 'schemaVersion']);
  assert.equal(payload(f.root, preview.recordPath!).originalText, f.options.text);
  assert.equal(payload(f.root, preview.recordPath!).source, f.options.source);
  assert(!('status' in payload(f.root, preview.recordPath!)) && !('mode' in payload(f.root, preview.recordPath!)));
});

test('existing request IDs are no-op retries and conflicting original text, title, source or owner refuses', () => {
  const f = fixture(), initial = captureIdea({ ...f.options, requestId: 'request:one' }); assert.equal(initial.state, 'captured');
  const before = snapshot(f.root), retry = captureIdea({ ...f.options, requestId: 'request:one', now: '2027-01-01' });
  assert.equal(retry.state, 'existing'); assert.equal(retry.id, initial.id); assert.equal(retry.recordPath, initial.recordPath); assert.equal(retry.plan, undefined); assert.deepEqual(snapshot(f.root), before);
  for (const changes of [{ text: 'Different idea' }, { title: 'A different title' }, { source: 'another-source' }, { capabilityId: 'other' }, { ownerId: 'capture' }]) assert.throws(() => planIdeaCapture({ ...f.options, requestId: 'request:one', ...changes }), /conflicts/);
  assert.deepEqual(snapshot(f.root), before);
});

test('omitted optional retry fields retain the first explicitly chosen title/source instead of inventing conflicts', () => {
  const f = fixture(), initial = captureIdea({ ...f.options, requestId: 'optional-retry', title: 'A deliberately chosen short title', source: 'user:original-message' });
  const before = snapshot(f.root), retried = captureIdea({ root: f.root, sourceRoot, text: f.options.text, requestId: 'optional-retry' });
  assert.equal(retried.state, 'existing'); assert.equal(retried.id, initial.id); assert.deepEqual(snapshot(f.root), before);
});

test('two intentional captures of the same text remain distinct without a request ID', () => {
  const f = fixture(), first = captureIdea(f.options), second = captureIdea(f.options);
  assert.notEqual(first.id, second.id); assert.notEqual(first.recordPath, second.recordPath);
  assert.equal(readWork(workOptionsForConfiguration(f.root, f.config)).items.length, 2);
});

test('same request retains original identity and source after normal promotion and local record annotations', () => {
  const f = fixture(), captured = captureIdea({ ...f.options, requestId: 'promote-one' });
  put(f.root, `${capPath}/chosen.design.md`, '# Actual selected design\n');
  const work = workOptionsForConfiguration(f.root, f.config);
  applyWorkPlan(planWorkUpdate(work, { capabilityId: 'cli', itemId: captured.id!, changes: { mode: 'DESIGN', phase: 'design', status: 'active', record: 'chosen.design.md', nextAction: 'Refine the actual design.' } }));
  fs.appendFileSync(path.join(f.root, captured.recordPath!), '\nA later local annotation.\n');
  const before = snapshot(f.root), retry = captureIdea({ ...f.options, requestId: 'promote-one' });
  assert.equal(retry.state, 'existing'); assert.equal(retry.recordPath, captured.recordPath); assert.equal(readWork(work).items[0].item.mode, 'DESIGN'); assert.deepEqual(snapshot(f.root), before);
});

test('known context selects the feature owner; explicit capability selection overrides context', () => {
  const f = fixture();
  const feature = planIdeaCapture({ ...f.options, contextPath: path.join(f.root, featurePath, 'existing.design.md') });
  assert.equal(feature.ownerId, 'capture'); assert.equal(feature.capabilityId, 'cli'); assert(feature.recordPath!.startsWith(`${featurePath}/ideas/`));
  const explicit = planIdeaCapture({ ...f.options, contextPath: featurePath, capabilityId: 'cli' }); assert.equal(explicit.ownerId, 'cli');
  const owner = planIdeaCapture({ ...f.options, ownerId: 'capture' }); assert.equal(owner.ownerId, 'capture');
  assert.throws(() => planIdeaCapture({ ...f.options, contextPath: '../outside' }), /relative path/);
});

test('ambiguous or unknown owners return structured missing input without creating new product scaffolds', () => {
  const config = configuration(); (config.documentation!.owners as any[]).push({ id: 'skill', role: 'capability', parent: 'product', path: 'docs/internal/product/capabilities/skill' });
  const f = fixture(config), before = snapshot(f.root);
  for (const extras of [{}, { capabilityId: 'unknown' }, { ownerId: 'unknown' }]) {
    const result = planIdeaCapture({ ...f.options, ...extras }); assert.equal(result.state, 'input-required'); assert(result.questions[0].options!.length >= 2); assert.equal(result.plan, undefined);
    if (result.questions[0].id === 'capability') assert(!result.questions[0].options!.some(option => option.id === 'capture'));
  }
  assert.deepEqual(snapshot(f.root), before);
});

test('missing configuration or registry returns setup-needed; missing text is one capture question', () => {
  const f = fixture(), before = snapshot(f.root);
  const empty = planIdeaCapture({ ...f.options, text: ' \n ' }); assert.equal(empty.state, 'input-required'); assert.deepEqual(empty.questions.map(question => question.id), ['text']); assert.deepEqual(snapshot(f.root), before);
  fs.unlinkSync(path.join(f.root, registry)); assert.equal(planIdeaCapture(f.options).state, 'setup-needed');
  fs.unlinkSync(path.join(f.root, 'stavel.config.json')); assert.equal(planIdeaCapture(f.options).state, 'setup-needed');
  assert.deepEqual(fs.readdirSync(f.root).sort(), ['docs']);
});

test('mapped ideas/status routes and plain snake naming use accepted existing owners and retain prior status bytes', () => {
  const config = configuration(); config.documentation = { roots: ['handbook'], kinds: ['recon'], naming: { shape: 'plain', identifierCase: 'snake' }, owners: [{ id: 'product', role: 'product', path: 'handbook' }, { id: 'cli', role: 'capability', parent: 'product', path: 'handbook/features/command-center' }] };
  config.workflow = { work: { registryFile: 'handbook/wip.json' }, ideas: { directory: 'notes/ideas', statusFiles: { cli: 'handbook/status/command-owner.status.json' } } };
  const f = fixture(config, false); put(f.root, 'handbook/wip.json', { schemaVersion: 2, capabilities: [] });
  const first = captureIdea(f.options); assert(first.recordPath!.startsWith('handbook/features/command-center/notes/ideas/')); assert(!path.posix.basename(first.recordPath!).includes('.recon.')); assert(path.posix.basename(first.recordPath!).startsWith('idea_capture_original'));
  const report = readWork(workOptionsForConfiguration(f.root, config)); assert.equal(report.capabilities[0].sourceFile, 'handbook/status/command-owner.status.json');
  const registryBefore = fs.readFileSync(path.join(f.root, 'handbook/wip.json')); const second = captureIdea({ ...f.options, text: 'Another captured thought.' });
  assert.equal(second.state, 'captured'); assert(fs.readFileSync(path.join(f.root, 'handbook/wip.json')).equals(registryBefore)); assert.equal(readWork(workOptionsForConfiguration(f.root, config)).items.length, 2);
  assert.equal(fs.existsSync(path.join(f.root, capPath)), false);
});

test('committed directory configuration routes capture and pins topic bytes in the composed preview', () => {
  const config = configuration(); config.workflow!.ideas = { directory: 'captured-thoughts' };
  const f = fixture(config); fs.unlinkSync(path.join(f.root, 'stavel.config.json'));
  for (const [name, bytes] of Object.entries(directoryConfigurationFiles({ config, baseline: { schemaVersion: 1 } }))) {
    const file = path.join(f.root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes);
  }
  const before = snapshot(f.root), result = planIdeaCapture(f.options);
  assert.equal(result.state, 'preview'); assert(result.recordPath!.includes('/captured-thoughts/'));
  assert.equal(typeof result.plan!.inputs['.stavel-config/workflow.config.json'], 'string'); assert.deepEqual(snapshot(f.root), before);
  applyPlan(result.plan!); assert.equal(readWork(workOptionsForConfiguration(f.root, config)).items.length, 1);
});

test('existing registry ownership can route a legacy repository without forcing a new configured owner tree', () => {
  const config = configuration(); config.documentation!.owners = [];
  const f = fixture(config); put(f.root, registry, { schemaVersion: 2, capabilities: [{ id: 'retained', statusFile: '../owners/retained.json' }] });
  put(f.root, 'docs/owners/retained.json', { schemaVersion: 2, capabilityId: 'retained', title: 'Retained owner', owner: 'Existing team', updated: now, items: [] });
  const captured = captureIdea(f.options); assert.equal(captured.capabilityId, 'retained'); assert(captured.recordPath!.startsWith('docs/owners/ideas/')); assert.equal(read(f.root, 'docs/owners/retained.json').owner, 'Existing team');
});

test('collision allocation preserves an unrelated record instead of overwriting a deterministic request path', () => {
  const f = fixture(), first = planIdeaCapture({ ...f.options, requestId: 'collision-request' });
  put(f.root, first.recordPath!, '# An unrelated existing record\n');
  const allocated = captureIdea({ ...f.options, requestId: 'collision-request' });
  assert.notEqual(allocated.id, first.id); assert.notEqual(allocated.recordPath, first.recordPath); assert.equal(fs.readFileSync(path.join(f.root, first.recordPath!), 'utf8'), '# An unrelated existing record\n');
});

test('arbitrary original snippets remain exact data without injecting metadata, links or unresolved framework tokens', () => {
  const f = fixture(); const text = 'Keep {{INPUT}} unchanged.\n[Not a document link](missing.md)\n<!-- mdcomposer:meta\nstate: accepted\n-->\n```\n<unsafe> & text\n';
  const captured = captureIdea({ ...f.options, text, title: 'Remember {{INPUT}} <literally>' });
  const content = fs.readFileSync(path.join(f.root, captured.recordPath!), 'utf8');
  assert.equal(payload(f.root, captured.recordPath!).originalText, text); assert.equal(parseMetadata(content).data.state, 'draft'); assert.equal(parseMetadata(content).data.kind, 'recon');
  assert(!/\{\{[A-Z_]+\}\}/.test(content)); assert.deepEqual(markdownLinks(f.root, captured.recordPath!, content).diagnostics, []);
});

test('custom mode vocabularies and malformed routes refuse explicitly without silently changing policy', () => {
  for (const ideas of [{ directory: '../outside' }, { directory: 'C:\\outside' }, { statusFiles: { cli: '../outside.json' } }, { extra: true }]) {
    const config = configuration(); config.workflow!.ideas = ideas;
    const f = fixture(config), before = snapshot(f.root); assert.throws(() => captureIdea(f.options), /workflow\.ideas|relative path/); assert.deepEqual(snapshot(f.root), before);
  }
  const config = configuration(); config.workflow!.work = { registryFile: registry, modes: ['EXPLORE', 'DESIGN'] };
  const f = fixture(config), before = snapshot(f.root); assert.throws(() => captureIdea(f.options), /unconfigured mode IDEA/); assert.deepEqual(snapshot(f.root), before);
  const excluded = configuration(); excluded.workflow!.modes = ['EXPLORE', 'DESIGN'];
  const missingMode = fixture(excluded), untouched = snapshot(missingMode.root); assert.throws(() => captureIdea(missingMode.options), /IDEA is excluded by workflow.modes/); assert.deepEqual(snapshot(missingMode.root), untouched);
  const included = configuration(); included.workflow!.modes = ['IDEA', 'EXPLORE'];
  assert.equal(captureIdea(fixture(included).options).state, 'captured');
});

test('incompatible selected record metadata refuses instead of generating a policy-invalid or public idea', () => {
  for (const replacement of [{ kinds: ['design'] }, { states: ['proposed', 'approved'] }, { audiences: ['public'] }]) {
    const config = configuration(); config.documentation = { ...config.documentation, ...replacement };
    const f = fixture(config), before = snapshot(f.root); assert.throws(() => captureIdea(f.options), /IDEA requires/); assert.deepEqual(snapshot(f.root), before);
  }
});

test('capture never overwrites configured authority, an unregistered status file or an invalid existing work source', () => {
  const config = configuration(); config.workflow!.ideas = { statusFiles: { cli: '.git/capture.json' } };
  const f = fixture(config), before = snapshot(f.root); assert.throws(() => captureIdea(f.options), /authority/); assert.deepEqual(snapshot(f.root), before);
  const occupied = fixture(); put(occupied.root, `${capPath}/cli.status.json`, 'Unrelated bytes.'); const occupiedBefore = snapshot(occupied.root); assert.throws(() => captureIdea(occupied.options), /already exists/); assert.deepEqual(snapshot(occupied.root), occupiedBefore);
  put(occupied.root, registry, { schemaVersion: 2, capabilities: [{ id: 'cli', statusFile: 'missing.json' }] }); assert.throws(() => captureIdea(occupied.options), /invalid work records/);
});

test('stale preview detects both accepted configuration and work registry changes before creating records', () => {
  for (const filename of ['stavel.config.json', registry]) {
    const f = fixture(), preview = planIdeaCapture(f.options);
    fs.appendFileSync(path.join(f.root, filename), '\n'); const before = snapshot(f.root);
    assert.throws(() => applyPlan(preview.plan!), /stale/); assert.deepEqual(snapshot(f.root), before); assert.equal(fs.existsSync(path.join(f.root, preview.recordPath!)), false);
  }
});

test('partial capture is never success; shared journal resume finishes record and registration consistently', () => {
  const f = fixture(), preview = planIdeaCapture({ ...f.options, requestId: 'recover-one' });
  assert.throws(() => applyPlan(preview.plan!, { failAfterOperations: 1 }), /stopped|simulated|injected|failure/i);
  assert.equal(readWork(workOptionsForConfiguration(f.root, f.config)).items.length, 0);
  assert.throws(() => captureIdea({ ...f.options, requestId: 'recover-one' }), /uncertain writer|recovery/);
  const journal = `.stavel/journals/${preview.plan!.id}.json`;
  assert.equal(resumeMigration({ root: f.root, journal }).state, 'complete');
  const retried = captureIdea({ ...f.options, requestId: 'recover-one' }); assert.equal(retried.state, 'existing'); assert.equal(retried.id, preview.id); assert.equal(readWork(workOptionsForConfiguration(f.root, f.config)).items.length, 1);
});

test('shared rollback removes a partial idea without changing prior policy or registry bytes', () => {
  const f = fixture(), beforeRegistry = fs.readFileSync(path.join(f.root, registry)), beforeConfig = fs.readFileSync(path.join(f.root, 'stavel.config.json'));
  const preview = planIdeaCapture(f.options); assert.throws(() => applyPlan(preview.plan!, { failAfterOperations: 1 }));
  assert.equal(rollbackMigration({ root: f.root, journal: `.stavel/journals/${preview.plan!.id}.json` }).state, 'rolled-back');
  assert(!fs.existsSync(path.join(f.root, preview.recordPath!))); assert(fs.readFileSync(path.join(f.root, registry)).equals(beforeRegistry)); assert(fs.readFileSync(path.join(f.root, 'stavel.config.json')).equals(beforeConfig));
});

test('custom status mapping cannot silently move an existing authoritative capability source', () => {
  const f = fixture(); captureIdea(f.options); f.config.workflow!.ideas = { statusFiles: { cli: 'docs/other.status.json' } }; put(f.root, 'stavel.config.json', f.config);
  const before = snapshot(f.root); assert.throws(() => captureIdea(f.options), /conflicts with the existing registry/); assert.deepEqual(snapshot(f.root), before);
});

test('invalid text/title/request identities and malformed prior original records refuse without rewriting files', () => {
  const f = fixture();
  for (const changes of [{ text: '\0' }, { title: 'two\nlines' }, { requestId: 'two\nlines' }, { now: 'not-a-date' }]) assert.throws(() => planIdeaCapture({ ...f.options, ...changes }));
  const captured = captureIdea({ ...f.options, requestId: 'original-integrity' });
  fs.writeFileSync(path.join(f.root, captured.recordPath!), '# Replaced original\n'); const before = snapshot(f.root);
  assert.throws(() => captureIdea({ ...f.options, requestId: 'original-integrity' }), /original-text identity/); assert.deepEqual(snapshot(f.root), before);
});

test('real directory junction or symlink record routes refuse and preserve outside bytes', context => {
  const f = fixture(), outside = fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-idea-outside-')); roots.push(outside); put(outside, 'marker.txt', 'Outside bytes.');
  fs.mkdirSync(path.join(f.root, capPath), { recursive: true });
  try { fs.symlinkSync(outside, path.join(f.root, capPath, 'ideas'), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (['EPERM', 'EACCES', 'ENOTSUP'].includes((error as NodeJS.ErrnoException).code ?? '')) { context.skip('Host cannot create real directory links.'); return; } throw error; }
  assert.throws(() => captureIdea(f.options), /junction|symlink/); assert.equal(fs.readFileSync(path.join(outside, 'marker.txt'), 'utf8'), 'Outside bytes.'); assert.deepEqual(fs.readdirSync(outside), ['marker.txt']);
});
