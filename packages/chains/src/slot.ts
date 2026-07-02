import type { Chain } from "./types";

// Matches Cartridge parseChainId for https://api.cartridge.gg/x/{projectId}/katana:
// shortString.encodeShortString(`WP_${projectId.toUpperCase().replace(/-/g, "_")}`)
function encodeShortString(str: string): bigint {
  if (str.length > 31) {
    throw new Error(`Short string cannot exceed 31 characters: "${str}"`);
  }
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return BigInt(`0x${hex}`);
}

function slotChainId(projectId: string): bigint {
  // Cartridge encodes every project id, numeric ones included, so a numeric
  // passthrough here would never match the chain id the katana node reports.
  const chainName = `WP_${projectId.toUpperCase().replace(/-/g, "_")}`;
  return encodeShortString(chainName);
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
