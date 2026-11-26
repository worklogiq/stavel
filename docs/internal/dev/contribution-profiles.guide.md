# Contribute conventions and profiles

<!-- mdcomposer:meta
title: "Contribute conventions and profiles"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Start with a concrete recurring failure or unmet project need. Search existing repository tools and established solutions before adding another. Keep the framework usable without any particular application language or provider.

A contribution identifies applicability, owner, version, configuration/questions, required dependencies, scope and side effects, examples, acceptance evidence, false-positive limitations, compatibility and migration consequences. Templates state decisions explicitly; executable rules need representative valid/invalid cases and refusal paths.

Illustrative [Java](profiles/java.profiles.md), [Python](profiles/python.profiles.md), [frontend](profiles/frontend.profiles.md) and [backend](profiles/backend.profiles.md) profiles are decision aids. They are not implemented language packs. Future contributors can add actual language integrations while preserving the generic contract and existing accepted behavior.

Reuse one canonical implementation through package versions. Consumers retain their own profile configuration; do not maintain diverging copied engines. Update help, owning docs, tests, provenance and asset membership in the same slice. Follow the [extension process](../process/framework-extension.policy.md); publication and external changes remain within the user's actual authorization.
