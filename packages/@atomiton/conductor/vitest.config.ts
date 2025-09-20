import { defineTestConfig } from "@atomiton/vite-config/vitest";

export default defineTestConfig({
  test: {
    testTimeout: 30000,
    exclude: ["node_modules", "dist", ".turbo", "src/__benchmarks__/legacy/**"],
  },
});
