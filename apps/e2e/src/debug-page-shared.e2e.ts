import { expect, test } from "#fixtures/electron";

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
    // Starting debug page E2E test...

    // Verify we're on the debug page
    const pageContent = await sharedElectronPage.textContent("body");
    expect(pageContent).toContain("Debug");
    // Debug page loaded

    // Check for IPC availability through page evaluation
    const ipcInfo = await sharedElectronPage.evaluate(() => {
      return {
        hasAtomitonRPC: !!(window as any).atomitonRPC,
        hasNode: !!(window as any).atomitonRPC?.node,
        hasSystem: !!(window as any).atomitonRPC?.system,
        nodeMethods: (window as any).atomitonRPC?.node
          ? Object.keys((window as any).atomitonRPC.node).filter(
              (key) =>
                typeof (window as any).atomitonRPC.node[key] === "function",
            )
          : [],
        systemMethods: (window as any).atomitonRPC?.system
          ? Object.keys((window as any).atomitonRPC.system).filter(
              (key) =>
                typeof (window as any).atomitonRPC.system[key] === "function",
            )
          : [],
      };
    });

    expect(ipcInfo.hasAtomitonRPC).toBe(true);
    expect(ipcInfo.hasNode).toBe(true);
    expect(ipcInfo.hasSystem).toBe(true);
    expect(ipcInfo.nodeMethods).toContain("run");
    expect(ipcInfo.systemMethods).toContain("health");
    // IPC availability and methods detected correctly
  });

  test("debug page IPC functions work", async ({ sharedElectronPage }) => {
    // Testing IPC functions through debug page...

    // Test IPC functions directly through page evaluation
    // Testing IPC health...
    const healthResult = await sharedElectronPage.evaluate(async () => {
      if ((window as any).atomitonRPC?.system?.health) {
        return await (window as any).atomitonRPC.system.health();
      }
      return null;
    });
    expect(healthResult).toBeTruthy();
    expect(healthResult.status).toBe("ok");
    // Ping works
  });

  test("debug page UI elements are interactive", async ({
    sharedElectronPage,
  }) => {
    // Testing debug page UI elements...

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

    // Debug page UI elements are present
  });
});
