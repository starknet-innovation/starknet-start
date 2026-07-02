import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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

  const [prevBlockNumber, setPrevBlockNumber] = useState<number | undefined>();

  // Without polling, the block number is only refetched on window refocus and
  // watched queries never invalidate.
  const { data: blockNumber } = useBlockNumber({
    enabled,
    refetchInterval: enabled ? refetchInterval : undefined,
  });

  useEffect(() => {
    if (!prevBlockNumber) {
      return setPrevBlockNumber(blockNumber);
    }

    if (blockNumber !== prevBlockNumber) {
      queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false });
      return setPrevBlockNumber(blockNumber);
    }
  }, [blockNumber, prevBlockNumber, queryKey, queryClient]);
}
