# Bootstrap a project

<!-- mdcomposer:meta
title: "Bootstrap a project"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

A bootstrap starts a greenfield repository with the selected framework defaults. The Node CLI performs deterministic inspection, planning, file operations and checks. The agent handles conversation and interpretation; the CLI does not embed a model or call an AI provider.

1. Inspect the actual target, available instruction files, stack, existing commands and current files. An apparently empty directory can still contain work to preserve.
2. Use the [decision catalog and Q&A workflow](agent-questions.guide.md). Explain selected defaults and any evidence-backed alternatives. Obtain complete applicable answers and alignment before creating target files.
3. Create a plan naming source/default versions, selected profiles, actual instructions establishing alignment, file operations and verification. A preview does not write the target.
4. Apply the aligned plan. Preflight containment, links and all differing-file conflicts; preserve host instructions and user work. No force-overwrite option is implied.
5. Verify structural routing and tool behavior. Start the [greenfield workflow](greenfield.guide.md) with one accepted outcome and first verifiable slice.

Use bootstrap for new repositories, [adopt](framework-adoption.guide.md) to preserve an existing project's conventions, or [migrate](repository-migration.guide.md) to deliberately convert conventions. Selecting a track does not authorize running the application, installing integrations, committing, merging, deploying or publishing.
