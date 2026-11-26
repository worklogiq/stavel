import { matchesAny, posix } from './shared.service.js';

export interface ImpactMapping { domain: string; source: string[]; docs: string[] }
export interface DocsAttestation { filePath: string; domains: string[]; fields: Record<string, string>; errors: string[] }
export interface ImpactOptions {
  mappings?: ImpactMapping[];
  attestations?: DocsAttestation[];
  ignored?: string[];
  servedDocs?: string[];
  strict?: boolean;
  requireChangesetForServedDocs?: boolean;
}

export function parseChangesetAttestation(filePath: string, contents: string): DocsAttestation {
  const fields: Record<string, string> = {};
  const errors: string[] = [];
  const body = contents.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*/, '');
  for (const line of body.split(/\r?\n/)) {
    const match = line.match(/^\s*(Docs-reviewed|Docs-needed|Docs-updated|Reason):\s*(.*?)\s*$/i);
    if (!match) continue;
    const key = match[1].toLowerCase();
    if (Object.hasOwn(fields, key)) errors.push(`${filePath}: duplicate ${match[1]} attestation field.`);
    fields[key] = match[2];
  }
  const domains = (fields['docs-reviewed'] ?? '').split(',').map(item => item.trim()).filter(Boolean);
  if (Object.keys(fields).length) {
    if (!domains.length) errors.push(`${filePath}: Docs-reviewed must list at least one docs-impact domain.`);
    const needed = fields['docs-needed']?.toLowerCase();
    if (needed && !['yes', 'no', 'deferred'].includes(needed)) errors.push(`${filePath}: Docs-needed must be yes, no, or deferred.`);
    if (needed === 'yes' && !fields['docs-updated']) errors.push(`${filePath}: Docs-updated is required when Docs-needed is yes.`);
    if (['no', 'deferred'].includes(needed ?? '') && !fields.reason) errors.push(`${filePath}: Reason is required when documentation is not updated.`);
  }
  return { filePath, domains, fields, errors };
}

export function analyzeDocumentationImpact(changedFiles: string[], options: ImpactOptions = {}) {
  const changed = changedFiles.map(posix).filter(file => !matchesAny(file, options.ignored ?? []));
  const attestations = options.attestations ?? [];
  const errors = attestations.flatMap(attestation => attestation.errors);
  const warnings: string[] = [];
  const servedDocChanges = changed.filter(file => matchesAny(file, options.servedDocs ?? []));
  if (options.requireChangesetForServedDocs && servedDocChanges.length && !changed.some(file => file.startsWith('.changeset/') && file.endsWith('.md') && file !== '.changeset/README.md')) {
    warnings.push(`Served documentation changed without a Changeset: ${servedDocChanges.join(', ')}. Add a Changeset because docs are a publishable artifact.`);
  }
  for (const mapping of options.mappings ?? []) {
    const sources = changed.filter(file => matchesAny(file, mapping.source));
    const attested = attestations.some(item => item.domains.includes(mapping.domain) && item.errors.length === 0 && (
      item.fields['docs-needed']?.toLowerCase() === 'yes' ? Boolean(item.fields['docs-updated']) :
      ['no', 'deferred'].includes(item.fields['docs-needed']?.toLowerCase() ?? '') ? Boolean(item.fields.reason) : false));
    if (sources.length && !changed.some(file => matchesAny(file, mapping.docs)) && !attested) {
      warnings.push(`Docs impact review needed for ${mapping.domain}: changed ${sources.join(', ')} but no mapped docs changed and no Changeset attestation was found.`);
    }
  }
  return { warnings, errors: options.strict ? [...errors, ...warnings] : errors, attestations, servedDocChanges };
}
