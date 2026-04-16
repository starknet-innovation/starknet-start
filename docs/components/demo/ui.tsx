import { StarknetWalletApi } from "@starknet-io/get-starknet-core";
import { useAccount } from "@starknet-start/react";
import { WalletConnectModal } from "@starknet-io/get-starknet-ui";
import stringify from "safe-stable-stringify";
import { DemoContainer } from "../starknet";

export function UI() {
  return (
    <DemoContainer hasWallet={false}>
      <div className="w-full flex justify-end pb-2">
        <WalletConnectModal />
      </div>
      <AccountInner />
    </DemoContainer>
  );
}

function AccountInner() {
  const { address, connector } = useAccount();

  return (
    <div className="flex flex-col gap-4">
      <pre>
        {stringify(
          {
            address: address ?? "Connect wallet first",
            connector:
              connector?.features[StarknetWalletApi].id ??
              "Connect wallet first",
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
