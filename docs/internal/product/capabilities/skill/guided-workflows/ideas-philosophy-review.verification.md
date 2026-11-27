# IDEA and Git-guard bounded philosophy review

<!-- mdcomposer:meta
title: "IDEA and Git-guard bounded philosophy review"
kind: verification
state: complete
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

## Scope and reviewers

The coordinator and delegated IDEA/work, Git-guard and initialization/doctor implementers reviewed their boundaries and cross-service integration against the selected designs, CLI philosophy, testing colocation, capability ownership, preservation and evidence rules. The IDEA agent additionally ran an independent relocated-package usage trial on Windows and Linux. Component implementers are not independent auditors of their own modules; this is bounded engineering review, not human acceptance.

## Findings resolved before closure

- A real serialized doctor/completion repair consumed .git/config as both generic input and separately activated resource, invalidating its own recovery. The descriptor now exclusively owns that transition; competing generic configuration operations refuse. Real apply/verify/resume/rollback regressions pass.
- Terminal text trimming would change a captured idea. Only decision identifiers are trimmed; a native Windows terminal trial confirms exact original leading/trailing whitespace, and shared capture retains literal multiline data.
- The IDEA artifact initially collided with the generic recon default destination in all-family generation. A validated optional identifier suffix distinguishes this role; custom canonical destinations remain authoritative, and the all-family regression passes.
- Git files backends on case-insensitive systems can alias MAIN to protected main. Actual backend/ignore-case inspection now refuses unsafe aliases conservatively; reftable keeps its exact identity behavior.
- Runtime resolution, private recovery receipts, foreign empty config locks and owned runtime upgrades were reviewed and tested. Preserving completion does not silently replace a pinned installed runtime; explicit upgrades bind the new bundle and support rollback.
- A positive fixture used lowercase idea inside the configured work vocabulary while the existing schema uses canonical IDEA. The fixture was corrected; explicit user arrays remain unmodified and excluded IDEA policy refuses capture.

## Philosophy alignment and evidence limits

The [delivery verification](ideas-delivery.verification.md) maps each execution slice to actual module/process evidence and the final 387-test result. New services have colocated behavioral tests; adapters delegate shared semantics. Capability owners remain skill/guided-workflows for the IDEA workflow and cli/initialization for guards; work state stays in capability records rather than a copied aggregate. No writes to main, bypass, unselected global configuration or publication are authorized by these tools.

AI-assisted selection/configuration changes retain their explicit source and nondeterministic warning. Deterministic file/runtime effects remain bound to checked plans, journals and preserving refusal paths. Asset application and Git activation are ordered recoverable steps, not a claim of atomic visibility across resources. Structural checks do not prove agent behavior or arbitrary custom templates. No remaining material finding was observed in this bounded review after fixes and final checks; no universal correctness or unrun remote matrix is claimed.
