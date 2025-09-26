import { createDesktopLogger } from "@atomiton/logger/desktop";
import {
  _electron as electron,
  type ElectronApplication,
  type Page,
} from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const logger = createDesktopLogger({ namespace: "E2E:ELECTRON" });

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ElectronTestHelper {
  private app: ElectronApplication | null = null;
  private page: Page | null = null;

  async launch(
    options: { headless?: boolean } = {},
  ): Promise<{ app: ElectronApplication; page: Page }> {
    const isHeadless = options.headless ?? true; // Default to headless for tests

    logger.info("Launching Electron application for testing", {
      headless: isHeadless,
    });

    // Navigate to desktop from e2e/tests/helpers (4 levels up to root, then into apps/desktop)
    const electronMain = path.join(
      __dirname,
      "../../../../apps/desktop/out/main/index.js",
    );

    logger.info("Electron main path:", { electronMain });

    // Use Playwright's built-in Electron support
    this.app = await electron.launch({
      args: [electronMain],
      env: {
        ...process.env,
        NODE_ENV: "test",
        ELECTRON_RENDERER_URL: "http://localhost:5173", // Client server managed by webServer
        CI: "false",
        LEFTHOOK: "false",
        // Control window visibility via environment variable
        ELECTRON_E2E_HEADLESS: isHeadless ? "true" : "false",
      },
      timeout: 30000,
    });

    logger.info("Electron app launched, waiting for first window");

    // Get the first window
    this.page = await this.app.firstWindow();

    logger.info("First window obtained, waiting for load");

    // Wait for the app to load
    await this.page.waitForLoadState("networkidle");

    logger.info("Electron app fully loaded");

    return { app: this.app, page: this.page };
  }

  async close(): Promise<void> {
    if (this.app) {
      logger.info("Closing Electron application");
      await this.app.close();
      this.app = null;
      this.page = null;
    }
  }

  async waitForElectronAPI(): Promise<void> {
    if (!this.page) throw new Error("Page not available");

    logger.info("Waiting for window.electron API to be available");

    // Wait for window.electron to be available
    await this.page.waitForFunction(
      () => {
        return (
          typeof (window as any).electron !== "undefined" &&
          typeof (window as any).electron.ipcRenderer !== "undefined"
        );
      },
      { timeout: 10000 },
    );

    logger.info("window.electron API is available");
  }

  async verifyIPCBridge(): Promise<boolean> {
    if (!this.page) throw new Error("Page not available");

    return await this.page.evaluate(() => {
      const hasElectron = typeof (window as any).electron !== "undefined";
      const hasIPC =
        hasElectron &&
        typeof (window as any).electron.ipcRenderer !== "undefined";
      return hasElectron && hasIPC;
    });
  }
}
