import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AssetCatalog, Distribution, FrameworkConfig, Question } from './framework.types.js';
import { contained, readJson, Refused, targetRoot } from './filesystem.service.js';

export function locateDistribution(sourceRoot?: string): Distribution {
  const moduleDirectory = typeof __dirname === 'string' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
  const candidates = sourceRoot ? [sourceRoot] : [
    path.resolve(moduleDirectory, '..', 'assets', 'framework'), path.resolve(moduleDirectory, '..'),
    path.resolve(moduleDirectory, '..', '..'), path.resolve(path.dirname(process.argv[1] ?? '.'), '..', 'assets', 'framework'), process.cwd(),
  ];
  for (const candidate of candidates) {
    const root = targetRoot(candidate);
    const catalogFile = contained(root, 'config/assets.catalog.json');
    if (!fs.existsSync(catalogFile)) continue;
    const catalog = readJson<AssetCatalog>(catalogFile);
    if (catalog.product !== 'stavel' || catalog.schemaVersion !== 1 || !Array.isArray(catalog.assets)) throw new Refused('unsupported Stavel assets catalog; expected product "stavel", schemaVersion 1 and assets array. Use the complete Stavel package or skill export.');
    for (const asset of catalog.assets) { contained(root, asset.source); contained(root, asset.target); }
    const config = readJson<FrameworkConfig>(contained(root, 'config/default.profile.json'));
    const questionCatalog = readJson<{ schemaVersion: number; questions?: Question[]; decisions?: Question[] }>(contained(root, 'config/decisions.catalog.json'));
    if (config.schemaVersion !== 1 || questionCatalog.schemaVersion !== 1) throw new Refused('unsupported profile or question catalog schema');
    const versionFile = contained(root, 'VERSION');
    const packageFile = contained(root, 'package.json');
    const version = fs.existsSync(versionFile) ? fs.readFileSync(versionFile, 'utf8').trim() : fs.existsSync(packageFile) ? readJson<{ version: string }>(packageFile).version : '0.1.0';
    return { root, catalog, config, questions: questionCatalog.questions ?? questionCatalog.decisions ?? [], version };
  }
  throw new Refused('framework assets are missing; use the full package or a self-contained skill export (or provide sourceRoot)');
}
