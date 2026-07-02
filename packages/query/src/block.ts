import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { BlockNumber, GetBlockResponse, ProviderInterface } from "starknet";

export type BlockQueryKeyParams = {
  chain?: Chain;
  blockIdentifier: BlockNumber;
};

export type BlockQueryFnParams = {
  provider: ProviderInterface;
  blockIdentifier: BlockNumber;
};

export function blockQueryKey({ chain, blockIdentifier }: BlockQueryKeyParams) {
  return [{ entity: "block" as const, chainId: chain?.name, blockIdentifier }] as const;
}

export function blockQueryFn({ provider, blockIdentifier }: BlockQueryFnParams) {
  return async (): Promise<GetBlockResponse> => await provider.getBlock(blockIdentifier);
}
