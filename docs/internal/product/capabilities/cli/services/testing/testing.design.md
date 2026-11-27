# Test placement policy and inspection

<!-- mdcomposer:meta
title: "Test placement policy and inspection"
kind: design
state: active
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Responsibility and boundaries

[testing.service.ts](../../../../../../../src/testing.service.ts) owns pure test-layout evidence classification and validation/normalization of aligned testing configuration. Decisions inspection consumes the evidence; planning persists the selected policy through the existing aligned init path. It does not generate tests, move adopter files or decide semantic community consensus.

The [placement guide](../../../../../dev/test-placement.guide.md) owns the supported shape and alignment behavior. The default strategy follows accepted repository conventions, falling back to a language/toolchain proposal or a focused question. Profile-default preserves the configured policy; explicit placement answers override it. Custom roots/patterns and scoped layouts are validated without replacing repository settings with a presumed global colocation rule.

## Evidence, errors and decisions

Classification uses recognized filenames, actual sibling paths and test directory indicators. It preserves unclassified files and distinguishes mixed, unknown and no recognized evidence. A source without a recognized test is not proof of missing coverage. No test runner or target command is executed by inspection.

Invalid policies, unknown fields, unsafe paths and incomplete custom layouts refuse. Relative roots/patterns/scopes remain explicit. The stored policy may require an agent recommendation or further aligned information; normalization does not pretend to resolve an unknown language's community convention.

## Verification

[Colocated service tests](../../../../../../../src/testing.service.test.ts) exercise independent policy/evidence examples and invalid inputs. They also run actual init preview/application, verify persisted configuration and unchanged pre-existing test bytes, and verify required custom questions without target generation. Existing adopter command/manifest compatibility remains covered by the retained integration suites.

Source Stavel tests are now colocated under its accepted [local philosophy](../../../../../philosophies/stavel-testing.philosophy.md). Other repositories choose their own aligned policy. Richer terminal init, convention recommendation catalogs and placement diagnostics remain planned; current evidence and policy persistence are implemented.
