# Install the Stavel skill

<!-- mdcomposer:meta
title: "Install the Stavel skill"
kind: "guide"
state: "accepted"
audience: "public"
owner: "repository-maintainer"
updated: "2026-11-25"
acceptance: "user:2026-11-25:framework-v02-implementation"
-->

The agent skill routes bootstrap, adoption, migration, scoped implementation and evidence review. It reads the adopted project's instructions and canonical owners first. It neither grants authorization nor replaces accepted repository policy.

From a built checkout:

~~~sh
node dist/stavel.cli.cjs export-skill --output /path/to/skills/stavel --dry-run
node dist/stavel.cli.cjs export-skill --output /path/to/skills/stavel
~~~

Place the complete exported folder in the host's supported skill directory. The source SKILL.md is an export input; copying it alone does not supply the runnable tools or references. The export includes canonical portable documents, questions/defaults, profile examples and tools, without another checkout or an implicit network installation.

Use the packaged script through node scripts/stavel.cli.cjs. Installing a skill and adopting its framework into a project are separate choices. The framework asks applicable naming, taxonomy, tooling and project questions through native Q&A when available or grouped conversation otherwise. It gathers all answers and obtains alignment before generating target files.

Example requests:

- Use $stavel to adopt this workflow while preserving our existing instruction files and document owners.
- Use $stavel to migrate this repository to the presented default taxonomy after resolving the project decisions.
- Use $stavel to review this implementation against its required mechanism and actual evidence.

The skill loads references progressively. Ordinary coding does not require installation, and adopting documents does not reconfigure internal application workers. See the [CLI contract](framework-cli.contract.md). Validate actual exported behavior after relocation; frontmatter or structural validation alone does not establish behavioral effectiveness.
