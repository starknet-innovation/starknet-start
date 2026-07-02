import type { PaymasterRpc, ProviderInterface } from "starknet";
import type { ComputedRef } from "vue";

import { computed } from "vue";

import { useStarknet } from "../context/starknet";

export interface UseProviderResult {
  provider: ComputedRef<ProviderInterface>;
  paymasterProvider: ComputedRef<PaymasterRpc | undefined>;
}

export function useProvider(): UseProviderResult {
  const starknet = useStarknet();
  // Destructuring the getters during setup would snapshot the providers;
  // return computeds so chain switches propagate.
  return {
    provider: computed(() => starknet.provider),
    paymasterProvider: computed(() => starknet.paymasterProvider),
  };
}
