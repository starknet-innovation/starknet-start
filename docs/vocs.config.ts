import ts from "typescript";
import { defineConfig } from "vocs";

import { sidebar } from "./sidebar";
import { docsHosting } from "./site.config.mjs";

export default defineConfig({
  baseUrl: docsHosting.url,
  rootDir: ".",
  title: "Starknet Start",
  description: "React hooks and shared utilities for building Starknet apps.",
  sidebar,
  twoslash: {
    compilerOptions: {
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
  },
  topNav: [
    { text: "Docs", link: "/docs/", match: "/docs" },
    { text: "Demo", link: "/demo", match: "/demo" },
  ],
  vite: {
    ssr: {
      noExternal: ["@starknet-io/get-starknet-ui"],
    },
  },
});
