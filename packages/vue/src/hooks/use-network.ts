import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { ComputedRef } from "vue";

import { computed } from "vue";

import { useStarknet } from "../context/starknet";

export interface UseNetworkResult {
  chain: ComputedRef<Chain>;
  chains: Chain[];
}

export function useNetwork(): UseNetworkResult {
  const starknet = useStarknet();
  // Destructuring the getter during setup would snapshot the current chain;
  // return a computed so chain switches propagate.
  return { chain: computed(() => starknet.chain), chains: starknet.chains };
}
