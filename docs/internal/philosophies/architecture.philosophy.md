# Architecture and contracts

<!-- mdcomposer:meta
title: "Architecture and contracts"
kind: "philosophy"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Applies when responsibilities, interfaces, dependency direction, or required algorithms change.

- Name the owner of each concept and authoritative decision. Keep domain rules separable from transport and infrastructure where that makes them independently testable.
- Put external IO behind explicit boundaries; inject configuration rather than embedding machine paths or reading unrelated process state deep in domain logic.
- Public APIs, events, errors, commands, and lifecycle states are contracts. Keep producers, clients, documentation, and compatibility expectations aligned.
- Validate trust-sensitive rules at the authoritative boundary; a UI check cannot enforce a server-side decision. Choose the boundary appropriate to local, distributed, or embedded software.
- Record meaningful alternatives and why one was accepted. Do not impose a framework, provider, layered architecture, or plugin system without a project need.
- If the mechanism is itself the research or product goal, specify its data flow and invariants. Equivalent-looking output from another mechanism is not automatic conformance.
- Treat a copied working directory as source isolation, not an OS security sandbox. Name the actual execution boundary.

Verification: trace a representative request or datum through its owners and side effects. Test contracts at boundaries and any defining mechanism. Assess breaking changes and migration before promotion.
