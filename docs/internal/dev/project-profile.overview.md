# Stavel project profile

<!-- mdcomposer:meta
title: "Stavel project profile"
kind: "overview"
state: "accepted"
audience: "internal"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

## Purpose and ownership

Project: Stavel. Maintainer and acceptance authority: repository owner. Goal: preserve accepted intent across AI-assisted sessions with useful reusable tooling. Package version: 0.1.0. Default profile: default@1.

The owner's 2026-11-26 instruction selected a clean Stavel 0.1.0 restart on main. It retains the MenuLogiq-derived documentation taxonomy, independent documentation/source naming, Node tooling, question-led aligned adoption, generic migration, historical context, tool extraction and subagent delivery. It removes predecessor aliases and automatic legacy imports. See the [restart decision](../decisions/stavel-restart.decision.md).

## Canonical owners

The [constitution](../process/development-constitution.policy.md), [philosophies](../philosophies/index.md), [documentation policy](../process/documentation-taxonomy.policy.md), [default-conventions decision](../process/default-conventions.decision.md) and versioned configuration own portable behavior. Package [requirements](../platform/tooling-and-packaging/stavel/framework.requirements.md) and [design](../platform/tooling-and-packaging/stavel/framework.design.md) own release acceptance. [CLI behavior](../../public/framework-cli.contract.md) and actual command help own executable usage.

This filled profile and package acceptance documents are local to Stavel and excluded from adopter assets.

## Environment and verification

Use supported Node LTS, npm install, npm run build, npm test and npm run check. TypeScript is this toolkit's implementation choice, not a requirement for adopting applications. Generated bundles and dependencies are development artifacts. Do not claim a check passed unless it ran.

## Local choices and boundaries

Use main as the default branch and reviewable task branches for subsequent changes; do not commit/push to main or merge without authorization. The current restart task authorizes the initial Stavel main history and its completion commits. Publication is distinct from source delivery or releasing a consumer application; npm publication and its release pipeline remain deferred. Keep the portable export sourced from explicit asset catalog entries and include every executable dependency needed after relocation.

Current implementation evidence and open work are maintained in the [execution record](../platform/tooling-and-packaging/stavel/stavel-restart.execution-plan.md). Accepted requirements are distinct from completion evidence.
