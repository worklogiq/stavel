# Independent agent workflow trial

<!-- mdcomposer:meta
title: "Independent agent workflow trial"
kind: verification
state: deprecated
audience: internal
owner: repository-maintainer
updated: 2026-11-26
-->

## Scope and evidence boundaries

The delegated ART/help agent performed a fresh Windows trial after the coordinator's successful full build. This exercises actual built CLI subprocesses and a small independently usable fixture; it does not prove universal agent behavior, semantic conformance in arbitrary applications, Linux/macOS behavior or completion of every initiative acceptance case. No publication, external tracker operation, commit or remote service was used.

The fixture is `C:/Users/steve/AppData/Local/Temp/stavel-agent-trial-HHD3Bk/project`. Numbered stdout/stderr and actual test TAP files are retained in its sibling `evidence` directory. The standalone skill export is sibling `skill-export`. The local `.cache/artifact/trial-location.json` records paths and observations; these temporary locations are supporting evidence, not portable framework assets or durable work-state owners.

## Actual workflow observations

The first run recorded **35 numbered steps: 32 Stavel CLI invocations and three direct fixture test runs**. Expected refusals and the actual integration failure below are retained rather than counted as a clean end-to-end pass.

| Steps | Observed behavior |
| --- | --- |
| 01–04 | Bare `init --json` detected the fixture root without `--target` and returned input-required/exit 2. Grouped explicit answers and real product facts produced a preview. Preview/dry-run left the original three files unchanged; apply succeeded and emitted the requested AI-authored-change warning. |
| 05–10 | Context configuration/help, an empty pointer-only work registry and doctor worked. Doctor reported mechanical success while retaining semantic review-required. A standalone skill was exported; its bundled CLI help ran outside the source checkout. |
| 11–14 | The agent explicitly mapped an actual formatting capability and greeting feature in committed taxonomy configuration. Artifact preview created no owner directories; apply generated draft feature-local requirements/design/test-plan documents. The agent filled the actual bounded design, then created/read one capability-owned work item through CLI commands. The registry contained only identity/status-file pointers. |
| 15–18 | PLAN with no scoped story answer returned input-required/exit 2. An explicit task-local `stories: false` produced one separate slice and a macro tracker under the feature's execution packet. Preview wrote nothing; apply succeeded; packet read reported that single slice ready. A local bounded trial review exception was recorded explicitly, without claiming an accepted design PR. |
| 19–24 | Premature packet close returned incomplete/exit 1. The slice entered in-progress. The original normal-input test passed 1/1; three added independent contract cases failed before implementation. After explicit type validation, one trim and blank refusal, all four fixture tests passed. Result/check/agent-review records were supplied explicitly; completion succeeded and emitted the AI-change warning. |
| 25–28 | Packet read reported complete; `packet close` returned scope-closed/exit 0 and ran packaged checks. Doctor independently retained semantic review-required. Work completion required and recorded actual verification/review evidence. No human acceptance was invented. |
| 29–34 | Archive preview/apply succeeded; the complete packet moved to its owner-relative mirror, and archived packet read still reported closed. Relocated contextual help succeeded. The subsequent relocated check exposed the archive-state defect below. |
| 35 | Real `migrate rollback` safely restored the pre-archive packet after that failure and returned rolled-back/exit 0, allowing replay after the coordinator's fix. |

The fixture implementation preserved its synchronous exported function and ordinary greeting behavior. The completed slice trims valid names and refuses blank/non-string inputs, with colocated tests. This is an observed coherent endpoint for this fixture, not a metric for general application quality.

## Actual integration failure and fixed replay

Step 34 failed with two `doc-archive` diagnostics: the archived execution slice and macro retained `state: draft`, while the selected archive policy permits historical `complete` or `deprecated`. Archive apply and packet read had both returned success. The original diagnostics remain in `evidence/34-relocated-check.stdout.json`; they were reported to the coordinator and a lifecycle owner was assigned a regression/fix. The packet was rolled back rather than editing the evidence to hide the failure.

After the lifecycle owner's fix and the coordinator's next successful build, **eight further CLI steps (36–43) all exited 0**. Total numbered evidence now covers **43 steps: 40 Stavel CLI invocations and three direct fixture test runs**. Original failed evidence remains intact.

