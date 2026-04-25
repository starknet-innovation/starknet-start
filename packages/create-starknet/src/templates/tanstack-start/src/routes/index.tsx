import { createFileRoute } from "@tanstack/react-router";

import { WalletBar } from "../components/wallet-bar";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-8">
      <section className="space-y-3 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Starknet Start</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          TanStack Start starter wired for Starknet.
        </h1>
        <p className="text-zinc-600">
          This template is ready with Starknet providers, hooks, and wallet connection state.
        </p>
        <WalletBar />
      </section>
    </main>
  );
}
