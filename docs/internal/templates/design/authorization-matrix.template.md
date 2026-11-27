# {{TITLE}}: Authorization matrix

<!-- mdcomposer:meta
title: "{{TITLE}}: Authorization matrix"
kind: template
state: draft
audience: public
owner: "{{OWNER}}"
updated: 2026-11-26
-->

<!-- Template output: save with selected naming and kind authorization-matrix; record actual acceptance separately. -->

## Scope and model

Identify actual subject types, resources, actions and trust boundaries. Do not assume tenants, roles, subscriptions or a particular policy engine.

## Access matrix

| Action/resource | Allowed conditions | Denied cases | Authoritative enforcement | Evidence |
| --- | --- | --- | --- | --- |
| Define actual action | Define policy | Define refusal | Identify boundary | Link check |

## Visibility and audit

Map optional UI visibility to authoritative access rules. Record audit/privacy requirements and safe denial behavior; UI visibility alone is not enforcement.

## Verification and decisions

Test allowed and denied paths and relevant ownership/scope changes. Link policy decisions and known gaps.
