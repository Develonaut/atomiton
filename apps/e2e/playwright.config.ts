import { defineConfig } from "@playwright/test";

/**
 * E2E test configuration for Atomiton Desktop Application
 * Tests client running inside Electron wrapper only
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.e2e.ts",
  testIgnore: ["**/.disabled/**", "**/disabled/**"],
  fullyParallel: true, // Enable parallel execution
  workers: process.env.CI ? 1 : undefined, // Use default workers locally, 1 in CI
  timeout: 60000,

  // Official Playwright webServer configuration
  // Only start the client dev server (not desktop) - tests will launch Electron
  webServer: {
    command: "cd ../.. && pnpm dev:client",
    port: 5173,
    reuseExistingServer: true,
    timeout: 120000,
  },

  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: {
      mode: "retain-on-failure",
      size: { width: 1280, height: 720 },
    },
  },
});
