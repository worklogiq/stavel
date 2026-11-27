# Proposed contracts for the remaining execution packets

<!-- mdcomposer:meta
title: "Proposed contracts for the remaining execution packets"
kind: design
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Current acceptance

The owner accepted the eight consolidated recommendations. The [acceptance and amendments](./execution-acceptance.decision.md) record actual answers, reviewed digest, mandatory AI/nondeterminism warnings and overridable conventional-commit defaults. The proposal language below preserves its review history; the accepted amendments govern current execution.

## Purpose and acceptance boundary

The owner requested EXECUTE with subagents and one consolidated clarification batch while independent work continues. FND-01/FND-02/FND-03 use existing contracts. The remaining [scoped gates](./design-readiness.guide.md) need the concrete contracts below. These are recommended designs, not silent acceptance. They preserve all selected product hierarchy, mode, story, naming, test placement and authorization choices.

Two material selections remain: accept this configuration/persistence contract bundle or identify changes; and retain the substantial-feature design-PR gate or record a one-time reviewed-in-chat exception for this unpublished implementation. The selected default design-PR policy remains unchanged for future work. Neither selection grants commit, push, PR creation, merge, publication, application deployment or global host-skill replacement authority.

## Configuration and reproducible defaults: G-01/G-06

Use .stavel-config/stavel.config.json as a version-1 entrypoint, with versioned taxonomy, workflow, tooling and decisions topic references. Create only meaningful topics. Commit a baseline.profile.json snapshot and its digest alongside overrides, so a project remains reproducible offline even when a later package changes its bundled defaults. Package, profile, config, session and work-record versions remain independent.

```json
{
  "schemaVersion": 1,
  "baseline": {
    "id": "default",
    "version": 1,
    "path": "baseline.profile.json",
    "sha256": "actual digest of the committed selected baseline"
  },
  "topics": {
    "taxonomy": "taxonomy.config.json",
    "workflow": "workflow.config.json",
    "tooling": "tooling.config.json",
    "decisions": "decisions.config.json"
  }
}
```

Topic files carry their own schemaVersion. Taxonomy owns documentation roots/naming and semantic owner nodes; tooling owns source conventions, testing and selected rules; workflow owns story policy/template, packet selection, status routing and amendments; decisions contain stable decision IDs, values, scope and actual source/owner references. Detailed rationale stays linked to its canonical document. Template bodies remain repo-owned files, not JSON strings copied into several authorities.

Composition is baseline, repository settings, explicit capability/source scope, then task amendment. Current user instructions remain controlling. Merge defined object fields by schema, replace arrays, and use explicit stable-ID add/omit/replace operations for amendments. Conflicting same-scope replacements, removed targets or incompatible versions refuse with provenance. An omission never silently waives a required concern or defining mechanism.

Owner nodes have stable id, role, parent identity and actual path; roles include product, capability, feature, contract-topic and optional grouping. Preserve existing mapped platform/modules/edge layouts rather than inferring roles from depth or forcing product. Do not generate empty future capabilities. Artifact definitions carry stable roles/sections/questions and explicit coverage/omission of the agreed generic design families; language packs remain limited to what is actually implemented.

Keep root stavel.config.json supported. Two active competing config homes are a conflict; an explicit hash-bound migration can create the directory and retire the root record. Unknown legacy fields require a mapping/refusal, never a lossy move. Preserve story generation/template ownership, testing placement/scopes and local decisions. Baseline upgrades show a diff and preserve accepted local choices; there is no implicit remote fetch or executable extension hook.

## Scope, sessions and headless operation: G-02

Explicit --target wins. Otherwise inspect ancestor Stavel markers and package/workspace/Git evidence, select a unique supported boundary and ask when valid scopes compete. Non-Git projects are supported. Do not silently inherit nested config or expand a package operation to its entire workspace; explicit scoped mappings provide the initial inheritance mechanism.

Store resumable version-1 decision sessions in the user's OS cache outside an unaligned target: LOCALAPPDATA/Stavel on Windows, Library/Caches/stavel on macOS, XDG_CACHE_HOME/stavel or .cache/stavel elsewhere. Bind each record to canonical target identity, source/input hashes and catalog versions. Store needed decisions and provenance, not transcripts or credentials. Retain sessions until explicit cleanup; interruption never silently discards accepted answers. No expiration-based acceptance or automatic overwrite on stale resume.

Keep existing low-level output/exit contracts. New guided flows use 0 for completed success, 1 for refusal/failure and 2 for unresolved input. --json implies no interactive wait; --non-interactive never waits. Existing --answers automation remains valid. Terminal confirmation records the actual complete recap and response as alignment evidence; a preselected UI value or absent response does not count.

