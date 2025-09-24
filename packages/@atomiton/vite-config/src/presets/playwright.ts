import { defineConfig, devices } from "@playwright/test";

export type PlaywrightPresetOptions = {
  /**
   * Base URL for tests
   * @default "http://localhost:5173"
   */
  baseURL?: string;

  /**
   * Test timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Expect timeout in milliseconds
   * @default 5000
   */
  expectTimeout?: number;

  /**
   * Screenshot threshold for visual comparisons
   * @default 0.3
   */
  threshold?: number;

  /**
   * Enable video recording
   * @default "on" in dev, "off" in CI/hooks
   */
  video?: "on" | "off" | "retain-on-failure";

  /**
   * Web server command to start dev environment
   * @default "pnpm run dev"
   */
  webServerCommand?: string;

  /**
   * Web server timeout in milliseconds
   * @default 120000
   */
  webServerTimeout?: number;
};

/**
 * Creates a shared Playwright configuration with standard patterns
 *
 * Features:
 * - Runs headless by default, set PLAYWRIGHT_HEADED=true for browser windows
 * - Standard test file patterns matching Vitest conventions
 * - Consistent snapshot and video settings
 * - Built-in web server management
 */
export function definePlaywrightConfig(options: PlaywrightPresetOptions = {}) {
  const {
    baseURL = "http://localhost:5173",
    timeout = 30000,
    expectTimeout = 5000,
    threshold = 0.3,
    video,
    webServerCommand = "pnpm run dev",
    webServerTimeout = 120000,
  } = options;

  const isCI = !!process.env.CI;
  const isHeaded = !!process.env.PLAYWRIGHT_HEADED;
  const isHeadless = !isHeaded;

  return defineConfig({
    testDir: "./src/__tests__",
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: [["html"], ["json", { outputFile: "test-results/results.json" }]],

    use: {
      baseURL,
      headless: isHeadless,
      trace: "on-first-retry",
      screenshot: "only-on-failure",
      video: video || (isHeadless ? "off" : "on"),
    },

    projects: [
      // Desktop app integration tests (Electron)
      {
        name: "desktop",
        testMatch: "**/*.desktop.integration.test.ts",
        fullyParallel: false,
        workers: 1,
      },

      // Visual snapshots for desktop
      {
        name: "vite-desktop",
        use: {
          ...devices["Desktop Chrome"],
          viewport: { width: 1920, height: 1080 },
          baseURL,
        },
        testMatch: ["**/snapshots.spec.ts", "**/capture-reference.spec.ts"],
        snapshotDir: "./src/__tests__/e2e/snapshots/desktop",
        snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
      },

      // Visual snapshots for mobile
      {
        name: "vite-mobile",
        use: {
          ...devices["Pixel 5"],
          baseURL,
        },
        testMatch: ["**/snapshots.spec.ts", "**/capture-reference.spec.ts"],
        snapshotDir: "./src/__tests__/e2e/snapshots/mobile",
        snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
      },

      // Standard chromium tests (excludes only snapshots and benchmarks, includes integration tests)
      {
        name: "chromium",
        use: { ...devices["Desktop Chrome"] },
        testIgnore: [
          "**/snapshots.spec.ts",
          "**/*.bench.{ts,tsx,js,jsx}",
          "**/benchmark/**",
        ],
      },
    ],

    webServer: {
      command: webServerCommand,
      url: baseURL,
      reuseExistingServer: !isCI,
      stdout: "ignore",
      stderr: "pipe",
      timeout: webServerTimeout,
    },

    timeout,
    expect: {
      timeout: expectTimeout,
      toHaveScreenshot: {
        threshold,
        animations: "disabled",
        scale: "css",
        caret: "hide",
      },
      toMatchSnapshot: {
        threshold,
      },
    },

    outputDir: "test-results/",
    snapshotDir: "./src/__tests__/e2e/snapshots",
    snapshotPathTemplate: "{snapshotDir}/routes/{arg}{ext}",
  });
}
