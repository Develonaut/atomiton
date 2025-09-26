import {
  test as base,
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type WorkerFixtures = {
  sharedElectronApp: ElectronApplication;
  sharedElectronPage: Page;
};

// Worker-scoped fixture that launches Electron once per worker
export const test = base.extend<{}, WorkerFixtures>({
  sharedElectronApp: [
    async ({}, use) => {
      console.log(
        "🚀 Launching shared Electron instance (will be reused for all tests in this worker)...",
      );

      const electronMain = path.join(
        __dirname,
        "../../../../apps/desktop/out/main/index.js",
      );

      // Determine if we should show the window
      const isHeaded =
        process.env.HEADED === "true" || process.env.PWDEBUG === "1";
      console.log(
        `🎭 Running in ${isHeaded ? "headed" : "headless"} mode (ELECTRON_E2E_HEADLESS=${!isHeaded})`,
      );

      // Generate unique user data dir for parallel test execution
      const userDataDir = path.join(
        __dirname,
        "../../.test-data",
        `electron-${process.pid}-${Date.now()}`,
      );

      const electronApp = await electron.launch({
        args: [
          electronMain,
          `--user-data-dir=${userDataDir}`, // Unique data dir for parallel execution
          // Add flags to prevent window from showing unless explicitly requested
          ...(isHeaded
            ? []
            : [
                "--no-sandbox", // Required for CI environments
                "--disable-gpu", // Disable GPU acceleration in headless
                "--disable-dev-shm-usage", // Overcome limited resource problems
                "--disable-web-security", // Additional flag for testing
                "--disable-background-timer-throttling", // Prevent throttling
                "--disable-backgrounding-occluded-windows", // Prevent backgrounding
              ]),
        ],
        env: {
          ...process.env,
          NODE_ENV: "test",
          ELECTRON_RENDERER_URL: "http://localhost:5173",
          // Control window visibility - hide by default, show only if HEADED=true
          ELECTRON_E2E_HEADLESS: isHeaded ? "false" : "true",
        },
        timeout: 30000,
      });

      // Wait for initial page load
      const page = await electronApp.firstWindow();
      await page.waitForLoadState("networkidle");
      console.log("✅ Electron app ready for testing");

      await use(electronApp);

      console.log("🧹 Closing shared Electron instance...");
      await electronApp.close();
    },
    { scope: "worker" },
  ],

  sharedElectronPage: async ({ sharedElectronApp }, use, testInfo) => {
    // Get the main window
    const page = await sharedElectronApp.firstWindow();
    await page.waitForLoadState("networkidle");

    // Navigate based on test needs
    if (testInfo.title.includes("debug") || testInfo.file.includes("debug")) {
      await page.goto("http://localhost:5173/debug");
    } else {
      await page.goto("http://localhost:5173");
    }
    await page.waitForLoadState("networkidle");

    await use(page);
  },
});

export { expect } from "@playwright/test";
