# Commit-safety hooks design

<!-- mdcomposer:meta
title: "Commit-safety hooks design"
kind: design
state: draft
audience: internal
owner: repository-maintainer
updated: 2026-11-27
-->

Source: [Idea 001](commit-safety-hooks.recon.md), requested after Stavel committed and pushed directly to main despite the task-branch rule. The owner requested DESIGN, not implementation. The selected mechanism below is proposed technical direction; it does not claim hooks are already installed.

## Enforced behavior

Ship pre-commit and pre-push adapters with one reusable policy evaluator. Reject commits on protected local branches, and reject pushes updating or deleting protected destination branches regardless of the source branch. A task branch pushed to main must fail too. Detached-HEAD commits fail with instructions to create/select a task branch. Normal task-branch work remains allowed, subject to actual user authorization.

Apply the policy to all Git callers rather than pretending to identify an AI process. A hook cannot validate conversational permission. Do not infer an exception from chat text, an environment flag, or a commit message; any deliberate exception needs an explicitly reviewed policy change. Stavel must not bypass a refusal using --no-verify, an alternate hooks path or a different Git invocation. Local hooks are bypassable guardrails; server-side branch protection remains a separate stronger control.

## Policy and package

Proposed workflow.gitProtection configuration: enabled, protectedBranches and hooksPath. Fresh adoption aligns the repository's selected primary branch as protected; this repo uses main. Additional protected branches are explicit. Names are matched as branch identities, not shell expressions. The topic lives in the existing committed workflow configuration and uses its pin/override/provenance rules.

Package a self-contained Node guard bundle and minimal pre-commit/pre-push launchers in the explicit portable asset catalog. Install owned copies under the configurable .stavel-hooks repository directory and activate it through local core.hooksPath. Git-required launcher names are naming exceptions. The bundle includes required configuration metadata and needs no model, network call, downloaded dependency or globally installed Stavel skill. Missing Node/config/policy returns an actionable nonzero refusal; no arbitrary project test scripts run inside the guard.

This extends the existing [CF-09 Git boundary](../../../contracts/framework/framework.requirements.md). PLAN must include an explicit contract amendment allowing the selected local hook/configuration effects; it must not silently authorize commits, pushes or global Git changes.

Each invocation reads the current selected committed policy through shared configuration logic and obtains Git facts through argument-safe subprocess calls. Pre-push validates every destination ref supplied on stdin. Conventional commit message validation belongs to a later commit-msg adapter; this increment must not claim to enforce message rules from pre-commit.

## Init, repeat detection and existing hooks

Install selected guards through init's aligned preview and checked application. Integrate with [repeat-setup recognition](repeat-initialization.decision.md): enabled guard assets plus actual activation are selected setup components. A healthy repeat is a no-op; missing/modified assets or activation produce concrete gaps and a preserving preview. Disabled or older pinned policy does not silently acquire new mandatory hooks; enabling it for an adopter is an explicit configuration/upgrade choice.

Inspect core.hooksPath and the complete existing active hook directory before changing anything. Switching paths can disable unrelated hooks. An existing foreign hook manager/path or custom hook therefore produces a visible integration conflict; never overwrite it, disable it or silently report protection installed. First increment supports ordinary non-bare repositories with default/no custom hooks, or an intact existing Stavel-owned installation. Worktrees/shared configuration and foreign managers remain explicit unsupported integrations until tested, without preventing read-only diagnosis or losing prior conventions.

Without a Git repository, retain the selected policy and report activation pending Git setup; do not run git init implicitly or claim protection is active. Ordinary Stavel document setup can be reported separately, while the selected guard component remains incomplete.

## Ownership, failures and recovery

The generic file planner alone cannot claim a transaction over Git configuration. Add a narrow Git-aware installation effect using the selected repository's local config, Git-compatible locking, captured before-value/hash and a recoverable journal. Validate paths and ownership; never modify global/system Git config.

Prepare and verify owned assets first, activate hooks last, and verify actual activation before success. Failure leaves a truthful incomplete installation with recorded recovery; preview changes neither files nor Git config. Retry/rollback restores the prior config only while it still matches the operation's expected value and removes only unchanged owned files. Preserve user edits and refuse uncertain/concurrent changes. Exact all-or-nothing visibility across assets/config is not claimed.

Doctor reports policy state, ownership/integrity, active path and missing runtime/integration separately. Repair uses the same installer/read set rather than rewriting hooks independently. Do not confuse a valid installation with proof every Git client or server enforces the rule.

## Intended acceptance

| Case | Required observation |
| --- | --- |
| Commit on protected main versus task branch | Real Git commit is rejected on main and succeeds on the task branch; no protected commit object becomes HEAD. |
| Push from task branch to protected destination | Real push to a local bare fixture remote is rejected, including multi-ref pushes and deletion; ordinary task-branch push succeeds. |
| Init preview, application and repeat | No preview effects, actual hook activation after apply, zero changes on repeat and fresh-checkout missing activation recognized as a gap. |
| Existing hooks/manager or unsupported worktree | Specific conflict/unsupported result and all prior hooks/config preserved. |
| Stale policy, missing runtime, changed owned asset, interruption | Actionable refusal or incomplete state, no fake success, supported preserving recovery without clobbering user edits. |
| Distribution and configuration | Relocated/offline bundle works on Windows/Linux, uses mapped policy, retains old pins and supports explicit disable/upgrade. |

Each new/changed service has colocated behavioral tests. Hook tests must invoke actual Git processes; unit tests of a branch-name function alone cannot prove prevention. No hooks or Git configuration were changed during this DESIGN pass. Next: select the design, then PLAN coherent implementation and verification slices.
