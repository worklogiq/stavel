# Portable artifact inventory

<!-- mdcomposer:meta
title: "Portable artifact inventory"
kind: recon
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and evidence

Read-only preparation for [ART-01](./art-01-portable-artifact-catalog.execution-slice.md), not implementation or contract acceptance. The inspection compared the explicit [portable asset catalog](../../../../../../../../../config/assets.catalog.json), [Stavel templates](../../../../../../../templates/index.md), current default-profile kinds and MenuLogiq's sibling `docs/internal/templates` directory. MenuLogiq paths below identify source evidence only; that sibling is not a runtime or validation dependency.

Observed on 2026-11-26: Stavel exports **16 template assets**, comprising 15 `template` entries and one editable `repository-template` story. All 16 source files exist. MenuLogiq has **22 files ending in `.template.md`** beneath `docs/internal/templates`: 15 design and seven execution templates. These exact counts supersede preliminary 15/21 estimates. Filled Stavel capability/status/product-overview records are excluded from the portable catalog.

In the inventory below, abbreviated template paths are relative to each repository's `docs/internal/templates` directory. Existing coverage describes source content, not an implemented family-selection or document-generation command.

## Family coverage and generic gaps

| Family | Existing portable Stavel coverage | MenuLogiq evidence and reusable gap |
| --- | --- | --- |
| Product | `design/product.template.md`: problem/outcome, scope, existing fit, success/uncertainty | `design/product.template.md` adds surfaces, relationships and constraints. The generic root product-overview role remains missing; Stavel's current template outputs `.product.md`. |
| Requirements | `design/requirements.template.md`: observable behavior, mechanisms and constraints | Equivalent family exists. `design/requirements.template.md` in MenuLogiq adds acceptance scenarios, dependencies and nonfunctional categories suitable for conditional sections. |
| Technical/backend | `design/design.template.md`: flow, responsibilities, mechanisms, compatibility and operation | Dedicated backend asset missing. `design/backend-design.template.md` supplies fact/writer/reader ownership, transport contracts, idempotency/concurrency, persistence/migrations, error behavior and test boundaries. |
| UI/interface | `design/interface.template.md` covers visual, CLI and SDK interfaces | Existing equivalent, with a visual specialization gap. `design/ui-design.template.md` supplies screen inventory, fields, navigation, validation, content and responsive behavior. |
| Architecture/ERD | Generic technical design only | `design/architecture-diagram.template.md`: context, components, critical sequence, conditional data model, invariants and omissions. Dedicated portable asset missing. |
| Decisions | `design/decision.template.md`: evidence, alternatives, consequences/enforcement and supersession | Equivalent family exists in `design/decision-record.template.md`; retain Stavel's evidence and authority distinctions. |
| Tests | `design/test-plan.template.md` and `execution/verification.template.md` | Equivalent family exists. `design/test-plan.template.md` provides additional test-level, environment and scenario matrices. |
| Accessibility | General section in `design/interface.template.md` | Dedicated plan missing. `design/accessibility-plan.template.md`: user/assistive-technology needs, semantics, focus, keyboard alternatives, error announcements, automated/manual checks and known gaps. |
| Authorization/access | Portable security philosophy and generic design references; no matrix asset | `design/iam-access-matrix.template.md`: subjects/resources/actions, allowed/denied conditions, authoritative enforcement, visibility mapping, audit and tests. Generic authorization matrix missing. |
| Observability | Portable philosophy and generic operation section; no planning asset | `design/otel-instrumentation.template.md`: operational questions/signals, boundaries/propagation, redaction, configuration, disabled behavior, validation and ownership. Framework-neutral plan missing. |
| Documentation/help/public docs | Interface help references and documentation philosophy; no dedicated templates | `design/documentation-plan.template.md`, `help-documentation.template.md`, `public-docs-design.template.md` and `readme.template.md`: audience/deliverable matrix, prerequisites, instructions/configuration, outcomes, limits, discovery, examples/assets and link boundaries. Dedicated planning/content assets missing. |
| Execution | Recon, execution-plan, execution-slice, verification and experiment assets | `execution/macro-execution.template.md` and `project-phase-status.template.md` expose tracker/phase/evidence/next-step concerns. Portable macro tracker missing despite local Stavel examples. Legacy `execution-slices.template.md` and `execution-prompt.template.md` are source evidence, not selected additions. |
| Story | Editable `design/story.template.md`, seeded once | Already portable in Stavel; no corresponding MenuLogiq template in this inventory. Preserve acceptance links and coherent delivery boundaries. Story output remains omitted for this planning pass only. |

The other Stavel template assets cover AGENTS routing, the local project profile, philosophies and language/domain contribution profiles. Their existence does not supply the missing design specializations.

## Specific exclusions and reconciliation

The reusable fields above do not select MenuLogiq's tenant/platform audience split, fixed admin host/routes, entitlement/role system, `includeDeleted`, providers/configuration names, frontend libraries, `HelpComponent`/FAB architecture, screenshot-token mechanics or local documentation paths. These application conventions remain outside generic extraction. The application-specific `execution/iam-execution-plan.template.md` is evidence for optional authorization concerns, not a universal execution requirement.

Do not import legacy multi-slice/prompt machinery as an implied default: accepted Stavel direction already specifies separate slice files, strict execution and pointer-based work status. Product-specific schema fields and fixed UI/API/database diagram examples also require generalization rather than copying.

MenuLogiq source templates contain discrepancies that must not become inherited authority. Its public-docs template suggests internal canonical references while its help/documentation templates forbid public-to-internal links. Its legacy macro guidance duplicates child slice completion. Stavel's existing audience and canonical-owner rules remain the current authority; this recon does not resolve new contracts.

## Pending gate and next action

[G-06](../guided-workflows/design-readiness.guide.md) and ART-01's CFG-03 dependency remain pending. Current catalog entries identify source, target and role; they do not define stable artifact/section identities, family applicability, augmentation targets or a queryable artifact-selection contract. The default profile already registers accessibility, architecture, documentation/help and macro kinds without corresponding templates. Backend, access-matrix and observability naming/kind registration must be reconciled with approved definitions during implementation.

Next: use this inventory to resolve the bounded artifact/semantic-owner contract, then implement ART-01 within its approved dependencies. No new family selection, omission policy, generator availability, design acceptance or completion is claimed here. This pass performed source/catalog inspection only; it did not run shared builds or checks.
