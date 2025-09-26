import { definePlaywrightConfig } from "@atomiton/vite-config/playwright";

/**
 * E2E test configuration for the entire Atomiton application
 * Tests both web client and desktop application
 * @see https://playwright.dev/docs/test-configuration
 */
const config = definePlaywrightConfig({
  baseURL: "http://localhost:5173",
  webServerCommand: "cd ../.. && pnpm dev",
  webServerTimeout: 120000,
});

// Override testDir to use new standardized structure
config.testDir = "./tests";
config.testMatch = "**/*.e2e.ts";
config.testIgnore = ["**/.disabled/**", "**/disabled/**"];

// Configure Electron tests to run with a single worker
config.projects = [
  {
    name: "electron",
    testMatch: "**/electron/**/*.e2e.ts",
    use: {
      ...config.use,
    },
    // Force single worker for Electron tests to share instance
    workers: 1,
    fullyParallel: false,
  },
  {
    name: "chromium",
    testMatch: ["**/*.e2e.ts"],
    testIgnore: [
      "**/electron/**/*.e2e.ts",
      "**/.disabled/**",
      "**/disabled/**",
    ],
    use: {
      ...config.use,
    },
  },
];

export default config;
