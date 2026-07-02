import { type Chain, devnet, mainnet, sepolia } from "@starknetfoundation/starknet-start-chains";
import { describe, expect, it } from "vitest";

import { blastProvider } from "./blast";
import { avnuPaymasterProvider } from "./paymaster/avnu";
import { slotProvider } from "./slot";

describe("blastProvider", () => {
  it("builds a provider for chains with a blast endpoint", () => {
    expect(blastProvider({ apiKey: "my-key" })(mainnet)?.channel.nodeUrl).toBe(
      "https://starknet-mainnet.blastapi.io/my-key",
    );
    expect(blastProvider({ apiKey: "my-key" })(sepolia)?.channel.nodeUrl).toBe(
      "https://starknet-sepolia.blastapi.io/my-key",
    );
  });

  it("returns null for chains without a blast endpoint", () => {
    expect(blastProvider({ apiKey: "my-key" })(devnet)).toBeNull();
  });
});

describe("slotProvider", () => {
  it("builds a provider for name-style project ids", () => {
    expect(slotProvider({ projectId: "my-game" })(devnet)?.channel.nodeUrl).toBe(
      "https://api.cartridge.gg/x/my-game/katana",
    );
  });
});

describe("avnuPaymasterProvider", () => {
  it("returns null instead of throwing for chains without an avnu paymaster", () => {
    const chain = { ...devnet, paymasterRpcUrls: {} } as Chain;
    expect(avnuPaymasterProvider({})(chain)).toBeNull();
  });

  it("builds a paymaster for chains with an avnu endpoint", () => {
    expect(avnuPaymasterProvider({ apiKey: "key" })(mainnet)).not.toBeNull();
  });
});
