import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { PaymasterInterface, TokenData } from "starknet";

export type PaymasterGasTokensQueryKeyParams = {
  chain?: Chain;
};

export type PaymasterGasTokensQueryFnParams = {
  paymasterProvider?: PaymasterInterface;
};

export function paymasterGasTokensQueryKey({ chain }: PaymasterGasTokensQueryKeyParams = {}) {
  return [
    {
      entity: "paymaster_gasTokens" as const,
      chainId: chain?.id.toString(),
    },
  ] as const;
}

export function paymasterGasTokensQueryFn({ paymasterProvider }: PaymasterGasTokensQueryFnParams) {
  return async (): Promise<TokenData[]> => {
    if (!paymasterProvider) throw new Error("PaymasterProvider is required");
    return await paymasterProvider.getSupportedTokens();
  };
}
