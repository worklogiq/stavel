# {{STORY_ID}}: {{TITLE}}

<!-- mdcomposer:meta
title: "{{STORY_ID}}: {{TITLE}}"
kind: template
state: draft
audience: public
owner: "{{OWNER}}"
updated: 2026-11-26
-->

<!-- Repository-owned template: init seeds this file once; customize it here or configure workflow.stories.template to an existing Markdown template. Output: identifier.story.md. When rendering, change kind to story, replace placeholders and retain actual acceptance state. Generating a story never accepts it or creates an external tracker issue. -->

## Outcome and scope

Describe the user or technical outcome, intended beneficiary/consumer and boundaries. Use a user-story sentence when it helps; technical enabling work does not need an artificial persona.

## Canonical requirements and design

Link requirement/acceptance IDs, the relevant design and decisions. If this story is an input to EXPLORE/DESIGN, explicitly record missing or proposed design rather than inventing an accepted baseline. Avoid copying the canonical specification into this record.

## Acceptance

| Requirement / outcome | Observable acceptance | Verification |
| --- | --- | --- |
| {{REQUIREMENT_ID}} | {{ACCEPTANCE}} | {{CHECK_OR_EVIDENCE}} |

## Delivery slices and dependencies

Link one or more PLAN-produced execution slices, merged prerequisites and review evidence when available. During discovery these may be pending. Each completed delivery slice must leave a coherent supported repository state without relying on a future unmerged repair.

## Non-goals, open decisions and status

Record exclusions, material unanswered choices, current story status and actual decision sources. Link implementation/evidence from canonical slice owners; do not establish another independently edited slice-completion tracker. External issue references are optional and require real creation/association evidence.
