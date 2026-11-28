# Local Git guards

<!-- mdcomposer:meta
title: "Local Git guards"
kind: guide
state: accepted
audience: public
owner: repository-maintainer
updated: 2026-11-27
acceptance: "user:2026-11-27:execute-idea-and-guard-designs"
-->

Selected workflow.gitProtection policy enables packaged pre-commit and pre-push guards. It names exact protected branches and an owned repository-relative hooksPath, normally .stavel-hooks. Fresh setup defaults to protecting main; align a different primary branch or additional names for the actual repository. Existing pinned profiles are unchanged until explicitly configured/upgraded.

Init previews owned assets and local hooks configuration together, activates only after checked file application and verifies readiness. Existing foreign hooks/managers are preserved and reported as conflicts; bare/shared-worktree integrations are reported unsupported. Without Git, activation remains pending. Neither case causes an implicit git init or hidden overwrite.

The guards reject commits on protected branches or detached HEAD and pushes to protected destination branches, including deletion or a task-branch-to-main push. They apply to every normal Git caller; they cannot read conversational permission or guarantee protection against deliberate local bypass. Never use --no-verify or alternate hook configuration to bypass a Stavel refusal. Server-side branch protection is a separate control.

Files-backend repositories on Windows or with Git core.ignoreCase enabled conservatively protect case aliases too. Reftable and case-sensitive files-backend identities retain exact matching. No macOS runtime-matrix result is claimed by this behavior rule.

Use hooks inspect or doctor for diagnosis. An interrupted activation has private recovery records under .git, separate from committed policy. Use hooks resume or hooks rollback; --dry-run inspects recovery without writes. --plan FILE selects the exact saved activation when historical records are ambiguous. Saved migration apply/resume/rollback also retain the selected activation. Changed/uncertain inputs refuse instead of clobbering user edits.

The standalone bundled runner requires Node, but no global Stavel installation, model, network request or target application commands. A missing runtime/configuration fails with an actionable refusal. Conventional message enforcement is separate; these guards enforce branch destinations, not commit-message format. Installing guards does not grant permission to commit, push, merge or publish.

## Explicit controls

Use these commands when you deliberately want an exception. They change Stavel's selected behavior without uninstalling hooks or changing core.hooksPath:

~~~sh
git -c stavel.allow=true commit -m "fix: repair configuration"
git -c stavel.allow=true push origin HEAD:main
git -c stavel.allow=false commit -m "fix: use configured protection"
stavel hooks disable --local
stavel hooks enable --local
stavel hooks disable --repo
stavel hooks enable --repo
~~~

The native Git boolean applies only to that invocation and its subprocesses. True permits its protected-branch commit or protected-destination push; false supplies no exception and follows the configured policy. No reason is required. Persisting stavel.allow in Git configuration does not grant an invocation exception: the runner reads command scope only. Repeated -c values follow Git ordering, with the last command-scoped value winning. Values other than true/false refuse. No wrapper, pending allowance or exception receipt is created, and the next ordinary command is protected again when policy is enabled.

Local enable/disable stays private in this checkout's .git/config and affects both guards. Repository selection changes committed policy. Enabling repository policy does not clear a personal disable; inspection exposes the personal setting, command-scoped value when present and effective enablement. False does not re-enable explicitly disabled local/repository policy. Neither control removes hooks or changes core.hooksPath. Persistent control commands apply by default; --preview/--dry-run performs no target/configuration writes. Old runners without these controls need an explicit owned runtime upgrade; ordinary init/repair preserves their installed pin.

An agent needs an explicit user instruction for the exception and scope. General commit/push permission and a guard refusal do not authorize changing protection or adding -c stavel.allow=true. Selected configuration and owned assets must remain intact even for an invocation exception. These controls do not grant hosted permissions or bypass server branch protection; Stavel cannot distinguish a human caller from an agent.
