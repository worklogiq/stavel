# Slice S06 doctor and repair

<!-- mdcomposer:meta
title: "Slice S06 doctor and repair"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-06 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with DOC-01 (archived; see historical context), DOC-02 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-06's status and eventual evidence.

Anchor identity for this slice is S-06. Title: Diagnose and preview scoped repairs.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Add doctor orchestration, structured finding states and the agreed deterministic repairs. Diagnose useful properties before adoption and integrate semantic review tasks in the skill.

Required decisions: D-04 initial repair allowlist/recovery and D-05 command boundary. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

Mechanical versus agent evidence, offer-preview default, actual authorization, before/after hashes, user-edit protection and no success-shaped parsing fallbacks.

## Steps

1. Define located/versioned findings with applicability, owner, status, evidence and next action.
2. Implement accepted repair candidates and concrete preview/application through the preservation/recovery contract.
3. Verify decline, stale previews, partial failure, resume/rollback, unavailable tools and review-required cases.

## Acceptance

- GW-27: Diagnose the resolved repository policy and its origins, including invalid topics, default/version drift and conflicting configuration homes; repair only a reviewed authorized plan.

- Initialized/uninitialized targets get accurate findings; standalone output identifies agent review that did not run.
- Repairs run only within the concrete allowed/authorized scope and are verified.
- Conflicting extensions, malformed state and intervening edits are actionable and never silently marked passed.

## Result and evidence

Not started. No implementation, feature-verification results or completion evidence yet. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

## Historical context (archived)

- [DOC-01](../../../../cli/doctor/execution/guided-doctor/doc-01-diagnosis.execution-slice.md)
- [DOC-02](../../../../cli/doctor/execution/guided-doctor/doc-02-repair-flow.execution-slice.md)
