# Historical context discovery

<!-- mdcomposer:meta
title: "Historical context discovery"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Gather the history needed for the task and adoption decisions. Start with local accepted decisions, current/superseded documents, tests, source and relevant Git history. Remote issues or services are optional authorized evidence sources, not prerequisites.

Cover canonical owners and instructions; architecture rationale and required mechanisms; rejected approaches and reversals; recurring defects/corrections/manual work; compatibility and data obligations; source/generated/distribution/live-state boundaries; operational constraints; actual verification commands; known failures and unresolved contradictions.

Produce a bounded context map with revision, scope, source links, accepted decisions, observations, hypotheses and open questions. A historical comment or abandoned proposal is evidence, not a current requirement. Preserve contrary evidence and incomplete verification.

For greenfield work record known goals and constraints rather than inventing project history. Existing adoption maps current owners; migration preserves meaningful rationale, approvals and superseded evidence while transforming conventions. Read only the history relevant to each later task and refresh claims affected by source changes.

Use the [recon template](../templates/execution/recon.template.md) and [handoff](../process/session-handoff.guide.md). Propose tools for recurring failures under the [tooling philosophy](../philosophies/tooling.philosophy.md) without silently expanding scope.
