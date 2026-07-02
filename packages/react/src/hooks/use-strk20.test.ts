import type { STRK20_ACTION } from "@starknet-io/types-js";

import { describe, expect, it } from "vitest";

import { defaultConnector } from "../../test/devnet";
import { act, renderHook, waitFor } from "../../test/react";
import { useConnect } from "./use-connect";
import { useStrk20Balances, useStrk20InvokeTransaction, useStrk20PrepareInvoke } from "./use-strk20";

const token = "0x123";
const actions: STRK20_ACTION[] = [
  {
    type: "deposit",
    token,
    amount: "0x1",
  },
];

function useStrk20WithConnect() {
  return {
    balances: useStrk20Balances({ tokens: [token] }),
    prepare: useStrk20PrepareInvoke({ actions, simulate: true }),
    invoke: useStrk20InvokeTransaction({ actions }),
    connect: useConnect(),
  };
}

describe("useStrk20", () => {
  it("exposes STRK20 wallet requests", async () => {
    const { result } = renderHook(() => useStrk20WithConnect());

    await act(async () => {
      await result.current.connect.connectAsync({
        connector: defaultConnector,
      });
    });

    await act(async () => {
      await result.current.balances.getBalancesAsync();
    });

    await waitFor(() => {
      expect(result.current.balances.data).toEqual([{ token, balance: "0x0" }]);
    });

    await act(async () => {
      await result.current.prepare.prepareAsync();
    });

    await waitFor(() => {
      expect(result.current.prepare.data?.call.entry_point).toEqual("execute_strk20");
      expect(result.current.prepare.data?.proof.data).toEqual("0x0");
    });

    await act(async () => {
      await result.current.invoke.invokeAsync();
    });

    await waitFor(() => {
      expect(result.current.invoke.data?.transaction_hash).toMatch(/^0x/);
    });
  });
});
