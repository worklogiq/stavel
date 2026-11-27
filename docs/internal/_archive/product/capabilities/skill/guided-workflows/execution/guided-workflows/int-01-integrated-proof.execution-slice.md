# INT-01: Verify packed distribution and independent end-to-end use

<!-- mdcomposer:meta
title: "INT-01: Verify packed distribution and independent end-to-end use"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: INT-01
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Validate the integrated selected workflows through offline package install, relocated export and an independent agent scenario, preserving actual platform/support boundaries.

Requirements: GW-18, GW-20, GW-23, GW-34, GW-36, GW-37 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-14, T-16, T-24, T-25, T-26, T-28, T-30, T-31 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/skill/guided-workflows/index.md). Read the [shared execution contract](./execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](./planning-baseline.json) and current user changes. Merged/applied prerequisites: FND-03 (archived; see historical context), SET-03 (archived; see historical context), DOC-02 (archived; see historical context), LFC-03 (archived; see historical context), HLP-01 (archived; see historical context), WRK-03 (archived; see historical context).

Design inputs: [G-08](./design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [package.test.ts](../../../../../../../../../package.test.ts)
- [config/assets.catalog.json](../../../../../../../../../config/assets.catalog.json)
- [skills/stavel](../../../../../../../../../skills/stavel)
- [src](../../../../../../../../../src)

Non-goals: No npm publication, publishing pipeline, real user/global skill replacement, external tracker mutation or unobserved agent-success claim.

## Acceptance and coherent stopping point

- All executable/catalog dependencies are present offline and source-specific packets/status/config stay outside generic adopter assets.
- Actual setup/customization/PLAN/EXECUTE/VIBE/closure scenarios preserve owners, mechanism, test placement, story choices and user edits.
- Stop after a single declared ready slice to prove a coherent prefix, then separately verify the broader outcome; agent evidence and structural checks stay distinct.

Declared post-merge endpoint: The integrated artifact is usable in isolated supported environments with an explicit evidence/limitation record and no hidden sibling checkout or network assumption.

## Verification and integration

Run npm test, npm run check, actual packed/offline install and relocated commands. Use an independent subagent trial when authorized, with isolated fixtures and actual artifacts/diff/check evidence. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Original PLAN context: this document initially recorded no execution or completion. On execution record changed locations/revision, requirement-to-case results, exact checks and outcomes, deviations, unavailable evidence and a durable next action. Current bounded groundwork is linked from the parent packet and must not be rebuilt merely because this slice is planned.

## Actual local execution result

Completed combined source/API/CLI/package verification, bounded independent usage and source policy/work-schema adoption; local scope is ready for owner review.

Completion is based on the [component proof](./guided-workflows.verification.md), [integrated verification](./guided-workflows.verification.md) and [bounded philosophy review](./philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md",
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
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "guided-workflows",
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
  "result": "Completed combined source/API/CLI/package verification, bounded independent usage and source policy/work-schema adoption; local scope is ready for owner review.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "INT-01",
  "sourceHashes": {
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
  "legacySliceId": "INT-01",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/int-01-integrated-proof.execution-slice.md",
  "sourceSha256": "2ed0ef388f0a59e436c607ccd600aa505fca3360396b6672c93fdee940778839"
}
-->

## Historical context (archived)

- [FND-03](../../../../cli/services/execution/foundations/fnd-03-effect-service-contracts.execution-slice.md)

- [SET-03](../../../../cli/initialization/execution/guided-init/set-03-bare-init.execution-slice.md)

- [WRK-03](../../../../cli/work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md)

- [DOC-02](../../../../cli/doctor/execution/guided-doctor/doc-02-repair-flow.execution-slice.md)

- [LFC-03](../lifecycle-delivery/lfc-03-vibe-checkpoints.execution-slice.md)

- [HLP-01](../../../../cli/help/execution/effective-help/hlp-01-effective-help.execution-slice.md)
