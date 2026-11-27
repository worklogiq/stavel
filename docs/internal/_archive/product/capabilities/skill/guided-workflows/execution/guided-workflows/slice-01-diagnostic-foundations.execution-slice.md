# Slice S01 diagnostic foundations

<!-- mdcomposer:meta
title: "Slice S01 diagnostic foundations"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-01 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with FND-01 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-01's status and eventual evidence.

Anchor identity for this slice is S-01. Title: Fix demonstrated diagnostic/default defects.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Consolidate the default document-kind source and report malformed package JSON explicitly in inspection. Preserve valid existing public API behavior and bounded historical inspection.

Required decisions: No unresolved UX decision needed for the two reproduced defects; implementation still needs task authorization. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

Use the actual versioned kind catalog, retain supported public imports, and distinguish invalid data from absent scripts. Avoid unrelated linter/refactoring expansion.

## Steps

1. Reproduce all currently divergent default kinds and malformed package inspection through public boundaries.
2. Fix the authoritative default source and diagnostic propagation; update owning help/contracts where observable output changes.
3. Run focused regressions and the existing package tests before the full required checks.

## Acceptance

- Every registered default kind behaves consistently through default/configured validation.
- Malformed JSON returns a located actionable diagnostic; absent package/scripts remain distinct valid observations.
- Regression evidence fails before and passes after the fix; no unrelated target writes.

## Result and evidence

Not started. No implementation, feature-verification results or completion evidence yet. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

The later bounded story/template task fixed the default-kind fallback divergence by reading the canonical default profile and added a regression over every declared kind. Preserve that verified fix. The malformed package inspection diagnostic and remaining broader foundation acceptance are still open; this package is not marked complete.

Current bounded mode/help/story groundwork has [actual evidence](./workflow-story.verification.md); preserve it while implementing the remaining broader scope. The source prompts and static summary do not establish deterministic orchestration or observed agent conformance.

## Historical context (archived)

- [FND-01](../../../../cli/services/execution/foundations/fnd-01-package-inspection.execution-slice.md)
