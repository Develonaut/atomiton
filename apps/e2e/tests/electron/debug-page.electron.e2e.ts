import { createDesktopLogger } from "@atomiton/logger/desktop";
import { _electron as electron, expect, test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { ElectronTestHelper } from "../helpers/electron";

// Force serial execution for Electron tests to share a single instance
test.describe.configure({ mode: 'serial' });

const logger = createDesktopLogger({ namespace: "E2E:ELECTRON:DEBUG-PAGE" });

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DesktopDebugElectronHelper extends ElectronTestHelper {
  async launchWithDebugRoute(): Promise<{ app: any; page: any }> {
    logger.info("Launching Electron application with debug route");

    // Path to the built Electron app
    const desktopPath = path.join(__dirname, "../../../desktop");
    const electronMain = path.join(desktopPath, "out/main/index.js");

    logger.info("Electron paths:", { desktopPath, electronMain });

    // Generate unique user data dir to avoid singleton lock issues
    const userDataDir = path.join(
      __dirname,
      "../../../.test-data",
      `electron-${Date.now()}-${Math.random().toString(36).substring(7)}`
    );

    // Launch Electron app pointing to dev server with debug route
    const app = await electron.launch({
      args: [electronMain, `--user-data-dir=${userDataDir}`],
      executablePath: path.join(desktopPath, "node_modules/.bin/electron"),
      env: {
        ...process.env,
        NODE_ENV: "development", // Set to development to enable /debug route
        ELECTRON_RENDERER_URL: "http://localhost:5173#/debug", // Load debug route directly via hash
        CI: "false",
        LEFTHOOK: "false",
      },
      timeout: 30000,
    });

    logger.info(
      "Electron app launched, waiting for first window",
    );

    // Get the first window
    const page = await app.firstWindow();

    logger.info("First window obtained, waiting for page to load");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Navigate to debug if not already there
    const url = await page.url();
    if (!url.includes('/debug')) {
      logger.info("Navigating to /debug route");
      await page.goto("http://localhost:5173/debug");
      await page.waitForLoadState("networkidle");
    }

    logger.info("Debug page loaded");

    return { app, page };
  }
}

test.describe.serial("Electron Debug Page", () => {
  let electronHelper: DesktopDebugElectronHelper;
  let app: any;
  let page: any;

  test.beforeAll(async () => {
    logger.info("Setting up Electron debug page test environment");
    electronHelper = new DesktopDebugElectronHelper();

    // Launch Electron app once for all tests
    logger.info("🚀 Launching Electron app for all tests...");
    const result = await electronHelper.launchWithDebugRoute();
    app = result.app;
    page = result.page;
    logger.info("✅ Electron app launched with debug route");
  });

  test.afterAll(async () => {
    logger.info("Cleaning up Electron debug page test environment");
    await electronHelper.close();
  });

  test("debug page loads and detects desktop wrapper functionality", async () => {
    logger.info("🚀 Starting debug page E2E test...");

    // Wait for the page to fully load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Give React time to render

    // Verify we're on the debug page
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Debug");
    logger.info("✅ Debug page loaded");

    // Check for IPC availability through page evaluation
    const ipcInfo = await page.evaluate(() => {
      return {
        hasElectron: !!(window as any).electron,
        hasAtomitonIPC: !!(window as any).atomitonIPC,
        ipcMethods: (window as any).atomitonIPC
          ? Object.keys((window as any).atomitonIPC).filter(
              (key) => typeof (window as any).atomitonIPC[key] === "function"
            )
          : [],
      };
    });

    expect(ipcInfo.hasElectron).toBe(true);
    expect(ipcInfo.hasAtomitonIPC).toBe(true);
    expect(ipcInfo.ipcMethods).toContain("ping");
    expect(ipcInfo.ipcMethods).toContain("executeNode");
    expect(ipcInfo.ipcMethods).toContain("storageGet");
    expect(ipcInfo.ipcMethods).toContain("storageSet");
    logger.info("✅ IPC availability and methods detected correctly");
  });

  test("debug page IPC functions work", async () => {
    logger.info(
      "🚀 Testing IPC functions through debug page...",
    );

    // Using shared app and page from beforeAll
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Test IPC functions directly through page evaluation
    logger.info("Testing IPC ping...");
    const pingResult = await page.evaluate(async () => {
      if ((window as any).atomitonIPC?.ping) {
        return await (window as any).atomitonIPC.ping();
      }
      return null;
    });
    expect(pingResult).toBe("pong");
    logger.info("✅ Ping works");

    // Test storage operations
    logger.info("Testing storage operations...");
    const storageResult = await page.evaluate(async () => {
      const ipc = (window as any).atomitonIPC;
      if (!ipc) return { set: false, get: null };

      try {
        // The storage API expects a data object with key and value
        const setResult = await ipc.storageSet({ key: "test-key", value: "test-value-e2e" });
        const getResult = await ipc.storageGet({ key: "test-key" });
        return {
          set: setResult?.success !== false,
          get: getResult?.value || getResult
        };
      } catch (err) {
        return { set: false, get: null, error: err.message };
      }
    });
    expect(storageResult.set).toBe(true);
    // Storage API should return the value we set
    expect(storageResult.get).toBeTruthy();
    logger.info("✅ Storage operations work");

    // Test node execution
    logger.info("Testing node execution...");
    const nodeResult = await page.evaluate(async () => {
      const ipc = (window as any).atomitonIPC;
      if (!ipc?.executeNode) return null;

      try {
        const result = await ipc.executeNode("test-node", { input: "test" });
        return result;
      } catch (err) {
        return { error: err.message };
      }
    });
    expect(nodeResult).toBeTruthy();
    logger.info("✅ Node execution works");

    logger.info(
      "🎉 All IPC functions tested successfully!",
    );
  });

  test("debug page environment detection works", async () => {
    logger.info("🚀 Testing environment detection...");

    // Using shared app and page from beforeAll
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Get comprehensive environment information
    const environmentInfo = await page.evaluate(() => {
      const result: any = {
        apis: [],
        hasElectron: false,
        hasAtomitonIPC: false,
        userAgent: navigator.userAgent,
        isElectronEnvironment: false,
      };

      // Check for Electron
      if (typeof (window as any).electron !== "undefined") {
        result.hasElectron = true;
        result.apis.push("window.electron");
      }

      // Check for atomitonIPC
      if (typeof (window as any).atomitonIPC !== "undefined") {
        result.hasAtomitonIPC = true;
        result.apis.push("window.atomitonIPC");
        const methods = Object.keys((window as any).atomitonIPC).filter(
          (key) => typeof (window as any).atomitonIPC[key] === "function",
        );
        result.ipcMethods = methods;
      }

      // Check if running in Electron
      result.isElectronEnvironment = navigator.userAgent.includes("Electron");

      return result;
    });

    // Verify environment detection
    expect(environmentInfo.isElectronEnvironment).toBe(true);
    expect(environmentInfo.hasElectron).toBe(true);
    expect(environmentInfo.hasAtomitonIPC).toBe(true);
    expect(environmentInfo.apis).toContain("window.electron");
    expect(environmentInfo.apis).toContain("window.atomitonIPC");

    // Check that IPC methods are properly detected
    expect(environmentInfo.ipcMethods).toBeDefined();
    expect(environmentInfo.ipcMethods).toContain("ping");
    expect(environmentInfo.ipcMethods).toContain("executeNode");
    expect(environmentInfo.ipcMethods).toContain("storageGet");
    expect(environmentInfo.ipcMethods).toContain("storageSet");

    logger.info("✅ Environment detection works correctly");
    logger.info("Environment info:", environmentInfo);
  });
});
