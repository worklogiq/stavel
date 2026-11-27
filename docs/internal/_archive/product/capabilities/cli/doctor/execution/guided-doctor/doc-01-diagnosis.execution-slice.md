# DOC-01: Expose truthful read-only diagnosis

<!-- mdcomposer:meta
title: "DOC-01: Expose truthful read-only diagnosis"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: DOC-01
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Implement a selected documented read-only diagnosis surface for initialized and uninitialized targets, with effective policy and explicit semantic review tasks.

Requirements: GW-07, GW-27 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-07, T-21 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/doctor/doctor.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: CFG-03 (archived; see historical context), SET-01 (archived; see historical context), ART-01 (archived; see historical context).

Design inputs: [G-04](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md), [G-02](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/checking.service.ts](../../../../../../../../../src/checking.service.ts)
- [src/decisions.service.ts](../../../../../../../../../src/decisions.service.ts)
- [src/stavel.cli.ts](../../../../../../../../../src/stavel.cli.ts)

Non-goals: No philosophical correctness claim from valid Markdown, guessed source refactors or automatic target script execution.

## Acceptance and coherent stopping point

- Findings include actual location/evidence/applicability and distinguish failed, unavailable, skipped, review-required and passed.
- Current mechanical checks and owner/amendment conflicts are reused; missing agent review never appears as passed in CLI output.
- Read-only diagnosis has no repair or arbitrary repository command effects, and availability labels expose that exact supported boundary.

Declared post-merge endpoint: A complete report-only capability is usable independently; no broken full repair workflow is advertised before DOC-02.

## Verification and integration

Use valid/uninitialized targets, malformed config, unavailable selected tools, stale amendments and seeded semantic tasks; observe read-only process behavior and output contract. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

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
  "sliceId": "DOC-01",
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
  "legacySliceId": "DOC-01",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/doctor/execution/guided-doctor/doc-01-diagnosis.execution-slice.md",
  "sourceSha256": "31b5a712d2b6244e83e4c5d6f3bca5b82d0bf2a0b1305153414bddaa005b88a0"
}
-->

## Historical context (archived)

- [CFG-03](../../../../../contracts/configuration/execution/repository-configuration/cfg-03-structured-amendments.execution-slice.md)

- [ART-01](../../../../skill/guided-workflows/execution/artifact-generation/art-01-portable-artifact-catalog.execution-slice.md)

- [SET-01](../../../initialization/execution/guided-init/set-01-scope-discovery.execution-slice.md)
