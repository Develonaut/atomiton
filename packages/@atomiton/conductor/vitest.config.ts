import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    include: ["src/**/*.{test,spec}.{js,ts,tsx}", "src/**/*.bench.{js,ts,tsx}"],
    exclude: ["node_modules", "dist", ".turbo", "src/__benchmarks__/legacy/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "src/__benchmarks__/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
      ],
    },
    benchmark: {
      include: ["src/**/*.bench.{js,ts,tsx}"],
      exclude: ["node_modules"],
      reporters: ["verbose"],
    },
  },
});
