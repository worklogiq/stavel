import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkPolicy, validateDocumentFilename, analyzeDocumentationImpact, parseChangesetAttestation, findMojibakeInText, compareImageReviewManifests } from './policy.service.js';
import type { PolicyConfig } from './policy.types.js';

const fixture = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'stavel-policy-'));
function write(root: string, name: string, content: string): void {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
const document = (body = '', fields = ''): string => `# Example\n\n<!-- mdcomposer:meta\ntitle: Example\nkind: guide\nstate: draft\naudience: internal\nowner: maintainer\nupdated: 2026-11-25\n${fields}-->\n\n${body}`;
const baseConfig = (): PolicyConfig => ({ documentation: { roots: ['docs'], naming: { shape: 'typed', identifierCase: 'kebab' }, kinds: ['guide', 'philosophy'], states: ['draft', 'accepted', 'active', 'complete', 'deprecated'] }, rules: { 'doc-archive': false } });

test('public default filename validation agrees with every declared kind, including story', () => {
  const profile = JSON.parse(fs.readFileSync(path.resolve('config/default.profile.json'), 'utf8'));
  assert.ok(profile.documentation.kinds.includes('story'));
  for (const kind of profile.documentation.kinds) assert.deepEqual(validateDocumentFilename(`sample.${kind}.md`), [], kind);
  assert.notDeepEqual(validateDocumentFilename('sample.unregistered-kind.md'), []);
});

test('typed and plain naming represent casing independently and preserve fixed host names', () => {
  for (const [identifierCase, identifier] of [['camel', 'someTopic'], ['snake', 'some_topic'], ['kebab', 'some-topic'], ['pascal', 'SomeTopic'], ['any', 'Some_mixed-Topic']] as const) {
    assert.deepEqual(validateDocumentFilename(`${identifier}.guide.md`, { shape: 'typed', identifierCase }, ['guide']), []);
    assert.deepEqual(validateDocumentFilename(`${identifier}.md`, { shape: 'plain', identifierCase }), []);
  }
  assert.ok(validateDocumentFilename('SomeTopic.guide.md', { identifierCase: 'kebab' }, ['guide']).length);
  assert.ok(validateDocumentFilename('topic.Guide.md', {}, ['guide']).length);
  assert.ok(validateDocumentFilename('topic.unknown.md', {}, ['guide']).length);
  assert.deepEqual(validateDocumentFilename('README.md'), []);
  assert.deepEqual(validateDocumentFilename('SKILL.md', { allowedNames: ['SKILL.md'] }), []);
  assert.deepEqual(validateDocumentFilename('topic.integration.contract.md', { legacyKinds: ['integration.contract'] }, ['contract']), []);
  assert.deepEqual(validateDocumentFilename('frontdoor.slice-02-jobs.execution-prompt.md', { typePatterns: ['^[a-z0-9-]+\\.execution-prompt$'] }, ['execution-prompt']), []);
  assert.ok(validateDocumentFilename('FrontDoor.slice-02-jobs.execution-prompt.md', { typePatterns: ['^[a-z0-9-]+\\.execution-prompt$'] }, ['execution-prompt']).length);
});

test('well formed canonical docs pass, required metadata and lifecycle are enforced', async () => {
  const root = fixture();
  write(root, 'docs/example.guide.md', document());
  assert.equal((await checkPolicy({ root, config: baseConfig() })).ok, true);
  write(root, 'docs/example.guide.md', '# Missing metadata\n');
  const missing = await checkPolicy({ root, config: baseConfig() });
  assert.equal(missing.ok, false);
  assert.ok(missing.diagnostics.some(item => item.message.includes('state')));
  write(root, 'docs/example.guide.md', document().replace('state: draft', 'state: archived'));
  assert.ok((await checkPolicy({ root, config: baseConfig() })).diagnostics.some(item => item.ruleId === 'doc-states'));
});

test('an accepted label without an acceptance reference fails structural metadata validation', async () => {
  const root = fixture();
  write(root, 'docs/example.guide.md', document().replace('state: draft', 'state: accepted'));
  assert.ok((await checkPolicy({ root, config: baseConfig() })).diagnostics.some(item => item.message.includes('acceptance record')));
  write(root, 'docs/example.guide.md', document('', 'acceptance: User decision 2026-11-25\n').replace('state: draft', 'state: accepted'));
  assert.equal((await checkPolicy({ root, config: baseConfig() })).ok, true);
});

test('lifecycle, audience and acceptance records cannot masquerade as YAML arrays', async () => {
  const root = fixture();
  write(root, 'docs/example.guide.md', document().replace('state: draft', 'state: [draft]').replace('audience: internal', 'audience: [internal]'));
  const result = await checkPolicy({ root, config: baseConfig() });
  assert.ok(result.diagnostics.some(item => item.ruleId === 'doc-states'));
  assert.ok(result.diagnostics.some(item => item.ruleId === 'doc-audience'));
  write(root, 'docs/example.guide.md', document('', 'acceptance: []\n').replace('state: draft', 'state: accepted'));
  assert.ok((await checkPolicy({ root, config: baseConfig() })).diagnostics.some(item => item.message.includes('acceptance record')));
});

test('public reference links to internal documents are checked, code examples are ignored', async () => {
  const root = fixture();
  write(root, 'docs/private.guide.md', document());
  write(root, 'docs/public.guide.md', document('[Private][p]\n\n[p]: ./private.guide.md\n').replace('audience: internal', 'audience: public'));
  assert.ok((await checkPolicy({ root, config: baseConfig() })).diagnostics.some(item => item.ruleId === 'doc-audience'));
  write(root, 'docs/public.guide.md', document('```md\n[Example](./private.guide.md)\n```\n').replace('audience: internal', 'audience: public'));
  assert.equal((await checkPolicy({ root, config: baseConfig() })).ok, true);
});

test('public composition cannot import internal content and fenced directives remain examples', async () => {
  const root = fixture();
  write(root, 'docs/private.guide.md', document('Internal content.'));
  write(root, 'docs/public.guide.md', document('<!-- @embed(./private.guide.md) -->\n').replace('audience: internal', 'audience: public'));
  const result = await checkPolicy({ root, config: baseConfig() });
  assert.equal(result.ok, false);
  assert.ok(result.diagnostics.some(item => /audience|public|internal/i.test(item.message)));
  write(root, 'docs/public.guide.md', document('```md\n<!-- @embed(./private.guide.md) -->\n```\n').replace('audience: internal', 'audience: public'));
  assert.equal((await checkPolicy({ root, config: baseConfig() })).ok, true);
});

test('archive publication policy keeps historical internal records out of public output', async () => {
  const root = fixture();
  const config = baseConfig();
  config.rules!['doc-archive'] = true;
  config.documentation!.archive = { root: 'docs/_archive' };
  write(root, 'docs/_archive/old.guide.md', document().replace('state: draft', 'state: complete').replace('audience: internal', 'audience: public'));
  assert.equal((await checkPolicy({ root, config })).ok, false);
});

test('historical links need an explicitly labeled historical section', async () => {
  const root = fixture();
  const config = baseConfig();
  config.rules!['doc-archive'] = true;
  config.documentation!.archive = { root: 'docs/_archive', historicalHeading: 'Historical context (archived)' };
  write(root, 'docs/_archive/old.guide.md', document().replace('state: draft', 'state: complete'));
  write(root, 'docs/new.guide.md', document('[Old](./_archive/old.guide.md)\n'));
  assert.ok((await checkPolicy({ root, config })).diagnostics.some(item => item.ruleId === 'doc-archive'));
  write(root, 'docs/new.guide.md', document('## Historical context (archived)\n\n[Old](./_archive/old.guide.md)\n'));
  assert.equal((await checkPolicy({ root, config })).ok, true);
});

test('README checks are profile selected and report missing required sections', async () => {
  const root = fixture();
  const config = baseConfig();
  config.rules!.readme = { headings: ['Purpose', 'Commands'] };
  write(root, 'README.md', '# Package\n\n## Purpose\n');
  assert.ok((await checkPolicy({ root, config })).diagnostics.some(item => item.ruleId === 'readme' && item.message.includes('Commands')));
  write(root, 'README.md', '# Package\n\n## Purpose\n\n## Commands\n');
  assert.equal((await checkPolicy({ root, config })).ok, true);
});

test('docs impact remains an evidence review obligation with configurable severity', () => {
  const mappings = [{ domain: 'orders', source: ['src/orders/**'], docs: ['docs/orders/**'] }];
  const without = analyzeDocumentationImpact(['src/orders/submit.service.ts'], { mappings });
  assert.equal(without.warnings.length, 1);
  assert.equal(without.errors.length, 0);
  assert.equal(analyzeDocumentationImpact(['src/orders/submit.service.ts'], { mappings, strict: true }).errors.length, 1);
  assert.equal(analyzeDocumentationImpact(['src/orders/submit.service.ts', 'docs/orders/orders.design.md'], { mappings }).warnings.length, 0);
  const attestation = parseChangesetAttestation('review.md', 'Docs-reviewed: orders\nDocs-needed: no\nReason: Internal refactoring only\n');
  assert.equal(analyzeDocumentationImpact(['src/orders/submit.service.ts'], { mappings, attestations: [attestation] }).warnings.length, 0);
  assert.ok(parseChangesetAttestation('review.md', 'Docs-reviewed: orders\nDocs-needed: no\n').errors.length);
});

test('encoding detection handles corruption while retaining valid Unicode punctuation', () => {
  assert.equal(findMojibakeInText('Healthy curly quotes “yes” and em dashes — remain valid.').length, 0);
  assert.ok(findMojibakeInText(`Broken ${String.fromCodePoint(0xfffd)}`).some(item => item.code === 'replacement-character'));
  assert.ok(findMojibakeInText(String.fromCodePoint(0xc3, 0xa2, 0xe2, 0x201a, 0xac, 0xe2, 0x20ac, 0x9d)).length);
});

test('optional code rules report AST behavior without reading comments as code', async () => {
  const root = fixture();
  write(root, 'src/example.component.tsx', `// error.message and fetch('x') are documentation\nexport const Example = () => <button title="Save">Save</button>;\n`);
  const config: PolicyConfig = { documentation: { roots: [] }, rules: { 'frontend-i18n-copy': true, 'frontend-error-surfaces': true, 'api-client-usage': true } };
  const result = await checkPolicy({ root, config });
  assert.equal(result.diagnostics.filter(item => item.ruleId === 'frontend-i18n-copy').length, 2);
  assert.equal(result.diagnostics.filter(item => item.ruleId === 'frontend-error-surfaces').length, 0);
  assert.equal(result.diagnostics.filter(item => item.ruleId === 'api-client-usage').length, 0);
});

test('API transport checks support aliased imports and named query callbacks', async () => {
  const root = fixture();
  const config: PolicyConfig = { documentation: { roots: [] }, rules: { 'api-client-usage': { apiClientModule: '@example/api', requireQueryCallbacks: true } } };
  write(root, 'src/example.service.ts', `import { useQuery as query } from '@tanstack/react-query';\nimport { list as load } from '@example/api';\nconst callback = () => load();\nquery({queryFn: callback});\n`);
  assert.equal((await checkPolicy({ root, config })).ok, true);
  write(root, 'src/example.service.ts', `import {list} from '@example/api';\nlist();\nfetch('/orders');\n`);
  assert.equal((await checkPolicy({ root, config })).diagnostics.filter(item => item.ruleId === 'api-client-usage').length, 2);
});

test('source naming is separately scoped and documentation casing never renames source', async () => {
  const root = fixture();
  const original = 'export const thing = 1;\n';
  write(root, 'src/SomeFeature.service.ts', original);
  const config: PolicyConfig = { documentation: { roots: [], naming: { identifierCase: 'kebab' } }, source: { roots: ['src'], naming: { identifierCase: 'pascal' } }, rules: { 'source-naming': true } };
  assert.equal((await checkPolicy({ root, config })).ok, true);
  assert.equal(fs.readFileSync(path.join(root, 'src/SomeFeature.service.ts'), 'utf8'), original);
});

test('image evidence reports hash and dimension drift without claiming visual correctness', () => {
  const shot = { key: 'screen', variant: 'desktop', path: 'screen.png', sha256: 'old', dimensions: { width: 100, height: 200 } };
  const findings = compareImageReviewManifests({ screenshots: [shot] }, { variants: ['desktop'], screenshots: [{ ...shot, sha256: 'new', dimensions: { width: 120, height: 200 } }] }, { requiredVariants: ['desktop'] });
  assert.deepEqual(findings.map(item => item.type), ['changed-hash', 'changed-dimension']);
});

test('scoped source naming applies nested conventions and preserves explicit rule boundaries', async () => {
  const root = fixture();
  write(root, 'src/GoodName.service.ts', 'export const value = 1;\n');
  write(root, 'src/components/MyButton.tsx', 'export const value = 1;\n');
  write(root, 'scripts/my_tool.ts', 'export const value = 1;\n');
  const config: PolicyConfig = { documentation: { roots: [] }, source: {
    roots: ['src'], naming: { shape: 'typed', identifierCase: 'kebab' },
    scopes: {
      src: { language: 'typescript', naming: { identifierCase: 'pascal' } },
      'src/components': { naming: { shape: 'plain', identifierCase: 'pascal' } },
      scripts: { naming: { shape: 'plain', identifierCase: 'snake' } },
    },
  }, rules: { 'source-naming': true } };
  assert.equal((await checkPolicy({ root, config })).ok, true);
  write(root, 'src/components/bad_name.tsx', 'export const value = 1;\n');
  assert.equal((await checkPolicy({ root, config })).diagnostics.filter(item => item.ruleId === 'source-naming').length, 1);
  config.source!.scopes!['src/components'].rules = { 'source-naming': false };
  assert.equal((await checkPolicy({ root, config })).ok, true);
  config.rules!['source-naming'] = { roots: ['scripts'] };
  write(root, 'src/invalid_name.service.ts', 'export const value = 1;\n');
  assert.equal((await checkPolicy({ root, config })).ok, true);
});
