import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const TEST_HTTP_SERVER_URL =
  process.env.TEST_HTTP_SERVER_URL || "http://localhost:8888";
const TEST_HTTP_SERVER_PORT = new URL(TEST_HTTP_SERVER_URL).port || "8888";

/**
 * E2E test configuration for Atomiton Desktop Application
 * Tests client running inside Electron wrapper only
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./src",
  testMatch: "**/*.e2e.ts",
  testIgnore: ["**/.disabled/**", "**/disabled/**"],
  fullyParallel: true, // Enable parallel execution
  // Limited to 3 workers locally to avoid Electron resource contention with dev server.
  // With 6+ workers (default based on CPU cores), multiple Electron instances competing
  // for resources cause intermittent timeouts and failures. Tested 5 consecutive runs
  // with 3 workers - all passed. With 6 workers - flaky failures occur.
  workers: process.env.CI ? 1 : 3,
  timeout: 60000,

  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],

  // Official Playwright webServer configuration
  // Start both client dev server and test HTTP server
  webServer: [
    {
      command: "cd ../.. && pnpm dev:client",
      port: 5173,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: "tsx src/test-http-server.ts",
      port: Number(TEST_HTTP_SERVER_PORT),
      reuseExistingServer: true,
      timeout: 10000,
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
});
