# Development constitution

<!-- mdcomposer:meta
title: "Development constitution"
kind: "policy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Status: accepted framework policy; local adoption is recorded in the project profile.

## 1. Preserve intent through evidence

An assistant may implement, challenge, and propose improvements to a design. It must not silently replace a required algorithm, remove a concept, weaken a contract, or claim an unmeasured capability. A smaller implementation is acceptable only if it satisfies the accepted requirements, including any required mechanisms.

## 2. Authority is explicit

The user's current instructions and existing authorization govern the task. Framework and repository documents do not override higher-priority instructions, grant new permissions, or imply consent for external actions. Record durable consequences of an authorized change in the relevant docs during the task.

Within repository documentation, apply the constitution and accepted local policy, then applicable philosophies, accepted requirements/contracts and decisions, design, and execution plans. Resolve a conflict by scope and an explicit accepted amendment, not by whichever file was edited last. A local extension cannot silently repeal an inherited invariant.

If docs conflict with running code, report the discrepancy. Code is evidence of behavior; it does not automatically define intended behavior. Documentation can also be wrong: retain contrary evidence and resolve the affected decision. A design contract cannot override mathematical or empirical reality.

## 3. Know what kind of statement you are making

Label requirements, observed behavior, hypotheses, proposals, and measurements distinctly. A test result supports only what that test exercised. File presence, test count, generated prose, and agent self-assessment do not establish working capability.

## 4. Use proportional scope

For a small reversible change, a short task note may contain recon, requirements, implementation, and verification. A major change needs explicit boundaries, contracts, risks, migration implications, and staged execution. Read the relevant documents, not every document. Do not require unrelated paperwork or a new toolchain for adoption.

## 5. Separate discovery from execution

EXPLORE clarifies requirements and codebase understanding. EXPERIMENT supports standalone learning/POCs or hypothesis tests. DESIGN records the design; PLAN sets up execution slices and optional stories. EXECUTE implements accepted ready scope using STRICT MODE. VIBE combines the activities with the same philosophy and evidence obligations. REVIEW assesses evidence and discrepancies. A mode is a working posture, not an authorization to write or publish. Experiments do not silently rewrite the production contract.

## 6. Handle uncertainty at its actual boundary

Pause the dependent portion when missing information affects required behavior, mechanism, security, compatibility, data ownership, or an external commitment. State the specific decision needed and continue independent authorized work. Choose routine reversible implementation details autonomously within the contract and record material assumptions. Do not turn every unspecified detail into a blocker.

## 7. Make verification independent of the claim

Define acceptance before implementation when practical. Link each important requirement to implementation and evidence. For a mandated mechanism, verify its defining property as well as outputs. For a defect, reproduce the failure before fixing when practical. Report unavailable checks and pre-existing failures separately. Never rewrite expected results merely to make implementation pass.

## 8. Close and preserve the loop

Before calling a slice complete, reconcile relevant docs, record actual checks and limitations, and leave a useful next step for open work. Preserve superseded reasoning and meaningful failures without treating them as current authority. Keep source changes reviewable and reversible to the degree the task permits.

## 9. Amend deliberately

New rules need a concrete motivation, owner, applicability, tradeoffs, enforcement, and acceptance. Prefer the smallest scoped change to existing policy. Revisit rules that conflict, fail, or impose costs without evidence of benefit. Follow the [extension process](framework-extension.policy.md).

## 10. Admit the framework's limits

Text influences agents; tooling enforces selected mechanical properties; tests exercise particular behaviors; review evaluates conformance. None alone guarantees correctness or faithful implementation. Use them together and distinguish which evidence exists.
