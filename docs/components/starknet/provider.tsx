"use client";

import type { ExplorerFactory } from "@starknetfoundation/starknet-start-explorers";

import { mainnet, sepolia } from "@starknetfoundation/starknet-start-chains";
import { publicProvider } from "@starknetfoundation/starknet-start-providers";
import { StarknetConfig } from "@starknetfoundation/starknet-start-react";

export function StarknetProvider({
  defaultChainId,
  children,
  explorer,
}: {
  children: React.ReactNode;
  defaultChainId?: bigint;
  explorer?: ExplorerFactory;
}) {
  const chains = [sepolia, mainnet];

  const provider = publicProvider();

  return (
    <StarknetConfig chains={chains} provider={provider} explorer={explorer} defaultChainId={defaultChainId}>
      {children}
    </StarknetConfig>
  );
}