| Replay steps | Actual result |
| --- | --- |
| 36–37 | Pre-archive packaged check and packet close passed against the restored packet. |
| 38–40 | Fixed archive preview/apply passed; archived slice and macro metadata both read `state: complete`; archived packet read remained closed. |
| 38–40 | An additional current-owner document contained both inline and reference-style links to the live slice/tracker. Archive moved those references into `Historical context (archived)` and rebased them to the owner-relative mirror. The document's current prose was retained. |
| 41–43 | A fresh standalone skill export was created at sibling `skill-export-fixed`. Its relocated CLI ran packaged checks successfully and reported the archived packet scope-closed. Its explicit source root was the export's own `assets/framework`, not the source checkout. |

This establishes the bounded fixture's clean archived endpoint after correction, not complete initiative acceptance or universal agent reliability.

## Native terminal proof

A separate real PowerShell PTY confirmed `process.stdin.isTTY` and `process.stdout.isTTY` are true. Running the actual CLI against sibling `native-target` displayed default-consent, project name/intent, language, verification-command, product audience/scope/outcome, full alignment and apply prompts. The agent answered these synthetic fixture questions, entered `align`, then declined apply with `no`. The process exited 0; the target remained completely empty.

The process-local `LOCALAPPDATA` pointed to sibling `native-runtime`, isolating persisted question-session files from the user's normal cache. `evidence/native-tty.transcript.txt` is a partial PowerShell screen capture; the complete sequence was observed in the tool's PTY outputs, not fully preserved by that transcript file.

The native preview also exposed a usability defect: full base64 plan payloads produced roughly 5,600 terminal lines before the apply question and were repeated after declining. After the coordinator's fix, a second native PTY session supplied aligned synthetic answers and displayed a human summary of 109 operation paths/reasons with `--json` offered for full detail. No serialized content/base64 payload appeared. Declining apply exited 0 and left sibling `native-target-fixed` completely empty. Its process-local runtime directory was isolated as well.

The second session's final preview JSON labeled the operation count `changed: 109` despite no writes. The coordinator subsequently changed that source contract to `plannedOperations` with `changed: 0` for a declined preview; this worker did not perform a third native session for that label alone. The label did not affect the observed preservation result. The original and fixed native sessions are additional terminal observations, separate from the 43 numbered headless steps.

## Additional supported-runtime availability probe

The source README requests a supported Node LTS release and `package.json` declares `engines.node: >=20.19.0`; those declarations are not multi-runtime execution evidence. The observed fixture/native runs used Windows Node 20.19.6.

A read-only attempt to obtain Linux/Node 24 evidence found both `docker.exe` and `wsl.exe` installed. `docker info --format '{{.ServerVersion}}'` and `docker image ls node` both failed because the `//./pipe/dockerDesktopLinuxEngine` daemon pipe was absent. Cached Node images could not be inspected; this is not evidence that no cached image exists. `wsl --list --verbose` reported both `Ubuntu-22.04` and `docker-desktop` stopped.

That initial probe did not start a daemon/distribution, pull an image, create a container, install dependencies or modify another repository. At that point Linux/Node 24 checks were unavailable. The later coordinator-authorized WSL proof below supersedes package-smoke unavailability; it does not convert the initial failed probe into a passing check.

## Follow-up Linux Node 24 installed-package proof

The coordinator subsequently started Ubuntu 22.04 through a benign WSL command, observed no installed `node`, and authorized a task-local official runtime without system/global installation. The worker used that now-running distribution. WSL reported `x86_64`; an initial systemd user-session warning did not prevent the actual commands below from executing.

