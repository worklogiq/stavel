# CLI foundations and service contracts execution plan

<!-- mdcomposer:meta
title: "CLI foundations and service contracts execution plan"
kind: execution-plan
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

execution-status: complete

## Scope and owners

[This owner](../../../../../../../product/capabilities/cli/cli.design.md) holds the relevant product/contract intent. This packet prepares cli foundations and service contracts under the [coordination plan](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.execution-plan.md). The source [design](../../../../../../../product/capabilities/cli/service-verification.test-plan.md), [design](../../../../../../../product/capabilities/cli/inspection/inspection.design.md) and canonical requirements remain authoritative; no local copy of their definitions is introduced.

No stories are generated for this pass per the owner's explicit Q&A answer. The choice is task-local. Read [the shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md) for actual authorization, colocation, subagent ownership and closure obligations.

## Slices and declared prerequisites

The coordination plan owns the cross-packet graph; this is the owner-local navigation projection. Each linked slice owns status/result and its concrete endpoint.

| Slice | Outcome | Requirement references | Merged/applied prerequisites |
| --- | --- | --- | --- |
| [FND-01](./fnd-01-package-inspection.execution-slice.md) | Report malformed package input accurately | GW-01 | None |
| [FND-02](./fnd-02-pure-service-contracts.execution-slice.md) | Verify shared pure and filesystem primitives | GW-35, GW-23 | None |
| [FND-03](./fnd-03-effect-service-contracts.execution-slice.md) | Verify orchestration and mutation service contracts | GW-35, GW-23 | [FND-01](./fnd-01-package-inspection.execution-slice.md) |

## Readiness and closure

Read each slice's specific readiness/design inputs and [the scoped gate register](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md). Draft designs and planning records do not accept new storage/interfaces or a design PR. Existing-contract assurance slices can be selected independently within their accepted scope; all code execution still needs an actual task.

Verify the declared slice endpoint without future unmerged code, then the packet's integrated outcome. Update canonical results and [the derived macro projection](./foundations.macro-execution.md); do not archive an unfinished packet. Whole closed packets later follow the selected owner-relative mirror rule. No publishing/merging/global host changes are authorized here.


## Local execution result

All three foundation slices are locally complete with [actual verification](./foundations.verification.md). The supported Linux/other Node matrix is still unrun here and is not claimed. Keep this packet current until integrated dependent review/closure determines the authorized archival boundary; no premature archive was performed.

## Actual local closure

All source slices in this packet completed their accepted local implementation scope. See the [integrated proof](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [philosophy review](../../../../skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Earlier pending/PLAN boundary statements above are retained chronology, not current blockers. No commit, PR, merge, publication or global-skill update is claimed. Completed packets stay available here for owner review; whole-packet archival is a later delivery step.
