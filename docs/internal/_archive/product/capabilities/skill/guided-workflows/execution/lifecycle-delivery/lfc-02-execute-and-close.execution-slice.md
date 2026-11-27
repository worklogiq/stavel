# LFC-02: Execute ready scope and close with evidence

<!-- mdcomposer:meta
title: "LFC-02: Execute ready scope and close with evidence"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: LFC-02
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Route EXECUTE to ready authorized slices using STRICT MODE and supported work commands, then verify/reconcile the selected slice, PR subset or initiative boundary.

Requirements: GW-38, GW-11, GW-12, GW-13, GW-21, GW-23, GW-31 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-32, T-12, T-13, T-15, T-16, T-17, T-25 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/skill/guided-workflows/index.md). Read the [shared execution contract](../guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [LFC-01](./lfc-01-plan-packets.execution-slice.md), DOC-02 (archived; see historical context), WRK-03 (archived; see historical context).

Design inputs: [G-05](../guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [skills/stavel/SKILL.md](../../../../../../../../../skills/stavel/SKILL.md)
- [docs/internal/process/prompts/execute.prompt.md](../../../../../../../process/prompts/execute.prompt.md)
- [docs/internal/process/prompts/strict.prompt.md](../../../../../../../process/prompts/strict.prompt.md)
- [docs/internal/process/prompts/review.prompt.md](../../../../../../../process/prompts/review.prompt.md)

Non-goals: No permission granted by a mode name, automatic application command execution beyond the task, global host changes or premature archive.

## Acceptance and coherent stopping point

- Preserve required mechanisms and actual changes; missing preparation explicitly transitions to authorized PLAN/DESIGN instead of being silently performed as EXECUTE.
- Selected checks/philosophies and actual diff drive closure; failures, unavailable review and remaining scope prevent an unqualified complete claim.
- Whole closed packets archive as units with selected mirror mappings and valid references; a partial PR does not archive an unfinished initiative.

Declared post-merge endpoint: An executor can complete one ready slice and leave a coherent verified repository with durable evidence; initiative completion and external PR/merge authorization remain distinct.

## Verification and integration

Run a fresh agent with a defining mechanism and unrelated edits; stop after one slice, verify without future slice code, seed missing checks and repeat closure after edits. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Bounded transition/closure/archive library implementation and failure reproductions are recorded in [lifecycle service evidence](./lifecycle-delivery.verification.md). Required check preservation, actual review/evidence hashes, prerequisite readiness, whole-packet mirror archival, binary preservation, historical links and interrupted apply/resume are independently exercised. These checks do not prove semantic acceptance. Dependencies, CLI/work/doctor integration, full repository checks and fresh-agent execution remain required before declaring this slice complete.

## Actual local execution result

Delivered template-based execution packets, canonical slice state, strict evidence and dependency gates, VIBE checkpoints and tested whole-packet mirrored archival.

Completion is based on the [component proof](./lifecycle-delivery.verification.md), [integrated verification](../guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lifecycle-delivery.verification.md",
      "id": "component-contracts",
      "required": true,
      "state": "passed"
    },
    {
      "description": "Final npm test 324 cases: 323 passed, zero failed, one existing Windows skip; npm run check zero diagnostics; TypeScript validation passed.",
      "evidence": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md",
      "id": "integrated-local-checks",
      "required": true,
      "state": "passed"
    },
    {
      "description": "The supported Windows/Ubuntu Node matrix was not run remotely; bounded local Windows and Linux consumer results are recorded separately.",
      "evidence": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md",
      "id": "remote-ci-matrix",
      "required": false,
      "state": "unavailable"
    }
  ],
  "evidence": [
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lifecycle-delivery.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "lifecycle-delivery",
  "referenceHistory": [
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md",
            "sha256": "a58944f83697bb5b30a110372f6f3e5130bc86c90ca6a977f969faf346c75888"
          },
          "to": {
            "path": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md",
            "sha256": "df122b5e16cd26b22363186636b8a84000d705bf0bb1dfcce2ba6fad4af2795a"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "foundations"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lifecycle-delivery.verification.md",
            "sha256": "11720bd8ea8829d0fd70448763269680e190786f8543d9092dcbbb5c67d72822"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lifecycle-delivery.verification.md",
            "sha256": "d8559bc8a2b27cd1dd2138cf6da097dd480e35656c13d4f0d9b47b1426136d2e"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "lifecycle-delivery"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lifecycle-delivery.verification.md",
            "sha256": "d8559bc8a2b27cd1dd2138cf6da097dd480e35656c13d4f0d9b47b1426136d2e"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lifecycle-delivery.verification.md",
            "sha256": "1a4e552ec36b8e0898854e701c26a31663d47d6cdd26a62544f15ec9145c0d74"
          }
        },
        {
          "from": {
            "path": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md",
            "sha256": "df122b5e16cd26b22363186636b8a84000d705bf0bb1dfcce2ba6fad4af2795a"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md",
            "sha256": "6cc37a80c0b00d832bc16c848e350ad5ed03d14b51f448c98cda610075bf1262"
          }
        },
        {
          "from": {
            "path": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
            "sha256": "e3c66b4bcc6e6fe0e8e8d45059115056b6fc624185ea9e7f88606a250c65949c"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
            "sha256": "2e9c93b740f6aac7feea53a5ef0615aca0b4894400d4020dbd4afc5d805685ae"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "guided-workflows"
    }
  ],
  "result": "Delivered template-based execution packets, canonical slice state, strict evidence and dependency gates, VIBE checkpoints and tested whole-packet mirrored archival.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "LFC-02",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md": "6cc37a80c0b00d832bc16c848e350ad5ed03d14b51f448c98cda610075bf1262",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md": "2e9c93b740f6aac7feea53a5ef0615aca0b4894400d4020dbd4afc5d805685ae",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lifecycle-delivery.verification.md": "1a4e552ec36b8e0898854e701c26a31663d47d6cdd26a62544f15ec9145c0d74"
  },
  "status": "complete"
}
-->

<!-- stavel:migration
{
  "from": "provisional-execution-fields",
  "legacyExecutionStatus": "complete",
  "legacySliceId": "LFC-02",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/skill/guided-workflows/execution/lifecycle-delivery/lfc-02-execute-and-close.execution-slice.md",
  "sourceSha256": "5be89c2ede66fc647898ef6fd1b22b6112b1aeb831a6a4dab09affd3983b812d"
}
-->

## Historical context (archived)

- [WRK-03](../../../../cli/work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md)

- [DOC-02](../../../../cli/doctor/execution/guided-doctor/doc-02-repair-flow.execution-slice.md)
