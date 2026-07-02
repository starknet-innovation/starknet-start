import { devnet } from "@starknetfoundation/starknet-start-chains";
import { useQuery } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { renderHook, waitFor } from "../../test/react";
import { useInvalidateOnBlock } from "./use-invalidate-on-block";

async function createBlock() {
  await fetch(devnet.rpcUrls.public.http[0], {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "devnet_createBlock" }),
  });
}

describe("useInvalidateOnBlock", () => {
  it("refetches the query when a new block is produced", async () => {
    let fetchCount = 0;

    const { result } = renderHook(() => {
      const query = useQuery({
        queryKey: ["invalidate-on-block-test"],
        queryFn: async () => {
          fetchCount += 1;
          return fetchCount;
        },
      });
      useInvalidateOnBlock({
        queryKey: ["invalidate-on-block-test"],
        refetchInterval: 200,
      });
      return query;
    });

    await waitFor(() => {
      expect(result.current.data).toBe(1);
    });

    await createBlock();

    // Without block-number polling this never fires: the block number was
    // fetched once and the query stayed on its first value.
    await waitFor(
      () => {
        expect(result.current.data).toBeGreaterThan(1);
      },
      { timeout: 10_000 },
    );
  });
});
