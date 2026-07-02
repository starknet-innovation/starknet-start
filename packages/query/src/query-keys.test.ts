import { mainnet, sepolia } from "@starknetfoundation/starknet-start-chains";
import { describe, expect, it } from "vitest";

import { blockQueryKey } from "./block";
import { blockNumberQueryKey } from "./block-number";
import { estimateFeesQueryKey } from "./estimate-fees";
import { eventsQueryKey } from "./events";
import { nonceForAddressQueryKey } from "./nonce-for-address";
import { paymasterGasTokensQueryKey } from "./paymaster-gas-tokens";

// Keys must differ across chains or a chain switch serves the previous
// chain's cached data.
describe("query keys are chain-scoped", () => {
  it("block", () => {
    expect(blockQueryKey({ chain: mainnet, blockIdentifier: "latest" })).not.toEqual(
      blockQueryKey({ chain: sepolia, blockIdentifier: "latest" }),
    );
  });

  it("blockNumber", () => {
    expect(blockNumberQueryKey({ chain: mainnet, blockIdentifier: "latest" })).not.toEqual(
      blockNumberQueryKey({ chain: sepolia, blockIdentifier: "latest" }),
    );
  });

  it("events", () => {
    expect(eventsQueryKey({ chain: mainnet, address: "0x1" })).not.toEqual(
      eventsQueryKey({ chain: sepolia, address: "0x1" }),
    );
  });

  it("nonce", () => {
    expect(nonceForAddressQueryKey({ chain: mainnet, address: "0x1" })).not.toEqual(
      nonceForAddressQueryKey({ chain: sepolia, address: "0x1" }),
    );
  });

  it("paymaster gas tokens", () => {
    expect(paymasterGasTokensQueryKey({ chain: mainnet })).not.toEqual(paymasterGasTokensQueryKey({ chain: sepolia }));
  });

  it("estimate fees is chain- and account-scoped", () => {
    expect(estimateFeesQueryKey({ chain: mainnet, address: "0x1" })).not.toEqual(
      estimateFeesQueryKey({ chain: sepolia, address: "0x1" }),
    );
    expect(estimateFeesQueryKey({ chain: mainnet, address: "0x1" })).not.toEqual(
      estimateFeesQueryKey({ chain: mainnet, address: "0x2" }),
    );
  });
});
