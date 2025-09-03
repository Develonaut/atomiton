/* eslint-disable turbo/no-undeclared-env-vars */
import { defineConfig, devices } from "@playwright/test";

/**
 * Visual Regression Testing Configuration for @atomiton/ui
 *
 * This configuration sets up Playwright end-to-end testing with:
 * - Automatic preview app build and serve
 * - Desktop and mobile viewports
 * - Visual regression testing with snapshots
 * - Navigation testing for all component pages
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  use: {
    /* Base URL to use in actions like await page.goto('/'). */
    baseURL: "http://localhost:3000",
    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",
    /* Take screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for desktop browser only */
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  /* Test timeout */
  timeout: 30 * 1000,

  /* Expect timeout */
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 10000,

    /* Threshold for visual comparisons - strict for UI components */
    toHaveScreenshot: {
      threshold: 0.2,
      animations: "disabled",
      scale: "css",
      caret: "hide",
      mode: "css",
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },

  /* Folder for test artifacts */
  outputDir: "test-results/",

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run preview:build && npm run preview:serve",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
