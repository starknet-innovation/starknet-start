import type { Chain } from "@starknetfoundation/starknet-start-chains";

import type { Explorer, ExplorerFactory } from "./explorer";

// Define the VoyagerExplorer class that extends Explorer
export class VoyagerExplorer implements Explorer {
  public name = "Voyager";
  private link: string;

  constructor(chain: Chain) {
    this.link = chain.explorers?.["voyager"]?.[0] ?? "";
  }

  block(hashOrNumber: { hash?: string; number?: number }): string {
    if (hashOrNumber.hash === undefined && hashOrNumber.number === undefined) {
      throw new Error("Provide a block hash or a block number.");
    }
    return `${this.link}/block/${hashOrNumber.hash ?? hashOrNumber.number}`;
  }

  transaction(hash: string): string {
    return `${this.link}/tx/${hash}`;
  }

  contract(address: string): string {
    return `${this.link}/contract/${address}`;
  }

  class(hash: string): string {
    return `${this.link}/class/${hash}`;
  }
}

// Define the voyager factory function
export const voyager: ExplorerFactory<VoyagerExplorer> = (chain: Chain) => {
  if (!chain.explorers?.["voyager"]?.[0]) return null;
  return new VoyagerExplorer(chain);
};
