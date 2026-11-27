# Work records and versioned migrations execution plan

<!-- mdcomposer:meta
title: "Work records and versioned migrations execution plan"
kind: execution-plan
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

execution-status: complete

## Scope and owners

[This owner](../../../../../../../product/capabilities/cli/work-management/work-management.design.md) holds the relevant product/contract intent. This packet prepares work records and versioned migrations under the [coordination plan](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.execution-plan.md). The source [design](../../../../../../../product/contracts/configuration/work-status.design.md) and canonical requirements remain authoritative; no local copy of their definitions is introduced.

No stories are generated for this pass per the owner's explicit Q&A answer. The choice is task-local. Read [the shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md) for actual authorization, colocation, subagent ownership and closure obligations.

## Slices and declared prerequisites

The coordination plan owns the cross-packet graph; this is the owner-local navigation projection. Each linked slice owns status/result and its concrete endpoint.

| Slice | Outcome | Requirement references | Merged/applied prerequisites |
| --- | --- | --- | --- |
| [WRK-01](./wrk-01-work-reader.execution-slice.md) | Query canonical work records without a status cache | GW-28 | CFG-02 (archived; see historical context), SET-01 (archived; see historical context) |
| [WRK-02](./wrk-02-work-writers.execution-slice.md) | Create, register and transition work safely | GW-28, GW-29, GW-17 | [WRK-01](./wrk-01-work-reader.execution-slice.md), SET-02 (archived; see historical context) |
| [WRK-03](./wrk-03-work-schema-migrations.execution-slice.md) | Upgrade supported work schemas without changing intent | GW-29, GW-16 | [WRK-02](./wrk-02-work-writers.execution-slice.md) |

## Readiness and closure

Read each slice's specific readiness/design inputs and [the scoped gate register](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md). Draft designs and planning records do not accept new storage/interfaces or a design PR. Existing-contract assurance slices can be selected independently within their accepted scope; all code execution still needs an actual task.

Verify the declared slice endpoint without future unmerged code, then the packet's integrated outcome. Update canonical results and [the derived macro projection](./work-records.macro-execution.md); do not archive an unfinished packet. Whole closed packets later follow the selected owner-relative mirror rule. No publishing/merging/global host changes are authorized here.

## Actual local closure

All source slices in this packet completed their accepted local implementation scope. See the [integrated proof](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [philosophy review](../../../../skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Earlier pending/PLAN boundary statements above are retained chronology, not current blockers. No commit, PR, merge, publication or global-skill update is claimed. Completed packets stay available here for owner review; whole-packet archival is a later delivery step.

## Historical context (archived)

- [CFG-02](../../../../../contracts/configuration/execution/repository-configuration/cfg-02-config-migration-and-adoption.execution-slice.md)

- [SET-01](../../../initialization/execution/guided-init/set-01-scope-discovery.execution-slice.md)
- [SET-02](../../../initialization/execution/guided-init/set-02-shared-question-sessions.execution-slice.md)
