import fs from 'node:fs';
import path from 'node:path';
import type { CheckResult, Diagnostic, FrameworkConfig } from './framework.types.js';
import { contained, digest, fileBytes, readJson, Refused, targetRoot, walkFiles } from './filesystem.service.js';
import { loadManifest } from './decisions.service.js';
import { locateDistribution } from './distribution.service.js';
import { markdownLinks } from './markdown.service.js';
import { DEFAULT_ENTRYPOINTS } from './planning.service.js';
import { checkPolicy } from './rules/policy.service.js';

export async function checkRepository(options: { root: string; config?: FrameworkConfig; frameworkPath?: string; sourceRoot?: string }): Promise<CheckResult> {
  const root = targetRoot(options.root);
  const manifest = loadManifest(root);
  const distribution = locateDistribution(options.sourceRoot);
  const configBytes = fileBytes(root, 'stavel.config.json');
  const config = options.config ?? (configBytes ? readJson<FrameworkConfig>(contained(root, 'stavel.config.json')) : distribution.config);
  const diagnostics: Diagnostic[] = [];
  const notes: string[] = [];
  const entrypoints = manifest?.entrypoints as typeof DEFAULT_ENTRYPOINTS | undefined ?? distribution.catalog.entrypoints ?? DEFAULT_ENTRYPOINTS;
  if (manifest && options.frameworkPath && options.frameworkPath !== manifest.framework_path) throw new Refused('--framework-path conflicts with the installed manifest');
  const required = [entrypoints.index, entrypoints.constitution, entrypoints.profile];
  for (const name of required) if (!fileBytes(root, name)) diagnostics.push({ ruleId: 'framework-structure', severity: 'error', path: name, message: 'missing required framework file' });
  const markdown = walkFiles(root).filter(name => name.endsWith('.md'));
  for (const name of markdown) {
    if (name.includes('/templates/')) continue;
    const text = fileBytes(root, name)!.toString('utf8');
    if (/\{\{[A-Z_]+\}\}/.test(text)) diagnostics.push({ ruleId: 'framework-tokens', severity: 'error', path: name, message: 'unresolved template token in a canonical document' });
    diagnostics.push(...markdownLinks(root, name, text).diagnostics);
  }
  const rootAgents = fileBytes(root, 'AGENTS.md');
  const rootTargets = rootAgents ? markdownLinks(root, 'AGENTS.md', rootAgents.toString('utf8')).targets : [];
  for (const requiredTarget of [entrypoints.index, entrypoints.constitution]) if (!rootTargets.includes(requiredTarget)) diagnostics.push({ ruleId: 'framework-routing', severity: 'error', path: 'AGENTS.md', message: `root AGENTS.md must link to ${requiredTarget}; companion routing may still need integration` });
  if (manifest) {
    for (const [name, expected] of Object.entries(manifest.files as Record<string, string>)) {
      const bytes = fileBytes(root, name);
      if (!bytes) diagnostics.push({ ruleId: 'framework-manifest', severity: 'error', path: name, message: 'installed file missing' });
      else if (digest(bytes) !== expected) notes.push(name === entrypoints.profile ? `local profile customized; review its status, owners, and decisions: ${name}` : `locally modified; review as amendment: ${name}`);
    }
    notes.push('Profile acceptance and semantic conformance require review; this check is structural.');
  }
  const policy = await checkPolicy({ root, config: config as never });
  diagnostics.push(...policy.diagnostics);
  return { ok: !diagnostics.some(item => item.severity === 'error'), diagnostics, notes };
}
