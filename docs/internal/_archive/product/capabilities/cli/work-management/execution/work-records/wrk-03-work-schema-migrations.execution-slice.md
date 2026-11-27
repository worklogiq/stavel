# WRK-03: Upgrade supported work schemas without changing intent

<!-- mdcomposer:meta
title: "WRK-03: Upgrade supported work schemas without changing intent"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: WRK-03
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Code the selected supported version paths with old/new fixtures, reviewable diffs and hash-checked apply/recovery, reusing the writer safeguards.

Requirements: GW-29, GW-16 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-23, T-11 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/work-management/work-management.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [WRK-02](./wrk-02-work-writers.execution-slice.md).

Design inputs: [G-03](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/migration.service.ts](../../../../../../../../../src/migration.service.ts)
- [src/framework.types.ts](../../../../../../../../../src/framework.types.ts)
- [docs/internal/product/contracts/configuration/work-status.design.md](../../../../../../../product/contracts/configuration/work-status.design.md)

Non-goals: No promise of universal backward compatibility, silent coercion of unknown fields or adoption of upstream defaults during conversion.

## Acceptance and coherent stopping point

- Schema conversion preserves stable identities, actual state/history and accepted configuration/decision sources.
- Dry-run/decline write nothing; stale or unsupported newer inputs refuse without overwrite and partial conversion is recoverable.
- Readers/writers/skill adapters report migration-needed or incompatibility honestly; a schema upgrade does not select new documentation or workflow policy.

Declared post-merge endpoint: The supported version matrix is complete and independently tested; all unsupported versions fail actionably without a later repair PR.

## Verification and integration

Exercise actual old-to-new fixtures, repeated migration, unsupported paths, concurrent edits and recovery; compare semantic records as well as bytes/hashes. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Original PLAN context: this document initially recorded no execution or completion. On execution record changed locations/revision, requirement-to-case results, exact checks and outcomes, deviations, unavailable evidence and a durable next action. Current bounded groundwork is linked from the parent packet and must not be rebuilt merely because this slice is planned.

## Actual local execution result

Delivered pointer-indexed capability records, source-backed queries and exclusive, checked, recoverable writers with explicit schema migration.

Completion is based on the [component proof](./work-records.verification.md), [integrated verification](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../../../../skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/cli/work-management/execution/work-records/work-records.verification.md",
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
    "docs/internal/_archive/product/capabilities/cli/work-management/execution/work-records/work-records.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "work-records",
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
            "path": "docs/internal/product/capabilities/cli/work-management/execution/work-records/work-records.verification.md",
            "sha256": "1bbe354872798422f37a43e8fd89ab7c0ca2ac642401f63fa40f3959ddf823ba"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/work-management/execution/work-records/work-records.verification.md",
            "sha256": "ab20aabc663aa9d71b33195681ee1f8b1b3077b41fcbd362c3280448e9092cb6"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "work-records"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/_archive/product/capabilities/cli/work-management/execution/work-records/work-records.verification.md",
            "sha256": "ab20aabc663aa9d71b33195681ee1f8b1b3077b41fcbd362c3280448e9092cb6"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/work-management/execution/work-records/work-records.verification.md",
            "sha256": "1bbe354872798422f37a43e8fd89ab7c0ca2ac642401f63fa40f3959ddf823ba"
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
  "result": "Delivered pointer-indexed capability records, source-backed queries and exclusive, checked, recoverable writers with explicit schema migration.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "WRK-03",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/cli/work-management/execution/work-records/work-records.verification.md": "1bbe354872798422f37a43e8fd89ab7c0ca2ac642401f63fa40f3959ddf823ba",
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
  "legacySliceId": "WRK-03",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md",
  "sourceSha256": "01d75018bdee93b9715ec062875bb82e80eddd2325372a9785296e5138c4feaf"
}
-->
