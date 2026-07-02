import { describe, expect, it } from "vitest";

import { getSlotChain } from "./slot";

describe("getSlotChain", () => {
  it("accepts a name-style project id without throwing", () => {
    const chain = getSlotChain("my-game");
    expect(chain.network).toBe("slot-my-game");
    expect(chain.rpcUrls.public.http[0]).toBe("https://api.cartridge.gg/x/my-game/katana");
    expect(typeof chain.id).toBe("bigint");
  });

  it("keeps numeric project ids as numeric chain ids", () => {
    expect(getSlotChain("123").id).toBe(123n);
  });

  it("gives distinct project names distinct chain ids", () => {
    expect(getSlotChain("my-game").id).not.toBe(getSlotChain("other-game").id);
  });
});
