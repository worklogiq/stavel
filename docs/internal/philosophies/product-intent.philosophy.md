# Product intent

<!-- mdcomposer:meta
title: "Product intent"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies to changes in capability, user outcomes, scope, and priorities.

- State whose problem is being solved, the desired outcome, and non-goals.
- Define the smallest useful result that preserves the required behavior and mechanisms. Smallness is not permission to remove the defining feature.
- Investigate reuse before inventing a parallel product, abstraction, or subsystem. New concepts need a clear responsibility and owner.
- Separate an exploratory idea from an accepted requirement. Document uncertainty and the experiment that can resolve it.
- Prefer measurable outcomes over broad labels such as intelligent, adaptive, secure, or production-ready.
- Explicitly record deferred scope. Do not treat an omitted requirement as completed merely because an easier subset works.

Verification: demonstrate acceptance scenarios for the intended user or consumer. Check non-goals and omitted requirements against the proposed scope. Use the [product](../templates/design/product.template.md) and [requirements](../templates/design/requirements.template.md) templates where needed.
