# Slice S11 CLI service contract tests

<!-- mdcomposer:meta
title: "Slice S11 CLI service contract tests"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-11 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with FND-02 (archived; see historical context), FND-03 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Anchor identity for this slice is S-11. Title: Verify every CLI service contract.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Deliver GW-35 against the [CLI service verification matrix](../../../../../../../product/capabilities/cli/service-verification.test-plan.md) and local architecture. The shared [plan](./guided-workflows.execution-plan.md) owns prerequisites; S-01 first fixes the reproduced defects. D-15's structured ownership tooling need not block independent meaningful service tests once actual implementation/review scope is authorized.

## Contract to preserve

Every current service has a documented responsibility and independent behavioral evidence. Preserve existing accepted behavior, public exports, filesystem recovery and unrelated user work. Do not replace aggregate integration tests or invent a meaningless test for a type-only file. Keep expectations independent from implementation.

## Steps

1. Refine the eleven-service inventory into explicit obligations, existing evidence and focused missing cases. Establish a reproducer before fixing any new defect discovered.
2. Add focused success/boundary/refusal tests using current Node tooling; use real temporary filesystems for effects and actual built CLI processes for adapter argument/output/exit contracts.
3. Reconcile each source-to-contract-to-case-to-result row, retaining unresolved gaps and platform limitations. If a behavior fix exceeds this slice's accepted scope, isolate it with its actual design/review evidence rather than weakening an assertion.
4. Run npm test and npm run check, plus relevant focused cases, and verify the increment is independently coherent on its merged prerequisites.

## Acceptance

T-29 covers all current .service.ts modules, meaningful independent expected results and relevant errors/effects. No test-file or coverage-percentage proxy satisfies this contract. Update the CLI test matrix with actual evidence. Any remaining required gap prevents an unqualified complete claim; refine this provisional package into smaller coherent story-linked increments if necessary.

- GW-36: Put all new service tests beside their implementation owner, preserving the moved public API/package suites and the nine existing testing-service cases. Retain real effects/refusal tests instead of file-presence proxies.

## Result and evidence

The broader gap-closure package remains planned. Nine testing-service cases were implemented under the separate bounded test-placement task linked below; older service gaps remain. Record actual changed locations, cases/results, limitations and next action when executed.

Bounded GW-36 groundwork now has [actual evidence](./test-placement.verification.md). This package remains planned for its wider accepted scope; do not discard the existing tested component or imply all remaining acceptance passed.

## Historical context (archived)

- [FND-02](../../../../cli/services/execution/foundations/fnd-02-pure-service-contracts.execution-slice.md)
- [FND-03](../../../../cli/services/execution/foundations/fnd-03-effect-service-contracts.execution-slice.md)
