# Guided workflows coordination and execution plan

<!-- mdcomposer:meta
title: "Guided workflows coordination and execution plan"
kind: execution-plan
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

execution-status: complete
Mode of original preparation: PLAN. Current execution mode: EXECUTE (STRICT).

## Authority and selected outcome

The owner requested execution packets on 2026-11-26 and answered No—execution packets only to the default story question. This pass generates no story documents and changes no standing story setting. It refines the prior twelve broad work packages into eight owner-local packets plus this coordination/integration packet, with 22 separately defined delivery slices.

Canonical [requirements](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.requirements.md), [design](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.design.md), [decisions](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.decision.md) and [planned acceptance](../../../../../../../product/capabilities/skill/guided-workflows/guided-workflows.test-plan.md) remain the source of intent. [The execution contract](./execution-contract.guide.md) owns common obligations. [Scoped design inputs](./design-readiness.guide.md) remain explicit; PLAN has not accepted their proposed schemas, recovery or review evidence.

## Packets and owners

| Packet | Plan | Canonical feature/contract owner | Separate execution slices |
| --- | --- | --- | --- |
| FND | CLI foundations and service contracts (archived; see historical context) | [owner](../../../../../../../product/capabilities/cli/cli.design.md) | FND-01 (archived; see historical context), FND-02 (archived; see historical context), FND-03 (archived; see historical context) |
| CFG | Repository configuration and amendments (archived; see historical context) | [owner](../../../../../../../product/contracts/configuration/index.md) | CFG-01 (archived; see historical context), CFG-02 (archived; see historical context), CFG-03 (archived; see historical context) |
| ART | Artifact catalog and owner-aware generation (archived; see historical context) | [owner](../../../../../../../product/capabilities/skill/guided-workflows/index.md) | ART-01 (archived; see historical context), ART-02 (archived; see historical context) |
| SET | Scope, questions and guided initialization (archived; see historical context) | [owner](../../../../../../../product/capabilities/cli/initialization/initialization.design.md) | SET-01 (archived; see historical context), SET-02 (archived; see historical context), SET-03 (archived; see historical context) |
| WRK | Work records and versioned migrations (archived; see historical context) | [owner](../../../../../../../product/capabilities/cli/work-management/work-management.design.md) | WRK-01 (archived; see historical context), WRK-02 (archived; see historical context), WRK-03 (archived; see historical context) |
| DOC | Guided diagnosis and reviewed repair (archived; see historical context) | [owner](../../../../../../../product/capabilities/cli/doctor/doctor.design.md) | DOC-01 (archived; see historical context), DOC-02 (archived; see historical context) |
| LFC | Plan, execute, VIBE and scoped closure (archived; see historical context) | [owner](../../../../../../../product/capabilities/skill/guided-workflows/index.md) | LFC-01 (archived; see historical context), LFC-02 (archived; see historical context), LFC-03 (archived; see historical context) |
| HLP | Shared effective help (archived; see historical context) | [owner](../../../../../../../product/capabilities/cli/help/help.design.md) | HLP-01 (archived; see historical context) |
| INT | [Integrated proof and local closure](./guided-workflows.execution-plan.md) | [owner](../../../../../../../product/capabilities/skill/guided-workflows/index.md) | [INT-01](./int-01-integrated-proof.execution-slice.md), [INT-02](./int-02-local-adoption-and-closure.execution-slice.md) |

## Active slice graph and requirement assignment

This table owns cross-packet sequencing and requirement assignment. Each linked slice owns status/results, concrete acceptance and the independently coherent stopping point. Packet/macro tables are validated projections. Requirement references do not mean all acceptance is already implemented.

