import type { Abi } from "abi-wan-kanabi";
import type { AccountInterface, Call } from "starknet";

import { describe, expect, it, vi } from "vitest";

import { defaultConnector } from "../../test/devnet";
import { act, renderHook, waitFor } from "../../test/react";
import { MockWallet } from "../connectors/mock";
import { UserRejectedRequestError } from "../errors";
import { useAccount } from "./use-account";
import { useConnect } from "./use-connect";
import { useContract } from "./use-contract";
import { useDisconnect } from "./use-disconnect";
import { useNetwork } from "./use-network";
import { useSendTransaction } from "./use-send-transaction";

function useSendTransactionWithConnect() {
  const { chain } = useNetwork();

  const { contract } = useContract({
    abi,
    address: chain.nativeCurrency.address,
  });

  const { address } = useAccount();

  const calls = contract && address ? [contract.populate("transfer", [address, 1n])] : undefined;

  return {
    sendTransaction: useSendTransaction({ calls }),
    connect: useConnect(),
    disconnect: useDisconnect(),
  };
}

function useManualSendTransactionWithConnect() {
  return {
    sendTransaction: useSendTransaction({}),
    connect: useConnect(),
  };
}

function createExecuteWallet() {
  const execute = vi.fn(async () => ({
    transaction_hash: "0x123",
  }));
  const account = {
    address: "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
    execute,
  } as unknown as AccountInterface;

  return {
    execute,
    connector: new MockWallet(
      {
        sepolia: [account],
        mainnet: [account],
      },
      {
        id: "controller",
        name: "Cartridge Controller",
        available: true,
      },
    ),
  };
}

describe("useSendTransaction", () => {
  it("sends a transaction sucessfully", async () => {
    const { result } = renderHook(() => useSendTransactionWithConnect());

    await act(async () => {
      await result.current.connect.connectAsync({
        connector: defaultConnector,
      });
    });

    await act(async () => {
      await result.current.sendTransaction.sendAsync();
    });

    await waitFor(() => {
      expect(result.current.sendTransaction.isSuccess).toBeTruthy();
    });
  });

  it("throws error if user rejects transaction", async () => {
    const { result } = renderHook(() => useSendTransactionWithConnect());

    await act(async () => {
      await result.current.connect.connectAsync({
        connector: defaultConnector,
      });
    });

    defaultConnector.updateOptions({ rejectRequest: true });

    try {
      await act(async () => {
        try {
          await result.current.sendTransaction.sendAsync();
        } catch {}
      });

      await waitFor(() => {
        expect(result.current.sendTransaction.isError).toBeTruthy();
        expect(result.current.sendTransaction.error).toBeInstanceOf(UserRejectedRequestError);
      });
    } finally {
      defaultConnector.updateOptions({ rejectRequest: false });
    }
  });

  it("sends calls passed to sendAsync through the connected wallet", async () => {
    const { connector, execute } = createExecuteWallet();
    const calls: Call[] = [
      {
        contractAddress: "0x123",
        entrypoint: "increase_balance",
        calldata: ["0x1"],
      },
    ];
    const { result } = renderHook(() => useManualSendTransactionWithConnect(), {
      extraWallets: [connector],
    });

    await act(async () => {
      await result.current.connect.connectAsync({ connector });
    });

    let response: unknown;

    await act(async () => {
      response = await result.current.sendTransaction.sendAsync(calls);
    });

    await waitFor(() => {
      expect(result.current.sendTransaction.isSuccess).toBeTruthy();
    });
    expect(response).toEqual({ transaction_hash: "0x123" });
    expect(execute).toHaveBeenCalledWith(calls);
  });
});

const abi = [
  {
    type: "function",
    name: "transfer",
    state_mutability: "external",
    inputs: [
      {
        name: "recipient",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "amount",
        type: "core::integer::u256",
      },
    ],
    outputs: [],
  },
] as const satisfies Abi;
