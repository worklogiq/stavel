# Experimental and algorithmic development

<!-- mdcomposer:meta
title: "Experimental and algorithmic development"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

Use this route when the required mechanism or claimed advantage is uncertain. Keep two questions separate: did we faithfully implement the mechanism, and does the mechanism achieve the claimed result?

1. State the hypothesis, required mechanism, inputs, expected observations, and falsification criteria in an [experiment note](../templates/execution/experiment.template.md).
2. Establish an independent reference when possible: a hand-worked example, spreadsheet, existing implementation, formal derivation, or fixed dataset. Reference cases must not be invented after seeing the candidate's answers.
3. Record baselines and the complete cost model relevant to the claim. For storage, for example, include required dictionaries, metadata, indexes, and decoder state rather than just one output buffer.
4. Specify data separation, repetitions, environment, stop conditions, and metrics as the experiment requires. Keep the scope bounded and preserve failed or negative results.
5. Run the experiment within the authorized environment. Report observations separately from interpretation. A limited test cannot establish an unrestricted mathematical claim.
6. Propose acceptance, revision, or rejection. Update the accepted design only after an actual decision; experiments do not silently change production requirements.

If a conventional alternative performs better, report it. Do not substitute it when testing the unconventional mechanism itself is the task. If implementation cannot follow the specification, identify the exact missing step or contradiction.
