# Planning, execution and iterative delivery workflows

<!-- mdcomposer:meta
title: "Planning, execution and iterative delivery workflows"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:eight-execution-contract-answers"
-->

## Authority and scope

The owner explicitly endorsed the preceding mode/readiness explanation on 2026-11-26 and requested its capture using DESIGN. UX-21 through UX-24 in the [recon](./guided-setup-and-repair.recon.md#confirmed-user-choices) record that source. This selects the workflow behavior below: incremental plans, executor handoff with automatic preparation and STRICT MODE, a distinct VIBE workflow, and EXPLORE as the discovery/recon activity. UX-30 through UX-32 subsequently correct the DESIGN/PLAN/EXECUTE boundaries and story flow; those later explicit choices govern. Exact schemas, routing syntax and implementation details remain subject to D-13/D-14 in the [decision register](./guided-workflows.decision.md).

This document owns the detailed workflow design for GW-30 through GW-33 in the [requirements](./guided-workflows.requirements.md). The [shared design](./guided-workflows.design.md) owns services and persistence boundaries. All remain a draft delivery packet; this instruction authorizes design documentation. Source mode prompts and CLI/skill help now reflect the explicit correction. Deterministic packet orchestration and richer persisted workflow configuration remain planned; this does not establish the initiative's design-PR acceptance or readiness of its broad runtime slices.

## Motivation and responsibilities

Users can develop several plans over time, refine one feature a little at a time, then hand a selected scope to an agent executor without manually invoking every lifecycle phase. Other tasks benefit from coding in short conversational iterations while maintaining durable intent. Both paths must preserve requirements, choices, verification and useful context for the next session.

The coding agent interprets intent, resolves material questions, writes code and performs semantic review. Shared CLI/library services manage supported records, validate references and readiness data, calculate views and perform migrations. The CLI must not claim to implement arbitrary prose by itself. This design requires no new AI-provider integration. Whether a separate executor distribution is useful is outside this increment.

## Mode contracts

| Entry | Purpose and expected result | Implementation boundary |
| --- | --- | --- |
| EXPLORE | Discuss requirements or understand the codebase, using an input story when provided; retain relevant recon. | Discovery does not implicitly begin product implementation or accept a design. |
| EXPERIMENT | Standalone experiments, proofs of concept or bounded learning; retain findings, evidence and limitations. | Can support another phase without being required before ordinary feature work. Production promotion needs its own actual decision. |
| DESIGN | Turn EXPLORE/EXPERIMENT/VIBE output and input stories into design documents and decision records. | Execution packet/slice generation belongs to PLAN. Preserve actual design acceptance and selected review policy. |
| PLAN | Set up execution from the selected design: generate slices, dependencies, acceptance/checks and optional output stories. | Distinct activity whether separately invoked or entered during an authorized lifecycle task. Planning does not itself execute the output. |
| EXECUTE | Carry out ready selected execution slices with STRICT MODE automatically, then verify and close. | Check readiness; explicitly transition to PLAN or DESIGN when authorized missing preparation is needed. Do not silently absorb those activities or invent acceptance. |
| STRICT MODE | Implement an authorized slice faithfully against its accepted requirements and defining mechanisms. | Retain the existing direct entrypoint. EXECUTE invokes its obligations automatically. |
| VIBE | Combine the applicable exploration, learning/experiment, design, planning, execution and review activities in short loops. | Record decisions/docs as work progresses, obey philosophies and preserve the selected review/verification obligations. |
| REVIEW | Compare actual changes and evidence with requirements, design, decisions and applicable philosophies. | Report discrepancies, limitations and scoped readiness. Close execution is an entry into this activity and reconciliation, not another permission level. |

Eight source guidance prompts now exist, including distinct PLAN, EXECUTE and VIBE instructions. CLI help explains them and the skill uses that help plus the selected prompt. These are agent workflows, not feature-execution CLI subcommands or a completed deterministic orchestration engine. Recon remains an artifact, not an extra installation. Modes describe activities and phases describe progress.

## Incremental planning and handoff

Reuse canonical requirements/design/decision owners when a user adds a plan or amends an existing one. Each selected delivery scope needs stable identity, owner links, acceptance state and enough provenance to tell a current plan from a superseded one. Detailed identity/selection representation remains D-13 work. Do not duplicate a feature specification into every story or slice.

PLAN produces or refines the execution directory, canonical slice files, dependency plan and derived macro coordination already selected for this initiative. Every final slice identifies its outcome/story, accepted design baseline or review exception, already-merged prerequisites, concrete post-merge behavior and checks. Split or combine provisional packages until each delivery endpoint is coherent; no future unmerged repair is required to restore supported behavior.

Plans can be incomplete while being developed. Label unresolved decisions and their affected slices. A partial plan can contain ready independent work; a polished document can still be unready. Updating a plan invalidates only affected readiness/review evidence, with actual provenance, rather than silently accepting the revision or discarding every unrelated decision.

An execution request may select one slice, one feature/plan or several plans. Resolve what an expression such as all this refers to from the task and actual owners; ask if multiple materially different scopes remain. Show the resolved scope and readiness as useful progress, without introducing a repeated approval prompt when authorization already covers it. Do not execute every plan found on disk merely because a global index lists it.

## Configurable story flow

A story may be an input to EXPLORE and DESIGN, an optional PLAN output, both, or unused. Read current task instructions and accepted repository choices; the user can change the flow on the fly without selecting an enterprise process globally. Task choices stay local unless made standing rules. Enterprise PLAN can generate story records linking outcome/acceptance and slices; story inputs already supplied by a tracker are preserved and linked rather than recreated.

Input stories can exist before technical design review. Preserve the selected substantial-feature review gate before committing final implementation stories/slices or executing dependent work. Creating external tracker records is a separate action requiring real authorization. The future workflow config must record chosen direction, terminology, scope and source without forcing one global story lifecycle.

The [story guide](../../../../dev/story-workflow.guide.md) owns the default question and template contract. PLAN asks about output generation unless the current scope is already answered or workflow.stories.generation selects always/never. Use the editable init-seeded repository template or its configured override. This is independent of accepting a story as discovery/design input.

## Executor preparation and execution

1. Read current instructions, selected repository settings, capability-owned status, relevant records and source changes. Resolve the selected scope and preserve unrelated user work.
2. Reconcile document acceptance, review evidence, observed code, current slice results and dependency state. Verify actual prerequisites; a ready label alone is insufficient.
3. If preparation is missing, report it and transition explicitly to PLAN to set up execution or DESIGN to resolve material design gaps, within the authorized lifecycle scope. Choose routine details autonomously and ask only material questions. Honor the selected design-PR gate or a real scoped exception. Return to EXECUTE only for ready work; its role remains actual implementation.
4. Evaluate cross-plan dependencies, conflicting requirements, overlapping changes, shared schema/interface ownership and potential cycles. Do not silently choose whichever plan was read last. Define one integration owner for shared contracts; independent delegation follows actual authorization and nonoverlapping ownership.
5. Implement dependency-ready authorized slices using STRICT MODE, with relevant focused checks and a coherent stopping point. Keep blocked or review-pending portions visible while continuing independent ready work.
6. Record implementation/evidence in each canonical slice, update capability-owned lifecycle state through supported management commands, and refresh the derived macro view. Re-evaluate affected readiness after changes or interruptions.
7. Review the requested boundary against requirements, applicable philosophies, selected checks and actual diff; reconcile docs and report COMPLETE, PARTIAL or BLOCKED with remaining scope. Slice/PR readiness remains separate from initiative completion, archival and external delivery authorization.

An overall request can authorize DESIGN, PLAN, EXECUTE and REVIEW transitions without requiring a separate user invocation for each. They retain distinct outputs; an EXECUTE request with missing preparation explicitly transitions rather than treating planning as EXECUTE behavior. Record actual phase/activity in the capability-owned status; retain the requested scope in the task record. Do not add another independently edited global state owner. Automatic preparation must not pretend that a design decision, external review or implementation check occurred.

If a prerequisite is outside the selected scope, report it and its dependent work instead of silently broadening execution. If source or accepted design changes during a pause, revalidate before resuming; do not replay stale actions. The exact readiness representation, scheduler order, restart contract and conflict protocol remain D-13 proposals to resolve before implementation.

## VIBE iteration contract

VIBE combines the applicable development activities while keeping intended product behavior and code aligned. Standalone EXPERIMENT can serve learning/POCs or hypothesis testing; VIBE can include that activity when useful without forcing an experiment into each iteration.

1. Identify the current small outcome, affected owners, constraints and useful verification. Capture material intent before it is lost; a small task can use one existing task/slice record.
2. Discuss options and record actual user choices, agent recommendations and unresolved alternatives with their different acceptance states. A recommendation does not become accepted simply because code was written.
3. Implement authorized changes within accepted requirements and conventions. When new evidence changes a meaningful decision, record the reason and source, update affected design/planning and satisfy the selected review policy before dependent implementation.
4. Check the result and reconcile canonical decisions, design, plan/slice evidence and capability status at a meaningful iteration boundary. Checks match the impact; required checks still run at the repository's required boundaries. Avoid a full design packet or full suite for each keystroke.
5. Continue with the next bounded outcome, switch to EXPERIMENT for an actual hypothesis, or close/handoff with verified results and remaining work. Do not claim a coherent complete increment when changes only work after unimplemented future repairs.

Meaningful boundaries include completing a requested change, accepting/changing a material choice, changing scope or mode, and preparing review/handoff/closure. Save accepted decisions when made and maintain durable intent during work; full operational checkpoints, interruption reconciliation and how lightweight records are rendered remain D-14 design choices. Do not rely on reconstructing all decisions at session end.

VIBE does not implicitly waive substantial-feature design review. It can iterate a reviewed feature or an explicitly excepted scope. When the change grows beyond the accepted scope, surface that transition, revise the affected plan/design and apply the selected policy. Small iteration and proportionate records must remain practical without weakening existing invariants.

## Interfaces and compatibility

Natural-language examples include plan this feature, execute this plan, execute these two plans and iterate on this in VIBE. Use the host's supported skill invocation/Q&A; these examples do not promise a universal at-sign syntax. A discovery-only request routes to EXPLORE with explicit read-only scope.

The existing CLI plan command prepares adoption/migration operations. Preserve that behavior and existing answers-driven interfaces. Feature PLAN and EXECUTE are agent workflows; any new CLI routing syntax or commands require a separately specified interface. Machine operations should share the work-management/configuration engine and expose actionable missing decisions rather than claiming semantic review passed.

All modes consume accepted repository overrides, owner mappings and task exceptions. The [work-status design](../../../contracts/configuration/work-status.design.md) owns versioned records and migrations. Mode/template changes need export/catalog/help/lifecycle consistency in their implementation slices; unknown saved modes or incompatible versions require explicit migration/refusal, not silent conversion to complete. This filled source design stays outside portable adopter assets.

## Verification and remaining design work

T-24 through T-27 in the [test plan](./guided-workflows.test-plan.md) cover planning, single/multiple-plan execution, VIBE durability and discovery/experiment separation. Combine mechanical record/CLI checks with a fresh agent trial that observes actual reads, edits, preserved mechanisms, checks and reported gaps. Prompt presence alone does not prove routing or fidelity.

S-00 resolves D-13/D-14 details; S-03 supplies proportional catalog/template support; S-07 delivers workflow routing, preparation, execution and closure; S-08 exposes accurate help; S-09 verifies relocated use. S-10 owns supported work-record operations reused by those consumers. All slices remain planned. Existing test success validates the baseline and documentation only, not these future workflows.

## Accepted execution resolution

The owner accepted the eight consolidated execution choices, including a scoped chat-reviewed design baseline, and required warnings for AI-assisted nondeterministic migrations/repairs. The acceptance record (archived; see historical context) resolves the earlier proposed representation and review questions. Conventional commits are the overridable default. Earlier planning/recon statements retain historical context; current implementation evidence is recorded in the execution owners, not inferred from this acceptance.

## Historical context (archived)

- [acceptance record](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md)
