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

// Override testDir to use our flattened structure
config.testDir = "./src/tests";

export default config;