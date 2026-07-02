import type { Address, Chain } from "@starknetfoundation/starknet-start-chains";
import type { BlockNumber, Nonce, ProviderInterface } from "starknet";

export type NonceForAddressQueryKeyParams = {
  chain?: Chain;
  address?: Address;
  blockIdentifier?: BlockNumber;
};

export type NonceForAddressQueryFnParams = {
  provider: ProviderInterface;
} & Omit<NonceForAddressQueryKeyParams, "chain">;

export function nonceForAddressQueryKey({ chain, address, blockIdentifier }: NonceForAddressQueryKeyParams) {
  return [{ entity: "nonce" as const, chainId: chain?.id.toString(), blockIdentifier, address }] as const;
}

export function nonceForAddressQueryFn({ provider, blockIdentifier, address }: NonceForAddressQueryFnParams) {
  return async (): Promise<Nonce> => {
    if (!address) {
      throw new Error("Address cannot be empty to get the nonce");
    }
    const nonce = await provider.getNonceForAddress(address, blockIdentifier);
    return nonce;
  };
}
