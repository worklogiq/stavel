# Idea 001: packaged commit-safety hooks

<!-- mdcomposer:meta
title: "Idea 001: packaged commit-safety hooks"
kind: recon
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

Source: the owner's 2026-11-27 request following a direct commit and push to main that violated the task-branch rule.

Original request: "stavel comes pre-packaged with a pre-commit hook, and PREVENTS its own commits, installing the hook on init."

## Intent to preserve

Ship executable commit safeguards with Stavel and install/integrate them during initialization. Enforce the repository's selected commit and branch policy mechanically so an agent cannot simply overlook the written rules. Existing hooks and configuration must be preserved; repeated init must not duplicate or overwrite them.

## Notes for later exploration

- Protected-branch enforcement is the motivating case. Define any broader authorization checks before implementation; a hook cannot reliably identify an AI agent from an ordinary Git invocation alone.
- Git's pre-commit hook can reject a commit. Preventing a prohibited push also needs an appropriate push-side guard; local hooks are bypassable and do not replace server-side protections.
- Reuse configured conventions and provide an actionable refusal. Do not silently install dependencies or replace an existing hook manager.

This records the first idea for the [IDEA mode proposal](../../skill/guided-workflows/idea-capture.design.md). No hook was implemented or installed by this capture.
