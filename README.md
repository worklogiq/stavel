# Stavel

A reusable development framework from MenuLogiq: preserve accepted intent, work in reviewable slices, and require evidence before calling work complete.

## What is this?

Stavel provides portable philosophies, a MenuLogiq-derived default documentation taxonomy, configurable Markdown and optional JavaScript/TypeScript checks, a Node CLI, and a self-contained agent skill. The [framework index](docs/internal/index.md) routes daily work; the [documentation taxonomy](docs/internal/process/documentation-taxonomy.policy.md) defines the defaults. Written instructions and structural checks do not guarantee agent compliance or application correctness.

Bootstrap starts a new project. Adoption retains an existing project's accepted conventions. Migration converts conventions through a concrete aligned plan. The agent discovers context and asks questions; deterministic tools handle inspection, planning, preservation and validation.

## How to run locally

Use a supported Node LTS release. From this checkout:

Before the first npm release, the lockfile uses a [versioned mdcomposer package snapshot](docs/internal/platform/tooling-and-packaging/stavel/dependency-snapshots.contract.md) included in this repository. No sibling checkout or npm authentication is needed.

~~~sh
npm ci
npm run build
npm test
npm run check
node dist/stavel.cli.cjs --help
~~~

The framework's Markdown needs no runtime. The executable skill uses Node; installing documentation does not launch the application, provision services, install target dependencies, or change application-internal workers.

Inspect before generating files:

~~~sh
node dist/stavel.cli.cjs inspect --target /path/to/project --track existing
node dist/stavel.cli.cjs questions --target /path/to/project --track existing
~~~

The agent uses native Q&A when available or grouped numbered questions otherwise. It gathers all applicable answers and aligns the complete configuration before creating target files. [Bootstrap](docs/internal/dev/bootstrap.guide.md), [adoption](docs/internal/dev/framework-adoption.guide.md) and [migration](docs/internal/dev/repository-migration.guide.md) explain each route.

## Agent skill

~~~sh
node dist/stavel.cli.cjs export-skill --output /path/to/skills/stavel --dry-run
node dist/stavel.cli.cjs export-skill --output /path/to/skills/stavel
~~~

The export includes the canonical portable assets and runnable tools, preserving source version and license. This package's filled profile, requirements, design and historical records are excluded. Place the exported folder in the host's supported skill location. See [installation](docs/public/skill-installation.guide.md).

## Canonical documentation

- [Development framework](docs/internal/index.md), [constitution](docs/internal/process/development-constitution.policy.md), and [local profile](docs/internal/dev/project-profile.overview.md).
- [CLI contract](docs/public/framework-cli.contract.md), [configuration](docs/internal/dev/configuration.contract.md), and [questions](docs/internal/dev/agent-questions.guide.md).
- [Package requirements](docs/internal/platform/tooling-and-packaging/stavel/framework.requirements.md) and [design](docs/internal/platform/tooling-and-packaging/stavel/framework.design.md).
- [Origins](docs/internal/dev/framework-origins.overview.md), [philosophy extraction](docs/internal/dev/philosophy-extraction.overview.md), and [contribution profiles](docs/internal/dev/contribution-profiles.guide.md).
- [Illustrative examples](examples/README.md); they are not claims about application results.

Version [0.1.0](VERSION) uses default profile version 1. Licensed under [MIT](LICENSE). Publishing a repository/package, merging and deploying are separate actions governed by actual user authorization.

## Historical context (archived)

The [initial verification record](docs/internal/_archive/delivery/initial-verification.overview.md) preserves the predecessor's Python tooling evidence and its limits. Current implementation evidence belongs in the active package execution record.
