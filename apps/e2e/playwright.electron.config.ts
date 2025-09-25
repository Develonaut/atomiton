import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/electron",
  testMatch: "**/*.electron.e2e.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
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
      testMatch: "**/*.electron.e2e.ts",
    },
  ],
});
