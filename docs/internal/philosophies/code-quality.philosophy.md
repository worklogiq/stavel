# Code quality

<!-- mdcomposer:meta
title: "Code quality"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to implementation and refactoring in the project's chosen language.

- Prefer small cohesive units and names that reveal responsibility. Decompose because responsibilities differ, not to meet a universal line-count target.
- Use the language's type and validation facilities to express real domain shapes. Dynamic or unknown values need appropriate boundary checks; avoid type escapes that conceal a defect.
- Keep shared contract values in one authoritative definition. Ordinary local literals are acceptable; repeated semantic identifiers and tuning parameters need clear ownership and rationale.
- Comments explain non-obvious intent, constraints, and algorithmic reasoning. Detailed design belongs in linked docs; do not remove useful explanations merely to reduce comments.
- Preserve dependency direction and reuse established patterns when they fit. Introduce an abstraction for a concrete benefit, not imagined future consumers.
- Fix underlying lint, type, and test problems. Do not suppress a required check or weaken a contract just to obtain green output. A genuine exception needs an explicit reason, scope, and review under local policy.
- Preserve unrelated user work. Keep refactoring distinct when it would obscure a behavior change.

Verification: review the diff against the contract and local conventions, then run relevant existing checks. The framework does not impose TypeScript, arrow functions, a directory suffix scheme, or a package manager.
