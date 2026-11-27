# DOC-02: Offer a concrete repair preview and verified apply

<!-- mdcomposer:meta
title: "DOC-02: Offer a concrete repair preview and verified apply"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: DOC-02
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Complete bare doctor with findings then an offered preview of the accepted deterministic repair allowlist, scoped application and re-entry verification.

Requirements: GW-38, GW-07, GW-08, GW-17 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-32, T-07, T-08, T-04 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/doctor/doctor.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [DOC-01](./doc-01-diagnosis.execution-slice.md), SET-03 (archived; see historical context), WRK-03 (archived; see historical context).

Design inputs: [G-04](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/checking.service.ts](../../../../../../../../../src/checking.service.ts)
- [src/migration.service.ts](../../../../../../../../../src/migration.service.ts)
- [src/stavel.cli.ts](../../../../../../../../../src/stavel.cli.ts)

Non-goals: No unrestricted autofix, detected-script execution by default, force overwrite or implication that preview approves every future repair.

## Acceptance and coherent stopping point

- Declining repair leaves bytes unchanged; approved supported repairs show exact effects, validate hashes and use recoverable application.
- Stale findings, conflicting edits, partial failure and interrupted resume produce actionable outcomes without losing user changes.
- Semantic/source repairs remain ordinary accepted feature work; uninitialized setup proposals respect the shared alignment engine rather than silently adopting.

Declared post-merge endpoint: The full selected doctor experience works from findings through verification with existing read-only diagnosis preserved.

## Verification and integration

Exercise both terminal and agent interfaces, actual CLI failures/cancellation and known repair fixtures; compare bytes, journal recovery and refreshed findings. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Original PLAN context: this document initially recorded no execution or completion. On execution record changed locations/revision, requirement-to-case results, exact checks and outcomes, deviations, unavailable evidence and a durable next action. Current bounded groundwork is linked from the parent packet and must not be rebuilt merely because this slice is planned.

## Actual local execution result

Delivered diagnosis and conservative preserving repair previews, with unavailable/semantic review distinctions and AI-authorship warnings.

Completion is based on the [component proof](./guided-doctor.verification.md), [integrated verification](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../../../../skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/cli/doctor/execution/guided-doctor/guided-doctor.verification.md",
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
    "docs/internal/_archive/product/capabilities/cli/doctor/execution/guided-doctor/guided-doctor.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "guided-doctor",
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
            "path": "docs/internal/product/capabilities/cli/doctor/execution/guided-doctor/guided-doctor.verification.md",
            "sha256": "50e1faaa8ff49b38b127a8ec96c51726a5d3ebe4b41e8bf705078d46f3c0ebd7"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/doctor/execution/guided-doctor/guided-doctor.verification.md",
            "sha256": "807f187a4d3c3ef7d61e686710de58ba5005ab7b7deaf213c8a6b37d042a669f"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "guided-doctor"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/_archive/product/capabilities/cli/doctor/execution/guided-doctor/guided-doctor.verification.md",
            "sha256": "807f187a4d3c3ef7d61e686710de58ba5005ab7b7deaf213c8a6b37d042a669f"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/doctor/execution/guided-doctor/guided-doctor.verification.md",
            "sha256": "50e1faaa8ff49b38b127a8ec96c51726a5d3ebe4b41e8bf705078d46f3c0ebd7"
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
  "result": "Delivered diagnosis and conservative preserving repair previews, with unavailable/semantic review distinctions and AI-authorship warnings.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "DOC-02",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/cli/doctor/execution/guided-doctor/guided-doctor.verification.md": "50e1faaa8ff49b38b127a8ec96c51726a5d3ebe4b41e8bf705078d46f3c0ebd7",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md": "6cc37a80c0b00d832bc16c848e350ad5ed03d14b51f448c98cda610075bf1262",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md": "2e9c93b740f6aac7feea53a5ef0615aca0b4894400d4020dbd4afc5d805685ae"
  },
  "status": "complete"
}
-->

<!-- stavel:migration
{
  "from": "provisional-execution-fields",
  "legacyExecutionStatus": "complete",
  "legacySliceId": "DOC-02",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/doctor/execution/guided-doctor/doc-02-repair-flow.execution-slice.md",
  "sourceSha256": "1a5f271346ff1d95b9b4503c65072546fe11b36fd13b1ea4684e536057b786c0"
}
-->

## Historical context (archived)

- [SET-03](../../../initialization/execution/guided-init/set-03-bare-init.execution-slice.md)

- [WRK-03](../../../work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md)
