import { expect, test } from "#fixtures/electron";
import { createDesktopLogger } from "@atomiton/logger/desktop";

const logger = createDesktopLogger({ namespace: "E2E:DEBUG-PAGE" });

test.describe("Electron Debug Page (Shared)", () => {
  test.beforeEach(async ({ sharedElectronPage }) => {
    // Navigate to debug route for each test
    await sharedElectronPage.goto("http://localhost:5173#/debug");
    await sharedElectronPage.waitForLoadState("networkidle");
    await sharedElectronPage.waitForTimeout(2000); // Give React time to render
  });

  test("debug page loads and detects desktop wrapper functionality", async ({
    sharedElectronPage,
  }) => {
    logger.info("🚀 Starting debug page E2E test...");

    // Verify we're on the debug page
    const pageContent = await sharedElectronPage.textContent("body");
    expect(pageContent).toContain("Debug");
    logger.info("✅ Debug page loaded");

    // Check for IPC availability through page evaluation
    const ipcInfo = await sharedElectronPage.evaluate(() => {
      return {
        hasElectron: !!(window as any).electron,
        hasAtomitonIPC: !!(window as any).atomitonIPC,
        ipcMethods: (window as any).atomitonIPC
          ? Object.keys((window as any).atomitonIPC).filter(
              (key) => typeof (window as any).atomitonIPC[key] === "function",
            )
          : [],
      };
    });

    expect(ipcInfo.hasElectron).toBe(true);
    expect(ipcInfo.hasAtomitonIPC).toBe(true);
    expect(ipcInfo.ipcMethods).toContain("ping");
    expect(ipcInfo.ipcMethods).toContain("executeNode");
    logger.info("✅ IPC availability and methods detected correctly");
  });

  test("debug page IPC functions work", async ({ sharedElectronPage }) => {
    logger.info("🚀 Testing IPC functions through debug page...");

    // Test IPC functions directly through page evaluation
    logger.info("Testing IPC ping...");
    const pingResult = await sharedElectronPage.evaluate(async () => {
      if ((window as any).atomitonIPC?.ping) {
        return await (window as any).atomitonIPC.ping();
      }
      return null;
    });
    expect(pingResult).toBe("pong");
    logger.info("✅ Ping works");
  });

  test("debug page UI elements are interactive", async ({
    sharedElectronPage,
  }) => {
    logger.info("🚀 Testing debug page UI elements...");

    // Check for debug page specific elements
    const hasDebugContent = await sharedElectronPage.evaluate(() => {
      const bodyText = document.body.textContent || "";
      return (
        bodyText.includes("Debug") ||
        bodyText.includes("IPC") ||
        bodyText.includes("Desktop")
      );
    });
    expect(hasDebugContent).toBe(true);

    logger.info("✅ Debug page UI elements are present");
  });
});
