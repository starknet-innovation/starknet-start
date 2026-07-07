import { ModuleResolutionKind } from "typescript";
import { defineConfig } from "vocs/config";

import { sidebar } from "./sidebar";
import { docsHosting } from "./site.config.mjs";

const basePath =
  (globalThis as { process?: { env?: { GITHUB_PAGES_BASE_PATH?: string } } }).process?.env?.GITHUB_PAGES_BASE_PATH ||
  "/";
const baseUrl = basePath === "/" ? docsHosting.url : new URL(docsHosting.url).origin;

export default defineConfig({
  basePath,
  baseUrl,
  rootDir: ".",
  srcDir: ".",
  checkDeadlinks: "warn",
  renderStrategy: "full-static",
  title: "Starknet Start",
  description: "React hooks and shared utilities for building Starknet apps.",
  sidebar,
  twoslash: {
    twoslashOptions: {
      compilerOptions: {
        moduleResolution: ModuleResolutionKind.Bundler,
      },
    },
  },
  topNav: [
    { text: "Docs", link: "/docs/", match: "/docs" },
    { text: "Demo", link: "/demo", match: "/demo" },
  ],
});