## Canonical work and writer recovery: G-03

Keep the registry reference-only and capability files authoritative for lifecycle/phase/mode/next action. Summaries are transient and include source provenance. Stable supported work schema version 2 distinguishes the current prototype version 1; implement an explicit preview/apply migration preserving identities, selected values and actual history. Unsupported versions refuse without overwrite. Migration may add a factual conversion event, never fabricated past decisions or completion.

Registry v2 retains schemaVersion and capabilities with id/statusFile. Capability v2 retains capabilityId/title/owner/updated and items with stable identity, status, phase, mode, implementation status, owner-record/tracker references, next action, blockers and history. Configured vocabularies can extend modes/phases deliberately. Status, document acceptance, readiness and slice result remain separate. Paths resolve relative to their record and must stay inside the repo without symlink escapes.

New work commands provide list/create/update/migrate and explicit recovery. Readers never mutate. Writers validate every affected source/destination, acquire an exclusive repository writer lock, recheck hashes under the lock and use journaled transitions. Per-file temporary writes/rename do not imply a multi-file transaction. Refuse concurrent/stale writes; never steal an uncertain lock automatically. Dry-run creates neither target records, locks nor journals. Runtime locks/journals stay separate from committed policy under the runtime area; cleanup/recovery is explicit. Identical updates do not manufacture timestamps/history changes.

## Diagnosis, repairs and effects: G-04

Initial deterministic repairs are limited to restoring a missing pinned framework asset, refreshing explicitly owned generated blocks, rebasing links from an explicit accepted path map and applying a supported configuration/schema migration. Each has a concrete hash-bound preview, preserved amendments, actual authorization and existing refusal/recovery semantics. Editable templates are seeded only when missing and never overwritten.

Do not infer acceptance/owners/content or rewrite requirements, application source or lifecycle completion as autofix. Packaged checks are the default; detecting a repository script does not execute it. The CLI does not gain an arbitrary target-script runner in this increment. An agent can use actual task-authorized verification commands after inspecting their effects, recording unavailable evidence when those effects are outside scope.

Finding states distinguish passed, failed, skipped/not-applicable, unavailable and review-required. Severity and evidence are separate. A missing required semantic review cannot become a healthy/complete result. Doctor reports first and offers a repair preview; decline preserves bytes.

## Packet identities, lifecycle and archival: G-05

Use one versioned packet manifest for packet identity, source references, dependencies and actual design-review/exception evidence. Qualify slice identities by packet. Slice Markdown remains canonical for execution status and result/evidence, with one versioned machine-readable execution block rather than a competing status file. Plans/macros are derived views; capability records remain work-state owners. Convert current provisional fields explicitly if needed, preserving original evidence and references.

PLAN generates packets from selected design and asks about output stories unless answered or always/never configured; this initiative still has no requested story outputs. EXECUTE implements ready scope using STRICT MODE and explicitly returns to PLAN/DESIGN when needed. VIBE checkpoints at material decisions, bounded outcomes, phase changes and handoff. Use proportional records, not a full packet per tiny edit.

Archive only an actually closed packet, as a unit, under _archive/<owner-relative path>/execution/<packet-id> by default, with configured alternatives and collision checks. Preserve stable identity and original completion/cancellation evidence. Current design/feature links stay canonical; links to archived evidence belong under Historical context (archived), including completed prerequisites. Do not leave archive links in active tables merely by mechanically rebasing them. No inactivity-based completion/cancellation or premature initiative archive.

## Effective help and integrated proof: G-07/G-08

Use shared capability records with stable ID, summary, interface, availability/reason, prerequisites, examples, provenance and version. Distinguish implemented CLI operations, usable agent guidance and unavailable automation. General help stays repo-independent/read-only; explicit contextual help reports invalid/conflicting state and selected overrides. Preserve adoption/migration CLI plan and the eight mode meanings.

Retain the existing supported CI matrix and complete offline package/relocated skill proof. Use isolated independent agent trials with raw fixtures, actual reads/diffs/checks and a coherent one-slice stopping point; prompt presence and self-assessment alone do not prove conformance. Reconcile Stavel's own supported configuration only after the resolver exists. Publication CI/CD and npm release remain deferred.

## Proposed review exception for this initiative only

If the owner selects it, record this document's reviewed digest and the actual reply as a one-time chat-reviewed design baseline for this unpublished implementation. Keep substantial-feature design-PR review as the reusable default. A later material deviation still requires affected design resolution; routine source organization and flag/file spelling do not require repeated approval. If the owner retains the PR gate instead, preserve the foundation work and wait for the required review before substantial implementation.
