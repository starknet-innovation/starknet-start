import { StarknetWalletApi } from "@starknet-io/get-starknet-core";
import { useAccount, useConnect, useDisconnect, useNetwork } from "@starknet-start/react";

export function WalletBar() {
  const { address } = useAccount();

  if (address) {
    return <ConnectedWallet address={address} />;
  }

  return <ConnectWallet />;
}

function ConnectedWallet({ address }: { address: `0x${string}` }) {
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();

  return (
    <section className="w-full rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-900">Connected wallet</p>
      <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
        <p className="truncate" title={address}>
          {address.slice(0, 12)}...{address.slice(-8)}
        </p>
        <p className="text-zinc-500">
          {chain.name} ({chain.network})
        </p>
      </div>
      <button
        type="button"
        onClick={() => disconnect()}
        className="mt-4 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Disconnect
      </button>
    </section>
  );
}

function ConnectWallet() {
  const { connectAsync, connectors, status } = useConnect();

  if (connectors.length === 0) {
    return (
      <section className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <p className="text-sm font-semibold text-amber-900">No wallet available</p>
        <p className="mt-2 text-sm text-amber-800">
          No Starknet wallet was detected in this browser. Install one like Ready Wallet (Formerly Argent) or Braavos,
          then refresh this page.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-900">Connect a Starknet wallet</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.features[StarknetWalletApi].id}
            type="button"
            onClick={async () => {
              await connectAsync({ connector });
            }}
            disabled={status === "pending"}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connector.name}
          </button>
        ))}
      </div>
    </section>
  );
}
