import path from 'node:path';
import { Refused, relativeName } from './filesystem.service.js';
import type { FrameworkConfig, TestLayout, TestingConfig, TestLayoutEvidence } from './framework.types.js';

const placements = new Set(['follow-repository', 'language-convention', 'colocated', 'separate', 'custom']);

function layout(value: unknown, scope: string): TestLayout {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Refused(`testing layout must be an object: ${scope}`);
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some(key => !['placement', 'roots', 'patterns'].includes(key))) throw new Refused(`unsupported testing layout field: ${scope}`);
  if (!placements.has(String(record.placement))) throw new Refused(`unsupported testing placement: ${scope}`);
  for (const field of ['roots', 'patterns']) {
    const items = record[field];
    if (items !== undefined) {
      if (!Array.isArray(items) || !items.length || items.some(item => typeof item !== 'string' || !item.trim())) throw new Refused(`testing ${field} must be a nonempty string array: ${scope}`);
      for (const item of items) relativeName(item);
    }
  }
  if (record.placement === 'custom' && (!record.roots || !record.patterns)) throw new Refused(`custom testing placement needs roots and patterns: ${scope}`);
  const result = structuredClone(record) as unknown as TestLayout;
  if (result.placement === 'separate' && !result.roots) result.roots = ['tests'];
  return result;
}

export function resolveTestingConfig(base: TestingConfig | undefined, selection?: unknown, details?: unknown): TestingConfig {
  const candidate = structuredClone(base ?? { placement: 'follow-repository', fallback: 'language-convention' }) as unknown as Record<string, unknown>;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new Refused('testing configuration must be an object');
  if (selection !== undefined && selection !== 'profile-default') {
    if (typeof selection !== 'string' || !placements.has(selection)) throw new Refused('unsupported testing placement answer');
    candidate.placement = selection;
  }
  if (details !== undefined) {
    if (!details || typeof details !== 'object' || Array.isArray(details) || Object.keys(details).some(key => !['roots', 'patterns', 'scopes'].includes(key))) throw new Refused('testing layout answers support roots, patterns and scopes');
    Object.assign(candidate, details);
  }
  if (Object.keys(candidate).some(key => !['placement', 'fallback', 'roots', 'patterns', 'scopes'].includes(key))) throw new Refused('unsupported testing configuration field');
  if (!['ask', 'language-convention'].includes(String(candidate.fallback))) throw new Refused('testing fallback must be ask or language-convention');
  const { fallback, scopes, ...top } = candidate;
  const result: TestingConfig = { ...layout(top, 'repository'), fallback: fallback as TestingConfig['fallback'] };
  if (scopes !== undefined) {
    if (!scopes || typeof scopes !== 'object' || Array.isArray(scopes)) throw new Refused('testing scopes must map relative source roots to layouts');
    const names = new Set<string>();
    result.scopes = Object.fromEntries(Object.entries(scopes).map(([root, value]) => { const name = relativeName(root); if (names.has(name)) throw new Refused(`conflicting normalized testing scope: ${name}`); names.add(name); return [name, layout(value, root)]; }));
  }
  return result;
}

export interface EffectiveTestingLayout { layout: TestLayout; fallback: TestingConfig['fallback']; source: 'repository' | 'scope'; scope?: string }
/** Scoped locations/patterns remain relative to the selected source scope. */
export function effectiveTestingLayout(config: TestingConfig | FrameworkConfig | undefined, scope?: string): EffectiveTestingLayout {
  const candidate = config && 'schemaVersion' in config ? config.testing : config as TestingConfig | undefined;
  const resolved = resolveTestingConfig(candidate); const { scopes, fallback, ...repository } = resolved;
  const selected = scope ? relativeName(scope) : undefined;
  const match = selected ? Object.keys(scopes ?? {}).filter(root => selected === root || selected.startsWith(`${root}/`)).sort((a, b) => b.length - a.length)[0] : undefined;
  return { layout: structuredClone(match ? scopes![match] : repository), fallback, source: match ? 'scope' : 'repository', ...(match ? { scope: match } : {}) };
}

