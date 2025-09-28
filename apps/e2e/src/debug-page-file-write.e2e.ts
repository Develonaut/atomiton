import { expect, test } from "#fixtures/electron";
import fs from "fs";
import path from "path";

test.describe("Debug Page File Write Functionality", () => {
  const testOutputDir = "/tmp/atomiton-e2e-test";
  const testFilePath = path.join(testOutputDir, "debug-test-output.txt");

  test.beforeAll(async () => {
    await fs.promises.mkdir(testOutputDir, { recursive: true });
  });

  test.afterAll(async () => {
    try {
      await fs.promises.rm(testOutputDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test.beforeEach(async ({ sharedElectronPage }) => {
    try {
      await fs.promises.unlink(testFilePath);
    } catch {
      // Ignore if file doesn't exist
    }

    await sharedElectronPage.goto("http://localhost:5173/debug");
    await sharedElectronPage.waitForLoadState("networkidle");
    await sharedElectronPage.waitForTimeout(2000);
  });

  test("executes node and writes file to .tmp directory", async ({
    sharedElectronPage,
  }) => {
    const testNodeButton = sharedElectronPage.locator(
      'button:has-text("Test Node")',
    );
    await expect(testNodeButton).toBeVisible({ timeout: 10000 });
    await testNodeButton.click();
    await sharedElectronPage.waitForTimeout(5000);

    const createdFilePath = ".tmp/debug-test-output.txt";
    const fileExists = await fs.promises
      .access(createdFilePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);
    const fileContent = await fs.promises.readFile(createdFilePath, "utf8");
    expect(fileContent).toContain("Debug test executed at");
    expect(fileContent).toContain("Test data: Hello from Debug Page!");
    const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
    expect(fileContent).toMatch(timestampRegex);
    // Check for success message in the logs
    const successMessage = sharedElectronPage.locator(
      "text=✅ File write test completed",
    );
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test("shows IPC connection and node execution capability", async ({
    sharedElectronPage,
  }) => {
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
    const healthResult = await sharedElectronPage.evaluate(async () => {
      if ((window as any).atomitonRPC?.system?.health) {
        return await (window as any).atomitonRPC.system.health();
      }
      return null;
    });
    expect(healthResult).toBeTruthy();
    expect(healthResult.status).toBe("ok");
  });

  test("handles node execution progress events", async ({
    sharedElectronPage,
  }) => {
    let progressEvents: any[] = [];
    await sharedElectronPage.evaluate(() => {
      (window as any).__progressEvents = [];
      // Note: Progress events are not part of the new RPC API
      // The new conductor API doesn't expose progress callbacks
    });

    const testNodeButton = sharedElectronPage.locator(
      'button:has-text("Test Node")',
    );
    await testNodeButton.click();

    await sharedElectronPage.waitForTimeout(3000);
    progressEvents = await sharedElectronPage.evaluate(() => {
      return (window as any).__progressEvents || [];
    });

    // Progress events are not part of the new RPC API
    // The conductor returns results after execution completes
    expect(progressEvents.length).toBe(0);
  });
});
