# ART-02: Generate aligned artifacts at their actual owners

<!-- mdcomposer:meta
title: "ART-02: Generate aligned artifacts at their actual owners"
kind: execution-slice
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

slice-id: ART-02
readiness: complete
Executed mode: EXECUTE using STRICT MODE; final evidence review completed.

## Outcome and authority

Implement owner-aware preview/rendering from explicit aligned facts and semantic role mappings, including proactive capability/feature suggestions and a meaningful product overview.

Requirements: GW-09, GW-10, GW-24, GW-25, GW-26, GW-30, GW-34, GW-37 in [canonical requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md). Planned evidence: T-09, T-18, T-19, T-20, T-24, T-28, T-31 in [acceptance scenarios](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md). Owner: [feature/contract owner](../../../../../../../product/capabilities/skill/guided-workflows/index.md). Read the [shared execution contract](../guided-workflows/execution-contract.guide.md).

## Inputs and dependencies

Baseline: revalidate [the recorded dirty source/config baseline](../guided-workflows/planning-baseline.json) and current user changes. Merged/applied prerequisites: [ART-01](./art-01-portable-artifact-catalog.execution-slice.md).

Design inputs: [G-06](../guided-workflows/design-readiness.guide.md) Review preference is configurable; this initiative uses the actual chat-reviewed design baseline in the accepted execution record. Design selection alone is not review approval. Story output is omitted for this planning pass only.

## Implementation boundary

Relevant current source/contracts (new module names remain routine choices within resolved interfaces):

- [src/planning.service.ts](../../../../../../../../../src/planning.service.ts)
- [src/naming.service.ts](../../../../../../../../../src/naming.service.ts)
- [src/markdown.service.ts](../../../../../../../../../src/markdown.service.ts)
- [config/default.profile.json](../../../../../../../../../config/default.profile.json)
- [skills/stavel/SKILL.md](../../../../../../../../../skills/stavel/SKILL.md)

Non-goals: No mode conflation: DESIGN remains a source of design docs; feature PLAN/EXECUTE orchestration is delivered in LFC, not silently inside this renderer.

## Acceptance and coherent stopping point

- Single-product and nested platform/product fixtures map actual capability/feature and shared contract homes without empty placeholders or repeated product identity.
- Missing product/owner facts return actionable unresolved input; existing canonical docs are mapped/preserved, not duplicated or accepted by generation.
- Naming, template overrides, story role and amendments drive actual outputs consistently; template seeding does not mean story generation was requested.

Declared post-merge endpoint: An explicit-input library/tool rendering path produces a complete link-valid preview and aligned apply result. Interactive orchestration can consume it later without repairing outputs.

## Verification and integration

Exercise default product and retained platform/features homes, typed/untyped naming, root overview preservation, real dual CLI/skill evidence and ambiguous owner proposals. Keep focused tests colocated, preserve prior component proofs and record actual API/process/filesystem observations separately from agent judgment. Reconcile affected CLI/configuration/help/owner docs and catalog/origins when their scope changes.

An independent implementation/review agent may own this slice where authorized. Coordinate overlapping source, schema and catalog edits through the integration owner; no dependent slice starts on an unmerged assumption.

## Result and evidence

The [artifact service](../../../../../../../../../src/artifact.service.ts) now provides explicit-input `previewArtifacts` / `createArtifactPlan` paths producing the existing hash-checked plan format. It consumes resolved semantic owners and definitions, preserves canonical documents and repository templates, generates draft product facts and actual mapped-owner references, extends navigation without replacing local prose and refuses unresolved facts or unsafe paths. No empty owner directories are scaffolded. Actual CLI/skill surfaces produce ownership suggestions, not claims of a correct semantic partition.

The colocated [suite](../../../../../../../../../src/artifact.service.test.ts) passed 20/20 focused Windows cases. Relevant cases exercise default and nested platform/product/group mappings, capability versus shared-contract ownership, typed camel/snake/Pascal and plain naming, unaligned read-only discovery without an applicable plan, preview/dry-run/apply/repeat, canonical overview preservation, custom story rebasing, source/config staleness, missing fields/links, literal metadata characters and a real Windows junction refusal with outside bytes preserved. All-family rendering is separately exercised; merely seeding a story template does not select story output.

CFG-03's implementation is consumed in a real service integration case. Full shared-suite/export/CLI adoption and fresh-agent lifecycle evidence remain pending coordinator integration, so this slice remains active. Next: integrate the public API and selected definitions into guided setup/lifecycle/help, then reconcile whole-packet evidence. No publication or external tracker operation occurred.

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
  "sliceId": "ART-02",
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
  "legacySliceId": "ART-02",
  "mappedStatus": "complete",
  "schemaVersion": 1,
  "source": "docs/internal/product/capabilities/skill/guided-workflows/execution/guided-workflows/execution-acceptance.decision.md",
  "sourcePath": "docs/internal/product/capabilities/skill/guided-workflows/execution/artifact-generation/art-02-owner-aware-rendering.execution-slice.md",
  "sourceSha256": "9dd1a6354ddfcf2e13142f8ef7619eeba9188fba1b25af4242b1406358cba4a9"
}
-->
