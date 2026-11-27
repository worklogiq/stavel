# Guided workflows feature

<!-- mdcomposer:meta
title: "Guided workflows feature"
kind: overview
state: active
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

Guided workflows owns conversational setup/customization and agent lifecycle behavior within the skill capability. The sibling CLI capability owns its command features and service contracts; shared configuration and distribution topics live under contracts. The [capability status file](../skill.status.json), indexed by the pointer-only [work registry](../../../../work-index.json), owns current work state, phase and next action.

| Canonical owner | Responsibility |
| --- | --- |
| [Requirements](guided-workflows.requirements.md) | Observable outcomes and accepted intent |
| [Design](guided-workflows.design.md) | Shared engine, state and representative flows |
| [Delivery workflows](delivery-workflows.design.md) | EXPLORE, EXPERIMENT, DESIGN, PLAN, EXECUTE/STRICT, VIBE and REVIEW |
| [Decision register](guided-workflows.decision.md) | Selected behavior and amendment sources |
| [Test plan](guided-workflows.test-plan.md) | Behavioral, failure/recovery, packaging and agent acceptance |
| [Delivery verification](guided-workflows-delivery.verification.md) | Actual local results, limitations and historical packet navigation |

Execution packets live under each working owner while active. Closed packets move as a unit into the configured archive mirror; canonical feature requirements/design remain here. Work state is read from its owning records, not inferred from document acceptance or a generated tracker.

## IDEA capture

[IDEA mode](idea-capture.design.md) now has shared CLI/skill capture and registration. The [delivery verification](ideas-delivery.verification.md) records actual implementation, checks and limitations; the capability status file owns current work state.

## Historical context (archived)

### Guided workflows draft packet

This retained navigation anchor identifies the original draft packet. The requirements, design and decisions above remain canonical; the historical packet links below preserve its preparation and execution evidence.

- [Execution coordination packet](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/index.md)
- [Coordination graph](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/guided-workflows.execution-plan.md)
- [Canonical packet manifest](../../../../_archive/product/capabilities/skill/guided-workflows/execution/guided-workflows/packet.manifest.json)
