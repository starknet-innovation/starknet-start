import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useBlockNumber } from "./use-block-number";

const DEFAULT_FETCH_INTERVAL = 5_000;

/**
 * Invalidate the given query on every new block.
 */
export function useInvalidateOnBlock({
  enabled = true,
  queryKey,
  refetchInterval = DEFAULT_FETCH_INTERVAL,
}: {
  enabled?: boolean;
  queryKey: QueryKey;
  refetchInterval?: number;
}) {
  const queryClient = useQueryClient();

  // A ref, not state: the previous block number is never rendered, and state
  // would re-render every consumer of a watched hook once per block.
  const prevBlockNumber = useRef<number | undefined>(undefined);

  // Without polling, the block number is only refetched on window refocus and
  // watched queries never invalidate.
  const { data: blockNumber } = useBlockNumber({
    enabled,
    refetchInterval: enabled ? refetchInterval : undefined,
  });

  useEffect(() => {
    if (blockNumber === undefined) return;

    // Block 0 is a valid block (devnet genesis), so compare against undefined.
    if (prevBlockNumber.current === undefined) {
      prevBlockNumber.current = blockNumber;
      return;
    }

    if (blockNumber !== prevBlockNumber.current) {
      prevBlockNumber.current = blockNumber;
      queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false });
    }
  }, [blockNumber, queryKey, queryClient]);
}
