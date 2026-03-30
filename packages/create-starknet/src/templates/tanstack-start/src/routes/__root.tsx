import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { StarknetProvider } from '../components/starknet-provider'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Starknet Start + TanStack Start' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <RootDocument>
      <StarknetProvider>
        <Outlet />
      </StarknetProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10 sm:px-8">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Not Found
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          This page does not exist.
        </h1>
      </section>
    </main>
  )
}
