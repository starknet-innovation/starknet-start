import type { PaymasterRpc, ProviderInterface } from "starknet";

import { useStarknet } from "../context/starknet";

export interface UseProviderResult {
  provider: ProviderInterface;
  paymasterProvider?: PaymasterRpc;
}

export function useProvider(): UseProviderResult {
  const { provider, paymasterProvider } = useStarknet();
  return { provider, paymasterProvider };
}
