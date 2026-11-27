# CFG-01: Resolve repository policy with provenance

<!-- mdcomposer:meta
title: "CFG-01: Resolve repository policy with provenance"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: CFG-01
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Implement the selected committed-config reader and provenance contract, distinguishing legacy-root, configured-directory, absent, invalid and conflicting sources.

Requirements: GW-39, GW-27, GW-16, GW-36, GW-37 in [canonical requirements](../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-33, T-21, T-11, T-30, T-31 in [acceptance scenarios](../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../product/contracts/configuration/index.md). Read the [shared execution contract](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: FND-02 (archived; see historical context), FND-03 (archived; see historical context).

Design inputs: [G-01](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/framework.types.ts](../../../../../../../../src/framework.types.ts)
- [src/decisions.service.ts](../../../../../../../../src/decisions.service.ts)
- [src/checking.service.ts](../../../../../../../../src/checking.service.ts)
- [src/planning.service.ts](../../../../../../../../src/planning.service.ts)
- [src/testing.service.ts](../../../../../../../../src/testing.service.ts)

Non-goals: No automatic convention migration, target command execution, remote profile download or premature new-format writes.

## Acceptance and coherent stopping point

- Read-only inspection/explanation returns one effective configuration with pinned baseline, actual paths and decision sources; invalid or conflicting input never silently falls back.
- Preserve test placement, ask/always/never story policy and mutable template ownership through resolution.
- Existing root-config interfaces remain supported. Until new-format writes are delivered, mutation entrypoints refuse unsupported activation clearly rather than ignore configured policy.

Declared post-merge endpoint: The resolver/read-only consumer surface is independently usable; existing writes retain their contract and new unsupported writes fail before touching a target.

## Verification and integration

Run old/new config fixtures, nested ambiguity, unavailable pinned defaults, malformed topics and conflicting homes; compare source provenance and zero-write snapshots. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Shared resolver and read-only consumers are implemented with provenance, pinned defaults, old/new/conflicting-home handling and preserved test/story settings. [Component verification](./configuration.verification.md) records 37 focused cases (36 passed, one existing Windows permission skip) and passing focused TypeScript checks. Full coordinator checks and new CLI process integration remain pending; tests do not establish agent conformance.

## Actual local execution result

Delivered early pinned configuration, explicit baseline/topic migrations, scoped amendments and preserved standing decisions including configurable conventional commits.

Completion is based on the [component proof](./configuration.verification.md), [integrated verification](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/contracts/configuration/execution/repository-configuration/configuration.verification.md",
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
    "docs/internal/_archive/product/contracts/configuration/execution/repository-configuration/configuration.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "repository-configuration",
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
            "path": "docs/internal/product/contracts/configuration/execution/repository-configuration/configuration.verification.md",
            "sha256": "9a26121098382e63412bdfdd8f1ab69723ae92c9bed79d12e7823bab91ecdd28"
          },
          "to": {
            "path": "docs/internal/_archive/product/contracts/configuration/execution/repository-configuration/configuration.verification.md",
            "sha256": "9eeb5304c24c59d228cc59220dc67a102d7e488de27b36a79ed1e5ae760cb3a5"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "repository-configuration"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/_archive/product/contracts/configuration/execution/repository-configuration/configuration.verification.md",
            "sha256": "9eeb5304c24c59d228cc59220dc67a102d7e488de27b36a79ed1e5ae760cb3a5"
          },
          "to": {
            "path": "docs/internal/_archive/product/contracts/configuration/execution/repository-configuration/configuration.verification.md",
            "sha256": "6054076afddd2669b2d319c4a5947aafb6daa28d95217ab6d94b90f927641cd3"
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
  "result": "Delivered early pinned configuration, explicit baseline/topic migrations, scoped amendments and preserved standing decisions including configurable conventional commits.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "CFG-01",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md": "6cc37a80c0b00d832bc16c848e350ad5ed03d14b51f448c98cda610075bf1262",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md": "2e9c93b740f6aac7feea53a5ef0615aca0b4894400d4020dbd4afc5d805685ae",
    "docs/internal/_archive/product/contracts/configuration/execution/repository-configuration/configuration.verification.md": "6054076afddd2669b2d319c4a5947aafb6daa28d95217ab6d94b90f927641cd3"
  },
  "status": "complete"
}
-->

<!-- stavel:migration
{
  "from": "provisional-execution-fields",
  "legacyExecutionStatus": "complete",
  "legacySliceId": "CFG-01",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/contracts/configuration/execution/repository-configuration/cfg-01-effective-config-reader.execution-slice.md",
  "sourceSha256": "15f4936ad0c711cc9a860a66e9d7e1b28f06cc2301ecf39fe60875feb5070cd1"
}
-->

## Historical context (archived)

- [FND-02](../../../../capabilities/cli/services/execution/foundations/fnd-02-pure-service-contracts.execution-slice.md)
- [FND-03](../../../../capabilities/cli/services/execution/foundations/fnd-03-effect-service-contracts.execution-slice.md)
