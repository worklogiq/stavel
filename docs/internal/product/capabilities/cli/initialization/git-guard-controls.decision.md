# Explicit Git-guard controls

<!-- mdcomposer:meta
title: "Explicit Git-guard controls"
kind: decision
state: accepted
audience: internal
owner: repository-maintainer
updated: 2026-11-27
acceptance: "user:2026-11-27:native-git-allow-boolean"
-->

The owner requested personal checkout and individual commit controls, then explicitly included pushes. After considering separate allowance commands and wrappers, the owner selected native git -c stavel.allow=true with no reason requirement, and explicitly required respecting false. This amends earlier absolute no-exception guidance. Default protection remains enabled; generic commit/push authorization still does not select an agent exception.

## Selected behavior

- git -c stavel.allow=true commit|push grants a guard exception for that Git invocation and its subprocesses. False grants no exception and retains the configured local/repository behavior. A missing value grants none; invalid command-scoped values refuse. Standard Git ordering applies: the last command-scoped value wins. Only true/false booleans are accepted, case-insensitively.
- The runner reads Git's actual command scope. A persisted stavel.allow value in local/global/system configuration does not create an invocation exception. No reason, pending token, private exception receipt or Git wrapper is required. The existing installation/recovery journals remain unrelated to invocation exceptions.
- hooks enable/disable requires exactly one of --local and --repo. Local selection stores a private boolean in this checkout's .git/config; repository selection updates committed configuration using the existing pinned serializer and checked file plan. Neither changes core.hooksPath, removes hook files, alters global Git settings or runs commits/pushes.
- True skips branch/destination restrictions only after supported layout, selected configuration and owned runtime integrity are validated. It cannot bypass missing or modified owned assets, Node availability or hosted branch protections. False does not re-enable a deliberately disabled checkout/repository policy; it simply does not grant a command exception.
- --preview and --dry-run for persistent controls do not change target files/configuration. Existing locks, foreign managers and unsupported layouts are preserved. Old installed runtimes require an explicitly selected owned upgrade before supporting the new controls; ordinary init/repair preserves their pin.
- An agent needs explicit user instruction for an exception and its scope. Tool refusals and general delivery permission do not supply that authority. Hooks cannot identify a human versus an agent or enforce conversational authorization.

## Implementation and verification scope

This cohesive extension uses a proportional decision/result record rather than reopening immutable completed packets. The guard service owns policy and controls; the Git adapter reports explicit exceptions; the CLI maps persistent settings. Colocated tests and real CLI/Git fixtures verify true/false/default/duplicate/malformed values, scope isolation, subsequent-operation protection, local/repository toggles, preview preservation, stale inputs, locks, runtime compatibility and unchanged baseline pins. Actual outcomes belong in the verification record. The earlier unshipped token design was replaced, not retained as a second interface.
