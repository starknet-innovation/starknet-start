import type { PaymasterFeeEstimate } from "starknet";

import {
  type PaymasterEstimateFeesArgs,
  paymasterEstimateFeesQueryFn,
  paymasterEstimateFeesQueryKey,
} from "@starknetfoundation/starknet-start-query";
import { useMemo } from "react";

import { useStarknetAccount } from "../context/account";
import { useStarknet } from "../context/starknet";
import { type UseQueryProps, type UseQueryResult, useQuery } from "../query";
import { useInvalidateOnBlock } from "./use-invalidate-on-block";
import { useProvider } from "./use-provider";

/** Options for `useEstimateFees`. */
export type UsePaymasterEstimateFeesProps = PaymasterEstimateFeesArgs &
  UseQueryProps<PaymasterFeeEstimate, Error, PaymasterFeeEstimate, ReturnType<typeof paymasterEstimateFeesQueryKey>> & {
    /** Refresh data at every block. */
    watch?: boolean;
  };

/** Value returned from `useEstimateFees`. */
export type UsePaymasterEstimateFeesResult = UseQueryResult<PaymasterFeeEstimate, Error>;

/**
 * Hook to estimate fees for smart contract calls.
 *
 * @remarks
 *
 * The hook only performs estimation if the `calls` is not undefined.
 */
export function usePaymasterEstimateFees({
  calls,
  options,
  watch = false,
  enabled: enabled_ = true,
  refetchInterval: refetchInterval_,
  ...props
}: UsePaymasterEstimateFeesProps): UsePaymasterEstimateFeesResult {
  const { account } = useStarknetAccount();
  const { chain } = useStarknet();
  const { paymasterProvider } = useProvider();

  const queryKey_ = useMemo(
    () => paymasterEstimateFeesQueryKey({ chain, address: account?.address, calls, options }),
    [chain, account?.address, calls, options],
  );

  // Without a configured paymaster the account falls back to starknet.js's
  // default (sepolia) endpoint, so refuse to run rather than query the wrong
  // network.
  const enabled = useMemo(
    () => Boolean(enabled_ && calls && options && paymasterProvider),
    [enabled_, calls, options, paymasterProvider],
  );

  useInvalidateOnBlock({
    enabled: Boolean(enabled && watch),
    queryKey: queryKey_,
    refetchInterval: typeof refetchInterval_ === "number" ? refetchInterval_ : undefined,
  });

  return useQuery({
    queryKey: queryKey_,
    queryFn: paymasterEstimateFeesQueryFn({
      account,
      calls,
      options,
    }),
    enabled,
    refetchInterval: watch ? undefined : refetchInterval_,
    ...props,
  });
}
