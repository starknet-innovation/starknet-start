# `@starknet-start/react`

Starknet React is a collection of React hooks for Starknet.

## Installation

```
npm install @starknet-start/react
# or
yarn add @starknet-start/react
```

## Documentation

Documentation [is available online](https://start.starknet-react.com/docs/getting-started).

## Development

Start by installing `pnpm`, then run the following command from the root of the project:

```
pnpm install
```

Running tests requires to have `starknet-devnet` running locally.
The easiest way is to use docker with:

```
docker run --rm -p 5050:5050 shardlabs/starknet-devnet:latest
```

After that, you can run tests with `pnpm test`.
