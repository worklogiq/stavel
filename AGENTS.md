# Stavel contributor instructions

Read the [framework index](docs/internal/index.md), [constitution](docs/internal/process/development-constitution.policy.md), and [local profile](docs/internal/dev/project-profile.overview.md). Read only philosophies and owning documents relevant to the task.

This repository develops the reusable framework and optional tools. It does not govern another repository until adopted there. The user's explicit task and existing authorization determine scope. Preserve accepted behavior and required mechanisms; report material ambiguity while making routine reversible implementation choices within the contract.

Use [MenuLogiq-derived documentation defaults](docs/internal/process/documentation-taxonomy.policy.md) and [typed filenames](docs/internal/process/naming-conventions.policy.md). Required host filenames are explicit exceptions. Keep documentation and source naming separate. Apply the [Q&A and alignment workflow](docs/internal/dev/agent-questions.guide.md) before generating files in an adopting target; existing explicit user choices count as answers.

For changes run npm test and npm run check, with focused checks appropriate to the affected behavior. Verify actual command behavior, help, preservation, dry-runs and refusal paths. Structural validation does not prove application semantics or agent behavior. Historical Python commands remain evidence for the archived predecessor, not the current tool interface.

Keep application-specific choices in profiles and owner docs. Follow the [extension process](docs/internal/process/framework-extension.policy.md), update [origins](docs/internal/dev/framework-origins.overview.md) when extraction scope changes, and keep skill exports sourced from the explicit portable asset catalog. Use subagents for independent implementation/review slices when authorized, with clear ownership and final integration verification.

Do not commit or push to main, merge, deploy or publish without authorization. Local instructions do not create permissions beyond the user's actual task.
