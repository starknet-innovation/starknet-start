import type { EstimateFeeResponseOverhead } from "starknet";

import {
  type EstimateFeesArgs,
  estimateFeesQueryFn,
  estimateFeesQueryKey,
} from "@starknetfoundation/starknet-start-query";
import { useMemo } from "react";

import { useStarknetAccount } from "../context/account";
import { useStarknet } from "../context/starknet";
import { type UseQueryProps, type UseQueryResult, useQuery } from "../query";
import { useInvalidateOnBlock } from "./use-invalidate-on-block";

/** Options for `useEstimateFees`. */
export type UseEstimateFeesProps = EstimateFeesArgs &
  UseQueryProps<
    EstimateFeeResponseOverhead,
    Error,
    EstimateFeeResponseOverhead,
    ReturnType<typeof estimateFeesQueryKey>
  > & {
    /** Refresh data at every block. */
    watch?: boolean;
  };

/** Value returned from `useEstimateFees`. */
export type UseEstimateFeesResult = UseQueryResult<EstimateFeeResponseOverhead, Error>;

/**
 * Hook to estimate fees for smart contract calls.
 *
 * @remarks
 *
 * The hook only performs estimation if the `calls` is not undefined.
 */
export function useEstimateFees({
  calls,
  options,
  watch = false,
  enabled: enabled_ = true,
  refetchInterval: refetchInterval_,
  ...props
}: UseEstimateFeesProps): UseEstimateFeesResult {
  const { account } = useStarknetAccount();
  const { chain } = useStarknet();

  const queryKey_ = useMemo(
    () => estimateFeesQueryKey({ chain, address: account?.address, calls, options }),
    [chain, account?.address, calls, options],
  );

  const enabled = useMemo(() => Boolean(enabled_ && calls), [enabled_, calls]);

  useInvalidateOnBlock({
    enabled: Boolean(enabled && watch),
    queryKey: queryKey_,
    refetchInterval: typeof refetchInterval_ === "number" ? refetchInterval_ : undefined,
  });

  return useQuery({
    queryKey: queryKey_,
    queryFn: estimateFeesQueryFn({
      account,
      calls,
      options,
    }),
    enabled,
    refetchInterval: watch ? undefined : refetchInterval_,
    ...props,
  });
}