| Slice | Requirement IDs | Planned evidence IDs | Merged/applied prerequisites | Additional DESIGN input |
| --- | --- | --- | --- | --- |
| FND-01 (archived; see historical context) | GW-01 | T-01 | None | Existing contract |
| FND-02 (archived; see historical context) | GW-35, GW-23 | T-29, T-16 | None | Existing contract |
| FND-03 (archived; see historical context) | GW-35, GW-23 | T-29, T-16 | FND-01 (archived; see historical context) | Existing contract |
| CFG-01 (archived; see historical context) | GW-27, GW-16, GW-36, GW-37, GW-39 | T-21, T-11, T-30, T-31, T-33 | FND-02 (archived; see historical context), FND-03 (archived; see historical context) | G-01 |
| CFG-02 (archived; see historical context) | GW-27, GW-16, GW-19, GW-24, GW-36, GW-37, GW-38 | T-21, T-11, T-06, T-18, T-30, T-31, T-32 | CFG-01 (archived; see historical context) | G-01 |
| CFG-03 (archived; see historical context) | GW-05, GW-14, GW-15, GW-16, GW-27 | T-03, T-10, T-11, T-21 | CFG-02 (archived; see historical context) | G-01 |
| ART-01 (archived; see historical context) | GW-09, GW-15, GW-18, GW-26, GW-37 | T-09, T-14, T-20, T-31 | CFG-03 (archived; see historical context) | G-06 |
| ART-02 (archived; see historical context) | GW-09, GW-10, GW-24, GW-25, GW-26, GW-30, GW-34, GW-37 | T-09, T-18, T-19, T-20, T-24, T-28, T-31 | ART-01 (archived; see historical context) | G-06 |
| SET-01 (archived; see historical context) | GW-03, GW-27, GW-34 | T-02, T-21, T-28 | CFG-02 (archived; see historical context) | G-02 |
| SET-02 (archived; see historical context) | GW-04, GW-05, GW-17, GW-36 | T-03, T-04, T-05, T-30 | SET-01 (archived; see historical context), CFG-03 (archived; see historical context) | G-02 |
| SET-03 (archived; see historical context) | GW-06, GW-08, GW-17, GW-26, GW-27, GW-28, GW-36, GW-37 | T-04, T-06, T-08, T-20, T-21, T-22, T-30, T-31 | SET-02 (archived; see historical context), ART-02 (archived; see historical context), WRK-03 (archived; see historical context) | G-02, G-03 |
| WRK-01 (archived; see historical context) | GW-28 | T-22 | CFG-02 (archived; see historical context), SET-01 (archived; see historical context) | G-03 |
| WRK-02 (archived; see historical context) | GW-28, GW-29, GW-17 | T-22, T-23, T-04 | WRK-01 (archived; see historical context), SET-02 (archived; see historical context) | G-03 |
| WRK-03 (archived; see historical context) | GW-29, GW-16 | T-23, T-11 | WRK-02 (archived; see historical context) | G-03 |
| DOC-01 (archived; see historical context) | GW-07, GW-27 | T-07, T-21 | CFG-03 (archived; see historical context), SET-01 (archived; see historical context), ART-01 (archived; see historical context) | G-04, G-02 |
| DOC-02 (archived; see historical context) | GW-07, GW-08, GW-17, GW-38 | T-07, T-08, T-04, T-32 | DOC-01 (archived; see historical context), SET-03 (archived; see historical context), WRK-03 (archived; see historical context) | G-04 |
| LFC-01 (archived; see historical context) | GW-10, GW-11, GW-21, GW-22, GW-23, GW-30, GW-31, GW-33, GW-34, GW-37 | T-12, T-15, T-16, T-17, T-24, T-25, T-27, T-28, T-31 | ART-02 (archived; see historical context), WRK-03 (archived; see historical context), CFG-03 (archived; see historical context) | G-05 |
| LFC-02 (archived; see historical context) | GW-11, GW-12, GW-13, GW-21, GW-23, GW-31, GW-38 | T-12, T-13, T-15, T-16, T-17, T-25, T-32 | LFC-01 (archived; see historical context), DOC-02 (archived; see historical context), WRK-03 (archived; see historical context) | G-05 |
| LFC-03 (archived; see historical context) | GW-14, GW-22, GW-32, GW-37 | T-10, T-15, T-26, T-31 | LFC-02 (archived; see historical context) | G-05 |
| HLP-01 (archived; see historical context) | GW-02, GW-15, GW-18, GW-33, GW-39 | T-05, T-10, T-14, T-27, T-33 | CFG-03 (archived; see historical context), ART-01 (archived; see historical context), SET-02 (archived; see historical context), WRK-01 (archived; see historical context) | G-07 |
| [INT-01](./int-01-integrated-proof.execution-slice.md) | GW-18, GW-20, GW-23, GW-34, GW-36, GW-37 | T-14, T-16, T-24, T-25, T-26, T-28, T-30, T-31 | FND-03 (archived; see historical context), SET-03 (archived; see historical context), DOC-02 (archived; see historical context), LFC-03 (archived; see historical context), HLP-01 (archived; see historical context), WRK-03 (archived; see historical context) | G-08 |
| [INT-02](./int-02-local-adoption-and-closure.execution-slice.md) | GW-13, GW-18, GW-19 | T-13, T-14, T-17 | [INT-01](./int-01-integrated-proof.execution-slice.md) | G-08 |

