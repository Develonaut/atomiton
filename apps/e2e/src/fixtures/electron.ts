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

      const electronApp = await electron.launch({
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

      const page = await electronApp.firstWindow();
      await page.waitForLoadState("domcontentloaded");

      await use(electronApp);

      await electronApp.close();
    },
    { scope: "worker" },
  ],

  sharedElectronPage: async ({ sharedElectronApp }, use, testInfo) => {
    const page = await sharedElectronApp.firstWindow();
    await page.waitForLoadState("domcontentloaded");

    if (testInfo.title.includes("debug") || testInfo.file.includes("debug")) {
      await page.goto("http://localhost:5173/debug");
    } else {
      await page.goto("http://localhost:5173");
    }
    await page.waitForLoadState("domcontentloaded");

    await use(page);
  },
});

export { expect } from "@playwright/test";
