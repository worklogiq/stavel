import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initializationProduct, augmentInitializationPlan } from './initialization.service.js';
import { configurationForAnswers, createPlan } from './planning.service.js';
import { plannedRepositoryConfiguration } from './configuration.service.js';
import { locateDistribution } from './distribution.service.js';
import { loadArtifactCatalog } from './artifact.service.js';
import { applyPlan } from './migration.service.js';
import { checkRepository } from './checking.service.js';
import type { AnswersDocument } from './framework.types.js';

const sourceRoot = process.cwd();
const rootFixture = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-initialization-'));
function answers(): AnswersDocument { return { useDefaults: true, alignment: { confirmed: true, instruction: 'user:fixture:aligned-init' }, answers: { 'source.languages': 'typescript', 'verification.commands': 'npm test', 'project.name': 'Example', 'project.intent': 'Provide a reusable example library.', 'project.owner': 'fixture-maintainer', 'workflow.mode': 'adopt', 'product.audience': 'Library developers', 'product.scope': 'One library; no hosted service.', 'product.outcomes': 'Documented, tested consumer API.' } }; }
test('product fact discovery leaves alignment unconfirmed and returns no executable plan', () => {
  const root = rootFixture(), document = answers(); document.alignment = { confirmed: false, instruction: '' };
  const config = locateDistribution(sourceRoot).config;
  const discovery = initializationProduct({ root, config, answers: document, sourceRoot });
  assert.equal(discovery.ready, true); assert.equal(discovery.plan, undefined); assert.equal(document.alignment.confirmed, false); assert.deepEqual(fs.readdirSync(root), []);
  const base = createPlan({ root, name: 'Example', track: 'existing', mode: 'adopt', answers: answers(), sourceRoot });
  assert.throws(() => augmentInitializationPlan(base, { config, answers: document, sourceRoot }), /actual alignment/);
  document.answers['product.audience'] = { value: 'An unaccepted guess', status: 'proposed-from-observation' };
  const unresolved = initializationProduct({ root, config, answers: document, sourceRoot });
  assert.equal(unresolved.ready, false); assert.ok(unresolved.questions.some(question => question.fact === 'audience')); assert.equal(unresolved.plan, undefined);
});
test('initialization preserves custom instructions, adds owned routing and seeds mutable product and pointer registry', async () => {
  const root = rootFixture(); const original = '# Team rules\n\nKeep our actual project instructions.\n'; fs.writeFileSync(path.join(root, 'AGENTS.md'), original);
  const document = answers(), baseline = locateDistribution(sourceRoot).config;
  const base = createPlan({ root, name: 'Example', track: 'existing', mode: 'adopt', answers: document, sourceRoot, configurationHome: 'directory' });
  const config = plannedRepositoryConfiguration(base, configurationForAnswers(baseline, document, base.decisions));
  const plan = augmentInitializationPlan(base, { config, answers: document, sourceRoot });
  applyPlan(plan, { dryRun: true }); assert.deepEqual(fs.readdirSync(root), ['AGENTS.md']);
  applyPlan(plan);
  const routing = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'); assert.ok(routing.startsWith(original.trimEnd())); assert.match(routing, /stavel:generated routing/);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.stavel.json'), 'utf8'));
  assert.equal(manifest.integration_at_install, 'owned-routing-block'); assert.ok(manifest.generatedBlocks['AGENTS.md#routing']);
  assert.ok(fs.existsSync(path.join(root, 'docs/internal/product/product.overview.md')));
  assert.equal(manifest.files['docs/internal/product/product.overview.md'], undefined, 'editable product records do not become immutable upstream assets');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'docs/internal/work-index.json'), 'utf8')), { capabilities: [], schemaVersion: 2 });
  const checks = await checkRepository({ root, sourceRoot }); assert.equal(checks.ok, true, JSON.stringify(checks.diagnostics));
});
test('mapped documentation home and plain naming route through actual persisted manifest paths', async () => {
  const root = rootFixture(); fs.writeFileSync(path.join(root, 'AGENTS.md'), '# Existing rules\n');
  const document = answers(); document.configuration = structuredClone(locateDistribution(sourceRoot).config);
  document.configuration.documentation!.roots = ['handbook']; document.configuration.documentation!.owners = [{ id: 'product', role: 'product', path: 'handbook/product' }];
  document.answers['documentation.naming.style'] = 'camelCase';
  const base = createPlan({ root, name: 'Example', track: 'existing', mode: 'adopt', answers: document, sourceRoot, configurationHome: 'directory', frameworkPath: 'handbook' });
  const config = plannedRepositoryConfiguration(base, document.configuration);
  const plan = augmentInitializationPlan(base, { config, answers: document, sourceRoot }); applyPlan(plan);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.stavel.json'), 'utf8'));
  const instructions = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8'); assert.ok(instructions.includes(`(${manifest.entrypoints.constitution})`));
  assert.ok(fs.existsSync(path.join(root, 'handbook/product/product.md')));
  assert.ok(fs.existsSync(path.join(root, 'handbook/work-index.json')));
  const checks = await checkRepository({ root, sourceRoot }); assert.equal(checks.ok, true, JSON.stringify(checks.diagnostics));
});
test('initialization consumes effective section amendments rather than restoring unmodified package templates', () => {
  const root = rootFixture(), config = structuredClone(locateDistribution(sourceRoot).config), document = answers();
  const section = loadArtifactCatalog(sourceRoot).sections.find(section => section.id === 'section.product-overview.purpose-and-outcomes')!;
  config.workflow!.amendments = [{ id: 'custom-product-purpose', collection: 'sections', target: section.id, action: 'replace', value: { ...section, guidance: 'Repository-specific purpose and required operating outcomes.' }, reason: 'Accepted repository-owned documentation convention', source: 'user:fixture:custom-overview' }];
  const result = initializationProduct({ root, config, answers: document, sourceRoot });
  assert.equal(result.ready, true, result.unresolved.join('; '));
  assert.match(result.artifacts.find(artifact => artifact.id === 'artifact.product-overview')!.content!, /Repository-specific purpose/);
  assert.deepEqual(fs.readdirSync(root), []);
});
test('multi-product setup asks for an actual selected product and does not create a competing product home', () => {
  const root = rootFixture(), config = structuredClone(locateDistribution(sourceRoot).config), document = answers();
  config.documentation!.owners = [{ id: 'alpha', role: 'product', path: 'docs/internal/products/alpha' }, { id: 'beta', role: 'product', path: 'docs/internal/products/beta' }];
  const ambiguous = initializationProduct({ root, config, answers: document, sourceRoot });
  assert.equal(ambiguous.ready, false); assert.ok(ambiguous.questions.some(question => question.fact === 'id'));
  document.answers['product.id'] = 'beta'; document.answers['product.title'] = 'Beta library'; document.answers['product.purpose'] = 'Serve the selected beta consumers.';
  const selected = initializationProduct({ root, config, answers: document, sourceRoot });
  assert.equal(selected.ready, true, selected.unresolved.join('; '));
  assert.equal(selected.artifacts[0].path, 'docs/internal/products/beta/product.overview.md');
  assert.ok(!selected.plan!.operations.some(operation => operation.path.includes('/alpha/'))); assert.deepEqual(fs.readdirSync(root), []);
});
