import type { Address } from "@starknet-start/chains";
import type { AccountInterface } from "starknet";

import React, { useContext } from "react";

const AccountContext = React.createContext<{
  account: AccountInterface | undefined;
  address: Address | undefined;
}>({
  account: undefined,
  address: undefined,
});

export function useStarknetAccount() {
  const { account, address } = useContext(AccountContext);
  return { account, address };
}

export function AccountProvider({
  address,
  account,
  children,
}: {
  address?: Address;
  account?: AccountInterface;
  children: React.ReactNode;
}) {
  return <AccountContext.Provider value={{ account, address }}>{children}</AccountContext.Provider>;
}
