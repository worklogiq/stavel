import path from 'node:path';
import type { NamingCase, NamingConvention } from './framework.types.js';
import { Refused } from './filesystem.service.js';

export const fixedFilenames = new Set(['README.md', 'index.md', 'AGENTS.md', 'SKILL.md', 'LICENSE', 'VERSION', 'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'tsconfig.json', 'openai.yaml']);
const words = (value: string): string[] => value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2').split(/[-_\s]+/).filter(Boolean).map(part => part.toLowerCase());
const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);
export function identifier(value: string, convention: NamingCase): string {
  if (convention === 'any') return value;
  const pieces = words(value);
  if (!pieces.length) throw new Refused('filename identifier cannot be empty');
  if (convention === 'snake') return pieces.join('_');
  if (convention === 'kebab') return pieces.join('-');
  if (convention === 'pascal') return pieces.map(capitalize).join('');
  return pieces[0] + pieces.slice(1).map(capitalize).join('');
}
export function documentFilename(id: string, kind: string, convention: NamingConvention): string {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(kind)) throw new Refused(`document kind must be kebab-case: ${kind}`);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Refused(`invalid document identifier: ${id}`);
  const name = identifier(id, convention.identifierCase === 'any' ? convention.generatedIdentifierCase ?? 'kebab' : convention.identifierCase);
  return convention.shape === 'typed' ? `${name}.${kind}.md` : `${name}.md`;
}
export function renameDocument(name: string, convention: NamingConvention, knownKinds: string[] = []): string {
  const filename = path.posix.basename(name);
  if (fixedFilenames.has(filename)) return name;
  const stem = filename.replace(/\.md$/i, '');
  const segments = stem.split('.');
  const kind = segments.length > 1 ? segments.slice(1).join('-') : 'overview';
  if (knownKinds.length && !knownKinds.includes(kind)) throw new Refused(`document kind needs an explicit mapping: ${name} (${kind})`);
  const filenameResult = convention.identifierCase === 'any' ? convention.shape === 'typed' ? `${segments[0]}.${kind}.md` : `${segments[0]}.md` : documentFilename(segments[0], kind, convention);
  return path.posix.join(path.posix.dirname(name), filenameResult);
}
