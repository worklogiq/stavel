---
name: stavel
description: Bootstrap, adopt, migrate, or apply the Stavel repository workflow with project-aware questions, documentation conventions, packaged checks, and evidence review. Use when the user requests this framework or an adopted repository routes work through it.
---

# Stavel

Start with the target's actual root instructions, local project profile, owning task documents and current work. Preserve accepted requirements, required mechanisms and existing authorization. Read only relevant references.

In an exported skill the generic documents are under assets/framework/docs/internal and the runnable command is node scripts/stavel.cli.cjs. In the source checkout build/export the complete skill first; the source SKILL.md alone is not a standalone installation.

- New project: read assets/framework/docs/internal/dev/bootstrap.guide.md and greenfield.guide.md.
- Existing project, retain conventions: read assets/framework/docs/internal/dev/framework-adoption.guide.md and existing-system.guide.md.
- Convert conventions: read assets/framework/docs/internal/dev/repository-migration.guide.md.
- Historical context: read assets/framework/docs/internal/dev/repository-history.guide.md.
- Questions and project choices: read assets/framework/docs/internal/dev/agent-questions.guide.md and the packaged decision catalog.
- Implementation/review: follow the adopted repository's actual mode prompts, requirements and verification owners.

For help, run the packaged node scripts/stavel.cli.cjs help and explain its workflow summary using the host's supported invocation. For a requested mode read assets/framework/docs/internal/process/prompts/index.md and only the relevant prompt. DESIGN produces design documents; PLAN prepares execution; EXECUTE implements with STRICT MODE. EXPERIMENT includes learning/POCs; VIBE combines the activities with contemporaneous records and philosophy fidelity. Stories may enter EXPLORE/DESIGN or emerge from PLAN, as chosen per task or repository.

Before choosing document destinations, inspect product surfaces, command entrypoints and modules for capability/feature ownership. Apply clear existing choices; propose missing owners and ask only about material boundary ambiguity. Give meaningful features local design/decision homes and shared services one contract owner; do not mirror every source file into a product feature. For this work read assets/framework/docs/internal/philosophies/capability-ownership.philosophy.md; for CLI changes also read assets/framework/docs/internal/philosophies/cli-tools.philosophy.md and the target's local service/test conventions.

Inspect facts before asking questions. Use the host Q&A capability when available; otherwise group numbered open questions in conversation and gather all applicable answers. Ask documentation and source naming separately. For typed documents the identifier can use the selected case while the document type stays kebab-case. Prior explicit user instructions count as answers. Align the complete selected configuration before generating any target files; silence is not agreement.

For PLAN story outputs, read assets/framework/docs/internal/dev/story-workflow.guide.md. Ask by default unless the scope already has an explicit answer or repo policy selects always/never. Input stories remain valid independently. Use the repository story template seeded by init, honoring its edits or configured override.

For test placement, read assets/framework/docs/internal/dev/test-placement.guide.md. Reuse accepted repository conventions, then propose the aligned profile default or applicable language/toolchain guidance; ask when mixed or unclear. Keep local colocation choices scoped and never move adopter tests merely by selecting a policy.

Use CLI inspect/questions and the adoption/migration plan command for read-only package preparation, apply with --dry-run for preflight, and apply only the aligned plan. Preserve existing AGENTS instructions, owner paths and local amendments. Verify actual routing and selected checks. Migration plans must preserve historical evidence and actual acceptance while supporting hash-checked recovery.

Use packaged Markdown tools and optional selected JavaScript/TypeScript checks; illustrative Java/Python/frontend/backend profiles are decision aids, not implemented language packs. Suggest existing or minimal tooling when recurring corrections or defects justify it. Distinguish structural checks, observed behavior, accepted intent and unverified claims.

Finish substantial work with actual evidence, deviations, open decisions and a durable next step. The skill does not authorize commits, messages, merges, publication, deployment or application execution beyond the user's task.

Read the target's .stavel-config/stavel.config.json (or supported root configuration) through the packaged configuration resolver before applying defaults, owner paths or workflow overrides. Keep distribution assets independent of local policy. Use packaged work and packet operations for supported record changes; distinguish deterministic CLI operations from agent judgment. For any AI-assisted migration or repair, read assets/framework/docs/internal/dev/change-provenance.guide.md and visibly warn before changes and in evidence. Follow the effective commit convention from assets/framework/docs/internal/dev/commit-conventions.guide.md; conventional commits are the overridable default and do not grant commit authorization.

Design PRs are a configurable recommendation, not a forced workflow. Respect actual required team gates; otherwise let the user choose direct DESIGN-to-PLAN or small-story design and record that selection without inventing approval. A workflow preference is not an extra permission gate.
