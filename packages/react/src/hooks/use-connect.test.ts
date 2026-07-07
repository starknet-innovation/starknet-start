import { describe, expect, it } from "vitest";

import { accounts, defaultConnector } from "../../test/devnet";
import { act, renderHook, waitFor } from "../../test/react";
import { MockWallet } from "../connectors/mock";
import { useConnect } from "./use-connect";

describe("useConnect", () => {
  it("connects the specified connector", async () => {
    const { result } = renderHook(() => useConnect());

    await waitFor(() => {
      expect(result.current.connector).toBeUndefined();
      expect(result.current.connectors).toHaveLength(1);
    });

    await act(async () => {
      const connector = result.current.connectors[0];
      await result.current.connectAsync({ connector });
    });

    await waitFor(() => {
      expect(result.current.connector).toBeDefined();
    });
  });

  it("includes extra wallets such as Cartridge Controller", async () => {
    const cartridgeController = new MockWallet(accounts, {
      id: "controller",
      name: "Cartridge Controller",
      available: true,
    });

    const { result } = renderHook(() => useConnect(), {
      extraWallets: [defaultConnector, cartridgeController],
    });

    await waitFor(() => {
      expect(result.current.connectors.map((connector) => connector.name)).toContain("Cartridge Controller");
    });
  });
});
