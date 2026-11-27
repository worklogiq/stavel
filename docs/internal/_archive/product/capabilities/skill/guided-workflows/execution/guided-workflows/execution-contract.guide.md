# Shared execution contract for the planned packets

<!-- mdcomposer:meta
title: "Shared execution contract for the planned packets"
kind: guide
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Planning authority and current scope

The owner requested execution packets on 2026-11-26. The subsequent Q&A answer was No—execution packets only. Generate no story documents in this pass; this is task-local and does not alter the default PLAN question or future story settings. This task prepares reviewable execution records, not implementation, commits, PRs or external delivery.

Canonical [requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md), [design](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.design.md), [decisions](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.decision.md) and [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md) remain the intent owners. The selected design-PR review gate applies to substantial features; planning does not invent acceptance. Small bounded diagnostic/contract assurance work uses existing accepted contracts and still needs an actual execution task.

## Ownership and readiness

The coordination plan owns the cross-packet dependency/assignment graph. Each slice owns its execution-status and eventual result/evidence. Packet plans provide owner-local navigation and stopping points; macro tables are manually validated projections until the planned work tools exist. Capability status owns actual initiative phase/next action; no second global status cache is introduced.

readiness: existing-contract means no new material design is required for the specified small scope; it is not permission to implement. readiness: design-input-required means resolve the referenced scoped DESIGN contracts and actual review evidence before execution. Dependencies must already be merged/applied on the declared baseline. A ready label does not establish those facts by itself.

The parent [baseline snapshot](./planning-baseline.json) records source/config/design input hashes. Revalidate changed inputs and affected design/readiness before execution; preserve current dirty work. Do not reset to HEAD or assume the snapshot is a clean commit. No external baseline/review reference exists until actual evidence records it.

## Execution obligations

Use EXECUTE with built-in STRICT MODE for actual implementation. Preserve required mechanisms, supported commands, root instructions, local colocation, mutable story templates, selected test/story policies, containment, preflight, no-op behavior and journal recovery. New tests live beside their actual source owner. New services have meaningful behavioral tests; file presence and aggregate test count are not proof.

Every slice must leave its declared coherent endpoint without future unmerged repair code. Prefer additive, independently tested surfaces; do not advertise incomplete interfaces. Where a split cannot satisfy that endpoint, combine/redesign it explicitly without losing requirement coverage. New defects outside scope get reproducing evidence and their own bounded resolution instead of weakened assertions.

For each implementation run npm test and npm run check, with focused API/filesystem/actual process tests named by the slice. Read selected repository commands and actual side effects before using them; packaged tooling does not authorize arbitrary application execution. Record platform limitations, unavailable review, deviations and actual command results.

Use subagents for independent implementation/review slices where authorized, with explicit file/contract ownership and merged prerequisites. One coordinator integrates shared schemas/CLI/catalog changes and verifies the combined diff. Agents share the workspace; overlapping writes require serialization. The plan's delegation instructions do not imply agents were used in this PLAN pass or grant external permissions.

## Completion and history

Mark a slice complete only with outcome-to-implementation-to-evidence results and reconciled canonical docs. PR-subset readiness, packet completion and initiative completion are distinct. Closed owner-local packets archive as units under the selected mirror policy after actual closure; active/design-pending packets stay current. The existing component verification records remain evidence to preserve, not work to recreate.

The integration coordinator owns shared edits to src/stavel.cli.ts, src/framework.types.ts, catalogs and the service-verification matrix. Independent agents can own nonoverlapping service/tests/artifacts and submit their evidence; serialize adapter/schema/matrix integration and rerun affected checks. Finish FND-02/FND-03 before CFG-01 so configuration changes do not race the existing-contract baseline audit.

## Accepted execution baseline

The owner accepted the [eight consolidated recommendations and amendments](./execution-acceptance.decision.md), including a one-time chat-reviewed design baseline for this initiative. Prior pending-review descriptions record planning history. Execute dependency-ready scope with the accepted nondeterminism warnings and configurable conventional-commit policy; actual implementation evidence remains separate.
