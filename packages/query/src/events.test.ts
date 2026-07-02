import { BlockTag } from "starknet";
import { describe, expect, it, vi } from "vitest";

import { eventsQueryFn } from "./events";

describe("eventsQueryFn", () => {
  it("preserves block zero filters", async () => {
    const getEvents = vi.fn().mockResolvedValue({ events: [] });
    const queryFn = eventsQueryFn({
      provider: { getEvents } as never,
      fromBlock: 0,
      toBlock: 0,
    });

    await queryFn({ pageParam: "0" });

    expect(getEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        from_block: { block_number: 0 },
        to_block: { block_number: 0 },
      }),
    );
  });

  it("maps pending filters to pre-confirmed", async () => {
    const getEvents = vi.fn().mockResolvedValue({ events: [] });
    const queryFn = eventsQueryFn({
      provider: { getEvents } as never,
      fromBlock: "pending",
      toBlock: "pending",
    });

    await queryFn({ pageParam: "0" });

    expect(getEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        from_block: BlockTag.PRE_CONFIRMED,
        to_block: BlockTag.PRE_CONFIRMED,
      }),
    );
  });
});