export interface TestingRecommendationSource { language: string; toolchain?: string; layout: TestLayout; source: string }
export interface TestingLayoutRecommendation {
  state: 'configured' | 'proposal' | 'input-required'; layout?: TestLayout;
  source: 'accepted-configuration' | 'repository-evidence' | 'declared-guidance' | 'question';
  sources: string[]; evidence: TestLayoutEvidence; reason: string; needsAlignment: boolean;
}
/** Pure decision aid: declared guidance is evidence, never live-verified consensus. */
export function recommendTestingLayout(options: { config?: TestingConfig | FrameworkConfig; scope?: string; files?: string[]; evidence?: TestLayoutEvidence; language?: string; toolchain?: string; recommendations?: TestingRecommendationSource[] }): TestingLayoutRecommendation {
  const effective = effectiveTestingLayout(options.config, options.scope);
  const selected = options.scope ? relativeName(options.scope) : undefined;
  const names = selected ? (options.files ?? []).filter(name => { const normalized = name.replace(/\\/g, '/'); return normalized === selected || normalized.startsWith(`${selected}/`); }) : options.files ?? [];
  const evidence = structuredClone(options.evidence ?? inspectTestLayout(names));
  const result = (state: TestingLayoutRecommendation['state'], source: TestingLayoutRecommendation['source'], reason: string, proposal?: TestLayout, sources: string[] = []): TestingLayoutRecommendation => ({ state, source, sources, evidence, reason, needsAlignment: state !== 'configured', ...(proposal ? { layout: structuredClone(proposal) } : {}) });
  if (['colocated', 'separate', 'custom'].includes(effective.layout.placement)) return result('configured', 'accepted-configuration', 'Preserve the explicitly configured test layout; observations do not authorize moving existing tests.', effective.layout, [effective.scope ? `testing.scopes.${effective.scope}` : 'testing']);
  if (effective.layout.placement === 'follow-repository') {
    if (evidence.layout === 'colocated' || evidence.layout === 'separate') return result('proposal', 'repository-evidence', 'Existing consistent test locations support a repository convention proposal; align the actual roots/patterns before generation.', { placement: evidence.layout }, [...evidence.colocated, ...evidence.separate]);
    if (evidence.layout === 'mixed' || evidence.layout === 'unknown') return result('input-required', 'question', 'Existing test locations are mixed or uncertain; ask about their intended scopes instead of replacing them with a language default.');
    if (effective.fallback === 'ask') return result('input-required', 'question', 'No settled test layout was found and the configured fallback requires a question.');
  }
  const profile = options.config && 'schemaVersion' in options.config ? options.config as FrameworkConfig : undefined;
  const languages = profile?.source?.languages; const inferred = Array.isArray(languages) && languages.length === 1 ? String(languages[0]) : undefined;
  const aliases: Record<string, string> = { ts: 'typescript', js: 'javascript', py: 'python' };
  const language = options.language ?? inferred; const normalized = language ? aliases[language.toLowerCase()] ?? language.toLowerCase() : undefined;
  const candidates = (options.recommendations ?? []).filter(record => {
    if (!record || typeof record.source !== 'string' || !record.source.trim() || typeof record.language !== 'string' || !record.language.trim()) throw new Refused('test layout guidance requires explicit language and source');
    layout(record.layout, `guidance ${record.source}`);
    if (!['colocated', 'separate', 'custom'].includes(record.layout.placement)) throw new Refused('test layout guidance must propose a concrete layout');
    return (aliases[record.language.toLowerCase()] ?? record.language.toLowerCase()) === normalized && (!record.toolchain || record.toolchain.toLowerCase() === options.toolchain?.toLowerCase());
  });
  const specific = candidates.filter(record => record.toolchain); const applicable = specific.length ? specific : candidates;
  if (!normalized || !applicable.length) return result('input-required', 'question', 'No applicable source-backed language/toolchain convention is declared; ask rather than assume a community consensus.');
  if (new Set(applicable.map(record => JSON.stringify(layout(record.layout, record.source)))).size > 1) return result('input-required', 'question', 'Applicable language/toolchain guidance conflicts; align the repository policy before generating files.', undefined, applicable.map(record => record.source));
  return result('proposal', 'declared-guidance', 'This proposal uses explicitly supplied language/toolchain guidance; it does not install a language pack or accept the policy.', layout(applicable[0].layout, applicable[0].source), applicable.map(record => record.source));
}

export function inspectTestLayout(files: string[]): TestLayoutEvidence {
  const names = new Set(files.map(file => file.replace(/\\/g, '/')));
  const evidence: TestLayoutEvidence = { layout: 'none', colocated: [], separate: [], unclassified: [] };
  for (const name of [...names].sort()) {
    const filename = path.posix.basename(name);
    if (!/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(filename) && !/^test_.+\.py$|_test\.(?:py|go)$|Tests?\.(?:java|kt|cs)$/.test(filename)) continue;
    if (/(?:^|\/)(?:tests?|__tests__)(?:\/|$)/.test(name)) { evidence.separate.push(name); continue; }
    const sibling = filename.replace(/\.(?:test|spec)(\.[cm]?[jt]sx?)$/, '$1').replace(/^test_(.+\.py)$/, '$1').replace(/_test(\.(?:py|go))$/, '$1');
    const candidates = [path.posix.join(path.posix.dirname(name), sibling)];
    if (filename === 'package.test.ts') candidates.push(path.posix.join(path.posix.dirname(name), 'package.json'));
    if (candidates.some(candidate => candidate !== name && names.has(candidate))) evidence.colocated.push(name);
    else evidence.unclassified.push(name);
  }
  evidence.layout = evidence.colocated.length && evidence.separate.length ? 'mixed' : evidence.colocated.length ? 'colocated' : evidence.separate.length ? 'separate' : evidence.unclassified.length ? 'unknown' : 'none';
  return evidence;
}
