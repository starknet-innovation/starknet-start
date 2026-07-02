import { WalletBar } from "@/components/starknet/wallet-bar";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-8">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Starknet Start</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Next.js starter wired for Starknet.</h1>
        <p className="max-w-2xl text-zinc-600">
          This project uses the latest Starknet Start packages and includes a wallet connect example out of the box.
        </p>
      </section>

      <WalletBar />

      <section className="rounded-xl border border-black/10 bg-white p-4 text-sm text-zinc-700 shadow-sm">
        <p className="font-semibold text-zinc-900">Next steps</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Edit this page at <code>src/app/page.tsx</code>.
          </li>
          <li>
            Customize the provider in
            <code> src/components/providers/starknet-provider.tsx</code>.
          </li>
          <li>
            Read docs at
            <a className="ml-1 underline" href="https://starknet-innovation.github.io/starknet-start/">
              Starknet Start
            </a>
            .
          </li>
        </ul>
      </section>
    </main>
  );
}
