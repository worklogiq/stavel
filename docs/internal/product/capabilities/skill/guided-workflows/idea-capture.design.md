# IDEA capture design

<!-- mdcomposer:meta
title: "IDEA capture design"
kind: design
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-27
acceptance: "user:2026-11-27:execute-idea-and-guard-designs"
-->

The owner requested quick IDEA capture and subsequently requested DESIGN. This is a draft technical design; the mode and commands are not implemented. The owner supplied the product intent; technical choices below are recommendations, not invented approval.

## Experience and boundaries

An agent asked to enter IDEA mode captures the user's thought, saves it and returns its stable ID/link. The proposed [CLI capture interface](../../cli/idea-capture/idea-capture.design.md) uses the same operation. No design packet, story question, implementation or automatic mode promotion is needed just to remember an idea.

Resolve the current repository and feature/capability owner using accepted mappings and active task context. Explicit target/owner arguments override inference. Ask only if actual scope or ownership cannot be resolved safely; automated callers receive structured missing input rather than a prompt. Preserve the user's original text instead of turning interpretation into an accepted requirement.

A target without the required adopted configuration/work registry returns setup-needed or specific missing input; capture does not silently bootstrap the repository.

## Records and authority

| Record | Responsibility |
| --- | --- |
| Small Markdown idea record | Stable identity, title, original text, source/instruction, capture date and optional links. Reuse kind recon and repository naming/templates; no new document kind is required initially. |
| Existing capability status file | Work ID, workType=idea, planned status, exploration phase, IDEA mode, record pointer and next action. This is the only lifecycle/status owner. |
| Existing work registry | Capability/status-file pointers only; queries summarize live records. No second backlog index or cached summary. |

Default new records live in ideas beneath the selected existing owner; configured conventions can map that location. Existing captured records retain their paths and IDs. Generate collision-safe IDs; an explicit capture request ID makes retries return the same record, while two intentional captures of similar text remain distinct. Store no duplicate current status in the idea body.

## Shared operation and effects

A reusable capture operation validates scope, selected configuration, record data and work identity, then previews one checked transaction containing the new Markdown record and capability/registry changes. Both CLI and skill use it. Reuse the work schema, validation and serializers; do not implement a parallel work format in the mode prompt.

The current work writer requires referenced files to exist. Implementation must extract/reuse its validation against a projected file set so capture can compose the record and registration in one hash-bound plan. Writing the record first and hoping registration succeeds is insufficient. Use the existing exclusive writer/journal boundary, stale-input checks and recovery; interrupted application is recoverable and never reported as successful capture.

Capture authorization covers those small files only. A preview/dry-run writes nothing. Ordinary skill capture follows the user's instruction without demanding a separate design-alignment ceremony; ambiguous target/owner and conflicting inputs still require resolution. Existing installation/configuration conventions remain authoritative.

## Lifecycle and compatibility

Add IDEA to supported mode/help metadata and portable guidance when implemented. Keep existing planned/exploration work states and legacy EXPLORE idea records readable; custom mode vocabularies need an explicit preserving addition, not an overwritten array. No automatic migration of the first captured idea is required.

Later exploration/design updates the same work identity and links its source idea; PLAN may then generate execution packets. Capture does not approve a design, execute an idea or authorize Git/external actions. IDEA is a capture posture, not another execution policy.

## Intended acceptance

- A one-sentence skill or CLI request creates one correctly named record and one discoverable work item, without a design/story questionnaire.
- CLI/API/agent paths preserve the same original text, ownership and stable ID; mapped roots and naming work.
- Retry IDs, colliding titles, invalid inputs, ambiguous owners and stale previews have explicit outcomes; missing input exits 2 and failures exit 1, with no accidental target writes.
- Injected interruption/recovery preserves prior work and finishes record plus registration consistently; preview/dry-run and true retry are no-ops.
- Live work queries find the idea after a new session; promotion retains its identity and source. Tests are colocated with each changed service and include real CLI/filesystem cases.

## First idea

[Packaged commit-safety hooks installed by init](../../cli/initialization/commit-safety-hooks.recon.md) is the first captured idea, with its [own draft design](../../cli/initialization/commit-safety-hooks.design.md). It is registered through today's work tooling. Next: review/select these designs, then PLAN execution; no execution slices are generated by this DESIGN pass.

## Design-pass verification

The documentation/work-record update passed npm run check with zero diagnostics and npm test with 323 passed, zero failed and one existing Windows permission skip (324 total). These results validate the current repository; they do not prove the proposed capture commands or hooks, which remain unimplemented. Both work items are in DESIGN with implementation not started.

## Execution selection

The owner subsequently selected this design through the explicit 2026-11-27 EXECUTE instruction. Earlier unimplemented/DESIGN-only statements describe that original baseline, not current execution status. Actual results belong to the execution packet and capability status record.
