import type {
  StandardEventsListeners,
  WalletWithStarknetFeatures,
} from "@starknet-io/get-starknet-wallet-standard/features";
import type { ExplorerFactory } from "@starknetfoundation/starknet-start-explorers";
import type { ChainProviderFactory } from "@starknetfoundation/starknet-start-providers";
import type { App, InjectionKey } from "vue";

import {
  StandardConnect,
  StandardDisconnect,
  StandardEvents,
  StarknetWalletApi,
} from "@starknet-io/get-starknet-wallet-standard/features";
import { type Address, type Chain, mainnet, sepolia } from "@starknetfoundation/starknet-start-chains";
import {
  avnuPaymasterProvider,
  type ChainPaymasterFactory,
} from "@starknetfoundation/starknet-start-providers/paymaster";
import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from "@tanstack/vue-query";
import { constants, type PaymasterRpc, type ProviderInterface } from "starknet";
import { inject, ref, shallowRef } from "vue";

const StarknetContextKey: InjectionKey<StarknetState> = Symbol("StarknetContext");

const defaultQueryClient = new QueryClient();

export interface StarknetState {
  connector?: WalletWithStarknetFeatures;
  connect: ({ connector }: { connector?: WalletWithStarknetFeatures }) => Promise<void>;
  disconnect: () => Promise<void>;
  connectors: WalletWithStarknetFeatures[];
  explorer?: ExplorerFactory;
  chains: Chain[];
  chain: Chain;
  provider: ProviderInterface;
  paymasterProvider?: PaymasterRpc;
  error?: Error;
  address?: Address;
}

export interface StarknetManagerOptions {
  chains: Chain[];
  provider: ChainProviderFactory;
  paymasterProvider?: ChainPaymasterFactory;
  connectors?: WalletWithStarknetFeatures[];
  explorer?: ExplorerFactory;
  autoConnect?: boolean;
  defaultChainId?: bigint;
}

type SafeStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function getStorage(): SafeStorage | undefined {
  const globalObj = globalThis as { localStorage?: SafeStorage };
  return globalObj.localStorage;
}

type WalletAccount = WalletWithStarknetFeatures["accounts"][number];

function walletId(connector: WalletWithStarknetFeatures): string {
  return connector.features[StarknetWalletApi].id;
}

function chainIdFromAccount(account?: WalletAccount): bigint | undefined {
  const chainIdentifier = account?.chains[0];
  if (!chainIdentifier) return undefined;

  try {
    const parts = chainIdentifier.split(":");
    const chainId = parts[parts.length - 1];
    return chainId ? BigInt(chainId) : undefined;
  } catch {
    return undefined;
  }
}

function chainIdFromConnector(connector: WalletWithStarknetFeatures): bigint | undefined {
  return chainIdFromAccount(connector.accounts[0]);
}

function providerForChain(chain: Chain, factory: ChainProviderFactory): { chain: Chain; provider: ProviderInterface } {
  const provider = factory(chain);
  if (provider) {
    return { chain, provider };
  }
  throw new Error(`No provider found for chain ${chain.name}`);
}

function paymasterProviderForChain(
  chain: Chain,
  factory: ChainPaymasterFactory,
): { chain: Chain; paymasterProvider?: PaymasterRpc } {
  return { chain, paymasterProvider: factory(chain) ?? undefined };
}

