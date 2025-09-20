import { defineTestConfig } from "@atomiton/vite-config/vitest";

export default defineTestConfig({
  test: {
    globals: true,
    testTimeout: 10000,
    exclude: [
      "node_modules",
      "out",
      ".turbo",
      "src/**/*.main.{test,spec}.{js,ts}",
      "src/**/*.int.test.{ts,tsx}",
      "src/**/*.int.{ts,tsx}",
      "src/__tests__/e2e/**",
    ],
    setupFiles: ["src/__tests__/test-setup.ts"],
  },
});
