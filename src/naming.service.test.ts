import test from 'node:test';
import assert from 'node:assert/strict';
import { documentFilename, identifier, renameDocument } from './naming.service.js';

test('identifier conversion preserves word boundaries across acronyms and source separator styles', () => {
  const input = 'HTTPServer_user-name';
  assert.equal(identifier(input, 'camel'), 'httpServerUserName');
  assert.equal(identifier(input, 'snake'), 'http_server_user_name');
  assert.equal(identifier(input, 'kebab'), 'http-server-user-name');
  assert.equal(identifier(input, 'pascal'), 'HttpServerUserName');
  assert.equal(identifier('Mixed_ID-kebab', 'any'), 'Mixed_ID-kebab');
  assert.throws(() => identifier('---___  ', 'kebab'), /cannot be empty/);
});

test('typed document names keep kebab-case roles separate from selected identifier casing', () => {
  assert.equal(documentFilename('HTTPServer', 'execution-slice', { shape: 'typed', identifierCase: 'camel' }), 'httpServer.execution-slice.md');
  assert.equal(documentFilename('HTTPServer', 'design', { shape: 'plain', identifierCase: 'snake' }), 'http_server.md');
  assert.equal(documentFilename('HTTPServer', 'design', { shape: 'typed', identifierCase: 'any', generatedIdentifierCase: 'pascal' }), 'HttpServer.design.md');
  assert.equal(documentFilename('HTTPServer', 'design', { shape: 'typed', identifierCase: 'any' }), 'http-server.design.md');
});

test('document generation refuses path-like IDs and invalid document roles', () => {
  for (const id of ['', '../escape', 'docs/topic', 'docs\\topic', 'has space', 'has.dot']) assert.throws(() => documentFilename(id, 'design', { shape: 'typed', identifierCase: 'kebab' }), /invalid document identifier/);
  for (const kind of ['', 'UpperCase', 'snake_case', 'has space', '-leading']) assert.throws(() => documentFilename('valid', kind, { shape: 'typed', identifierCase: 'kebab' }), /document kind must be kebab-case/);
});

test('renaming preserves required hosts, explicit kind mappings and mixed-case existing identifiers', () => {
  for (const filename of ['README.md', 'AGENTS.md', 'SKILL.md', 'index.md', 'package.json']) assert.equal(renameDocument(`docs/${filename}`, { shape: 'typed', identifierCase: 'pascal' }, ['design']), `docs/${filename}`);
  assert.equal(renameDocument('docs/User_Guide.md', { shape: 'typed', identifierCase: 'kebab' }, ['overview']), 'docs/user-guide.overview.md');
  assert.equal(renameDocument('docs/User_Guide.ui.design.md', { shape: 'typed', identifierCase: 'kebab' }, ['ui-design']), 'docs/user-guide.ui-design.md');
  assert.equal(renameDocument('docs/Mixed_ID.guide.md', { shape: 'typed', identifierCase: 'any' }, ['guide']), 'docs/Mixed_ID.guide.md');
  assert.equal(renameDocument('docs/Mixed_ID.guide.md', { shape: 'plain', identifierCase: 'any' }, ['guide']), 'docs/Mixed_ID.md');
  assert.throws(() => renameDocument('docs/topic.unknown.md', { shape: 'typed', identifierCase: 'kebab' }, ['guide']), /explicit mapping/);
});
