import { createDesktopLogger } from "@atomiton/logger/desktop";
import { expect, test, _electron as electron } from "@playwright/test";
import { ElectronTestHelper } from "../helpers/electron";
import path from "path";
import { fileURLToPath } from "url";

const logger = createDesktopLogger({ namespace: "E2E:ELECTRON:IPC-HTML" });

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DesktopTestElectronHelper extends ElectronTestHelper {
  async launchWithDesktopTest(): Promise<{ app: any; page: any }> {
    logger.info("Launching Electron application with DESKTOP_TEST mode");

    // Path to the built Electron app
    const desktopPath = path.join(__dirname, "../../../desktop");
    const electronMain = path.join(desktopPath, "out/main/index.js");

    logger.info("Electron paths:", { desktopPath, electronMain });

    // Launch Electron app with DESKTOP_TEST=true to load desktop-test.html
    const app = await electron.launch({
      args: [electronMain],
      executablePath: path.join(desktopPath, "node_modules/.bin/electron"),
      env: {
        ...process.env,
        NODE_ENV: "test",
        DESKTOP_TEST: "true", // This will make the app load desktop-test.html
        CI: "false",
        LEFTHOOK: "false",
      },
      timeout: 30000,
    });

    logger.info(
      "Electron app launched with DESKTOP_TEST=true, waiting for first window",
    );

    // Get the first window
    const page = await app.firstWindow();

    logger.info("First window obtained, waiting for DOM to be ready");

    // Wait for the page to load
    await page.waitForLoadState("domcontentloaded");

    logger.info("Electron app with desktop-test.html loaded");

    return { app, page };
  }
}

