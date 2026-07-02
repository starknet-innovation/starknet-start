# Agent Guide

Scope: this file applies to the entire repository.

## Project Map

This is a pnpm/Turbo monorepo for Starknet Start. Use pnpm only; do not introduce npm, Yarn, or generated lockfiles from other package managers.

- `packages/chains`: Starknet chain definitions, including mainnet, sepolia, devnet, and Slot helpers.
- `packages/explorers`: explorer URL helpers for supported Starknet explorers.
- `packages/providers`: JSON-RPC and paymaster provider factories.
- `packages/query`: framework-agnostic query functions, query keys, and wallet request helpers.
- `packages/react`: React context, connectors, and hooks built on the query package.
- `packages/vue`: Vue context and hooks built on the same lower-level packages.
- `packages/create-starknet`: CLI and application templates.
- `packages/typescript-config`: shared TypeScript config presets.
- `docs`: Vocs documentation site and demos. Demo components live in `docs/components/demo`.

## Toolchain

- Use Node 24 when matching CI. The root `package.json` allows Node `>=22`.
- Use pnpm 10. The pinned package manager is `pnpm@10.24.0`.
- Install dependencies with `pnpm install --strict-peer-dependencies=false`; add `--frozen-lockfile` when reproducing CI exactly.
- The repo uses `oxlint` for linting, `oxfmt` for formatting, `vitest` for tests, `tsdown` or `tsup` for package builds, and Vocs for docs.

## Common Commands

- `pnpm format:check`: check formatting.
- `pnpm format`: format the repository.
- `pnpm lint`: run oxlint.
- `pnpm lint:fix`: run oxlint fixes.
- `pnpm build`: build all packages through Turbo.
- `pnpm typecheck`: run TypeScript checks.
- `pnpm test:ci`: run the CI test suite through Turbo.
- `pnpm beachball check`: verify required change files.
- `pnpm dev`: run persistent development tasks, including docs.

For focused work that needs dependency builds, prefer Turbo filters so the `^build` task dependency in `turbo.json` still applies:

- `pnpm turbo run test:ci --filter=@starknetfoundation/starknet-start-react`
- `pnpm turbo run typecheck --filter=@starknetfoundation/starknet-start-query`

For docs and package scripts that do not rely on Turbo task dependencies, pnpm filters are fine:

- `pnpm --filter @starknetfoundation/starknet-start-docs dev`
- `pnpm --filter @starknetfoundation/starknet-start-docs... build`

## Testing Notes

Several tests expect a seeded Starknet devnet on port 5050. Start it before running broad tests or any test that imports `packages/react/test/devnet.ts`:

```sh
docker run --rm -p 5050:5050 shardlabs/starknet-devnet-rs:0.7.0-seed0
```

If tests fail with connection errors to `localhost:5050`, confirm devnet is running before changing code. The React package intentionally disables Vitest file parallelism through its package scripts; do not bypass those scripts unless you are isolating a single test while debugging.

## Change Management

- Keep changes scoped to the package or docs area requested by the task.
- Do not edit generated `dist` output or package changelogs by hand.
- Public package changes usually need a Beachball change file under `change/`. Match the existing JSON shape and use one file per affected published package.
- Docs-only changes are ignored by Beachball and do not need a change file.
- If a public API changes, update the relevant package README and docs page in the same change.
- Preserve fork attribution in `LICENSE` and `NOTICE.md`.

## Coding Conventions

- Keep TypeScript ESM style consistent with nearby files.
- Prefer existing helpers from lower-level packages instead of duplicating provider, chain, or query-key logic in framework packages.
- React and Vue packages should wrap shared behavior from `packages/query`, `packages/providers`, and `packages/chains` rather than reimplement it.
- Add or update focused Vitest coverage near the changed code. Use existing test fixtures and mock connectors where possible.
- Keep docs examples synchronized with exported package APIs and template code.

## Before Handoff

Run the narrowest meaningful validation first, then broaden as risk increases. For code changes, the CI-equivalent sequence is:

```sh
pnpm format:check
pnpm lint
pnpm build
pnpm typecheck
pnpm test:ci
pnpm beachball check
```

Mention any command you could not run and why, especially when devnet or Docker is unavailable.
