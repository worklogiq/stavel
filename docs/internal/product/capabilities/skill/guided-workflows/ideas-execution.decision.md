# IDEA and commit-guard execution selection

<!-- mdcomposer:meta
title: "IDEA and commit-guard execution selection"
kind: decision
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-27
acceptance: "user:2026-11-27:execute-idea-and-guard-designs"
-->

The owner explicitly requested Stavel EXECUTE after receiving the draft IDEA workflow/CLI and commit-safety hook designs. That selects those designs for local implementation, necessary planning, tests and recovery/distribution integration. No design PR or human review beyond that actual instruction is invented. Work stays on docs/idea-capture-and-commit-guards; main must not be changed.

Prepare owner-local execution packets, then execute using STRICT MODE. This bounded continuation uses execution packets without output stories, preserving the existing no-story/no-extra-question task preference. The standing PLAN story setting remains unchanged.

CF-09 is amended narrowly: tooling may inspect Git and, within an aligned selected hook plan, install owned local hook assets and activate/recover that repository's local hook configuration. This does not authorize automatic git init, commits, pushes, merge, global/system configuration changes or bypassing a protection refusal. Actual commit/push delivery to the existing task branch retains the user's prior branch-specific authorization; no merge/publication is authorized.

Routine API and serialization choices follow the selected designs. Existing hook managers/worktrees outside supported integration remain visible preserving refusals, not silently overwritten. Tests must exercise actual Git commit/push prevention and real capture/recovery effects. A passing structural check is not proof of those mechanisms.
