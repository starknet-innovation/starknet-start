import type { Call as RequestCall, STRK20_PROOF } from "@starknet-io/types-js";
import type { Call } from "starknet";

import {
  type RequestArgs,
  type RequestResult,
  type UseWalletRequestProps,
  type UseWalletRequestResult,
  useWalletRequest,
} from "./use-wallet-request";

export type UseSendTransactionCall = Call | RequestCall;

export type UseSendTransactionArgs = {
  calls?: UseSendTransactionCall[];
  proof?: STRK20_PROOF;
};

export type UseSendTransactionVariables = UseSendTransactionCall[] | UseSendTransactionArgs;

export type UseSendTransactionProps = UseSendTransactionArgs &
  Omit<UseWalletRequestProps<"wallet_addInvokeTransaction">, keyof RequestArgs<"wallet_addInvokeTransaction">>;

export type UseSendTransactionResult = Omit<
  UseWalletRequestResult<"wallet_addInvokeTransaction">,
  "request" | "requestAsync"
> & {
  send: (args?: UseSendTransactionVariables) => void;
  sendAsync: (args?: UseSendTransactionVariables) => Promise<RequestResult<"wallet_addInvokeTransaction">>;
};

export function useSendTransaction(props: UseSendTransactionProps): UseSendTransactionResult {
  const { calls, proof, ...rest } = props;

  const params = toRequestParams({ calls, proof });

  const { request, requestAsync, ...result } = useWalletRequest({
    type: "wallet_addInvokeTransaction",
    params,
    ...rest,
  });

  const send = (args?: UseSendTransactionVariables) =>
    request(
      args
        ? {
            params: toRequestParams(args),
            type: "wallet_addInvokeTransaction",
          }
        : undefined,
    );

  const sendAsync = (args?: UseSendTransactionVariables) =>
    requestAsync(
      args
        ? {
            params: toRequestParams(args),
            type: "wallet_addInvokeTransaction",
          }
        : undefined,
    );

  return {
    send,
    sendAsync,
    ...result,
  };
}

function toRequestParams(args: UseSendTransactionVariables | undefined) {
  if (!args) return undefined;

  const calls = Array.isArray(args) ? args : args.calls;
  if (!calls) return undefined;

  const proof = Array.isArray(args) ? undefined : args.proof;
  return {
    calls: transformCalls(calls),
    ...(proof ? { proof } : {}),
  };
}

function transformCalls(calls: UseSendTransactionCall[]) {
  return calls.map((call) => {
    if ("contract_address" in call) return call;

    return {
      contract_address: call.contractAddress,
      entry_point: call.entrypoint,
      calldata: call.calldata,
    } as RequestCall;
  });
}
