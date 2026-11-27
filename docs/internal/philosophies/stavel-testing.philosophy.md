# Stavel test ownership and colocation

<!-- mdcomposer:meta
title: "Stavel test ownership and colocation"
kind: philosophy
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:colocated-tests-for-stavel"
-->

Applies to this repository. The owner explicitly selected test files next to the files they test, replacing the separate tests directory convention. This is Stavel's local implementation choice, not a universal rule imposed on adopters.

- Put focused tests beside their owner: src/testing.service.ts has src/testing.service.test.ts, and src/rules/policy.service.ts has src/rules/policy.service.test.ts. Preserve the complete implementation stem and append .test before the language extension.
- Put cross-service public API tests beside their actual entrypoint, currently src/index.test.ts beside src/index.ts. Package/artifact checks live in package.test.ts beside package.json. These are shared contract owners, not a new central test directory. Document a different owner explicitly when a genuine multi-file boundary requires it.
- Keep fixtures/helpers with the tests that own them, or in a justified shared fixture owner. Do not invent fixtures/tests for type-only files, barrels or existence assertions merely to satisfy a naming rule. Meaningful service contracts and actual evidence remain required by the [CLI philosophy](cli-tools.philosophy.md).
- Test discovery must find colocated suites and exclude dependencies, generated output, caches and symlinks. Production declarations/bundles must not acquire tests because tests now live under src. Verify actual command behavior and preserved coverage when moving tests.
- Test placement and test quality are separate obligations. The move retains existing integration coverage; it does not close the remaining focused service gaps in the foundation packet (archived; see historical context).

The [portable placement guide](../dev/test-placement.guide.md) defines adopter choices and alignment. Preserve another repository's accepted naming/layout or align an explicit migration. Source fixtures, existing tests and community examples are evidence; they do not override a user's recorded decision.

## Historical context (archived)

- [the foundation packet](../_archive/product/capabilities/cli/services/execution/foundations/foundations.execution-plan.md)