The official [Node 24 release archive](https://nodejs.org/dist/v24.22.3/node-v24.22.3-linux-x64.tar.xz) was downloaded over HTTPS and its SHA-256 checked against both the latest-v24 discovery manifest and the [versioned official manifest](https://nodejs.org/dist/v24.22.3/SHASUMS256.txt): `4f2b175a6d53a5c617a80dba2676238a0688cef28c6da4eba35c7d844e66fcfb`. Actual execution reported **Linux x64 Node v24.22.3 and npm 11.19.1**.

`npm pack --ignore-scripts` wrote the then-built package to an isolated source `.cache` directory. The tested `worklogiq-stavel-0.1.0.tgz` has SHA-256 `ae03b408248b77e166f9d2445fd79eb9093a28c05bb12adff415baf014ce4e7d`. The Linux runtime and consumer are isolated at `/tmp/stavel-node24-proof.Q7392r`; installation used the local tarball with `--offline --ignore-scripts --omit=dev --no-audit --no-fund` and isolated npm configuration/cache. One package installed. Windows `node_modules` was not reused and no shared source build ran.

The installed package's **CJS and ESM APIs passed** real calls, including all 22 artifact definitions and backend selection. **Fourteen real CLI subprocesses** exercised general help; expected bare-init input-required/exit 2; aligned preview/dry-run with an empty target preserved; apply with the AI-authored-change warning; contextual configuration/help; pointer-work reading; packaged check; doctor with explicit semantic-review limits; skill export; and relocated help/check/contextual help. All other subprocesses exited 0. A real Linux directory symlink was refused while outside marker bytes remained unchanged.

Raw records are retained under `.cache/node24-proof-bf2402ca1c5044b9b8fd3479ea9173db`, including `linux-summary.json`, `linux-steps.json`, `linux-npm-install.txt` and each command's stdout/stderr. This is additional installed-package/relocated-skill smoke evidence, separate from the 43 Windows steps and native sessions. The full Linux source suite, every supported runtime, and any prototype migration added after this package was built were **not exercised**. No Docker daemon, desktop, container, apt/global installation, upload or publication was used for this proof.

## Final cross-consumer extension parity trial

After the coordinator's successful build containing the common definition-union fix, a fresh isolated Windows fixture at `C:/Users/steve/AppData/Local/Temp/stavel-extension-parity-9bny8E/project` started with pinned `.stavel-config` policy and two explicit standing amendments: replace `section.product-overview.purpose-and-outcomes` guidance, and replace the `project.owner` adoption-question prompt. This trial used actual CLI subprocesses, not a prompt callback stub.

**Fourteen CLI steps passed their declared outcomes.** Inspection, questions, configuration explanation and contextual help all accepted both amendments. The owner question appeared exactly once with the custom prompt; artifact fact questions did not become adoption questions. Before adoption, check/doctor correctly exited 1 for missing framework setup rather than failing to resolve a valid extension. All initial target hashes remained unchanged through these reads and guided preview/dry-run.

Guided init used complete synthetic answers and explicit `migrate` mode to update the existing fixture policy; no taxonomy paths were renamed. The applied draft product overview contained the selected custom section and actual facts. Check then exited 0; doctor reported mechanical success while keeping semantic review-required. After appending local prose to the overview, repeated setup preview preserved its exact bytes and proposed no overview replacement. Answered questions reported no unresolved required choices, and final inspection succeeded.

Raw stdout/stderr for all 14 steps are retained in the fixture's sibling `evidence` directory; `.cache/artifact/extension-parity-location.json` records the actual paths and observations. These are additional bounded extension cases, separate from the earlier 43 Windows workflow steps, native sessions and Linux package smoke. They do not establish every possible amendment combination or agent interpretation.

## Final built-candidate Linux replay

After the common-definition-union build and Windows parity proof, the worker packed the then-current built source again without invoking build/prepack scripts. This later tested candidate's SHA-256 is **`5699426cb2496c442a25d92b6bc6abf0d1889542a5c21edc3dd04eff29b1ea3d`**; the earlier `ae03...` hash above identifies its historical candidate only.

The earlier WSL runtime path was unavailable when reuse was attempted, so the same previously verified official archive was extracted into new task-local `/tmp/stavel-node24-final.80DrgT`. The latest candidate again installed offline into its own consumer and passed the same CJS/ESM API checks, **14 CLI subprocess outcomes**, relocated skill flows and real Linux symlink-preservation refusal on Node v24.22.3. The packed help now lists the supported packet migration command. This checks its availability record, not the migration mechanism itself on Linux.

Actual candidate records are in `.cache/node24-proof-bf2402ca1c5044b9b8fd3479ea9173db/final-candidate`, including `npm-pack.json`, `linux-summary.json`, `linux-steps.json` and individual outputs. These additional 14 Linux invocations are separate from the earlier Linux 14, Windows 43 workflow steps and Windows 14 extension steps. No full Linux source suite, complete CI matrix or all migration scenarios are claimed.

## Next action

The archive and relocated replay is complete. The coordination owner must reconcile full-suite/source adoption evidence and any remaining fresh-agent scenarios, including broader ambiguity, VIBE handoff and multi-owner work. Source-level artifact/help cases and structural checks remain separate evidence from this observed trial. No running terminal/helper process remains from this worker.
