import { type Chain, devnet, mainnet, sepolia } from "@starknetfoundation/starknet-start-chains";
import { assert, describe, expect, it } from "vitest";

import { cartridge } from "./cartridge";
import { viewblock } from "./viewblock";
import { voyager } from "./voyager";

describe("ExplorerFactory contract", () => {
  it("returns null for chains without the explorer", () => {
    expect(voyager(devnet)).toBeNull();
    expect(cartridge(devnet)).toBeNull();
    expect(viewblock(devnet)).toBeNull();
    expect(viewblock(sepolia)).toBeNull();
  });

  it("uses the first configured explorer url", () => {
    const chain = {
      ...mainnet,
      explorers: { voyager: ["https://a.example.com", "https://b.example.com"] },
    } as Chain;
    expect(voyager(chain)?.transaction("0x1")).toBe("https://a.example.com/tx/0x1");
  });

  it("rejects block links with neither hash nor number", () => {
    const explorer = voyager(mainnet);
    assert(explorer);
    expect(() => explorer.block({})).toThrowError(/block hash or a block number/);

    const viewblockExplorer = viewblock(mainnet);
    assert(viewblockExplorer);
    expect(() => viewblockExplorer.block({})).toThrowError(/provide a number/i);
    expect(() => viewblockExplorer.block({ hash: "0x1" })).toThrowError(/provide a number/i);
  });
});
