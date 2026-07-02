import type { Explorer } from "@starknetfoundation/starknet-start-explorers";

import { useStarknet } from "../context/starknet";

/**
 * Access the current explorer, should be inside a StarknetConfig.
 *
 * Returns `null` when the current chain does not define an endpoint for the
 * configured explorer (e.g. devnet), so callers can degrade gracefully
 * instead of crashing on a chain switch.
 */
export function useExplorer(): Explorer | null {
  const { explorer, chain } = useStarknet();
  if (!explorer) throw Error("Explorer is undefined. Try adding it to StarknetConfig.");
  return explorer(chain);
}
