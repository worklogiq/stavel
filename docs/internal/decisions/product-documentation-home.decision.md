# Product documentation home

<!-- mdcomposer:meta
title: "Product documentation home"
kind: decision
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-26
acceptance: "user:2026-11-26:product-home-and-execution-packet"
-->

## Context and actual authority

The owner questioned inheriting MenuLogiq's platform/modules/edge categories as universal defaults, preferred product, and explicitly instructed: "go ahead and fix that name here too" while continuing the draft execution documents and moving them into the selected directory format. That current instruction authorizes this source-repository documentation migration and the naming choice; it does not authorize the entire guided-workflow runtime, publication or deployment.

## Selected direction

Use docs/internal/product as the default capability-document home. Its actual path is a project decision: teams may retain or choose features, capabilities, domains, platform or another aligned home. Product, requirements, design and contract remain document roles; naming a directory product does not restrict it to product-management prose or prescribe application architecture.

The initial migration moved docs/internal/platform to docs/internal/product. The owner subsequently clarified that Stavel is already the product and explicitly selected product > capabilities | contracts > subdirectories. Current capability documents live at product/capabilities/skill; shared framework and distribution contracts live under product/contracts by topic. The redundant tooling-and-packaging/stavel nesting has been removed. The [hierarchy design](../process/documentation-hierarchy.design.md) owns the detailed draft model. Existing repositories retain their accepted homes unless migration is aligned; preserve actual ownership, states and evidence while rebasing references.

The execution packet is a directory with a plan, separate slice files, a macro-execution tracker, shared navigation and eventual verification evidence. Durable requirements/design/decision owners remain outside it. Full closure archives the delivery directory as a unit, preserving real outcomes and updating references; a completed subset PR does not archive an active initiative.

## Delivery state and remaining implementation

Source moves used the existing plan/apply/verify primitives. The initial product rename moved 22 documents and rebased four referring documents; its dry-run preserved 150 inspected inputs. Follow-up scope organization placed product-wide versus skill owners, and the final explicit capabilities/contracts correction moved 23 documents and rebased seven referring documents; its dry-run preserved 154 inspected inputs. Actual applications verified their planned bytes and retained journals under .cache. Later authorized prose refinements are distinct from those initial byte-verification results.

Reusable runtime profiles still contain their shipped platform/modules/edge role keys. Neutral capability-home configuration, setup questions, compatibility and template defaults are tracked by GW-24 and D-10 in the [draft packet](../product/capabilities/skill/guided-workflows/index.md#guided-workflows-draft-packet). They are not represented as implemented by this document move. The existing portable policy describes the shipped executable defaults until that implementation slice reconciles them.

## Alternatives and consequences

Features is familiar but can imply only end-user changes; capabilities is broad but less familiar; domains fits some teams' modeling conventions; platform reflects a specific product architecture. Select product as the general starting point and preserve configurable paths and existing accepted owners. Keep the chosen role independent from a literal directory name in the future resolver.

Do not rewrite historical rename-map destinations as though they originally used product. Relative links from historical Markdown to current owners can be rebased without changing the historical claims. New migrations must preview collisions, source changes, local links/anchors and exported assets. The source packet remains draft and uncommitted pending its own review.
