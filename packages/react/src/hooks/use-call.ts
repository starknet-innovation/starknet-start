import type { Address } from "@starknetfoundation/starknet-start-chains";

import { type CallQueryArgs, callQueryFn, callQueryKey } from "@starknetfoundation/starknet-start-query";
import { useMemo } from "react";
import { type Abi, BlockTag, type CallResult, type Contract } from "starknet";

import { type UseQueryProps, type UseQueryResult, useQuery } from "../query";
import { useContract } from "./use-contract";
import { useInvalidateOnBlock } from "./use-invalidate-on-block";
import { useNetwork } from "./use-network";

export type CallQueryKey = typeof callQueryKey;

/** Options for `useCall`. */
export type UseCallProps = CallQueryArgs &
  UseQueryProps<CallResult, Error, CallResult, ReturnType<CallQueryKey>> & {
    /** The target contract's ABI. */
    abi?: Abi;
    /** The target contract's address. */
    address?: Address;
    /** Refresh data at every block. */
    watch?: boolean;
  };

/** Value returned from `useCall`. */
export type UseCallResult = UseQueryResult<CallResult, Error>;

/**
 * Hook to perform a read-only contract call.
 *
 * @remarks
 *
 * The hook only performs a call if the target `abi`, `address`,
 * `functionName`, and `args` are not undefined.
 *
 */
export function useCall({
  abi,
  address,
  functionName,
  args,
  blockIdentifier = BlockTag.LATEST,
  refetchInterval: refetchInterval_,
  watch = false,
  enabled: enabled_ = true,
  parseArgs,
  parseResult,
  ...props
}: UseCallProps): UseCallResult {
  const { chain } = useNetwork();
  const { contract } = useContract({ abi, address });

  const queryKey_ = useMemo(
    () =>
      callQueryKey({
        chain,
        contract: contract as Contract,
        functionName,
        args,
        blockIdentifier,
      }),
    [chain, contract, functionName, args, blockIdentifier],
  );

  const enabled = useMemo(
    () => Boolean(enabled_ && contract && functionName && args),
    [enabled_, contract, functionName, args],
  );

  // When watching, refresh is driven by block invalidation alone; giving the
  // query its own interval on top would fetch the same data twice per cycle.
  useInvalidateOnBlock({
    enabled: Boolean(enabled && watch),
    queryKey: queryKey_,
    refetchInterval: typeof refetchInterval_ === "number" ? refetchInterval_ : undefined,
  });

  return useQuery({
    queryKey: queryKey_,
    queryFn: callQueryFn({
      contract: contract as Contract,
      functionName,
      args,
      blockIdentifier,
      parseArgs,
      parseResult,
    }),
    refetchInterval: watch ? undefined : refetchInterval_,
    enabled,
    ...props,
  });
}
