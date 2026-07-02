# `@starknetfoundation/starknet-start-react`

Starknet Start is a collection of React hooks for Starknet.

## Installation

```
npm install @starknetfoundation/starknet-start-react starknet @starknet-io/get-starknet-core @starknet-io/get-starknet-modal @starknet-io/get-starknet-wallet-standard
# or
yarn add @starknetfoundation/starknet-start-react starknet @starknet-io/get-starknet-core @starknet-io/get-starknet-modal @starknet-io/get-starknet-wallet-standard
```

## Documentation

Documentation is available at [Starknet Start Docs](https://starknet-innovation.github.io/starknet-start/).

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
