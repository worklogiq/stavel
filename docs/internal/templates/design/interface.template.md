# {{SURFACE}} interface design

<!-- mdcomposer:meta
title: "{{SURFACE}} interface design"
kind: "template"
state: "draft"
audience: "public"
owner: "{{OWNER}}"
updated: "2026-11-25"
-->

<!-- Template output: save as identifier.ui-design.md, replace placeholders, then record real acceptance. -->

Status: draft. Owner: {{OWNER}}. Requirement references: {{REQUIREMENTS}}.

## Audience and workflow

State tasks, entrypoints, permissions, inputs, results, and authoritative domain boundaries.

## States and recovery

Define initial, loading, empty, success, error, cancellation, and retry behavior as applicable. Specify understandable messages and the separate diagnostic path.

## Accessibility and interaction

For visual interfaces, record semantics, keyboard flow, focus, labels, zoom, contrast, and motion. For CLI/SDK interfaces, record help, side effects, exit/error contracts, and machine-readable output. Name the project's applicable accessibility target.

## Verification and help

Link behavior checks, manual review where needed, user documentation, and known gaps. Reuse existing patterns before adding a new interaction system.
