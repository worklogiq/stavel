# Origins and extraction decisions

<!-- mdcomposer:meta
title: "Origins and extraction decisions"
kind: "overview"
state: "accepted"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-25"
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