test.describe("Electron Desktop Test Page", () => {
  let electronHelper: DesktopTestElectronHelper;

  test.beforeEach(async () => {
    logger.info("Setting up Electron IPC HTML test environment");
    electronHelper = new DesktopTestElectronHelper();
  });

  test.afterEach(async () => {
    logger.info("Cleaning up Electron IPC HTML test environment");
    await electronHelper.close();
  });

  test("desktop-test.html loads and detects desktop wrapper functionality", async () => {
    logger.info("🚀 Starting desktop-test.html E2E test...");

    // Launch Electron app with DESKTOP_TEST=true
    const { app, page } = await electronHelper.launchWithDesktopTest();
    logger.info("✅ Electron app launched with test HTML");

    // Wait for the test page to fully load
    await page.waitForLoadState("networkidle");

    // Verify we're on the test page by checking the title
    const title = await page.textContent("h1");
    expect(title).toContain("Atomiton Desktop Test & Debug");
    logger.info("✅ Desktop test page loaded with correct title");

    // Wait for the status check to complete
    await page.waitForTimeout(1000);

    // Check if IPC was detected as available
    const statusElement = await page.locator("#status");
    const statusText = await statusElement.textContent();
    const statusClass = await statusElement.getAttribute("class");

    expect(statusText).toContain("IPC is available!");
    expect(statusClass).toContain("success");
    logger.info("✅ IPC availability detected correctly on test page");

    // Check that the API list shows our methods
    const apiListElement = await page.locator("#api-list");
    const apiListText = await apiListElement.textContent();

    expect(apiListText).toContain("window.atomitonIPC");
    expect(apiListText).toContain("Methods:");
    expect(apiListText).toContain("ping");
    expect(apiListText).toContain("executeNode");
    expect(apiListText).toContain("storageGet");
    expect(apiListText).toContain("storageSet");
    logger.info("✅ API methods detected correctly");

    // Check that controls are visible (they should be visible when IPC is available)
    const controlsElement = await page.locator("#controls");
    const controlsVisible = await controlsElement.isVisible();
    expect(controlsVisible).toBe(true);
    logger.info("✅ Test controls are visible");
  });

  test("desktop-test.html IPC function tests work", async () => {
    logger.info(
      "🚀 Testing IPC functions through desktop-test.html buttons...",
    );

    const { app, page } = await electronHelper.launchWithDesktopTest();
    await page.waitForLoadState("networkidle");

    // Wait for IPC to be available
    await page.waitForTimeout(1000);

    // Clear the result log for cleaner test results
    await page.evaluate(() => {
      const resultLog = document.getElementById("result-log");
      if (resultLog) resultLog.textContent = "";
    });

    // Test ping button
    logger.info("Testing ping button...");
    await page.click('button:has-text("Test Ping")');

    // Wait for ping result and check logs
    await page.waitForTimeout(1000);
    const logContent = await page.textContent("#result-log");
    expect(logContent).toContain("Testing ping...");
    expect(logContent).toContain("Ping successful");
    logger.info("✅ Ping test button works");

    // Test node execution button
    logger.info("Testing node execution button...");
    await page.click('button:has-text("Test Node Execute")');

    // Wait for node execution result
    await page.waitForTimeout(1000);
    const updatedLogContent = await page.textContent("#result-log");
    expect(updatedLogContent).toContain("Testing node execution...");
    expect(updatedLogContent).toContain("Node execution successful");
    logger.info("✅ Node execution test button works");

    // Test storage button
    logger.info("Testing storage button...");
    await page.click('button:has-text("Test Storage")');

    // Wait for storage result
    await page.waitForTimeout(1000);
    const finalLogContent = await page.textContent("#result-log");
    expect(finalLogContent).toContain("Testing storage...");
    expect(finalLogContent).toContain("Storage set successful");
    expect(finalLogContent).toContain("Storage get successful");
    logger.info("✅ Storage test button works");

    logger.info(
      "🎉 All desktop-test.html button tests completed successfully!",
    );
  });

  test("desktop-test.html environment check function works", async () => {
    logger.info("🚀 Testing environment check functionality...");

    const { app, page } = await electronHelper.launchWithDesktopTest();
    await page.waitForLoadState("networkidle");

    // Get the environment check results directly
    const environmentInfo = await page.evaluate(() => {
      // Simulate the checkEnvironment function
      const apis = [];

      if (typeof window.electron !== "undefined") {
        apis.push("window.electron");
      }

      if (typeof window.atomitonIPC !== "undefined") {
        apis.push("window.atomitonIPC");
        const methods = Object.keys(window.atomitonIPC).filter(
          (key) => typeof window.atomitonIPC[key] === "function",
        );
        apis.push(`Methods: ${methods.join(", ")}`);
      }

      if (
        typeof process !== "undefined" &&
        process.versions &&
        process.versions.electron
      ) {
        apis.push(`Electron version: ${process.versions.electron}`);
        apis.push(`Node version: ${process.versions.node}`);
      }

      return {
        apis,
        hasElectron: typeof window.electron !== "undefined",
        hasAtomitonIPC: typeof window.atomitonIPC !== "undefined",
        electronVersion:
          typeof process !== "undefined" && process.versions
            ? process.versions.electron
            : null,
      };
    });

    // Verify environment detection
    expect(environmentInfo.hasElectron).toBe(true);
    expect(environmentInfo.hasAtomitonIPC).toBe(true);
    expect(environmentInfo.electronVersion).toBeTruthy();
    expect(environmentInfo.apis).toContain("window.electron");
    expect(environmentInfo.apis).toContain("window.atomitonIPC");

    // Check that methods are properly detected
    const methodsLine = environmentInfo.apis.find((line) =>
      line.startsWith("Methods:"),
    );
    expect(methodsLine).toBeTruthy();
    expect(methodsLine).toContain("ping");
    expect(methodsLine).toContain("executeNode");
    expect(methodsLine).toContain("storageGet");
    expect(methodsLine).toContain("storageSet");

    logger.info("✅ Environment check function works correctly");
    logger.info("Environment info:", environmentInfo);
  });
});
