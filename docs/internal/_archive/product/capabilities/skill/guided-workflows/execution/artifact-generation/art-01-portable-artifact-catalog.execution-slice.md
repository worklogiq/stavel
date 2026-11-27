# ART-01: Expose the complete portable artifact catalog

<!-- mdcomposer:meta
title: "ART-01: Expose the complete portable artifact catalog"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: ART-01
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Map every agreed design/execution family to a portable definition, equivalent existing owner or explicit omission and expose usable selection/query behavior.

Requirements: GW-09, GW-15, GW-18, GW-26, GW-37 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-09, T-14, T-20, T-31 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/skill/guided-workflows/index.md). Read the [shared execution contract](../guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: CFG-03 (archived; see historical context).

Design inputs: [G-06](../guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [config/assets.catalog.json](../../../../../../../../../config/assets.catalog.json)
- [config/decisions.catalog.json](../../../../../../../../../config/decisions.catalog.json)
- [docs/internal/templates](../../../../../../../templates)
- [docs/internal/dev/framework-origins.overview.md](../../../../../../../dev/framework-origins.overview.md)

Non-goals: No copying MenuLogiq business fields, tenancy assumptions or providers; no fabricated Java/Python check packs.

## Acceptance and coherent stopping point

- Inventory product/requirements/design, backend, UI/interface, architecture/ERD, decisions, test plans, accessibility, authorization/access matrices, observability, docs/help/public-doc planning and execution/story artifacts.
- Give questions/sections/artifacts stable IDs compatible with amendments; register kinds and portable membership together.
- Provide the generic product-overview role and preserve the existing editable story template; filled Stavel docs never become adopter templates.

Declared post-merge endpoint: Catalog queries and template selection are independently useful with honest availability; no command advertises a generator that is not yet implemented.

## Verification and integration

Render/query selected frontend, backend, CLI/library and mixed fixture definitions; verify explicit omissions, naming/kind consistency and offline export closure. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

Implemented under the user's EXECUTE instruction and subsequent acceptance of the eight consolidated contracts, including the scoped chat-reviewed design exception. [The inventory](./artifact-inventory.recon.md) preserves the pre-implementation 16 Stavel / 22 MenuLogiq template counts; those are historical observations, not the resulting asset count.

[The artifact service](../../../../../../../../../src/artifact.service.ts) and [portable artifact catalog](../../../../../../../../../config/artifacts.catalog.json) expose 22 artifact definitions, 91 section identities and eight fact-question identities. Queries support explicit selection, surface applicability, reasoned omissions and effective definitions produced by the shared configuration resolver. Required artifacts/sections and unresolved dependencies refuse. Ten new generic templates cover product overview, backend, architecture/ERD, accessibility, authorization, observability, documentation/help/public docs and macro navigation. Existing story customization remains repository-owned.

The colocated [behavioral suite](../../../../../../../../../src/artifact.service.test.ts) passed 20/20 focused Windows cases using an isolated `.cache/artifact` bundle. This includes real shared-resolver amendments and stale-config refusal, surface variants, section/artifact changes, all-family rendering and actual filesystem effects. Unaligned discovery validates facts/paths without issuing an applicable plan; selected kinds must be registered. Focused artifact-source type analysis reported no diagnostics. The resulting source/export integration, relocated CLI checks and fresh-agent semantic evidence remain the coordinator's responsibility; this record does not declare the whole packet complete.

## Actual local execution result

Delivered the generic artifact catalog and owner-aware, fact/alignment-gated rendering using effective templates and section amendments.

Completion is based on the [component proof](./artifact-generation.verification.md), [integrated verification](../guided-workflows/guided-workflows.verification.md) and [bounded philosophy review](../guided-workflows/philosophy-review.verification.md). Required local tests/checks passed; the remote CI matrix was unavailable, not passed. No story documents or external delivery actions were generated. The original planning snapshot and prior failures remain historical evidence.

<!-- stavel:execution
{
  "checks": [
    {
      "description": "Focused mechanism, preservation and refusal evidence, reconciled by the final complete suite.",
      "evidence": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/artifact-generation/artifact-generation.verification.md",
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
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/artifact-generation/artifact-generation.verification.md",
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.verification.md"
  ],
  "packetId": "artifact-generation",
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
            "path": "docs/internal/product/capabilities/skill/guided-workflows/execution/artifact-generation/artifact-generation.verification.md",
            "sha256": "b7acf5190cbebb7b69c742385c26050c5d210306d295e6653162f569ec899ca9"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/artifact-generation/artifact-generation.verification.md",
            "sha256": "847fe8bed2ba45a5af9069265dc96831d8c155bf1d72d1dfbc150ca55df81166"
          }
        }
      ],
      "kind": "archive-reference-rebase",
      "packetId": "artifact-generation"
    },
    {
      "changes": [
        {
          "from": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/artifact-generation/artifact-generation.verification.md",
            "sha256": "847fe8bed2ba45a5af9069265dc96831d8c155bf1d72d1dfbc150ca55df81166"
          },
          "to": {
            "path": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/artifact-generation/artifact-generation.verification.md",
            "sha256": "3a2407ce6b2cc4d9cb74f0ecb560f3049545b91316678eb4790569403cd7598e"
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
  "result": "Delivered the generic artifact catalog and owner-aware, fact/alignment-gated rendering using effective templates and section amendments.",
  "review": {
    "source": "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/philosophy-review.verification.md",
    "state": "passed"
  },
  "schemaVersion": 1,
  "sliceId": "ART-01",
  "sourceHashes": {
    "docs/internal/_archive/product/capabilities/skill/guided-workflows/execution/artifact-generation/artifact-generation.verification.md": "3a2407ce6b2cc4d9cb74f0ecb560f3049545b91316678eb4790569403cd7598e",
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
  "legacySliceId": "ART-01",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/skill/guided-workflows/execution/artifact-generation/art-01-portable-artifact-catalog.execution-slice.md",
  "sourceSha256": "e0c104fea613f05a922c01955fe97049b31f805372153adb84a02909e1ff5c21"
}
-->

## Historical context (archived)

- [CFG-03](../../../../../contracts/configuration/execution/repository-configuration/cfg-03-structured-amendments.execution-slice.md)
