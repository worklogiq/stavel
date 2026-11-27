# Prepublication package snapshot

The user deferred npm publication and its CI/CD publishing pipeline. This archive makes source-checkout builds reproducible until that release work is completed.

| Artifact | Package | Source revision | SHA-256 |
| --- | --- | --- | --- |
| worklogiq-mdcomposer-0.1.0-d5bd0b7.tgz | @worklogiq/mdcomposer 0.1.0 | [d5bd0b7b73a4ed14793cda379eb28228082787ab](https://github.com/worklogiq/mdcomposer/commit/d5bd0b7b73a4ed14793cda379eb28228082787ab) | 6ea7d0aabaa953036b720cd350a0b4190152755f7d0ca4a6d793c321f8376415 |

Generated with npm pack from validated mdcomposer source. MIT and third-party notices are included inside the package. package-lock.json also verifies the archive's SHA-512 integrity during npm ci. The framework bundles its runtime closure; this snapshot is a development dependency and is excluded from its published artifact.

See the [snapshot contract](../../docs/internal/product/contracts/distribution/dependency-snapshots.contract.md) for refresh and removal instructions. Remove this archive after switching to the exact published registry version and validating a fresh install.
