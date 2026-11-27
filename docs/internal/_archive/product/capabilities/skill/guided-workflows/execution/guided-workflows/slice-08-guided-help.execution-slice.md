# Slice S08 guided help

<!-- mdcomposer:meta
title: "Slice S08 guided help"
kind: execution-slice
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Superseded provisional work package

This S-08 record is retained as planning history, not an active execution slice or a completed implementation. The 2026-11-26 PLAN pass supersedes its broad scope with HLP-01 (archived; see historical context). Use the [current coordination plan](./guided-workflows.execution-plan.md) for the active graph. Existing lower sections preserve earlier rationale; they do not override the new source records or accept unresolved design. No runtime completion is inferred.


Read the [shared execution contract](./index.md#shared-execution-contract) and [plan](./guided-workflows.execution-plan.md). This file owns S-08's status and eventual evidence.

Anchor identity for this slice is S-08. Title: Expose useful help through both interfaces.
prior-planning-status: superseded; not an execution result
Mode when authorized: STRICT MODE.

## Scope and decisions

Build task-oriented getting-started help from shared current capabilities, with CLI examples, skill conversation examples and explainable active customizations.

Required decisions: D-07 output/interaction contract. Dependency ownership is in the [plan](./guided-workflows.execution-plan.md#ordered-slices-and-coverage).

## Contract to preserve

Help works without a repository, does not generate files or run target commands, and never advertises proposed/agent-only behavior as a standalone command.

## Steps

1. Render onboarding and workflow recipes from the shared catalog with links to current supported help/contracts.
2. Include effective profile origins/omissions when context is available and clearly label host-specific invocation.
3. Test CLI and agent help parity, no-target/no-TTY behavior and availability labels.

## Acceptance

- GW-27: Explain effective repository choices/default versions and their sources, while general help still works outside configured repositories without writes.

- A new user can discover init, doctor, feature workflows and customization through help.
- Capability and amendment information agree with actual routing/generation/checks.
- General help remains read-only outside a repository.

- Explain available work-query/management/migration commands, preview and version compatibility using shared accepted command definitions.

- GW-33: Explain distinct workflow purposes, automatic execution preparation and VIBE durability; retain direct STRICT MODE and migration CLI plan usage. Recon is an EXPLORE output, not an extra installation. Label agent workflows and actual CLI availability accurately.

- GW-02/GW-37: Preserve the current static mode/story summary and skill-to-CLI help route while implementing future shared effective-capability help. Distinguish usable prompt guidance from unimplemented deterministic execution commands.

## Result and evidence

Not started. No implementation, feature-verification results or completion evidence yet. Record actual revision, changed locations, checks/results, omissions, deviations and next action here when executed.

Current bounded mode/help/story groundwork has [actual evidence](./workflow-story.verification.md); preserve it while implementing the remaining broader scope. The source prompts and static summary do not establish deterministic orchestration or observed agent conformance.

## Historical context (archived)

- [HLP-01](../../../../cli/help/execution/effective-help/hlp-01-effective-help.execution-slice.md)
