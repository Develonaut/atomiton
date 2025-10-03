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
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  retries: 1, // Retry failed tests once to handle flakiness

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
