# Discover and maintain capability ownership

<!-- mdcomposer:meta
title: "Discover and maintain capability ownership"
kind: philosophy
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:proactive-capability-and-feature-ownership"
-->

Applies when exploring a product, designing a feature, adopting a repository or changing behavior across existing owners. The owner requested proactive ownership discovery after Stavel's source documentation omitted its implemented CLI capability.

- Inspect product intent, actual entrypoints, commands, modules, existing docs and current work. Identify distinct product responsibilities and their features before choosing document destinations. A packaged tool can be a capability even when it also supports an agent skill.
- Reuse accepted repository structure. Apply clear existing choices and routine owner mappings within the task; ask a focused question when competing boundaries materially change ownership, placement or scope. Do not wait for the user to notice every missing capability, and do not silently expand an adopting target's aligned configuration.
- Give each meaningful feature a durable owner with its relevant requirements, design and decision references. Create subordinate feature homes when actual work or existing behavior warrants them. A small feature can use one document; do not require empty folders or a full packet for every command flag.
- Distinguish product features from shared services and implementation files. One service can support several commands; several services can deliver one feature. Document shared contracts once and link their consumers. Avoid copying the source tree mechanically into a competing product taxonomy.
- Keep cross-capability work with one accountable initiative owner and link affected feature designs. Do not duplicate its tracker, status or requirements under every participant.
- Revisit ownership when scope grows. Reconcile product/capability navigation, owner paths, status references, selected checks and execution links alongside the change. Migrate existing records with preserved intent and valid references rather than abandoning them.

Mechanical tools can discover candidates, validate mappings and detect unowned references; they cannot establish that an architectural boundary is appropriate. An agent trial should include a second actual product surface and shared helpers, then inspect whether the agent proposes coherent owners, preserves existing conventions and asks only material unresolved questions. Folder presence alone is insufficient evidence.
