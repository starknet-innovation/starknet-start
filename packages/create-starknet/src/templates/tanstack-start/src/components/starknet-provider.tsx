import type { ReactNode } from "react";

import { mainnet, sepolia } from "@starknetfoundation/starknet-start-chains";
import { publicProvider } from "@starknetfoundation/starknet-start-providers";
import { StarknetConfig } from "@starknetfoundation/starknet-start-react";

export function StarknetProvider({ children }: { children: ReactNode }) {
  return (
    <StarknetConfig chains={[sepolia, mainnet]} provider={publicProvider()}>
      {children}
    </StarknetConfig>
  );
}
