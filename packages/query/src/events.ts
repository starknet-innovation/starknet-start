import type { EVENTS_CHUNK } from "@starknet-io/types-js";
import type { Address, Chain } from "@starknetfoundation/starknet-start-chains";

import { type BlockIdentifier as BlockIdentifier_, BlockTag, hash, num, type RpcProvider } from "starknet";

const DEFAULT_PAGE_SIZE = 5;

type BlockIdentifier = Exclude<BlockIdentifier_, bigint>;

export type EventsQueryKeyParams = {
  chain?: Chain;
  address?: Address;
  eventName?: string;
  fromBlock?: BlockIdentifier;
  toBlock?: BlockIdentifier;
  pageSize?: number;
};

export type EventsQueryFnParams = {
  provider: RpcProvider;
} & Omit<EventsQueryKeyParams, "chain">;

export function eventsQueryKey({ chain, address, eventName, fromBlock, toBlock, pageSize }: EventsQueryKeyParams) {
  return [
    {
      entity: "events" as const,
      chainId: chain?.name,
      address,
      eventName,
      fromBlock,
      toBlock,
      pageSize,
    },
  ] as const;
}

export function eventsQueryFn({ provider, address, eventName, fromBlock, toBlock, pageSize }: EventsQueryFnParams) {
  const keyFilter = eventName ? [num.toHex(hash.starknetKeccak(eventName))] : [];
  const keys = [keyFilter];

  const fromBlockId = fromBlock ? blockIdentifierToBlockId(fromBlock) : undefined;

  const toBlockId = toBlock ? blockIdentifierToBlockId(toBlock) : undefined;
  const chunkSize = pageSize ? pageSize : DEFAULT_PAGE_SIZE;

  return async ({ pageParam }: { pageParam?: string }): Promise<EVENTS_CHUNK> => {
    const res = await provider.getEvents({
      from_block: fromBlockId,
      to_block: toBlockId,
      address,
      keys,
      chunk_size: chunkSize,
      continuation_token: pageParam === "0" ? undefined : pageParam,
    });
    // starknet.js types getEvents against the RPC spec version of its channel,
    // which may lag the pinned @starknet-io/types-js; the wire shape is the same.
    return res as EVENTS_CHUNK;
  };
}

function blockIdentifierToBlockId(blockIdentifier: BlockIdentifier) {
  if (blockIdentifier === null) {
    return BlockTag.PRE_CONFIRMED;
  }

  if (typeof blockIdentifier === "number") {
    return { block_number: blockIdentifier };
  }

  if (typeof blockIdentifier === "string") {
    // "pending" was the pre-RPC-0.9 name for what is now "pre_confirmed".
    if (blockIdentifier === "pending") {
      return BlockTag.PRE_CONFIRMED;
    }

    if (
      blockIdentifier === BlockTag.LATEST ||
      blockIdentifier === BlockTag.PRE_CONFIRMED ||
      blockIdentifier === BlockTag.L1_ACCEPTED
    ) {
      return blockIdentifier;
    }

    return { block_hash: blockIdentifier };
  }

  throw new Error(`Unsupported BlockIdentifier type: ${typeof blockIdentifier}`);
}
