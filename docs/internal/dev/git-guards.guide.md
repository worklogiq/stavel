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

Ordinary init/repair preserves the installed runtime pin. An explicitly aligned --upgrade-baseline migration may update the owned runtime from the supplied package; edited/foreign assets still refuse, and the checked file journal retains old bytes for rollback. Version selection never silently repairs a missing old pin with unrelated newer bytes.
