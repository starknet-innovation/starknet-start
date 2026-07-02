import { describe, expect, it } from "vitest";

import { tokenAddress } from "../../test/devnet";
import { renderHook } from "../../test/react";
import { useContract } from "./use-contract";

describe("useContract", () => {
  it("returns a contract", async () => {
    const { result } = renderHook(() => useContract({ abi, address: tokenAddress }));

    expect(result.current.contract).toBeDefined();
    expect(result.current.contract?.address).toBe(tokenAddress.toLowerCase());
    expect(result.current.contract?.functions.name).toBeTypeOf("function");
    expect(result.current.contract?.callStatic.name).toBeTypeOf("function");
  });

  it("returns undefined if the address is undefined", async () => {
    const { result } = renderHook(() => useContract({ abi }));

    expect(result.current.contract).toBeUndefined();
  });

  it("returns undefined if the abi is undefined", async () => {
    const { result } = renderHook(() => useContract({ address: tokenAddress }));

    expect(result.current.contract).toBeUndefined();
  });
});

const abi = [
  {
    members: [
      {
        name: "low",
        type: "felt",
      },
      {
        name: "high",
        type: "felt",
      },
    ],
    name: "Uint256",
    type: "struct",
  },
  {
    inputs: [
      {
        name: "name",
        type: "felt",
      },
      {
        name: "symbol",
        type: "felt",
      },
      {
        name: "recipient",
        type: "felt",
      },
    ],
    name: "constructor",
    type: "constructor",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        type: "felt",
      },
    ],
    state_mutability: "view",
    type: "function",
  },
] as const;
