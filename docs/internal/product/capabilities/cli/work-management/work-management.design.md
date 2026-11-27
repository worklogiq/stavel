# Work records and schema upgrades

<!-- mdcomposer:meta
title: "Work records and schema upgrades"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Authority and interfaces

The registry contains only schemaVersion and capability id/statusFile pointers. Capability records own actual work lifecycle, phase, mode, implementation status, canonical record/tracker references, next action, blockers and history. Queries produce transient summaries with source paths/hashes. They do not create another cached status authority.

work list/create/update/migrate/apply/recover share effective registry routing and configured vocabularies. Creation can register a meaningful empty capability without inventing an initiative. Updates preserve identities, unrelated fields and actual history; identical updates are no-ops. Completion requires explicit closure evidence. Schema 1 is readable but requires an explicit preview/apply migration to supported schema 2 before writes. Unsupported schemas refuse.

## Writer and recovery contract

Plans bind selected configuration and all affected source/evidence hashes. Exclusive repository writers recheck under lock and journal transitions; multi-file atomicity is not claimed. Concurrent/stale writes, symlink escapes, invalid records and tampered recovery refuse. Dry-run creates no target records/locks/journals. Recovery never steals an uncertain live lock, and runtime data stays outside committed policy. Deterministic code migration preserves original fields/history and adds only a factual conversion event.

## Evidence and ownership

work.service.ts has direct colocated cases for readers, writers, migration, no-op/preservation, locks/recovery and vocabulary/configuration binding. The execution packet (archived; see historical context) owns scoped results. CLI participation is coordinated by the skill initiative; this feature does not duplicate its status.

## Historical context (archived)

- [execution packet](../../../../_archive/product/capabilities/cli/work-management/execution/work-records/work-records.execution-plan.md)
