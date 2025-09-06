import { defineConfig, devices } from "@playwright/test";

/**
 * Root-level Playwright configuration for smoke testing all apps
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Visual regression testing
    ignoreHTTPSErrors: true,
    // Snapshot options
    contextOptions: {
      // Reduce animations for consistent snapshots
      reducedMotion: "reduce",
    },
  },

  // Snapshot configuration
  snapshotDir: "./tests/screenshots",
  snapshotPathTemplate:
    "{snapshotDir}/{testFileDir}/{testFileName}-{testName}/{projectName}-{platform}{ext}",

  projects: [
    {
      name: "client",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5173",
      },
    },
    {
      name: "ui",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5174",
      },
    },
    // Desktop app testing requires special setup with Electron
    // Will be added in a future iteration
  ],

  webServer: [
    {
      command: "pnpm --filter @atomiton/client dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "pnpm --filter @atomiton/ui dev",
      url: "http://localhost:5174",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
