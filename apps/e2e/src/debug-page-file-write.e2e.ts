import { expect, test } from "#fixtures/electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("Debug Page File Write Functionality", () => {
  // Use a predictable test output path
  const testOutputDir = "/tmp/atomiton-e2e-test";
  const testFilePath = path.join(testOutputDir, "debug-test-output.txt");

  test.beforeAll(async () => {
    // Create test output directory
    await fs.promises.mkdir(testOutputDir, { recursive: true });
    console.log(`📁 Created test output directory: ${testOutputDir}`);
  });

  test.afterAll(async () => {
    // Clean up test output directory
    try {
      await fs.promises.rm(testOutputDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up test output directory: ${testOutputDir}`);
    } catch (error) {
      console.warn(`⚠️ Failed to clean up test directory: ${error}`);
    }
  });

  test.beforeEach(async ({ sharedElectronPage }) => {
    // Clean up any existing test file
    try {
      await fs.promises.unlink(testFilePath);
    } catch {
      // File doesn't exist, that's fine
    }

    // Navigate to debug page
    await sharedElectronPage.goto("http://localhost:5173/debug");
    await sharedElectronPage.waitForLoadState("networkidle");
    await sharedElectronPage.waitForTimeout(2000); // Give React time to render
  });

  test("executes node and writes file to .tmp directory", async ({
    sharedElectronPage,
  }) => {
    console.log(
      "🚀 Testing file write functionality with default .tmp path...",
    );

    // Look for the "Test Node" button and click it
    const testNodeButton = sharedElectronPage.locator(
      'button:has-text("Test Node")',
    );
    await expect(testNodeButton).toBeVisible({ timeout: 10000 });

    console.log("🔘 Clicking Test Node button...");

    // Click the test button
    await testNodeButton.click();
    console.log("✅ Test Node button clicked");

    // Wait for the node execution to complete
    await sharedElectronPage.waitForTimeout(5000); // Give time for file operations

    // Check for the file in the .tmp directory (default behavior)
    const createdFilePath = ".tmp/debug-test-output.txt";

    console.log(`🔍 Checking if file exists at: ${createdFilePath}`);
    const fileExists = await fs.promises
      .access(createdFilePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);
    console.log("✅ File was created successfully");

    // Verify file contents
    const fileContent = await fs.promises.readFile(createdFilePath, "utf8");
    expect(fileContent).toContain("Debug test executed at");
    expect(fileContent).toContain("Test data: Hello from Debug Page!");
    console.log("✅ File content is correct");

    // Check that the content includes a timestamp (ISO format)
    const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
    expect(fileContent).toMatch(timestampRegex);
    console.log("✅ File contains valid timestamp");

    // Verify the test results appear in the UI
    const successMessage = sharedElectronPage.locator(
      "text=Node executed successfully",
    );
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    console.log("✅ Success message displayed in UI");
  });

  test("shows IPC connection and node execution capability", async ({
    sharedElectronPage,
  }) => {
    console.log("🚀 Testing IPC connection and basic functionality...");

    // Check for IPC availability
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
    console.log("✅ IPC and executeNode method available");

    // Test basic IPC ping
    const pingResult = await sharedElectronPage.evaluate(async () => {
      if ((window as any).atomitonIPC?.ping) {
        return await (window as any).atomitonIPC.ping();
      }
      return null;
    });
    expect(pingResult).toBe("pong");
    console.log("✅ IPC ping works");
  });

  test("handles node execution progress events", async ({
    sharedElectronPage,
  }) => {
    console.log("🚀 Testing node execution progress tracking...");

    // Set up progress tracking
    let progressEvents: any[] = [];
    await sharedElectronPage.evaluate(() => {
      (window as any).__progressEvents = [];

      // Listen for progress events
      if ((window as any).atomitonIPC?.onNodeProgress) {
        (window as any).atomitonIPC.onNodeProgress((progress: any) => {
          (window as any).__progressEvents.push(progress);
        });
      }
    });

    // Click the test button
    const testNodeButton = sharedElectronPage.locator(
      'button:has-text("Test Node")',
    );
    await testNodeButton.click();

    // Wait for execution
    await sharedElectronPage.waitForTimeout(3000);

    // Check if progress events were received
    progressEvents = await sharedElectronPage.evaluate(() => {
      return (window as any).__progressEvents || [];
    });

    expect(progressEvents.length).toBeGreaterThan(0);
    console.log(`✅ Received ${progressEvents.length} progress events`);

    // Verify progress event structure
    if (progressEvents.length > 0) {
      const firstEvent = progressEvents[0];
      expect(firstEvent).toHaveProperty("id");
      expect(firstEvent).toHaveProperty("nodeId");
      expect(firstEvent).toHaveProperty("progress");
      console.log("✅ Progress events have correct structure");
    }
  });
});
