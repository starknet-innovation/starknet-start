import { devnet, mainnet } from "@starknet-start/chains";
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

  it("rejects duplicated chain ids", () => {
    expect(() =>
      createStarknetVue({
        chains: [devnet, devnet],
        provider: (chain) => createTestProvider(chain),
      }),
    ).toThrowError("Duplicated chain id found");
  });
});
