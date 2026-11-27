# Slice S05 guided init

<!-- mdcomposer:meta
title: "Slice S05 guided init"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-05 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with SET-03 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-05's status and eventual evidence.

Anchor identity for this slice is S-05. Title: Orchestrate aligned initialization and verification.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Connect discovery/Q&A/effective configuration/packet selection to concrete preview, existing plan/apply and actual post-application checks for bare init. Support retaining conventions and explicit selected migrations.

Required decisions: D-05 command/effects boundary and D-08 compatibility. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

Existing root instructions, canonical owner docs, local amendments, stale-input refusal, journal recovery and current lower-level automation paths.

## Steps

1. Build the guided init flow around shared services, not duplicated parser/decision/mutation code.
2. Show selected conventions, relevant existing tools, optional rules, effects and alignment before generation.
3. Apply and verify; report pending routing, failures, unchanged files and explicit deferrals.

## Acceptance

- GW-27: Load accepted repo settings early, create/update committed configuration only through aligned plans, preserve existing choices and keep partial sessions/runtime journals separate.

- GW-26: Default bootstrap creates a meaningful draft overview at the resolved product root and links it from navigation. Dry-run/decline writes nothing; adoption and repeat setup preserve the existing canonical overview.

- Greenfield and existing-repository sessions complete from a bare invocation with aligned answers.
- Preview/decline preserve bytes; repeat setup preserves amendments or reports a concrete conflict/no-op.
- Actual verification outcome is returned; a completed file copy alone is not setup success.

- Use S-10 operations to create/register aligned capability status records; repeated init preserves actual work history and choices.

- GW-36: Carry the current answers-driven testing decision into guided init and recap. Do not move existing test files without an explicit separately verified migration.

- GW-37: Retain current template seeding, ask/always/never policy and selected mapped template path in richer guided init. Do not generate feature stories or overwrite repo template edits during init.

## Result and evidence

The broader package remains planned; separately verified GW-36 groundwork is linked below. No whole-package completion is claimed. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

Bounded GW-36 groundwork now has [actual evidence](./test-placement.verification.md). This package remains planned for its wider accepted scope; do not discard the existing tested component or imply all remaining acceptance passed.

Current bounded mode/help/story groundwork has [actual evidence](./workflow-story.verification.md); preserve it while implementing the remaining broader scope. The source prompts and static summary do not establish deterministic orchestration or observed agent conformance.

## Historical context (archived)

- [SET-03](../../../../cli/initialization/execution/guided-init/set-03-bare-init.execution-slice.md)
