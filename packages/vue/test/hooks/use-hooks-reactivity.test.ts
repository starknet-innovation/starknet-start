import { mainnet } from "@starknetfoundation/starknet-start-chains";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";

import { useConnect } from "../../src/hooks/use-connect";
import { useNetwork } from "../../src/hooks/use-network";
import { useProvider } from "../../src/hooks/use-provider";
import { useSendTransaction } from "../../src/hooks/use-send-transaction";
import { MockWallet, createTestStarknetVue } from "../starknet";

async function settleVueUpdates() {
  await flushPromises();
  await nextTick();
}

const Probe = defineComponent({
  setup() {
    const { chain } = useNetwork();
    const { provider } = useProvider();
    const { connector } = useConnect();
    const sendTransaction = useSendTransaction({
      calls: [{ contract_address: "0x1", entrypoint: "transfer", calldata: [] }],
    });
    return { chain, provider, connector, sendTransaction };
  },
  template: `
    <div>
      <span data-testid="chain">{{ chain.name }}</span>
      <span data-testid="connector">{{ connector?.name ?? "" }}</span>
    </div>
  `,
});

describe("hook reactivity", () => {
  it("send transaction works when the component mounted before the wallet connected", async () => {
    const connector = new MockWallet();
    const { plugin } = createTestStarknetVue({ connectors: [connector] });
    // Mounting first is the point: the hook must not snapshot the (absent)
    // connector during setup.
    const wrapper = mount(Probe, { global: { plugins: [plugin] } });

    await plugin.manager.connect({ connector });
    await settleVueUpdates();

    const result = await wrapper.vm.sendTransaction.sendAsync();
    expect(result).toEqual({ transaction_hash: "0x1" });
  });

  it("chain, provider and connector update after connect and chain switch", async () => {
    const connector = new MockWallet();
    const { plugin, providers } = createTestStarknetVue({ connectors: [connector] });
    const wrapper = mount(Probe, { global: { plugins: [plugin] } });

    expect(wrapper.get('[data-testid="connector"]').text()).toBe("");
    expect(wrapper.get('[data-testid="chain"]').text()).toBe("Starknet Devnet");

    await plugin.manager.connect({ connector });
    await settleVueUpdates();

    expect(wrapper.get('[data-testid="connector"]').text()).toBe("Mock Wallet");

    connector.switchChain(mainnet.id);
    await settleVueUpdates();

    expect(wrapper.get('[data-testid="chain"]').text()).toBe("Starknet");
    expect(wrapper.vm.provider).toBe(providers.get(mainnet.id));
  });
});
