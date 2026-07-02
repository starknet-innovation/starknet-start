import type { Address, STRK20_ACTION } from "@starknet-io/types-js";

import {
  type RequestArgs,
  type RequestResult,
  type UseWalletRequestProps,
  type UseWalletRequestResult,
  useWalletRequest,
} from "./use-wallet-request";

export type UseStrk20BalancesArgs = {
  tokens?: Address[];
};

export type UseStrk20BalancesProps = UseStrk20BalancesArgs &
  Omit<UseWalletRequestProps<"wallet_strk20Balances">, keyof RequestArgs<"wallet_strk20Balances">>;

export type UseStrk20BalancesResult = Omit<
  UseWalletRequestResult<"wallet_strk20Balances">,
  "request" | "requestAsync"
> & {
  getBalances: (tokens?: Address[]) => void;
  getBalancesAsync: (tokens?: Address[]) => Promise<RequestResult<"wallet_strk20Balances">>;
};

export function useStrk20Balances(props: UseStrk20BalancesProps = {}): UseStrk20BalancesResult {
  const { tokens = [], ...rest } = props;

  const { request, requestAsync, ...result } = useWalletRequest({
    type: "wallet_strk20Balances",
    params: { tokens },
    ...rest,
  });

  const getBalances = (args?: Address[]) =>
    request(args ? { params: { tokens: args }, type: "wallet_strk20Balances" } : undefined);

  const getBalancesAsync = (args?: Address[]) =>
    requestAsync(args ? { params: { tokens: args }, type: "wallet_strk20Balances" } : undefined);

  return {
    getBalances,
    getBalancesAsync,
    ...result,
  };
}

export type UseStrk20PrepareInvokeArgs = {
  actions?: STRK20_ACTION[];
  simulate?: boolean;
};

export type UseStrk20PrepareInvokeProps = UseStrk20PrepareInvokeArgs &
  Omit<UseWalletRequestProps<"wallet_strk20PrepareInvoke">, keyof RequestArgs<"wallet_strk20PrepareInvoke">>;

export type UseStrk20PrepareInvokeResult = Omit<
  UseWalletRequestResult<"wallet_strk20PrepareInvoke">,
  "request" | "requestAsync"
> & {
  prepare: (args?: UseStrk20PrepareInvokeArgs) => void;
  prepareAsync: (args?: UseStrk20PrepareInvokeArgs) => Promise<RequestResult<"wallet_strk20PrepareInvoke">>;
};

export function useStrk20PrepareInvoke(props: UseStrk20PrepareInvokeProps = {}): UseStrk20PrepareInvokeResult {
  const { actions, simulate, ...rest } = props;

  const { request, requestAsync, ...result } = useWalletRequest({
    type: "wallet_strk20PrepareInvoke",
    params: actions ? { actions, simulate } : undefined,
    ...rest,
  });

  const prepare = (args?: UseStrk20PrepareInvokeArgs) =>
    request(
      args
        ? {
            params: { actions: args.actions ?? [], simulate: args.simulate },
            type: "wallet_strk20PrepareInvoke",
          }
        : undefined,
    );

  const prepareAsync = (args?: UseStrk20PrepareInvokeArgs) =>
    requestAsync(
      args
        ? {
            params: { actions: args.actions ?? [], simulate: args.simulate },
            type: "wallet_strk20PrepareInvoke",
          }
        : undefined,
    );

  return {
    prepare,
    prepareAsync,
    ...result,
  };
}

export type UseStrk20InvokeTransactionArgs = {
  actions?: STRK20_ACTION[];
};

export type UseStrk20InvokeTransactionProps = UseStrk20InvokeTransactionArgs &
  Omit<UseWalletRequestProps<"wallet_strk20InvokeTransaction">, keyof RequestArgs<"wallet_strk20InvokeTransaction">>;

export type UseStrk20InvokeTransactionResult = Omit<
  UseWalletRequestResult<"wallet_strk20InvokeTransaction">,
  "request" | "requestAsync"
> & {
  invoke: (actions?: STRK20_ACTION[]) => void;
  invokeAsync: (actions?: STRK20_ACTION[]) => Promise<RequestResult<"wallet_strk20InvokeTransaction">>;
};

export function useStrk20InvokeTransaction(
  props: UseStrk20InvokeTransactionProps = {},
): UseStrk20InvokeTransactionResult {
  const { actions, ...rest } = props;

  const { request, requestAsync, ...result } = useWalletRequest({
    type: "wallet_strk20InvokeTransaction",
    params: actions ? { actions } : undefined,
    ...rest,
  });

  const invoke = (args?: STRK20_ACTION[]) =>
    request(args ? { params: { actions: args }, type: "wallet_strk20InvokeTransaction" } : undefined);

  const invokeAsync = (args?: STRK20_ACTION[]) =>
    requestAsync(args ? { params: { actions: args }, type: "wallet_strk20InvokeTransaction" } : undefined);

  return {
    invoke,
    invokeAsync,
    ...result,
  };
}
