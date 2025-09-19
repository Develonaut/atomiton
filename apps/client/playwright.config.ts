import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./src/__tests__/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["json", { outputFile: "test-results/results.json" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",

    /* Run headless in CI/hooks to avoid opening browser windows */
    headless: !!process.env.CI || !!process.env.HUSKY,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video for all tests to review user journeys - disabled in CI/hooks */
    video: process.env.CI || process.env.HUSKY ? "off" : "on",
  },

  /* Snapshot directory */
  snapshotDir: "./src/__tests__/e2e/snapshots",
  snapshotPathTemplate: "{snapshotDir}/routes/{arg}{ext}",

  /* Configure projects for major browsers and environments */
  projects: [
    // Vite environment for visual snapshots
    {
      name: "vite-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        baseURL: "http://localhost:5173",
      },
      testMatch: ["**/snapshots.spec.ts", "**/capture-reference.spec.ts"],
      snapshotDir: "./src/__tests__/e2e/snapshots/desktop",
      snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
    },
    {
      name: "vite-mobile",
      use: {
        ...devices["Pixel 5"],
        baseURL: "http://localhost:5173",
      },
      testMatch: ["**/snapshots.spec.ts", "**/capture-reference.spec.ts"],
      snapshotDir: "./src/__tests__/e2e/snapshots/mobile",
      snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
    },

    // Default chromium for other tests
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: "**/snapshots.spec.ts",
    },

    // Disabled for faster smoke tests - enable if needed for full testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Server configuration - automatically starts dev server for tests */
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120 * 1000,
  },

  /* Global setup and teardown */
  // globalSetup: require.resolve('./tests/global-setup'),
  // globalTeardown: require.resolve('./tests/global-teardown'),

  /* Test timeout */
  timeout: 30 * 1000,

  /* Expect timeout */
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 5000,

    /* Threshold for visual comparisons */
    toHaveScreenshot: {
      threshold: 0.3,
      animations: "disabled",
      scale: "css",
      caret: "hide",
    },
    toMatchSnapshot: {
      threshold: 0.3,
    },
  },

  /* Folder for test artifacts */
  outputDir: "test-results/",

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // testDir: './tests',
});
