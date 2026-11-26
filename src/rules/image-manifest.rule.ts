export interface ScreenshotRecord {
  key?: string; audience?: string; variant?: string; path?: string; sha256?: string;
  dimensions?: { width: number; height: number };
}
export interface ImageManifest {
  schemaVersion?: number;
  guide?: string;
  variants?: (string | { key: string })[];
  screenshots?: ScreenshotRecord[];
  brokenLinks?: unknown[];
}
export const screenshotId = (entry: ScreenshotRecord): string => `${entry.variant}:${entry.key}`;
export const defaultRequiredVariants = ['desktop-dark', 'desktop-light', 'mobile-dark', 'mobile-light'];
export function normalizeManifest(manifest: ImageManifest) {
  return { ...manifest, variants: (manifest.variants ?? []).map(value => typeof value === 'string' ? value : value.key), screenshots: manifest.screenshots ?? [] };
}
export function validateBaselineManifest(manifest: ImageManifest): string[] {
  const errors: string[] = [];
  if (manifest.schemaVersion !== 1) errors.push('Baseline manifest schemaVersion must be 1.');
  if (!manifest.guide) errors.push('Baseline manifest must include guide.');
  if (!Array.isArray(manifest.variants)) errors.push('Baseline manifest must include variants array.');
  if (!Array.isArray(manifest.screenshots)) errors.push('Baseline manifest must include screenshots array.');
  for (const shot of manifest.screenshots ?? []) {
    if (!shot.key) errors.push('Baseline screenshot is missing key.');
    for (const field of ['variant', 'audience', 'path', 'sha256'] as const) if (!shot[field]) errors.push(`Baseline screenshot ${shot.key ?? '<unknown>'} is missing ${field}.`);
    if (!shot.dimensions?.width || !shot.dimensions?.height) errors.push(`Baseline screenshot ${shot.key ?? '<unknown>'} is missing dimensions.`);
  }
  return errors;
}
export function compareImageReviewManifests(baseline: ImageManifest, generated: ImageManifest, options: { requiredVariants?: string[] } = {}) {
  const findings: { type: string; id?: string; variant?: string; before?: unknown; after?: unknown; screenshot?: ScreenshotRecord; link?: unknown }[] = [];
  const next = normalizeManifest(generated);
  for (const variant of options.requiredVariants ?? defaultRequiredVariants) if (!next.variants.includes(variant)) findings.push({ type: 'missing-variant', variant });
  const before = new Map((baseline.screenshots ?? []).map(shot => [screenshotId(shot), shot]));
  const after = new Map(next.screenshots.map(shot => [screenshotId(shot), shot]));
  for (const [id, shot] of after) {
    const old = before.get(id);
    if (!old) { findings.push({ type: 'added', id, screenshot: shot }); continue; }
    if (!shot.path || !shot.sha256 || !shot.dimensions) { findings.push({ type: 'missing-file', id, screenshot: shot }); continue; }
    if (old.sha256 !== shot.sha256) findings.push({ type: 'changed-hash', id, before: old.sha256, after: shot.sha256 });
    if (!old.dimensions || old.dimensions.width !== shot.dimensions.width || old.dimensions.height !== shot.dimensions.height) findings.push({ type: 'changed-dimension', id, before: old.dimensions, after: shot.dimensions });
  }
  for (const [id, shot] of before) if (!after.has(id)) findings.push({ type: 'removed', id, screenshot: shot });
  for (const link of generated.brokenLinks ?? []) findings.push({ type: 'broken-link', link });
  return findings;
}
