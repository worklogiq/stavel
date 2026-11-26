# Greenfield example: a notes CLI

<!-- mdcomposer:meta
title: "Greenfield example: a notes CLI"
kind: "example"
state: "draft"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
-->

Document status: illustrative. No implementation or execution is claimed.

## Accepted task

Build a local CLI that adds and lists plain-text notes. Non-goals: accounts, sync, plugins, and remote hosting. The user has authorized implementation; no additional architectural approval ceremony is needed.

## Requirements and slice

| ID | Behavior | Acceptance |
| --- | --- | --- |
| N-01 | Adding a nonempty note persists it | A new process lists the exact note |
| N-02 | Empty input is rejected | Nonzero result with explanation; storage unchanged |
| N-03 | Unreadable existing storage is preserved | Report error without resetting it |

Required mechanism: none beyond durable local storage. Choose a suitable simple implementation in the project's language. Record the storage location and missing/corrupt distinction in the short design note.

## STRICT MODE task

Implement N-01 through N-03, preserving unrelated files. Use temporary storage for checks. Do not add sync or authentication. Demonstrate normal write/read, a restart boundary, invalid input, and existing unreadable data.

## Example completion shape

Report actual implementation locations and actual check results per requirement. Until those checks run, rows remain unverified. A planned test or an assistant's confidence is not a passing result.
