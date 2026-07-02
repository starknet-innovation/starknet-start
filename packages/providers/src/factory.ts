import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { ProviderInterface } from "starknet";

export type ChainProviderFactory<T extends ProviderInterface = ProviderInterface> = (chain: Chain) => T | null;
