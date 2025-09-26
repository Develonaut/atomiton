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
  fullyParallel: false,
  workers: 1,
  timeout: 60000,

  // Official Playwright webServer configuration
  webServer: [
    {
      // Start client server (needed for Electron renderer)
      command: process.env.CI
        ? "pnpm build:client && pnpm --filter @atomiton/client preview --port 5173"
        : "pnpm --filter @atomiton/client dev --port 5173",
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      // Build desktop app (Electron main process)
      command: process.env.CI
        ? "pnpm build:desktop"
        : "pnpm --filter @atomiton/desktop build",
      port: null, // Desktop doesn't serve on a port
      timeout: 180000,
    },
  ],

  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: {
      mode: "retain-on-failure",
      size: { width: 1280, height: 720 },
    },
  },

  projects: [
    {
      name: "electron",
      testMatch: "**/electron/**/*.e2e.ts",
      use: {
        // Electron-specific configuration
      },
    },
  ],
});
