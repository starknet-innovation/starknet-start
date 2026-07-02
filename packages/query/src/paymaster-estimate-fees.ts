import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { AccountInterface, Call, PaymasterDetails, PaymasterFeeEstimate } from "starknet";

export type PaymasterEstimateFeesArgs = {
  calls?: Call[];
  options?: PaymasterDetails;
};

export type PaymasterEstimateFeesQueryKeyParams = PaymasterEstimateFeesArgs & {
  chain?: Chain;
  address?: string;
};

export type PaymasterEstimateFeesQueryFnParams = {
  account?: AccountInterface;
} & PaymasterEstimateFeesArgs;

export function paymasterEstimateFeesQueryKey({ chain, address, calls, options }: PaymasterEstimateFeesQueryKeyParams) {
  return [
    {
      entity: "estimatePaymasterTransactionFee" as const,
      chainId: chain?.id.toString(),
      address,
      calls,
      options,
    },
  ] as const;
}

export function paymasterEstimateFeesQueryFn({ account, calls, options }: PaymasterEstimateFeesQueryFnParams) {
  return async (): Promise<PaymasterFeeEstimate> => {
    if (!account) throw new Error("account is required");
    if (!calls || calls.length === 0) throw new Error("calls are required");
    if (!options) throw new Error("paymaster options are required");
    return await account.estimatePaymasterTransactionFee(calls, options);
  };
}
