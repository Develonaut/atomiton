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
    const successMessage = sharedElectronPage.locator(
      "text=Node executed successfully",
    );
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test("shows IPC connection and node execution capability", async ({
    sharedElectronPage,
  }) => {
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
    expect(ipcInfo.ipcMethods).toContain("executeNode");
    const pingResult = await sharedElectronPage.evaluate(async () => {
      if ((window as any).atomitonIPC?.ping) {
        return await (window as any).atomitonIPC.ping();
      }
      return null;
    });
    expect(pingResult).toBe("pong");
  });

  test("handles node execution progress events", async ({
    sharedElectronPage,
  }) => {
    let progressEvents: any[] = [];
    await sharedElectronPage.evaluate(() => {
      (window as any).__progressEvents = [];

      if ((window as any).atomitonIPC?.onNodeProgress) {
        (window as any).atomitonIPC.onNodeProgress((progress: any) => {
          (window as any).__progressEvents.push(progress);
        });
      }
    });

    const testNodeButton = sharedElectronPage.locator(
      'button:has-text("Test Node")',
    );
    await testNodeButton.click();

    await sharedElectronPage.waitForTimeout(3000);
    progressEvents = await sharedElectronPage.evaluate(() => {
      return (window as any).__progressEvents || [];
    });

    expect(progressEvents.length).toBeGreaterThan(0);
    expect(progressEvents.length).toBeGreaterThan(0);
    if (progressEvents.length > 0) {
      const firstEvent = progressEvents[0];
      expect(firstEvent).toHaveProperty("id");
      expect(firstEvent).toHaveProperty("nodeId");
      expect(firstEvent).toHaveProperty("progress");
    }
  });
});