## Execution waves and safe parallel work

1. FND-01 and FND-02 are independent bounded existing-contract candidates. FND-03 follows FND-01. Code execution still requires an actual instruction.
2. Resolve only scoped design inputs needed by CFG/SET/ART/WRK; do not require all future feature decisions to start existing-contract assurance. CFG readers precede writes and amendments.
3. After shared contracts and merged dependencies exist, ART and SET work can be delegated by nonoverlapping ownership; WRK read-only query precedes writers and supported migrations.
4. SET-03 and DOC flows consume those actual primitives. LFC PLAN output generation precedes EXECUTE/closure and VIBE integration. HLP can expose only installed available capabilities independently of later implementation.
5. INT-01 proves the integrated package and independent usage; INT-02 reconciles source adoption and scoped closure. A successful subset never means the whole initiative is complete.

Use subagents for independent implementation/review slices where authorized. Give one agent explicit file/contract ownership and merged prerequisites; the coordinator serializes shared schema/catalog/CLI integration, reviews the combined diff and runs final verification. This planning pass itself does not claim delegation or grant new external authority.

## Baseline and existing groundwork

The [baseline snapshot](./planning-baseline.json) identifies actual source/config/design hashes at planning, including local uncommitted work. Preserve the already verified local doc hierarchy, colocated suites, testing policy, eight prompts/static help, story policy/editable template and canonical kind registry. Read the component proof records in this packet. FND-01 addresses the remaining malformed-package finding; do not recreate the already fixed fallback drift.

The selected review policy recommends design PRs for substantial features and permits direct DESIGN-to-PLAN; this initiative has an actual chat-reviewed baseline. No design PR was opened/accepted by this planning task. Unresolved storage/interface design returns to DESIGN; implementation does not resolve it silently. This candidate packet set is ready for review, not a blanket go-execute-all claim.

## Superseded work-package mapping

The old S-00..S-11 files remain deprecated planning records so existing links and rationale are preserved. They have no active execution-status and are not completed or archived delivery. Use these refined identities:

| Prior package | Active source records |
| --- | --- |
| S-00 | [DESIGN inputs; no executable S-00](./design-readiness.guide.md) |
| S-01 | FND-01 (archived; see historical context) |
| S-02 | CFG-01 (archived; see historical context), CFG-02 (archived; see historical context), CFG-03 (archived; see historical context) |
| S-03 | ART-01 (archived; see historical context), ART-02 (archived; see historical context) |
| S-04 | SET-01 (archived; see historical context), SET-02 (archived; see historical context) |
| S-05 | SET-03 (archived; see historical context) |
| S-06 | DOC-01 (archived; see historical context), DOC-02 (archived; see historical context) |
| S-07 | LFC-01 (archived; see historical context), LFC-02 (archived; see historical context), LFC-03 (archived; see historical context) |
| S-08 | HLP-01 (archived; see historical context) |
| S-09 | [INT-01](./int-01-integrated-proof.execution-slice.md), [INT-02](./int-02-local-adoption-and-closure.execution-slice.md) |
| S-10 | WRK-01 (archived; see historical context), WRK-02 (archived; see historical context), WRK-03 (archived; see historical context) |
| S-11 | FND-02 (archived; see historical context), FND-03 (archived; see historical context) |

## Original planning completion boundary

This PLAN task completes when packet links, coverage, dependency consistency, source baseline and preservation checks pass, with unresolved DESIGN gates and actual story choice recorded. No implementation, commit/push/PR, merge, publication pipeline, npm release, MenuLogiq runtime change or global skill replacement is included. Runtime closure follows actual per-slice evidence and [the shared contract](./execution-contract.guide.md).

The subsequent explicit EXECUTE request authorizes local implementation with subagents. FND-01/FND-02/FND-03 are now locally complete; remaining contract/review selections are pending. The original planning boundary above records history, not a restriction on that later authorization. See the [execution checkpoint](./execution-checkpoint.verification.md) for actual progress and the next dependency-ready slice. External delivery and global installation still require their own authorization.


## Ordered slices and coverage

This retained navigation anchor points to the active slice graph and requirement assignment above. Prior S-00..S-11 records are superseded; use the refined source slice IDs and packet plans.

