# Development framework

<!-- mdcomposer:meta
title: "Development framework"
kind: "overview"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Read the [constitution](process/development-constitution.policy.md), [default conventions](process/documentation-taxonomy.policy.md), and the repository's actual project profile linked from root AGENTS.md. The [profile template](templates/project-profile.template.md) describes the required adoption record; an exported framework never supplies this package's filled profile as your application's policy.

| Situation | Read | Result |
| --- | --- | --- |
| New project | [Bootstrap](dev/bootstrap.guide.md) and [greenfield](dev/greenfield.guide.md) | Aligned decisions and first verifiable slice |
| Existing project, retain conventions | [Adoption](dev/framework-adoption.guide.md) and [existing system](dev/existing-system.guide.md) | Owner mapping with preserved instructions |
| Convert conventions | [Migration](dev/repository-migration.guide.md) | Reviewed, versioned file and metadata transformations |
| Discover relevant history | [Historical context](dev/repository-history.guide.md) | Bounded evidence and unresolved decisions |
| Gather project decisions | [Agent questions](dev/agent-questions.guide.md) | Complete alignment before target files are generated |
| Unproven mechanism | [Research](dev/research.guide.md) | Bounded experiment with independent reference |
| Daily delivery | [Lifecycle](process/development-lifecycle.policy.md) and [modes](process/prompts/index.md) | Proportional recon, implementation and evidence |
| Change a rule | [Extension process](process/framework-extension.policy.md) | Scoped amendment with acceptance and enforcement |
| Restart a session | [Handoff](process/session-handoff.guide.md) | Durable state, sources and next action |

## Canonical homes

[Philosophies](philosophies/index.md) own portable engineering principles. [Templates](templates/index.md) describe document roles and output names. The local project profile maps product, requirements, contracts, design, decisions, execution and history to one owner each. Adopt existing owner paths when retaining repository conventions; migrate only within the aligned scope.

Document state is draft, accepted, active, complete or deprecated. Archive is a location. Execution status and evidence are separate from acceptance. Read only the task-relevant documents, not the entire corpus. File presence or passing structural checks cannot establish semantic or agent compliance.
