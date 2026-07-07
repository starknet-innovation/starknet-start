import { mainnet } from "@starknetfoundation/starknet-start-chains";
import { describe, expect, it } from "vitest";

import { useConnect } from "../src/hooks/use-connect";
import { defaultConnector } from "./devnet";
import { act, renderHook, waitFor } from "./react";

// `defaultConnector` is a module-level singleton shared by every test. These two
// ordered cases guard the reset wired into `test/setup.ts` (vitest runs tests
// within a file sequentially): the first case intentionally leaves the
// connector dirtied, and the second only passes if that state was reset in
// between.
describe("shared connector isolation", () => {
  it("leaves the shared connector dirtied without manual cleanup", () => {
    defaultConnector.updateOptions({ rejectRequest: true });
    defaultConnector.switchChain(mainnet.id);
  });

  it("starts the next test from a pristine connector", async () => {
    const { result } = renderHook(() => useConnect());

    await act(async () => {
      // Throws UserRejectedRequestError if `rejectRequest` leaked in from the
      // previous test.
      await result.current.connectAsync({ connector: defaultConnector });
    });

    await waitFor(() => {
      expect(result.current.connector).toBeDefined();
    });
  });
});
