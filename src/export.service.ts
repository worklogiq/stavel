import fs from 'node:fs';
import path from 'node:path';
import type { AssetCatalog } from './framework.types.js';
import { locateDistribution } from './distribution.service.js';
import { contained, digest, fileBytes, jsonText, Refused, targetRoot, validateDestinations, walkFiles, writeExclusive } from './filesystem.service.js';
import { rewriteMarkdownLinks } from './markdown.service.js';

export function exportSkill(options: { output: string; sourceRoot?: string; dryRun?: boolean }): { ok: true; output: string; created: string[]; reused: string[] } {
  const distribution = locateDistribution(options.sourceRoot);
  const source = distribution.root;
  const output = targetRoot(options.output);
  const skillDirectory = distribution.catalog.skill?.source ?? 'skills/stavel';
  if (!fs.existsSync(contained(source, skillDirectory))) throw new Refused('export from the source package so skill metadata and provenance have one owner');
  const files = new Map<string, Buffer>();
  const catalog: AssetCatalog = structuredClone(distribution.catalog);
  const mapping: Record<string, string> = {};
  for (const asset of catalog.assets) {
    const bytes = fileBytes(source, asset.source);
    if (!bytes) throw new Refused(`missing portable source asset: ${asset.source}`);
    const name = `assets/framework/${asset.source}`;
    files.set(name, bytes); mapping[asset.source] = name;
  }
  for (const filename of ['config/default.profile.json', 'config/decisions.catalog.json']) {
    const bytes = fileBytes(source, filename);
    if (bytes) files.set(`assets/framework/${filename}`, bytes);
  }
  files.set('assets/framework/config/assets.catalog.json', Buffer.from(jsonText(catalog)));
  files.set('assets/framework/VERSION', Buffer.from(`${distribution.version}\n`));
  files.set('assets/VERSION', Buffer.from(`${distribution.version}\n`));
  const license = fileBytes(source, 'LICENSE');
  if (!license) throw new Refused('upstream license is missing');
  files.set('LICENSE', license); files.set('assets/framework/LICENSE', license);
  for (const filename of walkFiles(source, skillDirectory, { includeHidden: true })) files.set(filename.slice(skillDirectory.length + 1), fileBytes(source, filename)!);
  const cli = fileBytes(source, 'dist/stavel.cli.cjs');
  if (!cli) throw new Refused('built CLI is missing; run npm run build before exporting the standalone skill');
  files.set('scripts/stavel.cli.cjs', cli);
  const markdownCli = fileBytes(source, 'dist/mdcomposer.cli.cjs');
  if (!markdownCli) throw new Refused('packaged mdcomposer CLI is missing; run npm run build before exporting');
  files.set('scripts/mdcomposer.cli.cjs', markdownCli);
  for (const name of walkFiles(source, 'dist')) {
    if (name.endsWith('.LEGAL.txt') || path.posix.basename(name) === 'THIRD-PARTY-NOTICES.txt') files.set(`scripts/${path.posix.basename(name)}`, fileBytes(source, name)!);
  }
  const originsPath = 'docs/internal/dev/framework-origins.overview.md';
  const origins = fileBytes(source, originsPath);
  if (origins) files.set('ORIGINS.md', Buffer.from(rewriteMarkdownLinks(origins.toString('utf8'), originsPath, 'ORIGINS.md', mapping)));
  files.set('assets/manifest.json', Buffer.from(jsonText({ product: 'stavel', framework_version: distribution.version, profile_version: `${distribution.config.id ?? 'default'}@${distribution.config.version ?? 1}`, files: Object.fromEntries([...files].map(([name, data]) => [name, digest(data)])) })));
  validateDestinations([...files.keys()]);
  const created: string[] = [];
  const reused: string[] = [];
  for (const [name, content] of files) {
    const existing = fileBytes(output, name);
    if (existing) {
      if (!existing.equals(content)) throw new Refused(`no files written; differing export destination requires review: ${name}`);
      reused.push(name);
    } else created.push(name);
  }
  if (!options.dryRun) {
    for (const name of created) {
      try { writeExclusive(output, name, files.get(name)!); }
      catch (error) { throw new Refused(`export stopped at ${name}; earlier writes may remain, inspect before retrying: ${(error as Error).message}`); }
    }
  }
  return { ok: true, output, created, reused };
}
