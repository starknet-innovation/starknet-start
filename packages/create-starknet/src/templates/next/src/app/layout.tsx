import type { Metadata } from "next";
import { StarknetProvider } from "@/components/providers/starknet-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starknet Start + Next.js",
  description: "A Starknet-ready Next.js app.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-zinc-50 text-zinc-900 antialiased">
        <StarknetProvider>{children}</StarknetProvider>
      </body>
    </html>
  );
}
