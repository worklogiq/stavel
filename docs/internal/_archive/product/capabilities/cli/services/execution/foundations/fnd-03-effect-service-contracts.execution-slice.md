# FND-03: Verify orchestration and mutation service contracts

<!-- mdcomposer:meta
title: "FND-03: Verify orchestration and mutation service contracts"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: FND-03
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Complete identifiable service coverage for checking, decisions, planning, migration, export, policy and testing, reusing the existing story/testing/process cases.

Requirements: GW-35, GW-23 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-29, T-16 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/cli.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [FND-01](./fnd-01-package-inspection.execution-slice.md).

Design inputs: No new design gate for this bounded existing-contract scope. Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/checking.service.ts](../../../../../../../../../src/checking.service.ts)
- [src/decisions.service.ts](../../../../../../../../../src/decisions.service.ts)
- [src/planning.service.ts](../../../../../../../../../src/planning.service.ts)
- [src/migration.service.ts](../../../../../../../../../src/migration.service.ts)
- [src/export.service.ts](../../../../../../../../../src/export.service.ts)
- [src/rules/policy.service.ts](../../../../../../../../../src/rules/policy.service.ts)
- [src/testing.service.ts](../../../../../../../../../src/testing.service.ts)
- [src/stavel.cli.test.ts](../../../../../../../../../src/stavel.cli.test.ts)

Non-goals: No new future command promises, relaxed assertions to match bugs or artificial tests for type-only files/barrels.

## Acceptance and coherent stopping point

- All twelve current service modules have an explicit obligation-to-case-to-result map; list genuine remaining gaps rather than inferring coverage from filenames.
- Positive, invalid-input, stale/refusal and partial-recovery cases use real effects at their actual boundaries.
- Retain canonical default-kind regression, story copy-once preservation, nine testing cases and actual CLI/package tests; source tests stay colocated.

Declared post-merge endpoint: Existing supported behavior is better verified without depending on the forthcoming configuration/session/doctor implementation.

## Verification and integration

Run focused service cases, actual built process cases and existing package/relocation checks through npm test; run npm run check. Isolate any newly exposed incompatible behavior before widening a fix. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

COMPLETE for this local scoped slice. Added direct checking/export/migration and pure configuration evidence, retaining prior suites. Fixed a reproduced missing/empty SKILL export defect with a two-line preflight guard. Independent review strengthened whole-state refusal assertions and narrowed the pure-validation claim.

The integrated Windows/Node v20.19.6 run completed 145 tests: 144 passed, zero failed, one explicitly skipped permission case. npm run check reported zero diagnostics. [Foundation verification](./foundations.verification.md) records reproducing evidence, independent reviews, exact scope and platform limitations. Linux/other Node matrix and broader workflow conformance are not claimed. No commit/push/publication occurred.

## Actual local execution result

Verified package inspection and source/export refusal behavior, with direct colocated tests for every foundational service.

Completion is based on the [component proof](./foundations.verification.md), [integrated verification](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../../../../skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/cli/services/execution/foundations/foundations.verification.md",
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
    "docs/internal/_archive/product/capabilities/cli/services/execution/foundations/foundations.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "foundations",
  "referenceHistory": [
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/product/capabilities/cli/services/execution/foundations/foundations.verification.md",
            "sha256": "b1d95c5deec6ff423518664670a9dcc041785a10346903012a6331a495330c59"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/services/execution/foundations/foundations.verification.md",
            "sha256": "26d352e5e3759a91ae194fdbd514475a76b8963074cfa0154640bcddc7dbdcd4"
          }
        },
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
            "path": "docs/internal/_archive/product/capabilities/cli/services/execution/foundations/foundations.verification.md",
            "sha256": "26d352e5e3759a91ae194fdbd514475a76b8963074cfa0154640bcddc7dbdcd4"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/services/execution/foundations/foundations.verification.md",
            "sha256": "b1d95c5deec6ff423518664670a9dcc041785a10346903012a6331a495330c59"
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
  "result": "Verified package inspection and source/export refusal behavior, with direct colocated tests for every foundational service.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "FND-03",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/cli/services/execution/foundations/foundations.verification.md": "b1d95c5deec6ff423518664670a9dcc041785a10346903012a6331a495330c59",
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
  "legacySliceId": "FND-03",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/services/execution/foundations/fnd-03-effect-service-contracts.execution-slice.md",
  "sourceSha256": "651a3f4b0f9ff03b27db45443094da384a0812fa6e76b4b285031f858a307b38"
}
-->
