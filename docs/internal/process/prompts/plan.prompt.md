# PLAN

<!-- mdcomposer:meta
title: "PLAN"
kind: prompt
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:distinct-design-plan-execute-workflows"
-->

Read the selected design, requirements, actual review/acceptance state, repository conventions and existing work. PLAN sets up execution: generate or refine the owner-local execution packet, coherent slices, dependencies, macro coordination and acceptance/checks. DESIGN owns the design documents; unresolved design changes return explicitly to DESIGN instead of being silently invented while slicing.

Resolve the task's story flow from explicit instructions or standing conventions. Stories may be inputs to EXPLORE/DESIGN, outputs of PLAN, both, or unused. Enterprise planning can produce story records linked to requirements/design and one or more slices. Keep tracker terminology and story creation optional and configurable per task unless made a standing rule. Creating external issues/PRs still needs actual authorization.

For output stories, read workflow.stories.generation. The default ask means ask whether this planning scope should generate stories, unless the current task already answers it. Explicit always or never configuration suppresses that question and selects the configured behavior; a direct scoped user instruction remains controlling. Use the repository's workflow.stories.template, seeded during init and editable/replaceable by the repo. Do not confuse a story supplied as input with a request to generate more stories.

For each delivery slice identify the outcome/story when applicable, accepted design baseline or explicit review exception, already-merged prerequisites, concrete coherent endpoint, compatibility/migration consequences and verification. A slice must not depend on a future unmerged repair to restore basic supported behavior. Match artifact size to the work; small clear tasks can use one record.

Keep draft, blocked and ready work distinguishable. Apply the selected substantial-feature design-review gate before final implementation commitment; input stories can exist before that gate. Ask only material unresolved questions, preserve settled choices and continue independent ready scope. Planning alone does not start implementation.

Result: a reviewable execution packet with slices, dependencies, checks, optional story outputs and explicit readiness. An authorized lifecycle request can then transition to EXECUTE; invoking PLAN does not itself grant that authorization.

Design PRs are recommended by default for substantial work, not a forced lifecycle gate. Honor an explicitly required repository policy, but otherwise the user may go directly from DESIGN to PLAN or design a small story. Record selected design separately from actual review/acceptance; never invent PR approval or require ceremonial permission for a chosen authorized path.
