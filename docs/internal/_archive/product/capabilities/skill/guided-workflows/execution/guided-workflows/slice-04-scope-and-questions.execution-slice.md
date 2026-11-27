# Slice S04 scope and questions

<!-- mdcomposer:meta
title: "Slice S04 scope and questions"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-04 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with SET-01 (archived; see historical context), SET-02 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-04's status and eventual evidence.

Anchor identity for this slice is S-04. Title: Share scope discovery and resumable questions.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Implement accepted root discovery, shared decision sessions, terminal prompt rendering and agent-facing structured question state. Preserve explicit argument/answers-file paths.

Required decisions: D-01, D-02 and D-07. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

No inferred alignment, no pre-alignment adoption files, no target script execution during discovery, and no noninteractive prompt hangs.

## Steps

1. Implement explicit-target and root-evidence resolution with ambiguity results and containment checks.
2. Use stable question IDs/applicability/resolution evidence for both adapters; handle explicit overrides and conflicts.
3. Implement accepted cancellation/resume/corruption/staleness/concurrent-writer behavior and test non-TTY output/exits.

## Acceptance

- GW-27: Resolve the applicable committed config and actual owner routing before convention-dependent discovery/questions. Reuse decided settings and diagnose ambiguous scope or corrupt records.

- GW-26: Obtain any required missing product purpose/audience/owner facts through shared Q&A; reuse existing accepted information rather than inventing product prose.

- GW-25: follow the selected product/capabilities/contracts semantic hierarchy, optional outer/deeper scopes and existing owner mappings. Use the [hierarchy design](../../../../../../../process/documentation-hierarchy.design.md); preserve owner-local delivery and the selected archive mirror.

- GW-24: setup distinguishes the internal root, capability home and delivery directory; product is the presented selected default, other paths can be selected, and retained existing homes are not renamed implicitly.

- Bare invocation resolves an unambiguous scope; nested ambiguity asks; explicit target is honored.
- Both adapters produce equivalent decisions for equivalent explicit answers.
- Cancellation and missing noninteractive answers write no adoption files and do not become acceptance.

- GW-34: Inspect actual product surfaces/features and map owner evidence before asking. Reuse explicit choices; ask only material ownership ambiguity and preserve accepted target structures.

- GW-36: Use existing test-layout evidence and accepted owner/runner conventions. Reuse settled placement, propose sourced toolchain guidance only when applicable and ask about unclear/mixed scopes.

## Result and evidence

The broader package remains planned; separately verified GW-36 groundwork is linked below. No whole-package completion is claimed. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

Bounded GW-36 groundwork now has [actual evidence](./test-placement.verification.md). This package remains planned for its wider accepted scope; do not discard the existing tested component or imply all remaining acceptance passed.

## Historical context (archived)

- [SET-01](../../../../cli/initialization/execution/guided-init/set-01-scope-discovery.execution-slice.md)
- [SET-02](../../../../cli/initialization/execution/guided-init/set-02-shared-question-sessions.execution-slice.md)
