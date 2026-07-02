import type {
  StandardEventsListeners,
  StandardEventsNames,
  StandardEventsOnMethod,
  WalletWithStarknetFeatures,
} from "@starknet-io/get-starknet-wallet-standard/features";
import type { RequestFn, RequestFnCall, RpcMessage, RpcTypeToMessageMap } from "@starknet-io/types-js";
import type { Chain } from "@starknetfoundation/starknet-start-chains";
import type { ChainProviderFactory } from "@starknetfoundation/starknet-start-providers";
import type { ChainPaymasterFactory } from "@starknetfoundation/starknet-start-providers/paymaster";
import type { ProviderInterface } from "starknet";

import {
  StandardConnect,
  StandardDisconnect,
  StandardEvents,
  StarknetWalletApi,
} from "@starknet-io/get-starknet-wallet-standard/features";
import { devnet, mainnet } from "@starknetfoundation/starknet-start-chains";
import { PaymasterRpc } from "starknet";

import { createStarknetVue } from "../src/context/starknet";

export const testAccounts = {
  devnet: [
    "0x078662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1",
    "0x4f348398f859a55a0c80b1446c5fdc37edb3a8478a32f10764659fc241027d3",
  ],
  mainnet: [
    "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
    "0x49dfb8ce986e21d354ac93ea65e6a11f639c1934ea253e5ff14ca62eca0f38e",
  ],
} as const;

export type TestProvider = ProviderInterface & {
  chainId: bigint;
};

export function chainToWalletStandardChain(chain: Chain): `starknet:0x${string}` {
  return `starknet:0x${chain.id.toString(16)}`;
}

export class MockWallet implements WalletWithStarknetFeatures {
  readonly version = "1.0.0" as const;
  readonly name: string;
  readonly icon = "data:image/svg+xml;base64,PHN2Zy8+" as const;

  private accountIndex = 0;
  private connected = false;
  private chainId = devnet.id;
  private readonly id: string;
  private listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][];
  } = {};

  constructor({ id = "mock", name = "Mock Wallet" }: { id?: string; name?: string } = {}) {
    this.id = id;
    this.name = name;
  }

  get chains() {
    return [chainToWalletStandardChain(this.currentChain)];
  }

  get accounts(): WalletWithStarknetFeatures["accounts"] {
    if (!this.connected) {
      return [];
    }

    return [
      {
        address: this.currentAddress,
        publicKey: new Uint8Array(),
        chains: this.chains,
        features: [],
      },
    ] as unknown as WalletWithStarknetFeatures["accounts"];
  }

  get features(): WalletWithStarknetFeatures["features"] {
    return {
      [StandardConnect]: {
        version: "1.0.0",
        connect: this.connect,
      },
      [StandardDisconnect]: {
        version: "1.0.0",
        disconnect: this.disconnect,
      },
      [StandardEvents]: {
        version: "1.0.0",
        on: this.on,
      },
      [StarknetWalletApi]: {
        id: this.id,
        version: "1.0.0",
        request: this.request,
        walletVersion: "1.0.0",
      },
    };
  }

  switchChain(chainId: bigint): void {
    this.chainId = chainId;
    this.accountIndex = 0;
    this.emit("change", { accounts: this.accounts, chains: this.chains });
  }

  switchAccount(accountIndex: number): void {
    this.accountIndex = accountIndex;
    this.emit("change", { accounts: this.accounts });
  }

  private connect = async (_input: { silent?: boolean } = {}) => {
    this.connected = true;
    this.emit("change", { accounts: this.accounts });
    return { accounts: this.accounts };
  };

  private disconnect = async () => {
    this.connected = false;
    this.emit("change", { accounts: [] });
  };

  private on: StandardEventsOnMethod = (event, listener) => {
    this.listeners[event] ??= [];
    this.listeners[event]?.push(listener);

    return (): void => {
      this.listeners[event] = this.listeners[event]?.filter((existing) => existing !== listener);
    };
  };

  private request: RequestFn = async <T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> => {
    switch (call.type) {
      case "wallet_requestAccounts":
        this.connected = true;
        return [this.currentAddress] as RpcTypeToMessageMap[T]["result"];
      case "wallet_requestChainId":
        return `0x${this.chainId.toString(16)}` as RpcTypeToMessageMap[T]["result"];
      case "wallet_getPermissions":
        return [] as RpcTypeToMessageMap[T]["result"];
      case "wallet_addInvokeTransaction":
        if (!this.connected) {
          throw new Error("Wallet not connected");
        }
        return { transaction_hash: "0x1" } as RpcTypeToMessageMap[T]["result"];
      default:
        throw new Error(`Unknown request type: ${call.type}`);
    }
  };

  private emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
    const listeners = this.listeners[event];
    if (!listeners) return;

    for (const listener of listeners) {
      listener.apply(null, args);
    }
  }

  private get currentChain(): Chain {
    return this.chainId === mainnet.id ? mainnet : devnet;
  }

  private get currentAddress(): string {
    const accounts = this.chainId === mainnet.id ? testAccounts.mainnet : testAccounts.devnet;
    const account = accounts[this.accountIndex];
    if (!account) {
      throw new Error("No mock account available");
    }
    return account;
  }
}

export function createTestProvider(chain: Chain): TestProvider {
  return {
    chainId: chain.id,
    channel: {
      id: `test-${chain.network}`,
      setChainId() {},
    },
  } as unknown as TestProvider;
}

export function createTestStarknetVue({ connectors = [new MockWallet()] } = {}) {
  const providers = new Map<bigint, TestProvider>();
  const paymasters = new Map<bigint, PaymasterRpc>();

  const provider: ChainProviderFactory = (chain) => {
    let existing = providers.get(chain.id);
    if (!existing) {
      existing = createTestProvider(chain);
      providers.set(chain.id, existing);
    }
    return existing;
  };

  const paymasterProvider: ChainPaymasterFactory = (chain) => {
    let existing = paymasters.get(chain.id);
    if (!existing) {
      existing = new PaymasterRpc({ nodeUrl: "http://localhost:5050", headers: {} });
      paymasters.set(chain.id, existing);
    }
    return existing;
  };

  return {
    plugin: createStarknetVue({
      chains: [devnet, mainnet],
      connectors,
      provider,
      paymasterProvider,
    }),
    provider,
    providers,
    paymasterProvider,
    paymasters,
  };
}
