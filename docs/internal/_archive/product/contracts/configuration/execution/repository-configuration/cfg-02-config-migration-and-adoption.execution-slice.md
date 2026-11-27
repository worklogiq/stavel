# CFG-02: Adopt and migrate committed configuration safely

<!-- mdcomposer:meta
title: "CFG-02: Adopt and migrate committed configuration safely"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: CFG-02
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Enable aligned config generation and explicit root-file/directory migration through existing plan/preflight/journal services; connect relevant current consumers to the shared result.

Requirements: GW-38, GW-27, GW-16, GW-19, GW-24, GW-36, GW-37 in [canonical requirements](../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-32, T-21, T-11, T-06, T-18, T-30, T-31 in [acceptance scenarios](../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../product/contracts/configuration/index.md). Read the [shared execution contract](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [CFG-01](./cfg-01-effective-config-reader.execution-slice.md).

Design inputs: [G-01](../../../../capabilities/skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/planning.service.ts](../../../../../../../../src/planning.service.ts)
- [src/migration.service.ts](../../../../../../../../src/migration.service.ts)
- [src/checking.service.ts](../../../../../../../../src/checking.service.ts)
- [docs/internal/dev/project-profile.overview.md](../../../../../../dev/project-profile.overview.md)

Non-goals: No rename of an adopter merely because product is the new default; no unapproved source-repo dogfood changes beyond the implementation task.

## Acceptance and coherent stopping point

- Preview/decline produce no target changes; apply preserves user decisions, template bytes and selected test layout.
- Both conflicting homes produce a reviewed migration/refusal path, not last-write-wins behavior; interrupted/stale changes recover without overwriting later edits.
- All current inspect/questions/plan/init/check entrypoints use the same accepted policy; source export still uses its portable source catalog.

Declared post-merge endpoint: The supported new config format works end-to-end while old automation is preserved or explicitly migrated; there is no reader/writer interpretation split.

## Verification and integration

Exercise actual CLI plan/apply/check and repeated adoption for old/new mapped fixtures, including MenuLogiq-like paths. Run required suite/check and journal recovery cases. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Shared policy drives planning/checking/questions/inspection. Aligned plans support directory bootstrap and explicit root-file retirement, including hidden-file preconditions and journaled recovery. [Component verification](./configuration.verification.md) records actual API apply/dry-run/repeat/rollback/resume, stale-input refusal and template-byte preservation. New CLI process and required coordinator checks remain pending. Conflicting simultaneous authorities refuse without guessing which to retain.

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
  "sliceId": "CFG-02",
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
  "legacySliceId": "CFG-02",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/contracts/configuration/execution/repository-configuration/cfg-02-config-migration-and-adoption.execution-slice.md",
  "sourceSha256": "9e28a0b2d4b56b82256d67a8ea78b97ccc41ae4bac64aec80b7ba61dd56617cd"
}
-->
