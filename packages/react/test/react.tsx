import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-core";
import type React from "react";

import { devnet, mainnet } from "@starknetfoundation/starknet-start-chains";
import { jsonRpcProvider } from "@starknetfoundation/starknet-start-providers";
import { QueryClient } from "@tanstack/react-query";
import {
  type RenderHookOptions,
  type RenderOptions,
  type RenderResult,
  render,
  renderHook,
} from "@testing-library/react";

import type { MockWalletOptions } from "../src/connectors/mock";

import { StarknetConfig as OgStarknetConfig } from "../src/context";
import { defaultConnector } from "./devnet";

function rpc() {
  return {
    nodeUrl: devnet.rpcUrls.public.http[0],
  };
}

function StarknetConfig({
  children,
  connectorOptions,
  extraWallets = [defaultConnector],
}: {
  children: React.ReactNode;
  connectorOptions?: Partial<MockWalletOptions>;
  extraWallets?: WalletWithStarknetFeatures[];
}) {
  const chains = [devnet, mainnet];
  const provider = jsonRpcProvider({ rpc });

  if (connectorOptions) {
    defaultConnector.updateOptions(connectorOptions);
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <OgStarknetConfig chains={chains} provider={provider} extraWallets={extraWallets} queryClient={queryClient}>
      {children}
    </OgStarknetConfig>
  );
}

function customRender(
  ui: React.ReactElement,
  options: Omit<RenderOptions, "wrapper"> & {
    connectorOptions?: Partial<MockWalletOptions>;
    extraWallets?: WalletWithStarknetFeatures[];
  } = {},
): RenderResult {
  const { connectorOptions, extraWallets, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <StarknetConfig connectorOptions={connectorOptions} extraWallets={extraWallets}>
        {children}
      </StarknetConfig>
    ),
    ...renderOptions,
  });
}

function customRenderHook<RenderResult, Props>(
  render: (initialProps: Props) => RenderResult,
  options: Omit<RenderHookOptions<Props>, "wrapper"> & {
    connectorOptions?: Partial<MockWalletOptions>;
    extraWallets?: WalletWithStarknetFeatures[];
  } = {},
) {
  const { connectorOptions, extraWallets, hydrate, ...renderOptions } = options;
  return renderHook(render, {
    wrapper: ({ children }) => (
      <StarknetConfig connectorOptions={connectorOptions} extraWallets={extraWallets}>
        {children}
      </StarknetConfig>
    ),
    hydrate: hydrate as false | undefined,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { customRender as render, customRenderHook as renderHook };
