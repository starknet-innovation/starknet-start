import type { Chain } from "./types";

// Slot project ids are usually names, not numbers. Numeric ids keep their
// numeric value; anything else is encoded as a Starknet short string so the
// chain id stays a bigint instead of BigInt() throwing on non-numeric input.
function slotChainId(projectId: string): bigint {
  if (/^\d+$/.test(projectId)) return BigInt(projectId);
  let id = 0n;
  for (const codeUnit of new TextEncoder().encode(projectId)) {
    id = (id << 8n) | BigInt(codeUnit);
  }
  return id;
}

export function getSlotChain(projectId: string) {
  return {
    id: slotChainId(projectId),
    network: `slot-${projectId}`,
    name: `${projectId}`,
    nativeCurrency: {
      address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    testnet: true,
    rpcUrls: {
      default: {
        http: [],
      },
      public: {
        http: [`https://api.cartridge.gg/x/${projectId}/katana`],
      },
    },
    paymasterRpcUrls: {
      avnu: {
        http: ["https://sepolia.paymaster.avnu.fi/"],
      },
    },
  } as const satisfies Chain;
}
