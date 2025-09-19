import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "main-process",
    globals: true,
    environment: "node",
    testTimeout: 10000,
    include: ["src/**/*.main.{test,spec}.{js,ts}"],
    exclude: ["node_modules", "out", ".turbo"],
    setupFiles: ["src/__tests__/setup/main-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "out/",
      ],
    },
  },
});
