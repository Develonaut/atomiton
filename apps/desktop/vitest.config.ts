import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10000,
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: [
      "node_modules",
      "out",
      ".turbo",
      "src/**/*.main.{test,spec}.{js,ts}",
      "src/__tests__/e2e/**",
    ],
    setupFiles: ["src/__tests__/test-setup.ts"],
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
