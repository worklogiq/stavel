# SET-02: Share resumable questions across terminal and agent

<!-- mdcomposer:meta
title: "SET-02: Share resumable questions across terminal and agent"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: SET-02
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Deliver the selected versioned decision/session engine with terminal and agent adapters, actual evidence sources and a bounded noninteractive contract.

Requirements: GW-04, GW-05, GW-17, GW-36 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-03, T-04, T-05, T-30 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/initialization/initialization.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [SET-01](./set-01-scope-discovery.execution-slice.md), CFG-03 (archived; see historical context).

Design inputs: [G-02](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/decisions.service.ts](../../../../../../../../../src/decisions.service.ts)
- [src/framework.types.ts](../../../../../../../../../src/framework.types.ts)
- [src/stavel.cli.ts](../../../../../../../../../src/stavel.cli.ts)
- [docs/internal/dev/agent-questions.guide.md](../../../../../../../dev/agent-questions.guide.md)

Non-goals: No embedded AI provider, interpretation of silence as consent or terminal-only second decision implementation.

## Acceptance and coherent stopping point

- Equivalent explicit inputs produce equivalent resolved decisions; unaccepted defaults, proposed observations and unanswered items never become acceptance.
- Interrupted sessions resume with identity/hash checks; corruption, changed targets, cancellation and concurrent writers follow the selected refusal/recovery contract.
- Unaligned session state stays outside the target; machine operation never hangs on input. Test placement reuses accepted evidence or sourced applicable guidance and asks on uncertainty.

Declared post-merge endpoint: A documented question/session surface is usable and tested independently; the old answers-file init path continues to work until the next slice adds bare init.

## Verification and integration

Exercise real child processes, controlled terminal input and agent adapter records; verify zero target writes before alignment and preserved prior choices on resume. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

The shared question/session API persists actual terminal responses outside the target, binds inputs/catalogs/baseline, supports explicit reset and refuses corruption, uncertainty, concurrent or stale writes. Recaps require actual alignment; headless preparation returns structured open decisions. [Component verification](./guided-init.verification.md) records real cache/terminal-callback and no-write behavior. Native host Q&A and new CLI process parity still require integrated proof.

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
  "sliceId": "SET-02",
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
  "legacySliceId": "SET-02",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/initialization/execution/guided-init/set-02-shared-question-sessions.execution-slice.md",
  "sourceSha256": "aab544b6a1bc90d1ba0f5638f80a71c69e5e1f8a42963a58349c499b33158260"
}
-->

## Historical context (archived)

- [CFG-03](../../../../../contracts/configuration/execution/repository-configuration/cfg-03-structured-amendments.execution-slice.md)
