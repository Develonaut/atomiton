import { definePlaywrightConfig } from "@atomiton/vite-config/playwright";

/**
 * E2E test configuration for the entire Atomiton application
 * Tests both web client and desktop application
 * @see https://playwright.dev/docs/test-configuration
 */
const config = definePlaywrightConfig({
  baseURL: "http://localhost:5173",
  webServerCommand: "cd ../client && pnpm run dev",
  webServerTimeout: 120000,
});

// Override testDir to use new standardized structure
config.testDir = "./tests";
config.testMatch = "**/*.e2e.ts";

export default config;
