# Origins and extraction decisions

<!-- mdcomposer:meta
title: "Origins and extraction decisions"
kind: "overview"
state: "accepted"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-26"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Stavel generalizes the documentation and AI-development practices developed for MenuLogiq, at the repository owner's request. The portable text and tools were written for this package; this is not a dump of an application's internal documentation or code. No claim of measured effectiveness is made from that provenance.

## Extraction map

| Source family in MenuLogiq | Portable owner | Deliberately left local |
| --- | --- | --- |
| AGENTS and canonical-document rules | [Constitution](../process/development-constitution.policy.md), [adoption](framework-adoption.guide.md) | App paths, commands, and local precedence |
| AI assistance and execution prompts | [AI collaboration](../philosophies/ai-collaboration.philosophy.md), [modes](../process/prompts/index.md) | Persona names and project-specific execution invariants |
| Product and project management | [Product intent](../philosophies/product-intent.philosophy.md), [lifecycle](../process/development-lifecycle.policy.md) | Restaurant/SaaS priorities and issue taxonomy |
| Code structure and naming | [Code quality](../philosophies/code-quality.philosophy.md) | Language-specific styles/source suffixes and fixed thresholds; default documentation taxonomy is now portable |
| Domain core, adapters, backend, API architecture/client/docs | [Architecture](../philosophies/architecture.philosophy.md) | Express, React Query, Zod, package names, route/header contracts |
| Data model and database | [Data and persistence](../philosophies/data-and-persistence.philosophy.md) | PostgreSQL schemas, tenant columns, sharding strategy |
| Frontend, UX engineering, accessibility, testing IDs | [Interfaces and accessibility](../philosophies/interfaces-and-accessibility.philosophy.md) | UI stack, component suffixes, admin selector mandates |
| Testing | [Verification](../philosophies/verification.philosophy.md) | Specific runners and inconsistent historical runner references |
| Observability | [Observability](../philosophies/observability.philosophy.md) | Provider, telemetry library, header format |
| Infrastructure as code | [Delivery](../philosophies/delivery-and-infrastructure.philosophy.md) | Terraform, hosting/DNS providers, environment names |
| Developer tooling | [Tooling](../philosophies/tooling.philosophy.md) | Package manager, wrapper names, browser harness |
| Public docs and linking policy | [Documentation](../philosophies/documentation.philosophy.md) | Public-help renderer, embed syntax, company publication model |
| Design/execution template families | [Templates](../templates/index.md) | IAM, tenant, billing, and app-specific fields |
| Consistency/security audits | [REVIEW](../process/prompts/review.prompt.md), [security](../philosophies/security-and-privacy.philosophy.md) | Blanket whole-repository audits for every small task |

## Deliberate improvements during generalization

- One consistent lifecycle phase vocabulary and separate working modes.
- Required algorithms and mechanisms protected from silent simplification.
- A research route that separates conformance from demonstrated value.
- Routine reversible choices remain autonomous; only material contract decisions block dependent work.
- Current explicit user instructions and existing authorization retain precedence.
- Proportional documentation rather than mandatory full packets for minor changes.
- Distinct accepted intent, observed behavior, proposals, and implementation evidence.
- Structural tooling explicitly does not certify semantic compliance.

An earlier experimental WARP adoption remains outside this restart. It is historical context, not evidence that WARP's runtime or development problems are solved. Downstream adaptations should preserve their own existing owners and carry only shareable material upstream.


## Stavel extraction scope

The owner's 2026-11-25 instruction broadened extraction to MenuLogiq-derived documentation taxonomy, generic mdcomposer mechanics, configurable Markdown policy checks, optional JavaScript/TypeScript rules, question-led bootstrap/adoption/migration and contribution profiles. Package consumers retain their own source conventions and operational authority. The [complete philosophy matrix](philosophy-extraction.overview.md) records all source families and discrepancies.

Standalone mdcomposer owns generic composition/index/navigation/metadata/link mechanics. Stavel owns methodology, aligned project decisions and selected policy checks. MenuLogiq remains an independently configured consumer; its runtime, seeds, provider operations and business rules are not exported into this framework.

The explicit asset catalog excludes this package's filled profile, requirements/design, local decisions and historical execution evidence. The predecessor's 57-path rename map is retained only as historical provenance, outside the runtime and portable exports. Earlier measured claims remain historical evidence; Stavel requires its own verification.

On 2026-11-26 the owner selected a fresh Stavel 0.1.0 repository and Git history on main. The implementation originated from the complete predecessor snapshot 962f647; its full Git history, installation and CI evidence were backed up before retirement. The current product uses only Stavel interfaces, without predecessor command aliases or automatic legacy adoption. MIT attribution and accepted portable principles are preserved.

Later on 2026-11-26 the owner selected product as the configurable capability-document home instead of imposing MenuLogiq's platform category. This source repository's documentation and active directory-based execution packet moved to docs/internal/product. Executable default-profile role changes and configurable adopter placement remain planned; the local move alone does not establish those capabilities. Historical path maps retain their original destinations.


The owner's subsequent 2026-11-26 correction identified the existing CLI as a sibling capability and guided workflows as a skill feature. Source docs were reorganized accordingly with preserved references. The new portable [ownership philosophy](../philosophies/capability-ownership.philosophy.md) and [CLI philosophy](../philosophies/cli-tools.philosophy.md), plus source skill discovery guidance, originate from that explicit correction rather than a claimed new MenuLogiq extraction. The asset catalog includes those generic philosophies. Filled CLI feature/service designs, test-gap matrix and source status records remain local. Structured ownership diagnostics and missing service tests remain planned; documentation presence does not establish agent behavior or service coverage.


The owner then selected colocated tests specifically for Stavel and configurable test placement for adopters. Existing suites moved beside their public API/rule/package owners; generic defaults remain repository-following. The portable [placement guide](test-placement.guide.md), optional decision and typed testing policy originate from that instruction. Inspection supplies heuristic evidence and aligned init persists policy; automatic language recommendations/enforcement remain planned. The filled local testing philosophy is excluded from adopter assets.


The owner's subsequent mode correction separates DESIGN documentation, PLAN execution setup and EXECUTE implementation, broadens EXPERIMENT to learning/POCs and defines VIBE as the combined philosophy-preserving workflow. Source prompts, CLI help and skill help routing now express that direction. The follow-up instruction makes PLAN ask about stories by default and adds an overridable init-seeded story template. The new portable [story guide](story-workflow.guide.md) and template originate from these explicit choices. Story kind registration now uses the existing default profile as the canonical fallback registry, removing the drift previously reproduced in the public validator. Deterministic story/packet orchestration and enterprise tracker integration remain separate work.

## Guided workflow implementation extraction

The owner's accepted execution answers add pinned repository policy, topic overrides, stable artifact/section/question amendments, guided sessions, pointer-owned work, reviewed repairs and packet lifecycle operations. Generic design fields were compared with MenuLogiq templates for backend responsibilities, architecture, accessibility, authorization, observability and documentation/help. The portable assets contain generic prompts and no MenuLogiq tenant/business/provider/host or frontend-library conventions. mdcomposer remains the separate canonical Markdown engine. The new [provenance guide](change-provenance.guide.md) and [commit conventions](commit-conventions.guide.md) originate from explicit owner instructions. Source config, filled designs/status and trial evidence remain outside portable skill membership; runtime state stays outside committed policy.
