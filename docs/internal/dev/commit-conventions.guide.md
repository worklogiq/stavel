# Commit conventions

<!-- mdcomposer:meta
title: "Commit conventions"
kind: guide
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:conventional-commits-default"
-->

Stavel defaults to conventional commit messages: type, optional scope, colon and a concise description, for example feat(init): resume accepted setup answers. The default types are feat, fix, docs, style, refactor, perf, test, build, ci, chore and revert. Scope is optional. Record breaking changes explicitly when applicable.

The effective workflow.commits configuration owns this choice. Reuse an accepted repository convention or a configured custom template instead when selected. Supported convention values are conventional, repository, custom and none; custom policy records its actual format in the repository owner documents. Ask during alignment when a discovered convention conflicts with the proposed default. Selecting a convention never authorizes committing, hooks, remote operations or installing tooling.

Before an authorized commit, the agent reads the effective convention and checks the proposed message. Automated message checking can be added by the repository. Selected [local branch guards](git-guards.guide.md) are installed only through aligned setup and preserve existing hooks; they do not implement message checking or authorize Git actions. Existing history is preserved.
