# Slice S10 work status CLI and migrations

<!-- mdcomposer:meta
title: "Slice S10 work status CLI and migrations"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-10 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with WRK-01 (archived; see historical context), WRK-02 (archived; see historical context), WRK-03 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-10's status and eventual evidence.

Anchor identity for this slice is S-10. Title: Work registry, status CLI and schema migrations.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Deliver GW-28/GW-29 through the [work-status design](../../../../../../../product/contracts/configuration/work-status.design.md). The selected architecture has a reference-only registry, capability-owned work records, transient read-only reports and CLI operations shared with the skill. D-12 settles the exact schemas, command names, transitions, writer/recovery behavior and supported version paths. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

Keep accepted owner paths and choices, stable work identities, actual lifecycle history, user edits and current authorization. Document acceptance, work lifecycle and slice verification are distinct facts. Schema migration must not silently apply a new policy or rename an adopting repository's documentation tree. No independently persisted global work summary.

## Steps

1. Implement schema validation, contained reference resolution and the read-only collector with provenance and distinct invalid/unavailable/empty outcomes.
2. Implement accepted creation, registration, update/transition and query operations through shared services and real CLI entrypoints. Preflight affected records, support preview and idempotent repeats, and enforce the selected conflict/recovery contract.
3. Code supported version migrations with old/new fixtures, explicit preview and stale-input protection. Refuse unsupported formats without overwrite and verify partial recovery with intervening edits.
4. Package required schemas/templates/migrations and command definitions for later init/help/skill consumers. Keep this source repository's filled registry/status records outside generic portable assets.

## Acceptance

- T-22 proves actual source reads, pointer-only indexing, provenance, lifecycle separation and no mutation during query.
- T-23 exercises actual CLI creation/registration/updates/migration, no-op repeats, dry-run/decline, concurrent/stale writes, partial recovery and unsupported versions.
- Supported migration fixtures preserve IDs, decision references, state and history without adopting new conventions.
- The merged endpoint exposes independently usable documented commands with tests; later skill integration is a consumer, not a repair required for CLI correctness. Existing interfaces remain usable.
- Refine this provisional work package into coherent story-linked increments under D-09 if necessary before final delivery commitment.

## Result and evidence

Not started. No implementation, feature-verification results or completion evidence yet. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

## Historical context (archived)

- [WRK-01](../../../../cli/work-management/execution/work-records/wrk-01-work-reader.execution-slice.md)
- [WRK-02](../../../../cli/work-management/execution/work-records/wrk-02-work-writers.execution-slice.md)
- [WRK-03](../../../../cli/work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md)
