# AI collaboration

<!-- mdcomposer:meta
title: "AI collaboration"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to external coding assistants and development automation. Application-internal workers adopt these rules only through a separate explicit integration.

- Begin with the task, project profile, relevant accepted docs, and actual repository state. Find existing implementations before adding another.
- Keep retrieved facts, accepted requirements, and assistant inferences distinguishable. Summaries should link to authoritative details instead of silently replacing them.
- State the active scope and mode when useful; switch to STRICT MODE only for an accepted implementation task. Existing task authorization is sufficient; do not demand ceremonial reapproval.
- Preserve required mechanisms. If a replacement seems preferable, explain the change and tradeoff before implementing the dependent redesign.
- Surface material ambiguity and doc/code divergence. Routine implementation choices within a clear contract remain the assistant's responsibility.
- Work in reviewable slices; avoid unrelated changes. Re-read the requirements during review, not just the assistant's implementation summary.
- Report actual checks, deviations, and open work. Do not claim perfect compliance, successful training, or completed execution from intention alone.
- Leave durable handoffs with source references and evidence. Context availability does not prove the model used it correctly.

- Use [question-led alignment](../dev/agent-questions.guide.md) for bootstrap/adoption/migration and the [tooling philosophy](tooling.philosophy.md) to recognize recurring problems, search reuse opportunities and propose proportionate improvements.

Verification: inspect the diff and requirement/evidence table. Identify any behavior that came only from an assistant assumption. Use independent review when the risk warrants it; self-audit remains supporting evidence.
