"use client";

import type { ReactNode } from "react";

import { mainnet, sepolia } from "@starknet-start/chains";
import { publicProvider } from "@starknet-start/providers";
import { StarknetConfig } from "@starknet-start/react";

export function StarknetProvider({ children }: { children: ReactNode }) {
  return (
    <StarknetConfig chains={[sepolia, mainnet]} provider={publicProvider()}>
      {children}
    </StarknetConfig>
  );
}
