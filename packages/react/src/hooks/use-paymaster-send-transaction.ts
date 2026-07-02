import type { BigNumberish, Call, InvokeFunctionResponse, PaymasterDetails } from "starknet";

import {
  paymasterSendTransactionMutationFn,
  paymasterSendTransactionMutationKey,
} from "@starknetfoundation/starknet-start-query";
import { useCallback } from "react";

import { useStarknetAccount } from "../context/account";
import { type UseMutationResult, useMutation } from "../query";
import { useProvider } from "./use-provider";

export type UsePaymasterSendTransactionArgs = {
  /** List of smart contract calls to execute. */
  calls?: Call[];
  /** Paymaster details. */
  options?: PaymasterDetails;
  /** Max fee in gas token. */
  maxFeeInGasToken?: BigNumberish;
};

/** Value returned from `usePaymasterSendTransaction`. */
export type UsePaymasterSendTransactionResult = Omit<
  UseMutationResult<InvokeFunctionResponse, Error, Call[]>,
  "mutate" | "mutateAsync"
> & {
  send: (args?: Call[]) => void;
  sendAsync: (args?: Call[]) => Promise<InvokeFunctionResponse>;
};

/** Hook to send one or several transaction(s) to the network through a paymaster. */
export function usePaymasterSendTransaction(props: UsePaymasterSendTransactionArgs): UsePaymasterSendTransactionResult {
  const { calls, options, maxFeeInGasToken, ...rest } = props;
  const { account } = useStarknetAccount();
  const { paymasterProvider } = useProvider();

  const { mutate, mutateAsync, ...result } = useMutation<InvokeFunctionResponse, Error, Call[]>({
    mutationKey: paymasterSendTransactionMutationKey(calls || []),
    // Without a configured paymaster the account falls back to starknet.js's
    // default (sepolia) endpoint, so fail rather than send to the wrong network.
    mutationFn: paymasterProvider
      ? paymasterSendTransactionMutationFn({
          account,
          options,
          maxFeeInGasToken,
        })
      : async () => {
          throw new Error("No paymaster is configured for the current chain.");
        },
    ...rest,
  });

  const send = useCallback(
    (args?: Call[]) => {
      mutate(args || calls || []);
    },
    [mutate, calls],
  );

  const sendAsync = useCallback(
    (args?: Call[]) => {
      return mutateAsync(args || calls || []);
    },
    [mutateAsync, calls],
  );

  return {
    send,
    sendAsync,
    ...result,
  };
}
