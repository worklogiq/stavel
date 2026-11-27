# SET-01: Resolve project scope without broadening writes

<!-- mdcomposer:meta
title: "SET-01: Resolve project scope without broadening writes"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: SET-01
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Implement the selected explicit-target/root/workspace discovery contract and expose source evidence and material ambiguity before any write.

Requirements: GW-03, GW-27, GW-34 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-02, T-21, T-28 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/initialization/initialization.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: CFG-02 (archived; see historical context).

Design inputs: [G-02](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/filesystem.service.ts](../../../../../../../../../src/filesystem.service.ts)
- [src/decisions.service.ts](../../../../../../../../../src/decisions.service.ts)
- [src/stavel.cli.ts](../../../../../../../../../src/stavel.cli.ts)

Non-goals: No first-Git-root heuristic treated as authority, automatic workspace-wide adoption or dependency installation.

## Acceptance and coherent stopping point

- Explicit target remains authoritative; subdirectory use resolves a determinate project root and ambiguous valid scopes return questions.
- Non-Git, nested package/workspace, absent target and symlink/junction cases have explicit located outcomes and no implicit broadening.
- Relevant owner/config discovery follows actual boundaries; accepted local capability structure remains mapped rather than replaced.

Declared post-merge endpoint: A read-only scope API/entrypoint is usable independently; existing explicit-target callers preserve their supported behavior.

## Verification and integration

Run real filesystem/process fixtures on supported Windows/Linux cases; prove zero target writes and no application command execution. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Scope discovery now supports explicit overrides, unique ancestor selection and structured ambiguity across actual configuration/package/workspace boundaries. [Component verification](./guided-init.verification.md) records 15 passing guided tests including both terminal candidate choices, explicit-target bypass and headless no-write scope evidence. Required new CLI processes, platform integration and coordinator checks remain pending; no scope is silently broadened by this API.

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
  "sliceId": "SET-01",
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
  "legacySliceId": "SET-01",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/initialization/execution/guided-init/set-01-scope-discovery.execution-slice.md",
  "sourceSha256": "3d870edf34f71cfdd5112781c80f4b03e5744347cf7c5303d3ad2bb785dd6b23"
}
-->

## Historical context (archived)

- [CFG-02](../../../../../contracts/configuration/execution/repository-configuration/cfg-02-config-migration-and-adoption.execution-slice.md)
