import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";

import { unref } from "vue";

import { useStarknet } from "../context/starknet";
import { type UseMutationProps, type UseMutationResult, useMutation } from "../query";

export type ConnectVariables = { connector?: WalletWithStarknetFeatures };

type MutationResult = UseMutationResult<void, Error, ConnectVariables, unknown>;

export type UseConnectProps = UseMutationProps<void, Error, ConnectVariables>;

export type UseConnectResult = Omit<MutationResult, "mutate" | "mutateAsync"> & {
  connector?: WalletWithStarknetFeatures;
  connectors: WalletWithStarknetFeatures[];
  pendingConnector?: WalletWithStarknetFeatures;
  connect: (args?: ConnectVariables) => void;
  connectAsync: (args?: ConnectVariables) => Promise<void>;
};

export function useConnect(props: UseConnectProps = {}): UseConnectResult {
  const starknet = useStarknet();

  const { mutate, mutateAsync, variables, ...result } = useMutation<void, Error, ConnectVariables, unknown>({
    mutationKey: [{ entity: "connect", chainId: starknet.chain.name }],
    mutationFn: starknet.connect,
    ...((props ?? {}) as UseMutationProps<void, Error, ConnectVariables, unknown>),
  });

  const connect = (args?: ConnectVariables) => mutate(args ?? { connector: starknet.connector });
  const connectAsync = (args?: ConnectVariables) => mutateAsync(args ?? { connector: starknet.connector });

  return {
    connector: starknet.connector,
    connectors: starknet.connectors,
    pendingConnector: unref(variables)?.connector,
    connect,
    connectAsync,
    variables,
    ...result,
  };
}
