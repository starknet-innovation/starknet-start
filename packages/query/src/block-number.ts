import type { Chain } from "@starknetfoundation/starknet-start-chains";

import { type BlockNumber, BlockStatus, type GetBlockResponse, type ProviderInterface } from "starknet";

export type BlockNumberQueryKeyParams = {
  chain?: Chain;
  blockIdentifier: BlockNumber;
};

export type BlockNumberQueryFnParams = {
  provider: ProviderInterface;
  blockIdentifier: BlockNumber;
};

export function blockNumberQueryKey({ chain, blockIdentifier }: BlockNumberQueryKeyParams) {
  return [{ entity: "blockNumber" as const, chainId: chain?.name, blockIdentifier }] as const;
}

export function blockNumberQueryFn({ provider, blockIdentifier }: BlockNumberQueryFnParams) {
  return async (): Promise<number | undefined> => {
    const block = (await provider.getBlock(blockIdentifier)) as GetBlockResponse;
    if (block.status !== BlockStatus.PRE_CONFIRMED) {
      return block.block_number;
    }
    return undefined;
  };
}
