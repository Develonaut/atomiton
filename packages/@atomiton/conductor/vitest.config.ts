import { defineTestConfig } from "@atomiton/vite-config/vitest";
import { resolve } from "path";

export default defineTestConfig({
  test: {
    testTimeout: 30000,
    exclude: ["node_modules", "dist", ".turbo", "src/__benchmarks__/legacy/**"],
  },
  resolve: {
    alias: {
      "#core": resolve(__dirname, "src/core"),
      "#browser": resolve(__dirname, "src/browser"),
      "#desktop": resolve(__dirname, "src/desktop"),
      "#shared": resolve(__dirname, "src/shared"),
    },
  },
});
