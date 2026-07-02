import { shortString } from "starknet";
import { describe, expect, it } from "vitest";

import { getSlotChain } from "./slot";

describe("getSlotChain", () => {
  it("accepts a name-style project id without throwing", () => {
    const chain = getSlotChain("my-game");
    expect(chain.network).toBe("slot-my-game");
    expect(chain.rpcUrls.public.http[0]).toBe("https://api.cartridge.gg/x/my-game/katana");
    expect(chain.id).toBe(BigInt(shortString.encodeShortString("WP_MY_GAME")));
  });

  it("matches Cartridge parseChainId for hyphenated project names", () => {
    expect(getSlotChain("my-slot-chain").id).toBe(BigInt(shortString.encodeShortString("WP_MY_SLOT_CHAIN")));
  });

  it("encodes numeric project ids like Cartridge parseChainId", () => {
    expect(getSlotChain("123").id).toBe(BigInt(shortString.encodeShortString("WP_123")));
  });

  it("gives distinct project names distinct chain ids", () => {
    expect(getSlotChain("my-game").id).not.toBe(getSlotChain("other-game").id);
  });
});
