import { mount, flushPromises } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";

import { useStarknet } from "../../src/context/starknet";
import { useAccount } from "../../src/hooks/use-account";
import { getAddress } from "../../src/utils";
import { MockWallet, createTestStarknetVue, testAccounts } from "../starknet";

const AccountProbe = defineComponent({
  setup() {
    return {
      account: useAccount(),
      starknet: useStarknet(),
    };
  },
  template: `
    <div>
      <span data-testid="status">{{ account.status }}</span>
      <span data-testid="address">{{ account.address ?? "" }}</span>
      <span data-testid="chain">{{ starknet.chain.name }}</span>
    </div>
  `,
});

async function settleVueUpdates() {
  await flushPromises();
  await nextTick();
}

describe("useAccount", () => {
  it("tracks wallet connection and account changes through Vue injection", async () => {
    const connector = new MockWallet();
    const { plugin } = createTestStarknetVue({ connectors: [connector] });
    const wrapper = mount(AccountProbe, {
      global: {
        plugins: [plugin],
      },
    });

    expect(wrapper.get('[data-testid="status"]').text()).toBe("disconnected");
    expect(wrapper.get('[data-testid="address"]').text()).toBe("");

    await plugin.manager.connect({ connector });
    await settleVueUpdates();

    expect(wrapper.get('[data-testid="status"]').text()).toBe("connected");
    expect(wrapper.get('[data-testid="address"]').text()).toBe(getAddress(testAccounts.devnet[0]));
    expect(wrapper.get('[data-testid="chain"]').text()).toBe("Starknet Devnet");

    connector.switchAccount(1);
    await settleVueUpdates();

    expect(wrapper.get('[data-testid="address"]').text()).toBe(getAddress(testAccounts.devnet[1]));

    await plugin.manager.disconnect();
    await settleVueUpdates();

    expect(wrapper.get('[data-testid="status"]').text()).toBe("disconnected");
    expect(wrapper.get('[data-testid="address"]').text()).toBe("");
  });
});
