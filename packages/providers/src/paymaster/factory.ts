import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { PaymasterRpc } from "starknet";

export type ChainPaymasterFactory<T extends PaymasterRpc = PaymasterRpc> = (chain: Chain) => T | null;
