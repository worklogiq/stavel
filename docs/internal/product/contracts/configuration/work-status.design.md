# Work status ownership and CLI

<!-- mdcomposer:meta
title: "Work status ownership and CLI"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Authority and prototype boundary

The owner requested an index of current work, then clarified that the index should only point to capability-owned status files. A tool should read those files and summarize them. The subsequent instruction adds CLI creation/registration/management so the skill can use code-backed schema migrations as it evolves. GW-28/GW-29 and D-12 in the [draft packet](../../capabilities/skill/guided-workflows/index.md#guided-workflows-draft-packet) own delivery acceptance.

The current [work index](../../../work-index.json) and [skill status](../../capabilities/skill/skill.status.json) are initial repository-owned records. The JSON shapes are draft examples for this source repository, not a shipped supported CLI format. No new work-management command is implemented by writing these files.

## One owner for each fact

The global registry contains stable capability identity and a status-file reference only. It has no cached status, phase, next action, counters or duplicated feature prose. Paths are relative to the configured registry location and validated against its repository scope.

Each capability's status file owns the declared work-item status, lifecycle phase, current mode, accountable owner, next action and blockers. It can describe exploration/design work before an execution packet exists. Give items stable IDs and links to the actual recon/design/decision/tracker records; qualify identities by capability when aggregating. Do not infer paused/completed state from inactivity.

Document state is a different concept: an accepted design can describe unimplemented work, and a draft recon can belong to active design work. Individual execution slices still own their implementation result and evidence. A macro tracker coordinates those slices and links the capability status for work-level phase/state; it must not establish another independently edited owner for those fields.

The current prototype has one registered capability and one active initiative in design. No future website or fake runtime activity is registered. The initiative's implementation remains unstarted while its documentation and local organization have been refined.

## Read-only query and transient summaries

Resolve actual instructions/scope and [repository configuration](./repository-configuration.design.md), locate the registry and read its referenced status files. Validate versions, identity, contained paths, duplicate registrations/items, fields, configured lifecycle vocabulary and referenced owning records. Emit a structured report with source provenance and actionable errors. An invalid source must not silently become an empty/successful work list.

The tool can render a human summary, and the skill can use structured output to answer what is in progress. That output is transient; the query does not persist a second summary/index-of-state or mutate owner status. Surface stale/inconsistent evidence as a discrepancy rather than silently changing the declared lifecycle state. Missing/unavailable sources remain distinguishable from a valid empty registry.

## CLI-owned management

The CLI should provide operations to create an owning status record, register it, add work, transition/update work and close a verified scope. Names such as work create, work list, work update and work migrate are illustrative until the interface is accepted. Use the shared question/scope engine and optional explicit arguments; no command should assume a fixed documentation tree or require manual index edits for normal use.

Creation must preflight both the capability file and registry change, preserve existing data, validate references, and provide an idempotent path for a repeated identical request. Define serialized writers or conflict refusal, journal/recovery for multi-file changes and actual interruption behavior; do not claim a transaction from separate successful writes. Show affected files and effects through preview. Closed records retain their actual result/history rather than disappearing as if no work occurred.

The skill uses supported CLI/library operations to manage state after its normal interpretation, alignment and review. It does not invent file formats or independently patch registry/status JSON as its steady-state workflow. A data command can enforce structural transition prerequisites; semantic acceptance and authorization still require actual task/review evidence. Setting a status value is not implementation or verification.

## Versioned upgrades and compatibility

Version registry, capability status, configuration and other persisted artifacts independently from the npm package and default-policy version. Code deterministic migrations for the supported version paths, with fixed old/new fixtures, retained IDs/decision sources/lifecycle history and no silent coercion of unknown state. Reuse the established plan/preflight/journal mechanisms where appropriate.

An upgrade reports current and target versions and the concrete changes before applying within authorization. Dry-run/decline writes nothing; stale inputs refuse; partial application is recoverable; intervening user edits stay protected. Unsupported newer schemas fail actionably without overwrite. Define supported older readers or an explicit migration-needed result, rather than pretending compatibility with every past or future release.

Schema conversion is separate from choosing new conventions. Updating tool versions must not implicitly rename MenuLogiq's accepted homes, replace repository decisions, reset active work or adopt a new default policy. Local/source-specific records stay out of generic portable exports; distribute schema/templates/migration code required by supported commands.

## Startup, lifecycle and verification

The configured workflow topic points to the registry. Register work when an authorized exploration/design task begins; update the owning record at real lifecycle transitions, changes to blockers/next action and closure. The global registry changes only when references/registration change. Cross-capability work has one accountable owner and references the other scopes instead of multiple independent status copies.

T-22 checks pointer-only indexing, actual reads, source provenance, empty versus invalid/unavailable state and status/mode/lifecycle separation. T-23 checks create/register/update/query through actual CLI processes, idempotency, concurrent/stale writes, partial recovery, compatible old-format migrations, unsupported formats and preserved user decisions. A fresh skill trial must use the commands for these transitions and query the authoritative state on resume.

D-12 still needs the exact schema/command names, concurrency strategy, transitions, retention, refresh/evidence reconciliation and supported-version policy. Current source records enable manual source-based answers; automatic CLI collection/mutation/migration remains planned.

## Accepted execution resolution

The owner accepted the eight consolidated execution choices, including a scoped chat-reviewed design baseline, and required warnings for AI-assisted nondeterministic migrations/repairs. The acceptance record (archived; see historical context) resolves the earlier proposed representation and review questions. Conventional commits are the overridable default. Earlier planning/recon statements retain historical context; current implementation evidence is recorded in the execution owners, not inferred from this acceptance.

## Historical context (archived)

- [acceptance record](../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md)
