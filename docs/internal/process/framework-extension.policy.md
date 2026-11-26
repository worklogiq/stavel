# Extending the framework without losing its shape

<!-- mdcomposer:meta
title: "Extending the framework without losing its shape"
kind: "policy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Use this process when a real task exposes a missing rule, contradictory policy, or a deliberate change of direction.

1. Capture the concrete failure or decision with source/evidence links. Separate a one-off preference from a recurring engineering constraint.
2. Find the existing owner. Prefer clarifying that document over adding a competing definition. Choose local scope unless the rule is demonstrably portable.
3. Draft an amendment with motivation, applicability, proposed rule, costs, exceptions, enforcement, acceptance authority, and migration effects. Use the [decision](../templates/design/decision.template.md) or [philosophy](../templates/design/philosophy.template.md) template.
4. Identify affected requirements, prompts, templates, code checks, and existing exceptions. Explain conflicts instead of silently tightening or weakening inherited policy.
5. Record the authorized decision. Direct user instructions may already authorize the change; make their durable effect explicit. Otherwise keep the amendment a proposal until accepted.
6. Update the single canonical owner, indexes, affected consumers, and checks in the same slice. Mark the old decision superseded and link the replacement.
7. Review the rule after actual use. Revise rules that create needless blocking, encourage shortcuts, or fail to protect the intended behavior.

## Enforcement levels

| Rule type | Appropriate evidence |
| --- | --- |
| File/link/layout convention | Structural check |
| Schema or interface constraint | Contract check |
| Runtime behavior | Behavioral or integration test |
| Mandated mechanism | Defining-property check plus behavioral evidence |
| Empirical advantage | Reproducible comparison against a baseline |
| Reasoning or architectural fit | Human or independent review with limitations |

Do not convert every philosophy into a regex or every incident into a universal prohibition. A rule needs an owner and an enforcement strategy that actually addresses its purpose.
