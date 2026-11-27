import fs from 'node:fs';
import path from 'node:path';
import type { CheckResult, Diagnostic, FrameworkConfig } from './framework.types.js';
import { contained, digest, fileBytes, readJson, Refused, targetRoot, walkFiles } from './filesystem.service.js';
import { loadManifest } from './decisions.service.js';
import { locateDistribution } from './distribution.service.js';
import { markdownLinks } from './markdown.service.js';
import { DEFAULT_ENTRYPOINTS } from './planning.service.js';
import { checkPolicy, listRules } from './rules/policy.service.js';
import { parseMetadata } from '@worklogiq/mdcomposer';
import { packagedConfigurationDefinitions, resolveRepositoryConfiguration, type ConfigurationAmendment } from './configuration.service.js';

export async function checkRepository(options: { root: string; config?: FrameworkConfig; frameworkPath?: string; sourceRoot?: string; scope?: string; taskAmendments?: ConfigurationAmendment[] }): Promise<CheckResult> {
  const root = targetRoot(options.root);
  const manifest = loadManifest(root);
  const distribution = locateDistribution(options.sourceRoot);
  const resolved = resolveRepositoryConfiguration({ root, packagedBaseline: distribution.config, packagedDefinitions: packagedConfigurationDefinitions(distribution), explicitConfig: options.config, scope: options.scope, taskAmendments: options.taskAmendments });
  const config = structuredClone(resolved.config);
  config.rules ??= {};
  for (const id of Object.keys(config.rules)) if (!resolved.definitions.checks?.[id]) config.rules[id] = false;
  const available = new Set(listRules().map(rule => rule.id));
  for (const definition of Object.values(resolved.definitions.checks ?? {})) {
    const id = String(definition.ruleId ?? definition.id);
    if (!available.has(id) && definition.options !== false && !(definition.options && typeof definition.options === 'object' && (definition.options as { enabled?: boolean }).enabled === false)) throw new Refused(`configured check is unavailable: ${id}`);
    config.rules[id] = definition.options ?? { enabled: true };
  }
  const diagnostics: Diagnostic[] = [];
  const notes: string[] = [];
  const storyTemplate = config.workflow?.stories?.template;
  const validArtifactTemplates = new Set<string>();
  for (const artifact of Object.values(resolved.definitions.artifacts ?? {})) {
    if (artifact.templateSource !== 'repository' || typeof artifact.template !== 'string') continue;
    const bytes = fileBytes(root, artifact.template);
    if (!bytes || parseMetadata(bytes.toString('utf8')).data.kind !== 'template') diagnostics.push({ ruleId: 'artifact-template', severity: 'error', path: artifact.template, message: 'configured repository artifact template must exist and declare kind: template' });
    else validArtifactTemplates.add(artifact.template);
  }
  let validStoryTemplate: string | undefined;
  if (storyTemplate) {
    const bytes = fileBytes(root, storyTemplate);
    if (!bytes || parseMetadata(bytes.toString('utf8')).data.kind !== 'template') diagnostics.push({ ruleId: 'story-template', severity: 'error', path: storyTemplate, message: 'configured story template must exist and declare kind: template' });
    else validStoryTemplate = storyTemplate;
  }
  const entrypoints = manifest?.entrypoints as typeof DEFAULT_ENTRYPOINTS | undefined ?? distribution.catalog.entrypoints ?? DEFAULT_ENTRYPOINTS;
  if (manifest && options.frameworkPath && options.frameworkPath !== manifest.framework_path) throw new Refused('--framework-path conflicts with the installed manifest');
  const required = [entrypoints.index, entrypoints.constitution, entrypoints.profile];
  for (const name of required) if (!fileBytes(root, name)) diagnostics.push({ ruleId: 'framework-structure', severity: 'error', path: name, message: 'missing required framework file' });
  const markdown = walkFiles(root).filter(name => name.endsWith('.md'));
  for (const name of markdown) {
    if (name.includes('/templates/') || name === validStoryTemplate || validArtifactTemplates.has(name)) continue;
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