## Design review and delivery readiness

Use the [scoped DESIGN input register](./design-readiness.guide.md) and each source slice's readiness. Review requirements follow the selected repository policy; a design PR is recommended by default and can be configured as required. Packet generation establishes neither. Existing-contract assurance can be selected independently within actual execution authorization.

## Accepted execution baseline

The owner accepted the [eight consolidated recommendations and amendments](./execution-acceptance.decision.md), including a one-time chat-reviewed design baseline for this initiative. Prior pending-review descriptions record planning history. Execute dependency-ready scope with the accepted nondeterminism warnings and configurable conventional-commit policy; actual implementation evidence remains separate.

## Actual local closure

All source slices in this packet completed their accepted local implementation scope. See the [integrated proof](./guided-workflows.verification.md) and [philosophy review](./philosophy-review.verification.md). Earlier pending/PLAN boundary statements above are retained chronology, not current blockers. No commit, PR, merge, publication or global-skill update is claimed. Completed packets stay available here for owner review; whole-packet archival is a later delivery step.

## Historical context (archived)

- [CLI foundations and service contracts](../../../../cli/services/execution/foundations/foundations.execution-plan.md)
- [FND-01](../../../../cli/services/execution/foundations/fnd-01-package-inspection.execution-slice.md)
- [FND-02](../../../../cli/services/execution/foundations/fnd-02-pure-service-contracts.execution-slice.md)
- [FND-03](../../../../cli/services/execution/foundations/fnd-03-effect-service-contracts.execution-slice.md)

- [Repository configuration and amendments](../../../../../contracts/configuration/execution/repository-configuration/repository-configuration.execution-plan.md)
- [CFG-01](../../../../../contracts/configuration/execution/repository-configuration/cfg-01-effective-config-reader.execution-slice.md)
- [CFG-02](../../../../../contracts/configuration/execution/repository-configuration/cfg-02-config-migration-and-adoption.execution-slice.md)
- [CFG-03](../../../../../contracts/configuration/execution/repository-configuration/cfg-03-structured-amendments.execution-slice.md)

- [Artifact catalog and owner-aware generation](../artifact-generation/artifact-generation.execution-plan.md)
- [ART-01](../artifact-generation/art-01-portable-artifact-catalog.execution-slice.md)
- [ART-02](../artifact-generation/art-02-owner-aware-rendering.execution-slice.md)

- [Scope, questions and guided initialization](../../../../cli/initialization/execution/guided-init/guided-init.execution-plan.md)
- [SET-01](../../../../cli/initialization/execution/guided-init/set-01-scope-discovery.execution-slice.md)
- [SET-02](../../../../cli/initialization/execution/guided-init/set-02-shared-question-sessions.execution-slice.md)
- [SET-03](../../../../cli/initialization/execution/guided-init/set-03-bare-init.execution-slice.md)

- [Work records and versioned migrations](../../../../cli/work-management/execution/work-records/work-records.execution-plan.md)
- [WRK-01](../../../../cli/work-management/execution/work-records/wrk-01-work-reader.execution-slice.md)
- [WRK-02](../../../../cli/work-management/execution/work-records/wrk-02-work-writers.execution-slice.md)
- [WRK-03](../../../../cli/work-management/execution/work-records/wrk-03-work-schema-migrations.execution-slice.md)

- [Guided diagnosis and reviewed repair](../../../../cli/doctor/execution/guided-doctor/guided-doctor.execution-plan.md)
- [DOC-01](../../../../cli/doctor/execution/guided-doctor/doc-01-diagnosis.execution-slice.md)
- [DOC-02](../../../../cli/doctor/execution/guided-doctor/doc-02-repair-flow.execution-slice.md)

- [Plan, execute, VIBE and scoped closure](../lifecycle-delivery/lifecycle-delivery.execution-plan.md)
- [LFC-01](../lifecycle-delivery/lfc-01-plan-packets.execution-slice.md)
- [LFC-02](../lifecycle-delivery/lfc-02-execute-and-close.execution-slice.md)
- [LFC-03](../lifecycle-delivery/lfc-03-vibe-checkpoints.execution-slice.md)

- [Shared effective help](../../../../cli/help/execution/effective-help/effective-help.execution-plan.md)
- [HLP-01](../../../../cli/help/execution/effective-help/hlp-01-effective-help.execution-slice.md)
