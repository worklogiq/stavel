# Philosophy extraction and project decisions

<!-- mdcomposer:meta
title: "Philosophy extraction and project decisions"
kind: "overview"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

This matrix covers all 22 MenuLogiq philosophy files, including pointer documents. Preserve portable principles and make concrete stack, provider, team and domain choices explicit. Accepted repository decisions are retained; code patterns are evidence to propose, not automatic policy.

| Source philosophy | Portable owner | Decisions when applicable | Profile direction |
| --- | --- | --- | --- |
| accessibility | Interfaces/accessibility | Accessibility target, platform coverage, exceptions | Web/desktop/mobile/CLI |
| adapters | Architecture | IO/config/error/retry ownership, authorized providers | Language-specific ports and DI |
| ai-assistance | AI collaboration | Instruction owners, handoffs, alignment and modes | Host Q&A or grouped fallback |
| api-architecture | Architecture pointer | Protocol, routing, versioning, owner | REST/RPC/messaging |
| api-client | Architecture/interfaces | Generated clients, transport, cache/retry/auth context | Browser/server/mobile SDK |
| api-docs | Architecture/documentation | Schema format, code/spec-first, publication | Selected API contract format |
| backend-technical | Architecture/security | Runtime, validation, jobs, integrations | Java/Python/Node backend examples |
| code-structure | Code quality | Modules, style, roles, thresholds, formatter/linter | Scoped language conventions |
| data-model | Data/persistence | Facts versus projections/snapshots/history | Storage/eventing examples |
| database | Data/persistence | Storage, tenancy, transactions, migrations/recovery | Database/provider integration |
| domain-core | Architecture | Domain boundaries, shared types/constants | Language modeling examples |
| file-naming | Naming policy | Document shape/case independent of source naming | Language and host exceptions |
| frontend-architecture | Interfaces pointer | Framework, UI ownership, routing/state/data | Frontend examples |
| infrastructure-as-code | Delivery/infrastructure | Providers, IaC, state/secrets/resource ownership | Provider/tool profiles |
| observability | Observability | Diagnostics, correlation, privacy, retention/cost | Runtime instrumentation |
| product | Product intent | Audience, outcomes, scope, success measures | Domain examples |
| project-management | Lifecycle/documentation | Tracking, branching, acceptance/archive rules | Team workflow profiles |
| public-docs | Documentation/interfaces | Audience, publishing, renderer, help/i18n | Library/API/product guides |
| testing-ids-and-onboarding | Interfaces/verification | Selectors, constants, onboarding | UI testing conventions |
| testing | Verification | Runners, commands, layers, fixtures, evidence | Language/domain testing |
| tooling | Tooling | Selected modules, recurring problems, help | Configurable checks |
| uxe-technical | Interfaces/architecture | Composition, forms, cache, i18n, recovery | Frontend examples |

## Deliberate differences and source discrepancies

The source testing philosophy mixes Vitest and historical Jest expectations. Select actual accepted commands rather than copying incompatible runner mandates. The source infrastructure-as-code document contains corrupted hyphen-separated text; recover intent from accepted owner/history evidence and preserve uncertainty rather than exporting corrupted policy. The source philosophy index omits public-docs and frontend-architecture. Pointer docs remain pointers, not competing authorities.

The extracted framework retains user authorization, proportional scope, independent evidence and autonomous routine implementation choices. It does not reinstate blanket blockers for every undocumented detail or mandatory planning modes. MenuLogiq product priorities, package paths, tenant headers, exact thresholds and providers remain local.

## Decision handling and contributions

The thirteen-group catalog covers these families without forcing 22 separate questionnaires. Inspect accepted policies first, ask only applicable unresolved questions, mark not-applicable subjects, then gather answers and align before generation. Java, Python, frontend and backend examples are decision aids; executable support requires a separately tested contribution.