function createStarknetManager({
  chains,
  provider,
  paymasterProvider,
  explorer,
  connectors = [],
  autoConnect = false,
  defaultChainId,
}: StarknetManagerOptions) {
  const defaultChain = defaultChainId ? (chains.find((c) => c.id === defaultChainId) ?? chains[0]) : chains[0];
  if (defaultChain === undefined) {
    throw new Error("Must provide at least one chain.");
  }

  const seen = new Set<bigint>();
  for (const chain of chains) {
    if (seen.has(chain.id)) {
      throw new Error(`Duplicated chain id found: ${chain.id}`);
    }
    seen.add(chain.id);
  }

  const { provider: defaultProvider } = providerForChain(defaultChain, provider);
  const paymasterFactory = paymasterProvider ?? avnuPaymasterProvider({});
  const { paymasterProvider: defaultPaymasterProvider } = paymasterProviderForChain(defaultChain, paymasterFactory);

  const connectorRef = shallowRef<WalletWithStarknetFeatures | undefined>();
  const currentChain = ref(defaultChain);
  const currentProvider = shallowRef<ProviderInterface>(defaultProvider);
  const currentPaymasterProvider = shallowRef<PaymasterRpc | undefined>(defaultPaymasterProvider);
  const currentAddress = ref<Address | undefined>();
  const error = shallowRef<Error | undefined>();
  let removeChangeListener: (() => void) | undefined;

  const updateChainAndProvider = ({ chainId }: { chainId?: bigint }) => {
    if (!chainId) return;
    const targetChain = chains.find((chain) => chain.id === chainId);
    if (!targetChain) return;
    const { chain, provider: newProvider } = providerForChain(targetChain, provider);
    const { paymasterProvider: newPaymasterProvider } = paymasterProviderForChain(targetChain, paymasterFactory);
    currentChain.value = chain;
    currentProvider.value = newProvider;
    currentPaymasterProvider.value = newPaymasterProvider;
  };

  const handleWalletWithStarknetFeaturesChange: StandardEventsListeners["change"] = (change) => {
    if (change.accounts && change.accounts.length === 0) {
      currentAddress.value = undefined;
      currentProvider.value = defaultProvider;
      currentPaymasterProvider.value = defaultPaymasterProvider;
      currentChain.value = defaultChain;
      return;
    }

    const account = change.accounts?.[0] ?? connectorRef.value?.accounts[0];
    const chainId = chainIdFromAccount(account);
    if (chainId !== undefined) {
      updateChainAndProvider({ chainId });
    }
    const address = account?.address;
    if (address) {
      currentAddress.value = address as Address;
    }
  };

  const disconnect = async () => {
    currentAddress.value = undefined;
    currentProvider.value = defaultProvider;
    currentPaymasterProvider.value = defaultPaymasterProvider;
    currentChain.value = defaultChain;

    if (autoConnect) {
      getStorage()?.removeItem("lastUsedWalletWithStarknetFeatures");
    }

    removeChangeListener?.();
    removeChangeListener = undefined;

    try {
      await connectorRef.value?.features[StandardDisconnect].disconnect();
    } catch {}

    connectorRef.value = undefined;
  };

  const connect = async ({ connector }: { connector?: WalletWithStarknetFeatures }) => {
    if (!connector) {
      throw new Error("Must provide a connector.");
    }

    const needsListenerSetup = connectorRef.value ? walletId(connectorRef.value) !== walletId(connector) : true;

    try {
      const { accounts } = await connector.features[StandardConnect].connect();
      const address = accounts[0]?.address;

      // Swap listeners only once the new wallet connected: if the user
      // dismisses its popup, the still-active previous wallet keeps its
      // change listener.
      if (needsListenerSetup) {
        removeChangeListener?.();
        removeChangeListener = connector.features[StandardEvents].on("change", handleWalletWithStarknetFeaturesChange);
      }

      // Always track the connector: two wallets can expose the same address,
      // and the change listener registered above belongs to this one.
      connectorRef.value = connector;
      currentAddress.value = address ? (address as Address) : undefined;
      error.value = undefined;

      if (autoConnect) {
        getStorage()?.setItem("lastUsedWalletWithStarknetFeatures", walletId(connector));
      }

      const chainId = chainIdFromConnector(connector);
      updateChainAndProvider({ chainId });
    } catch (err) {
      error.value = err instanceof Error ? err : new Error("Failed to connect wallet.");
      throw err;
    }
  };

  if (autoConnect && !connectorRef.value) {
    const storage = getStorage();
    const lastConnectedWalletWithStarknetFeaturesId = storage?.getItem("lastUsedWalletWithStarknetFeatures");
    if (lastConnectedWalletWithStarknetFeaturesId) {
      const lastConnectedWalletWithStarknetFeatures = connectors.find(
        (connector) => walletId(connector) === lastConnectedWalletWithStarknetFeaturesId,
      );
      if (lastConnectedWalletWithStarknetFeatures) {
        lastConnectedWalletWithStarknetFeatures.features[StandardConnect]
          .connect({ silent: true })
          .then(() => {
            return connect({
              connector: lastConnectedWalletWithStarknetFeatures,
            });
          })
          .catch(() => {
            /* ignore */
          });
      }
    }
  }

  const expose: StarknetState = {
    get connector() {
      return connectorRef.value;
    },
    connectors,
    explorer,
    chains,
    get chain() {
      return currentChain.value;
    },
    get provider() {
      return currentProvider.value;
    },
    get paymasterProvider() {
      return currentPaymasterProvider.value;
    },
    get address() {
      return currentAddress.value;
    },
    get error() {
      return error.value;
    },
    connect,
    disconnect,
  };

  return expose;
}

export interface StarknetPluginOptions extends StarknetManagerOptions {
  queryClient?: QueryClient;
  vueQueryOptions?: VueQueryPluginOptions;
}

export function createStarknetVue(options: StarknetPluginOptions) {
  const manager = createStarknetManager(options);
  const queryClient = options.queryClient ?? defaultQueryClient;

  return {
    install(app: App) {
      app.use(VueQueryPlugin, { queryClient, ...options.vueQueryOptions });
      app.provide(StarknetContextKey, manager);
    },
    manager,
  };
}

export function useStarknet(): StarknetState {
  const state = inject(StarknetContextKey);
  if (!state) {
    throw new Error("useStarknet must be used after installing createStarknetVue plugin");
  }
  return state;
}

export function starknetChainId(chainId: bigint): constants.StarknetChainId | undefined {
  switch (chainId) {
    case mainnet.id:
      return constants.StarknetChainId.SN_MAIN;
    case sepolia.id:
      return constants.StarknetChainId.SN_SEPOLIA;
    default:
      return undefined;
  }
}
