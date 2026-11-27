# SET-03: Initialize and verify through a guided aligned flow

<!-- mdcomposer:meta
title: "SET-03: Initialize and verify through a guided aligned flow"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: SET-03
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Connect bare init to scope, shared questions, concrete preview/application, owner/status registration and post-apply verification while retaining explicit args/answers automation.

Requirements: GW-06, GW-08, GW-17, GW-26, GW-27, GW-28, GW-36, GW-37 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-04, T-06, T-08, T-20, T-21, T-22, T-30, T-31 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/initialization/initialization.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [SET-02](./set-02-shared-question-sessions.execution-slice.md), ART-02 (archived; see historical context), [WRK-03](../../../work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md).

Design inputs: [G-02](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md), [G-03](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/stavel.cli.ts](../../../../../../../../../src/stavel.cli.ts)
- [src/planning.service.ts](../../../../../../../../../src/planning.service.ts)
- [src/migration.service.ts](../../../../../../../../../src/migration.service.ts)
- [src/checking.service.ts](../../../../../../../../../src/checking.service.ts)

Non-goals: No new automatic installation, global host skill replacement, remote service calls or weakening of existing low-level plan/apply interfaces.

## Acceptance and coherent stopping point

- No target artifacts precede complete applicable alignment; decline/dry-run remain byte-preserving and stale application refuses.
- Generate the selected root overview, owner-local framework/config and editable story template; preserve existing instructions, actual owners and template edits.
- Reuse supported work-management operations; test conventions and story ask/always/never choices persist, while init does not generate feature stories or run arbitrary target code.

Declared post-merge endpoint: Bare init is a complete supported vertical outcome with truthful verification and recovery, not a prompt shim that writes without preview or leaves a broken routing state.

## Verification and integration

Run greenfield/existing/research, root/subdirectory, explicit-target, repeated setup, pending root routing, cancellation, interruption and mapped-home fixtures through actual commands. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Guided preparation composes aligned configuration plans with owner-aware initialization artifacts and an empty pointer-only work registry. Missing product facts are asked before alignment; mapped existing overviews remain intact. The actual selected mode and final remapped owner/template paths reach the preview. [Component verification](./guided-init.verification.md) records actual API preview/apply and terminal/headless cases. Bare CLI orchestration, required full checks and independent agent proof remain coordinator integration work.

## Actual local execution result

Delivered detected-root terminal/headless initialization, shared resumable questions and aligned preserving product/config/work setup.

Completion is based on the [component proof](./guided-init.verification.md), [integrated verification](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../../../../skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
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
    "docs/internal/_archive/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "guided-init",
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
            "path": "docs/internal/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
            "sha256": "ca65df0cc0fc42d829221bb943e599ea7eff944893ad8d7b32aa0de07571dc02"
          },
          "to": {
            "path": "docs/internal/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
            "sha256": "faebd2940c4d22371d594d184a4fb232222350493e49a67e4b073e28d94443ab"
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
            "path": "docs/internal/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
            "sha256": "faebd2940c4d22371d594d184a4fb232222350493e49a67e4b073e28d94443ab"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
            "sha256": "e8fd98475d71fa47873d7a0a9180cb8ace0255e098d9419d5c147315e7718c16"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "guided-init"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/_archive/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
            "sha256": "e8fd98475d71fa47873d7a0a9180cb8ace0255e098d9419d5c147315e7718c16"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md",
            "sha256": "104253a653d97c8dbb3543093c87510d0ae402d371eacb2df1d4f12309013ade"
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
  "result": "Delivered detected-root terminal/headless initialization, shared resumable questions and aligned preserving product/config/work setup.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "SET-03",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/cli/initialization/execution/guided-init/guided-init.verification.md": "104253a653d97c8dbb3543093c87510d0ae402d371eacb2df1d4f12309013ade",
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
  "legacySliceId": "SET-03",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/initialization/execution/guided-init/set-03-bare-init.execution-slice.md",
  "sourceSha256": "a2246fdbb76f19b5bf33fabf3af7bfc5c001a25a14be85485a43d5d9be286b76"
}
-->

## Historical context (archived)

- [ART-02](../../../../skill/guided-workflows/execution/artifact-generation/art-02-owner-aware-rendering.execution-slice.md)
