# Markdown tools and link integration

<!-- mdcomposer:meta
title: "Markdown tools and link integration"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and current evidence

Interface: docs <mdcomposer args>. This feature owns the responsibility below. Existing behavior is observed from the linked source and tests; future changes require their actual accepted contract.

Delegate generic Markdown parsing/composition to canonical mdcomposer. Stavel wraps heading/link inspection and path-aware rebasing for its plans/checks. The CLI docs adapter launches the bundled mdcomposer executable with explicit arguments and forwards its output/exit.

## Decisions, constraints and rationale

Do not fork generic Markdown mechanics into Stavel. Preserve fenced examples, reference/image links and composition imports when rebasing; unsafe local destinations produce diagnostics or refusal. Spawning the packaged tool is distinct from running arbitrary target scripts.

## Verification and gaps

Existing tests cover links with spaces/titles/fragments, reference/image rebasing, composition imports and fenced examples. Add focused wrapper tests and actual docs process success/failure/argument/output propagation.

## Planned delivery and owners

The separate mdcomposer repository remains the generic implementation owner. Stavel owns its policy integration and packaging contract.

[source boundary](../../../../../../src/markdown.service.ts) | [CLI architecture](../cli.design.md) | [public CLI contract](../../../../../public/framework-cli.contract.md) | [initiative requirements](../../skill/guided-workflows/guided-workflows.requirements.md)
