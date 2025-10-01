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
  electronApp: ElectronApplication;
  electronPage: Page;
};

// Worker-scoped fixture that launches Electron once per worker
export const test = base.extend<{}, WorkerFixtures>({
  electronApp: [
    async ({}, use) => {
      const electronMain = path.join(
        __dirname,
        "../../../../apps/desktop/out/main/index.js",
      );

      const isHeadless =
        process.env.LEFTHOOK === "1" ||
        process.env.CI === "1" ||
        process.env.ELECTRON_E2E_HEADLESS === "true";

      const isHeaded =
        (process.env.HEADED === "true" || process.env.PWDEBUG === "1") &&
        !isHeadless;

      const userDataDir = path.join(
        __dirname,
        "../../.test-data",
        `electron-${process.pid}-${Date.now()}`,
      );

      const app = await electron.launch({
        args: [
          electronMain,
          `--user-data-dir=${userDataDir}`,
          ...(isHeaded ? [] : ["--headless"]),
        ],
        env: {
          ...process.env,
          NODE_ENV: "test",
          ELECTRON_RENDERER_URL: "http://localhost:5173",
        },
        timeout: 30000,
      });

      const page = await app.firstWindow();
      await page.waitForLoadState("domcontentloaded");

      await use(app);

      await app.close();
    },
    { scope: "worker" },
  ],

  electronPage: [
    async ({ electronApp }, use) => {
      const page = await electronApp.firstWindow();
      await page.waitForLoadState("domcontentloaded");

      // Navigate to the debug/nodes page by default for all tests
      // This is the most common starting point for node tests
      await page.goto("http://localhost:5173/debug/nodes");
      await page.waitForLoadState("domcontentloaded");

      await use(page);
    },
    { scope: "worker" },
  ],
});

export { expect } from "@playwright/test";
