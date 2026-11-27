# Execution readiness and scoped design inputs

<!-- mdcomposer:meta
title: "Execution readiness and scoped design inputs"
kind: guide
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Current resolution

G-01 through G-08 selections are resolved by the owner's [eight answers and amendments](./execution-acceptance.decision.md). Use the [accepted contracts](./execution-contracts.design.md), including the one-time chat-review exception and mandatory AI-assisted migration/repair warnings. The scoped boundaries below remain design ownership references, not pending questions. Implementation dependencies and evidence remain mandatory.

## Original scoped return to DESIGN

These are remaining material design inputs, not a questionnaire or new blanket approval flow. Existing explicit choices stay settled; routine implementation details stay autonomous. Resolve only affected contracts in DESIGN and record their actual source/review evidence. PLAN does not silently choose persisted schemas, recovery semantics or review acceptance. Independent existing-contract assurance work need not wait for every feature decision.

| Gate | Design boundary | Existing decision IDs | Dependent slices |
| --- | --- | --- | --- |
| G-01 | Repository configuration and amendments | D-03 D-10 D-11 | CFG-01 (archived; see historical context), CFG-02 (archived; see historical context), CFG-03 (archived; see historical context) |
| G-02 | Scope, sessions and interaction | D-01 D-02 D-07 D-15 D-16 | SET-01 (archived; see historical context), SET-02 (archived; see historical context), SET-03 (archived; see historical context), DOC-01 (archived; see historical context) |
| G-03 | Work schemas, writers and migrations | D-06 D-08 D-12 | SET-03 (archived; see historical context), WRK-01 (archived; see historical context), WRK-02 (archived; see historical context), WRK-03 (archived; see historical context) |
| G-04 | Diagnosis, repair and command effects | D-04 D-05 D-07 | DOC-01 (archived; see historical context), DOC-02 (archived; see historical context) |
| G-05 | Lifecycle readiness and archive | D-06 D-08 D-09 D-13 D-14 D-15 | LFC-01 (archived; see historical context), LFC-02 (archived; see historical context), LFC-03 (archived; see historical context) |
| G-06 | Artifact and semantic-owner model | D-03 D-10 D-15 | ART-01 (archived; see historical context), ART-02 (archived; see historical context) |
| G-07 | Effective help and capability availability | D-03 D-07 D-11 | HLP-01 (archived; see historical context) |
| G-08 | Reviewed baseline and integrated evidence | D-08 D-09 | [INT-01](./int-01-integrated-proof.execution-slice.md), [INT-02](./int-02-local-adoption-and-closure.execution-slice.md) |

## G-01: Repository configuration and amendments

Owner: [design source](../../../../../../../product/contracts/configuration/repository-configuration.design.md). Select committed entrypoint/topic schema, baseline pinning/provenance, precedence/conflict rules, stable amendment targets and explicit root-config migration. Preserve current story/testing settings; do not assume the draft directory already works.

## G-02: Scope, sessions and interaction

Owner: [design source](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.design.md). Specify root/workspace precedence, session location/identity/retention/writers, actual machine/TTY stream/exit contract and question evidence. Existing explicit-target and answers-file behavior stays supported.

## G-03: Work schemas, writers and migrations

Owner: [design source](../../../../../../../product/contracts/configuration/work-status.design.md). Select registry/status versions and transitions, exact command/API surface, concurrency/recovery and supported conversion paths. Prototype JSON is not automatically a supported schema; preserve one lifecycle authority and transient queries.

## G-04: Diagnosis, repair and command effects

Owner: [design source](../../../../../../../product/capabilities/cli/doctor/doctor.design.md). Choose the deterministic repair allowlist, finding/review states, actual effect/authorization contract and bounded resume behavior. General source refactors and arbitrary target script execution remain outside autofix.

## G-05: Lifecycle readiness and archive

Owner: [design source](../../../../../../../product/capabilities/skill/guided-workflows/delivery-workflows.design.md). Specify stable packet/slice/review identities, prerequisite/evidence validation, mode transition/checkpoint protocol and archive mirror/collision handling. Keep DESIGN, PLAN and EXECUTE distinct and default story asking intact.

## G-06: Artifact and semantic-owner model

Owner: [design source](../../../../../../../process/documentation-hierarchy.design.md). Specify catalog stable IDs, applicable family coverage, omission/augmentation and actual semantic owner mappings. Core capabilities/contracts model is selected; runtime schema and generated mappings are still design inputs.

## G-07: Effective help and capability availability

Owner: [design source](../../../../../../../product/capabilities/cli/help/help.design.md). Specify shared available-capability/provenance records and context/headless presentation. Preserve the current usable static summary; source prompts do not prove deterministic execution.

## G-08: Reviewed baseline and integrated evidence

Owner: [design source](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.design.md). Record actual accepted substantial-feature design review/exception, supported artifact/environment matrix and independent-review criteria. No PR/review acceptance is fabricated by these plans.

Before execution, substantial feature slices additionally require actual accepted design review or a real scoped exception under GW-21. This pass creates review candidates; it does not create a review PR or claim the gate passed. No new questions about these contracts are required to finish the planning artifacts themselves.

## Historical context (archived)

- [CFG-01](../../../../../contracts/configuration/execution/repository-configuration/cfg-01-effective-config-reader.execution-slice.md)
- [CFG-02](../../../../../contracts/configuration/execution/repository-configuration/cfg-02-config-migration-and-adoption.execution-slice.md)
- [CFG-03](../../../../../contracts/configuration/execution/repository-configuration/cfg-03-structured-amendments.execution-slice.md)

- [ART-01](../artifact-generation/art-01-portable-artifact-catalog.execution-slice.md)
- [ART-02](../artifact-generation/art-02-owner-aware-rendering.execution-slice.md)

- [SET-01](../../../../cli/initialization/execution/guided-init/set-01-scope-discovery.execution-slice.md)
- [SET-02](../../../../cli/initialization/execution/guided-init/set-02-shared-question-sessions.execution-slice.md)
- [SET-03](../../../../cli/initialization/execution/guided-init/set-03-bare-init.execution-slice.md)

- [WRK-01](../../../../cli/work-management/execution/work-records/wrk-01-work-reader.execution-slice.md)
- [WRK-02](../../../../cli/work-management/execution/work-records/wrk-02-work-writers.execution-slice.md)
- [WRK-03](../../../../cli/work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md)

- [DOC-01](../../../../cli/doctor/execution/guided-doctor/doc-01-diagnosis.execution-slice.md)
- [DOC-02](../../../../cli/doctor/execution/guided-doctor/doc-02-repair-flow.execution-slice.md)

- [LFC-01](../lifecycle-delivery/lfc-01-plan-packets.execution-slice.md)
- [LFC-02](../lifecycle-delivery/lfc-02-execute-and-close.execution-slice.md)
- [LFC-03](../lifecycle-delivery/lfc-03-vibe-checkpoints.execution-slice.md)

- [HLP-01](../../../../cli/help/execution/effective-help/hlp-01-effective-help.execution-slice.md)
