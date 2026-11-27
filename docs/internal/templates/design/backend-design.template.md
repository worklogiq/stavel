# {{TITLE}}: Backend design

<!-- mdcomposer:meta
title: "{{TITLE}}: Backend design"
kind: template
state: draft
audience: public
owner: "{{OWNER}}"
updated: 2026-11-26
-->

<!-- Template output: save with selected naming and kind backend-design; record actual acceptance separately. -->

## Scope and ownership

Describe backend boundaries and the source of truth for each durable fact. Identify writers, readers and shared contracts.

## Transport and domain behavior

Define inputs, outputs, validation, errors, authorization boundaries, idempotency and concurrency. Reuse existing application conventions.

## Persistence and adapters

Record persistence/adapter boundaries, consistency, migrations, compatibility and recovery where applicable. Do not assume a database or tenancy model.

## Operation and verification

Identify operational signals, privacy/redaction, failure paths and meaningful contract, unit, adapter and integration evidence.

## Risks and decisions

Link accepted requirements/decisions and identify unresolved boundaries.
