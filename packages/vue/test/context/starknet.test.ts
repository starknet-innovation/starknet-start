import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";

import { StandardConnect, StarknetWalletApi } from "@starknet-io/get-starknet-wallet-standard/features";
import { type Chain, devnet, mainnet } from "@starknetfoundation/starknet-start-chains";
import { describe, expect, it } from "vitest";

import { createStarknetVue } from "../../src/context/starknet";
import { MockWallet, createTestProvider, createTestStarknetVue, testAccounts } from "../starknet";

describe("createStarknetVue", () => {
  it("defaults to the first chain", () => {
    const { plugin, providers } = createTestStarknetVue();

    expect(plugin.manager.chain.id).toBe(devnet.id);
    expect(plugin.manager.provider).toBe(providers.get(devnet.id));
  });

  it("connects, reacts to wallet changes, and disconnects", async () => {
    const connector = new MockWallet();
    const { plugin, providers } = createTestStarknetVue({ connectors: [connector] });

    expect(plugin.manager.connector).toBeUndefined();
    expect(plugin.manager.address).toBeUndefined();

    await plugin.manager.connect({ connector });

    expect(plugin.manager.connector).toBe(connector);
    expect(plugin.manager.address).toBe(testAccounts.devnet[0]);
    expect(plugin.manager.chain.id).toBe(devnet.id);
    expect(plugin.manager.provider).toBe(providers.get(devnet.id));

    connector.switchChain(mainnet.id);

    expect(plugin.manager.address).toBe(testAccounts.mainnet[0]);
    expect(plugin.manager.chain.id).toBe(mainnet.id);
    expect(plugin.manager.provider).toBe(providers.get(mainnet.id));

    connector.switchAccount(1);

    expect(plugin.manager.address).toBe(testAccounts.mainnet[1]);

    await plugin.manager.disconnect();

    expect(plugin.manager.connector).toBeUndefined();
    expect(plugin.manager.address).toBeUndefined();
    expect(plugin.manager.chain.id).toBe(devnet.id);
    expect(plugin.manager.provider).toBe(providers.get(devnet.id));
  });

  it("keeps the previous wallet's change listener when a new connect fails", async () => {
    const connector = new MockWallet();
    const { plugin } = createTestStarknetVue({ connectors: [connector] });

    await plugin.manager.connect({ connector });
    expect(plugin.manager.address).toBe(testAccounts.devnet[0]);

    const failing = {
      version: "1.0.0",
      name: "Failing Wallet",
      icon: "data:image/svg+xml;base64,PHN2Zy8+",
      chains: [],
      accounts: [],
      features: {
        [StandardConnect]: {
          version: "1.0.0",
          connect: async () => {
            throw new Error("user rejected");
          },
        },
        [StarknetWalletApi]: {
          id: "failing",
          version: "1.0.0",
          request: async () => {
            throw new Error("unsupported");
          },
          walletVersion: "1.0.0",
        },
      },
    } as unknown as WalletWithStarknetFeatures;

    await expect(plugin.manager.connect({ connector: failing })).rejects.toThrow("user rejected");

    // The old wallet is still connected, so its change events must still update state.
    expect(plugin.manager.connector).toBe(connector);
    connector.switchAccount(1);
    expect(plugin.manager.address).toBe(testAccounts.devnet[1]);
  });

  it("rejects duplicated chain ids", () => {
    expect(() =>
      createStarknetVue({
        chains: [devnet, devnet],
        provider: (chain) => createTestProvider(chain),
      }),
    ).toThrowError("Duplicated chain id found");
  });

  it("allows chains without an avnu paymaster", () => {
    const chain = { ...devnet, paymasterRpcUrls: {} } as Chain;
    const plugin = createStarknetVue({
      chains: [chain],
      provider: (chain_) => createTestProvider(chain_),
    });

    expect(plugin.manager.chain.id).toBe(chain.id);
    expect(plugin.manager.paymasterProvider).toBeUndefined();
  });
});
