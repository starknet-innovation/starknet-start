import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { AccountInterface, Call, EstimateFeeResponseOverhead, UniversalDetails } from "starknet";

export type EstimateFeesArgs = {
  calls?: Call[];
  options?: UniversalDetails;
};

export type EstimateFeesQueryKeyParams = EstimateFeesArgs & {
  chain?: Chain;
  address?: string;
};

export type EstimateFeesQueryFnParams = {
  account?: AccountInterface;
} & EstimateFeesArgs;

export function estimateFeesQueryKey({ chain, address, calls, options }: EstimateFeesQueryKeyParams) {
  return [
    {
      entity: "estimateInvokeFee" as const,
      chainId: chain?.name,
      address,
      calls,
      options,
    },
  ] as const;
}

export function estimateFeesQueryFn({ account, calls, options }: EstimateFeesQueryFnParams) {
  return async (): Promise<EstimateFeeResponseOverhead> => {
    if (!account) throw new Error("account is required");
    if (!calls || calls.length === 0) throw new Error("calls are required");
    return await account.estimateInvokeFee(calls, options);
  };
}
