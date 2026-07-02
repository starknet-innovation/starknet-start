# Publishing Policy

This repository publishes npm packages only through the manual GitHub Actions
workflow at `.github/workflows/release.yml`.

## Release workflow

The release workflow must keep these properties:

- It runs from the `Release` GitHub environment.
- The release job has `id-token: write` so npm trusted publishing can exchange
  the GitHub OIDC token for publish authority.
- It does not use a long-lived `NPM_TOKEN` secret.
- Package publishing remains bounded to Beachball via
  `pnpm beachball publish --access public -y`.

If the workflow file name, repository, or GitHub environment changes, every npm
trusted publishing relationship must be updated to match.

## Package policy

| Package                             | Workspace path               | npm policy                                                                                                                                                                                          |
| ----------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@starknet-start/react`             | `packages/react`             | Public npm package.                                                                                                                                                                                 |
| `@starknet-start/query`             | `packages/query`             | Public npm package.                                                                                                                                                                                 |
| `@starknet-start/providers`         | `packages/providers`         | Public npm package.                                                                                                                                                                                 |
| `@starknet-start/chains`            | `packages/chains`            | Public npm package.                                                                                                                                                                                 |
| `@starknet-start/explorers`         | `packages/explorers`         | Public npm package.                                                                                                                                                                                 |
| `create-starknet`                   | `packages/create-starknet`   | Public npm package.                                                                                                                                                                                 |
| `@starknet-start/vue`               | `packages/vue`               | Not part of the public release set until maintainers intentionally approve and publish it. Do not configure trusted publishing for it while public npm metadata returns 404 or while it is private. |
| `@starknet-start/typescript-config` | `packages/typescript-config` | Workspace-only private package. Do not publish.                                                                                                                                                     |
| `@starknet-start/docs`              | `docs`                       | Workspace-only private package. Do not publish.                                                                                                                                                     |

New public packages must be approved by maintainers before they are added to the
release set. Trusted publishing can be configured only after the npm package
already exists.

## Maintainer access

Release maintainers must have npm write access to every package in the public
release set before running or approving a release. The intended ownership model
is shared npm organization or team access, not a single personal account.

At least two project maintainers should have read-write npm access for:

- the `@starknet-start` scope packages listed as public above;
- the unscoped `create-starknet` package.

Accounts used for npm ownership and trusted publishing setup must have 2FA
enabled. If a maintainer is removed from the project, remove their npm package
or team access at the same time.

Current npm state checked on 2026-07-02:

- Public owner metadata for the scoped public packages lists `pragmaoracle` and
  `fracek`; the `adrienlacombe-starknet` npm account also had read-write access
  to the five scoped public packages through npm access controls.
- `create-starknet` collaborator metadata lists `fracek` with read-write access.
  Add the shared release maintainer team or the active release maintainers before
  relying on automated releases for this unscoped package.
- `@starknet-start/vue` is not publicly installable. `npm view` returns 404, and
  `npm access get status @starknet-start/vue` reports `private`.

Useful checks:

```sh
npm whoami
npm --version
npm access list packages @starknet-start --json
npm access list collaborators create-starknet --json
npm owner ls @starknet-start/react
npm owner ls create-starknet
```

## Trusted publishing setup

Use npm CLI `>=11.15.0` and an authenticated npm account with package write
access. Run these commands once for each existing public package:

```sh
npm trust github @starknet-start/react --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknet-start/query --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknet-start/providers --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknet-start/chains --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknet-start/explorers --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github create-starknet --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
```

Do not configure `@starknet-start/vue` until it is intentionally public and
exists on npm. After setup, verify each relationship:

```sh
npm trust list @starknet-start/react
npm trust list @starknet-start/query
npm trust list @starknet-start/providers
npm trust list @starknet-start/chains
npm trust list @starknet-start/explorers
npm trust list create-starknet
```
