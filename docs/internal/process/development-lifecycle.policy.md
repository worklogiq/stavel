# A proportional development lifecycle

<!-- mdcomposer:meta
title: "A proportional development lifecycle"
kind: "policy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Use this single phase vocabulary in plans, prompts, and handoffs. Modes describe the activity; phases describe progress. Return to an earlier phase when evidence changes a decision.

| Phase | Outcome | Typical mode |
| --- | --- | --- |
| 0 Recon | Relevant docs, behavior, gaps, and side effects mapped | EXPLORE or REVIEW |
| 1 Requirements | Accepted behavior, non-goals, and required mechanisms | EXPLORE |
| 2 Design | Boundaries, alternatives, contracts, risks, and decisions | DESIGN or EXPERIMENT |
| 3 Slice planning | Execution packet, coherent slices, dependencies, checks and optional output stories | PLAN |
| 4 Implementation | Code or documents implement the authorized slice | EXECUTE using STRICT MODE |
| 5 Verification | Requirement-level evidence and residual limitations | REVIEW |
| 6 Close and handoff | Current docs, status, open work, historical record | REVIEW |

EXPERIMENT can be standalone learning/POC work or support another phase. EXPLORE can begin with a story or an open problem. DESIGN turns that evidence into design docs; PLAN sets up execution from the selected design, including optional story outputs. EXECUTE performs the work. VIBE combines the applicable activities in short loops while preserving philosophies and durable records. A single authorized task can cover explicit transitions without collapsing these responsibilities or requiring a separate user invocation for every phase.

## Match the packet to the work

- A typo or low-impact edit can use the task and final note; no architecture packet or artificial regression test is required.
- A defect or small feature can use one [slice](../templates/execution/execution-slice.template.md) containing relevant recon, acceptance, and checks. Reproduce a defect first when practical.
- A major change normally uses product/requirements/design, decisions as needed, and a [plan](../templates/execution/execution-plan.template.md) with slices. Use a separate [test plan](../templates/design/test-plan.template.md) when multiple boundaries require coordination.
- An uncertain algorithm starts with an [experiment](../templates/execution/experiment.template.md), not a promise of implementation success.

The task can authorize implementing an already clear requirement; explicit acceptance does not require asking the same permission again. Resolve decisions only at the boundary where they materially change the contract.

## Completion

Use `COMPLETE`, `PARTIAL`, or `BLOCKED` with evidence, affected scope, and next actions. Complete means all in-scope requirements are satisfied to the agreed standard. Partial means useful work landed with gaps. Blocked names the dependent decision or unavailable prerequisite. A blocked slice does not prevent independent authorized work.

Update the canonical owner docs alongside the change. Preserve completed execution notes and superseded reasoning under the project's archive policy, with current documents pointing to current authority. Issues and PRs coordinate delivery; they do not replace accepted requirements.
