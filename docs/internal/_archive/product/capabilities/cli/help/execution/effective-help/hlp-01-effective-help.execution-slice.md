# HLP-01: Explain installed workflows and local choices consistently

<!-- mdcomposer:meta
title: "HLP-01: Explain installed workflows and local choices consistently"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: HLP-01
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Replace duplicated/static capability knowledge with the selected shared effective definitions while preserving the current usable mode/story summary.

Requirements: GW-39, GW-02, GW-15, GW-18, GW-33 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-33, T-05, T-10, T-14, T-27 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/cli/help/help.design.md). Read the [shared execution contract](../../../../skill/guided-workflows/execution/guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../../../../skill/guided-workflows/execution/guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: CFG-03 (archived; see historical context), ART-01 (archived; see historical context), SET-02 (archived; see historical context), WRK-01 (archived; see historical context).

Design inputs: [G-07](../../../../skill/guided-workflows/execution/guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/stavel.cli.ts](../../../../../../../../../src/stavel.cli.ts)
- [src/stavel.cli.test.ts](../../../../../../../../../src/stavel.cli.test.ts)
- [skills/stavel/SKILL.md](../../../../../../../../../skills/stavel/SKILL.md)
- [config/assets.catalog.json](../../../../../../../../../config/assets.catalog.json)

Non-goals: No advertisement of unimplemented execution subcommands, mandatory adoption for help or universal host invocation syntax.

## Acceptance and coherent stopping point

- CLI and skill expose matching available capabilities, examples, mode boundaries and actual local overrides with provenance.
- General help works outside a repo without writes; contextual help diagnoses invalid state rather than silently selecting defaults.
- Unavailable workflows remain honestly labeled, eight source prompts remain discoverable and CLI adoption plan is not confused with agent PLAN.

Declared post-merge endpoint: Help is independently useful for currently installed features; future features can register availability without requiring a hardcoded later repair.

## Verification and integration

Run actual CLI aliases outside/contextual repos and non-TTY output, profile omissions/additions, missing modules and relocated exports; assert no target commands ran. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Original PLAN context: this document initially recorded no execution or completion. On execution record changed locations/revision, requirement-to-case results, exact checks and outcomes, deviations, unavailable evidence and a durable next action. Current bounded groundwork is linked from the parent packet and must not be rebuilt merely because this slice is planned.

## Actual local execution result

Delivered shared effective CLI/skill help, contextual availability, selected conventions and configuration provenance.

Completion is based on the [component proof](./effective-help.verification.md), [integrated verification](../../../../skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../../../../skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/cli/help/execution/effective-help/effective-help.verification.md",
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
    "docs/internal/_archive/product/capabilities/cli/help/execution/effective-help/effective-help.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "effective-help",
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
            "path": "docs/internal/product/capabilities/cli/help/execution/effective-help/effective-help.verification.md",
            "sha256": "12417471d10d606a252b6fb2e9759139959a538d65448e6bc04de8ad5a1556b2"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/help/execution/effective-help/effective-help.verification.md",
            "sha256": "f722f39b0a04da86b0abce9c60180cfb6540b511f8405b28523dc343e457a86a"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "effective-help"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/_archive/product/capabilities/cli/help/execution/effective-help/effective-help.verification.md",
            "sha256": "f722f39b0a04da86b0abce9c60180cfb6540b511f8405b28523dc343e457a86a"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/cli/help/execution/effective-help/effective-help.verification.md",
            "sha256": "12417471d10d606a252b6fb2e9759139959a538d65448e6bc04de8ad5a1556b2"
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
  "result": "Delivered shared effective CLI/skill help, contextual availability, selected conventions and configuration provenance.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "HLP-01",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/cli/help/execution/effective-help/effective-help.verification.md": "12417471d10d606a252b6fb2e9759139959a538d65448e6bc04de8ad5a1556b2",
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
  "legacySliceId": "HLP-01",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/cli/help/execution/effective-help/hlp-01-effective-help.execution-slice.md",
  "sourceSha256": "4e8506d2562e98960593fb6591606988a9d4cc81aa573c28acd45467d3a330f3"
}
-->

## Historical context (archived)

- [CFG-03](../../../../../contracts/configuration/execution/repository-configuration/cfg-03-structured-amendments.execution-slice.md)

- [ART-01](../../../../skill/guided-workflows/execution/artifact-generation/art-01-portable-artifact-catalog.execution-slice.md)

- [SET-02](../../../initialization/execution/guided-init/set-02-shared-question-sessions.execution-slice.md)

- [WRK-01](../../../work-management/execution/work-records/wrk-01-work-reader.execution-slice.md)
