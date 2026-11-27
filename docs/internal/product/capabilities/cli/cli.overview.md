# CLI overview

<!-- mdcomposer:meta
title: "CLI overview"
kind: overview
state: active
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Purpose and audience

Stavel's CLI provides deterministic local tooling for people, automation and coding agents. It is a product surface with its own feature contracts, shared services, error/effect boundaries and behavioral verification; it is not only an implementation detail inside the skill.

## Current and planned behavior

Inspection/questions, adoption/migration planning, answers-driven init, apply/verify/recovery, structural checks/rule listing, bundled Markdown commands and skill export exist today. Guided terminal setup, diagnosis/repair, effective help, work management and packet record operations are implemented with explicit configuration and recovery boundaries. Feature PLAN/EXECUTE/VIBE remain agent workflows using those record operations; the adoption CLI plan meaning remains intact.

The [public CLI contract](../../../../public/framework-cli.contract.md) and actual help own supported usage. The [feature index](index.md) routes detailed designs. Package/library consumers and the exported skill share reusable operation contracts.

## Local conventions and limits

[Architecture](cli.design.md) explains service naming, adapter boundaries and source ownership. Every service requires meaningful behavioral tests; the [test plan](service-verification.test-plan.md) records current integration evidence and remaining focused gaps. Existing tests passing does not close those gaps automatically.

Tools preserve task authorization and accepted target conventions. They do not gain permission to run arbitrary application commands, install dependencies, mutate Git or publish because they were invoked by an agent.
