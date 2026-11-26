# Documentation ownership and lifecycle

<!-- mdcomposer:meta
title: "Documentation ownership and lifecycle"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to durable intent, instructions, decisions, execution notes, and user help.

- Give each concept one canonical home. Link from indexes and local instructions; do not duplicate definitions into parallel trees.
- Separate authority from location: accepted policy, accepted contracts, proposed design, observed behavior, and execution history are different document roles.
- Record status, scope, owner or decision authority, and evidence as appropriate. Acceptance must refer to a real decision; a generated `accepted` label is not approval.
- Use relative Markdown links for maintained documents. Templates may illustrate destinations, but adopted documents must link to real owners.
- Update docs with the behavior change. Do not amend a requirement after a failed implementation merely to redefine success; record the authorized decision and its reason.
- Preserve historical decisions and completed execution evidence; mark supersession and route readers to current authority. Archive is historical, not an alternative policy source.
- Match audience and publication scope. Public does not mean every internal detail is suitable to share; do not infer permission from a folder name.
- Keep a small number of relevant documents in each coding session. Retain references to detailed specs rather than relying on an ever-growing chat summary.

Verification: check links and ownership, inspect conflicting definitions, and compare acceptance claims with the recorded decision. Follow the [extension guide](../process/framework-extension.policy.md) when ownership or policy changes.
