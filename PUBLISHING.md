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
  `pnpm beachball publish --access public --no-git-tags -y`.
- GitHub Releases are created after publishing for each public package whose
  version changed. Release tags use the `name@version` format.

If the workflow file name, repository, or GitHub environment changes, every npm
trusted publishing relationship must be updated to match.

## Release GitHub App

The release workflow publishes packages and then lets Beachball push the
generated version and changelog commit back to `main`. The default
`GITHUB_TOKEN` cannot bypass the `main` branch rules, so releases authenticate as
a dedicated GitHub App installation.

Create an organization-owned GitHub App for releases and install it only on this
repository. The app needs these repository permissions:

- Metadata: read
- Contents: read and write

Store the app credentials on the `Release` environment:

- Variable `RELEASE_APP_CLIENT_ID`: the app client ID.
- Secret `RELEASE_APP_PRIVATE_KEY`: the app private key PEM.

Configure `main` branch protection through a repository ruleset so the release
app can bypass every branch rule that blocks its generated commit:

- Target: the default branch.
- Bypass actor: the release GitHub App, with bypass mode `always`.
- Rules equivalent to the project policy: require pull requests, require the
  `test` status check, require linear history, block deletions, block
  non-fast-forward pushes, and require conversation resolution.

Classic branch protection can allow an app to bypass pull-request requirements,
but it does not provide an app bypass for required status checks. Keep the
classic rule disabled for `main` once the equivalent ruleset is active, otherwise
the direct release commit can still be rejected.

## Package policy

| Package                                                | Workspace path               | npm policy                                                                                                                                                                                                             |
| ------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@starknetfoundation/starknet-start-react`             | `packages/react`             | Public npm package.                                                                                                                                                                                                    |
| `@starknetfoundation/starknet-start-query`             | `packages/query`             | Public npm package.                                                                                                                                                                                                    |
| `@starknetfoundation/starknet-start-providers`         | `packages/providers`         | Public npm package.                                                                                                                                                                                                    |
| `@starknetfoundation/starknet-start-chains`            | `packages/chains`            | Public npm package.                                                                                                                                                                                                    |
| `@starknetfoundation/starknet-start-explorers`         | `packages/explorers`         | Public npm package.                                                                                                                                                                                                    |
| `@starknetfoundation/starknet-start-create-starknet`   | `packages/create-starknet`   | Public npm package.                                                                                                                                                                                                    |
| `@starknetfoundation/starknet-start-vue`               | `packages/vue`               | Not part of the public release set until maintainers intentionally approve and publish it. Do not configure trusted publishing for it while public npm metadata returns 404 or while it stays outside the release set. |
| `@starknetfoundation/starknet-start-typescript-config` | `packages/typescript-config` | Workspace-only package. Do not publish.                                                                                                                                                                                |
| `@starknetfoundation/starknet-start-docs`              | `docs`                       | Workspace-only package. Do not publish.                                                                                                                                                                                |

New public packages must be approved by maintainers before they are added to the
release set. Trusted publishing can be configured only after the npm package
already exists.

## Maintainer access

Release maintainers must have npm write access to every package in the public
release set before running or approving a release. The intended ownership model
is shared npm organization or team access, not a single personal account.

At least two project maintainers should have read-write npm access for every
`@starknetfoundation/starknet-start-*` package listed as public above.

Accounts used for npm ownership and trusted publishing setup must have 2FA
enabled. If a maintainer is removed from the project, remove their npm package
or team access at the same time.

Current npm state checked on 2026-07-02:

- Verify npm owner and access metadata for the current
  `@starknetfoundation/starknet-start-*` package names before approving the first
  automated release under this scope.
- `@starknetfoundation/starknet-start-vue` is not part of the public release set
  while npm metadata returns 404 and maintainers have not approved it for release.

Useful checks:

```sh
npm whoami
npm --version
npm access list packages @starknetfoundation --json
npm owner ls @starknetfoundation/starknet-start-react
npm owner ls @starknetfoundation/starknet-start-create-starknet
```

## Trusted publishing setup

Use npm CLI `>=11.15.0` and an authenticated npm account with package write
access. Run these commands once for each existing public package:

```sh
npm trust github @starknetfoundation/starknet-start-react --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknetfoundation/starknet-start-query --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknetfoundation/starknet-start-providers --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknetfoundation/starknet-start-chains --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknetfoundation/starknet-start-explorers --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
npm trust github @starknetfoundation/starknet-start-create-starknet --repo starknet-innovation/starknet-start --file release.yml --env Release --allow-publish
```

Do not configure `@starknetfoundation/starknet-start-vue` until it is
intentionally public and exists on npm. After setup, verify each relationship:

```sh
npm trust list @starknetfoundation/starknet-start-react
npm trust list @starknetfoundation/starknet-start-query
npm trust list @starknetfoundation/starknet-start-providers
npm trust list @starknetfoundation/starknet-start-chains
npm trust list @starknetfoundation/starknet-start-explorers
npm trust list @starknetfoundation/starknet-start-create-starknet
```
