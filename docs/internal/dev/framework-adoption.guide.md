# Adopt in an existing repository

<!-- mdcomposer:meta
title: "Adopt in an existing repository"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Adoption applies the methodology while retaining accepted local conventions and canonical homes. [Migration](repository-migration.guide.md) deliberately converts conventions. Neither operation launches the target application, installs target dependencies, operates Git, calls an AI provider or provisions services.

## Inspect and align

Use read-only inspection, [historical context](repository-history.guide.md) and the [question workflow](agent-questions.guide.md). Establish source/generated/distribution/live-state boundaries and actual commands. Map existing owner docs, instructions, naming, lifecycle, audiences and exceptions. Inspect actual product surfaces and their feature/service responsibilities using the [ownership philosophy](../philosophies/capability-ownership.philosophy.md); do not assume one currently documented capability describes the whole repository. Record discrepancies without blessing accidental implementation behavior.

Gather all applicable answers and align the complete selected configuration before creating target files. Accepted local policies provide evidence-backed selections; observed patterns remain proposals. Direct prior user choices count as answers. Keep material unknowns explicit.

## Plan and apply

From the built checkout use node dist/stavel.cli.cjs; from the self-contained skill use node scripts/stavel.cli.cjs. The plan command emits JSON to stdout; store a plan or answers outside the target until applying the aligned operation.

~~~sh
stavel inspect --target /path/to/project --track existing
stavel questions --target /path/to/project --track existing
stavel plan --target /path/to/project --name "Project Name" --track existing --mode adopt --answers /outside-target/answers.json
stavel apply --plan /outside-target/plan.json --dry-run
stavel apply --plan /outside-target/plan.json
stavel check --target /path/to/project
~~~

Default generic assets install under docs/internal and docs/public with a generated local project profile. A custom relative framework path remaps asset destinations consistently. All destinations must remain in the target and avoid symlink/junction escapes. Differing files refuse before planned writes; identical planned bytes can be reused. An OS write failure can leave partial state and must be reported.

Existing AGENTS.md remains untouched. A typed companion carries proposed routing until the root instruction file explicitly links the actual index and constitution. The checker inspects real links, not filenames in code examples. The generated local profile records actual alignment and unresolved matters; generation never invents approval.

## Upgrades, removal and distribution

Use a new versioned plan for upgrades; compare source versions, hashes and local amendments. Do not rerun installation as an overwrite mechanism. Preserve local accepted changes and use migration when convention conversion is intended.

Review installed records and local changes before removal; update entrypoint links and preserve dependent requirements/decisions. Removal never authorizes deletion of application state.

A repository shipping an archive is a distribution artifact. Installing this framework does not regenerate embedded code, alter seed/live state, train a model or change runtime worker policy. Development in extracted source needs its own reviewed routing and adoption record.
