# `@starknet-start/react`

Starknet Start is a collection of React hooks for Starknet.

## Installation

```
npm install @starknet-start/react
# or
yarn add @starknet-start/react
```

## Documentation

Documentation is available in the [Starknet Start repository](https://github.com/starknet-innovation/starknet-start#readme).

## Development

Start by installing `pnpm`, then run the following command from the root of the project:

```
pnpm install
```

Running tests requires to have `starknet-devnet` running locally.
The easiest way is to use docker with:

```
docker run --rm -p 5050:5050 shardlabs/starknet-devnet-rs:0.7.0-seed0
```

After that, you can run tests with `pnpm test`.
