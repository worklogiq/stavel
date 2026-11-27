# CLI architecture and service verification

<!-- mdcomposer:meta
title: "CLI architecture and service verification"
kind: philosophy
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:cli-philosophy-and-service-tests"
-->

Applies to repository CLI tools and their supporting application/shared services. The owner requested explicit CLI conventions, meaningful tests for each service and an explanation of service naming so agents maintain consistent boundaries.

## Responsibilities and naming

Keep argument parsing, terminal interaction, output rendering and exit mapping in the CLI adapter. Give reusable operations explicit inputs, outputs, errors and effects outside that adapter. Shared library and skill consumers should reuse those operations rather than reproduce their rules.

A service name identifies a cohesive operational responsibility. It does not imply a network process, deployed microservice, class or dependency-injection framework. Record the local meaning and naming convention in the project profile/architecture; preserve accepted language conventions. Pure helpers and adapters still need clear roles, without forcing every file to acquire a service suffix. Explain boundaries and reasons rather than relying on filenames to enforce architecture.

Feature docs own observable command behavior, accepted choices, errors, compatibility and verification. Shared services have one contract owner linked by their consumers. Keep the actual public interface canonical; local design docs distinguish observed behavior from planned changes.

## Every service has behavioral tests

For each service, maintain focused tests of its externally meaningful contract and relevant failure/refusal paths. For a pure service, use independent expected examples and boundaries. For filesystem/state services, use temporary real inputs and verify preservation, mutation limits, stale inputs and recovery where relevant. For adapters/process boundaries, test actual stdout/stderr, exits and side effects at the integration layer.

Tests can share fixtures and span several services, but each service's important obligations must be identifiable and independently diagnosable. Passing a large integration suite is not proof of every service contract. Do not satisfy the rule with existence checks, tests of private implementation structure, tautological expectations or an arbitrary coverage percentage. Type-only files and export barrels need appropriate compile/API compatibility checks, not artificial service tests.

Trace services to current evidence and identify gaps honestly. New or changed services include relevant tests with their delivery increment. Existing gaps become explicit scoped work; do not claim they were fixed by writing the policy or silently waive them to make checks pass.

## Interface and effect contracts

Document which commands read, plan, write, execute other commands or contact external systems. Help/discovery must not acquire hidden effects. Interactive and automated paths share validation and decisions; missing input and corrupt input remain distinct. Preserve supported command meanings, structured output and exit behavior, and test actionable refusal as well as successful paths.

Preview and mutation need concrete observable contracts. Protect accepted user data, surface partial failures and prove the relevant recovery behavior. A success label, journal file or generated design is not evidence of transactionality or semantic correctness. Use the repository's selected verification and review policy at coherent delivery boundaries.
