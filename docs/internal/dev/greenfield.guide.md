# Starting a new project

<!-- mdcomposer:meta
title: "Starting a new project"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Use [EXPLORE](../process/prompts/explore.prompt.md) to identify the user, problem, outcome, constraints, and non-goals. Do not manufacture architecture before the first useful behavior is understood.

1. Set the [profile template](../templates/project-profile.template.md): owners, intended environment, source-of-truth homes, available commands, and current authorization boundaries.
2. Draft the first capability using [product](../templates/design/product.template.md) and [requirements](../templates/design/requirements.template.md) sections. For a small project these can be one document. Distinguish outcomes from mechanisms the project specifically requires.
3. Resolve meaningful alternatives in [DESIGN](../process/prompts/design.prompt.md). Use [EXPERIMENT](../process/prompts/experiment.prompt.md) for uncertainties that need measurements. Accept decisions before relying on them as implementation constraints.
4. Choose a thin end-to-end slice with explicit inputs, outputs, failure behavior, and acceptance. Add design detail and a test plan only where they clarify a real boundary or risk.
5. Execute the accepted slice in [STRICT MODE](../process/prompts/strict.prompt.md), verify against the original requirements, and leave a [handoff](../process/session-handoff.guide.md).

Do not create empty documents for future departments or subsystems. The first deliverable is a useful, checked behavior plus enough durable intent to extend it faithfully. Select a stack based on the project, not this framework's implementation language.
