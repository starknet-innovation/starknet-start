import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/hooks/index.ts"],
  hash: false,
  sourcemap: true,
  dts: true,
  clean: true,
  format: ["esm"],
});
