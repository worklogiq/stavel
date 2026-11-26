# Adopting in an existing system

<!-- mdcomposer:meta
title: "Adopting in an existing system"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Start with [read-only recon](../templates/execution/recon.template.md). A working codebase and its history are evidence; they are neither disposable nor automatically the intended design.

An existing experimental application uses this recon route first, then the [research protocol](research.guide.md) for uncertain mechanisms or benefit claims. The installer track is an initial reading route, not an exclusive project category.

## Establish the map

- Find existing agent instructions, requirements, decisions, runbooks, tests, source, generated outputs, and live state.
- Identify which documents are current, proposed, historical, conflicting, or unverified.
- Map commands and side effects before running the application. Record machine-specific assumptions and the difference between source, distribution, and live installation.
- Route the new profile to existing canonical homes. Keep original paths until an explicitly scoped migration is justified.

## Adopt one boundary at a time

Pick one reported failure or capability. Record the intended requirement, observed behavior, existing proof, and missing evidence. Where behavior is undocumented, characterize it without treating accidental behavior as a newly accepted requirement.

Agree on the relevant contract, identify any required mechanism, and make the next change in [STRICT MODE](../process/prompts/strict.prompt.md). Record pre-existing failures separately from regressions. Do not require the whole system to satisfy every new convention before a focused improvement can proceed.

## When documentation disagrees

Preserve the discrepancy with locations and evidence. Resolve the specific behavioral decision with the owner or current explicit user instruction. Do not silently rewrite code to fit stale docs or rewrite docs to bless broken code. An accepted local exception names its scope and review condition.

For archives and seeds, document where development actually occurs. A framework in the distribution checkout does not automatically govern the source tree or workers inside the shipped application. See [adoption](framework-adoption.guide.md).
