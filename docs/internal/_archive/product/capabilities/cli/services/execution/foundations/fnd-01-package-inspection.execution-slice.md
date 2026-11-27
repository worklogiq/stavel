# FND-01: Report malformed package input accurately

<!-- mdcomposer:meta
title: "FND-01: Report malformed package input accurately"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: FND-01
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Distinguish a missing package, a valid package with no scripts and malformed package JSON through located inspection evidence. Use the existing notes channel without changing successful inspect output/exit behavior.

Requirements: GW-01 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-01 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/cli.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: None.

Design inputs: No new design gate for this bounded existing-contract scope. Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/decisions.service.ts](../../../../../../../../../src/decisions.service.ts)
- [src/decisions.service.test.ts](../../../../../../../../../src/decisions.service.test.ts)

Non-goals: No new inspection schema, exit-code redesign, terminal session engine or unrelated package parser refactor.

## Acceptance and coherent stopping point

- A malformed package.json yields a path-located parse finding; valid empty scripts and absent package files do not produce that finding.
- Direct API and built inspect process cases prove read-only behavior and meaningful output, with a reproducer before the fix.
- Preserve managed-asset capability filtering, explicit-invalid-answer refusal and existing question/alignment behavior.

Declared post-merge endpoint: The existing inspect/questions APIs and CLI remain usable, now with an honest diagnostic; no later PR is required for basic inspection correctness.

## Verification and integration

Exercise absent, valid, malformed and permission/error inputs where supported; capture actual stdout, notes and target-byte preservation. Run npm test and npm run check. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

COMPLETE for this local scoped slice. Implemented the located malformed-package note with four focused passing cases and one explicit Windows permission skip. Three failures were reproduced first. Existing successful inspect semantics and read-only bytes are preserved.

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
  "sliceId": "FND-01",
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
  "legacySliceId": "FND-01",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/services/execution/foundations/fnd-01-package-inspection.execution-slice.md",
  "sourceSha256": "5feba17589511a60e22a78a5c4488ca9fa8730f7383478d9fe8af1299d1e3406"
}
-->
