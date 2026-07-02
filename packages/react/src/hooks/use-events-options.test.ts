import { describe, expect, it } from "vitest";

import { renderHook } from "../../test/react";
import { useEvents } from "./use-events";

describe("useEvents options", () => {
  it("respects enabled: false", async () => {
    const { result } = renderHook(() =>
      useEvents({
        eventName: "Transfer",
        pageSize: 1,
        enabled: false,
      }),
    );

    // A disabled query must not fetch.
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
