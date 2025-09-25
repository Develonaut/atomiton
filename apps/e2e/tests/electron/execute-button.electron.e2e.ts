import { test, expect } from "@playwright/test";
import { readFile, unlink, mkdir } from "fs/promises";
import { dirname } from "path";
import { ElectronTestHelper } from "../helpers/electron";
import { createDesktopLogger } from "@atomiton/logger/desktop";

const logger = createDesktopLogger({ namespace: "E2E:ELECTRON:EXECUTE" });

// Use fixed test output path for E2E tests
const TEST_FILE_PATH =
  "/Users/Ryan/Desktop/atomiton-e2e-test/execute-test-result.txt";
const EXPECTED_CONTENT = "Execute button test successful!";

test.describe("Electron Execute Button", () => {
  let electronHelper: ElectronTestHelper;

  test.beforeEach(async () => {
    logger.info("Setting up Electron test environment");
    electronHelper = new ElectronTestHelper();

    // Clean up any existing test file
    try {
      await unlink(TEST_FILE_PATH);
      logger.info("Cleaned up existing test file");
    } catch {
      // File doesn't exist, which is fine
    }
  });

  test.afterEach(async () => {
    logger.info("Cleaning up Electron test environment");
    await electronHelper.close();
  });

  test("execute button works in Electron with IPC", async () => {
    logger.info("🚀 Starting Electron Execute button test...");
    logger.info(`Test file path: ${TEST_FILE_PATH}`);

    // Launch Electron app
    const { app, page } = await electronHelper.launch();

    // Wait for and verify Electron API
    await electronHelper.waitForElectronAPI();

    // Verify we're in Electron environment
    const ipcAvailable = await electronHelper.verifyIPCBridge();
    expect(ipcAvailable).toBe(true);
    logger.info("✅ Electron environment and IPC confirmed");

    // Create a new scene to open the editor
    logger.info("Creating a new scene to access the editor...");

    // Click the Create button
    const createButton = page.locator('button:has-text("Create")');
    await expect(createButton).toBeVisible({ timeout: 15000 });
    await createButton.click();

    // Wait for the editor to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Now look for the Execute button in the toolbar
    logger.info("Looking for Execute button in toolbar...");

    const executeButton = page.locator('[data-testid="execute-button"]');
    await expect(executeButton).toBeVisible({ timeout: 15000 });

    logger.info("🎯 Execute button found, clicking...");

    // Click the Execute button
    await executeButton.click();

    logger.info("⏳ Waiting for file creation via IPC...");

    // Wait for the file to be created by polling the filesystem
    let fileContent: string = "";
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds with 500ms intervals

    while (attempts < maxAttempts) {
      try {
        fileContent = await readFile(TEST_FILE_PATH, "utf8");
        logger.info("✅ File created successfully via IPC!");
        logger.info(`File location: ${TEST_FILE_PATH}`);
        break;
      } catch (error) {
        // File doesn't exist yet, wait and try again
        await page.waitForTimeout(500);
        attempts++;
      }
    }

    // Verify the file was created with the expected content
    if (attempts >= maxAttempts) {
      throw new Error(
        `Test file was not created at ${TEST_FILE_PATH} after ${maxAttempts * 500}ms`,
      );
    }

    expect(fileContent.trim()).toBe(EXPECTED_CONTENT);
    logger.info(
      `🎉 SUCCESS! File created with correct content: "${fileContent.trim()}"`,
    );

    // Take a screenshot for debugging
    const screenshotPath =
      "/Users/Ryan/Desktop/atomiton-e2e-test/execute-success.png";
    await mkdir(dirname(screenshotPath), { recursive: true });
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    logger.info(`Screenshot saved to ${screenshotPath}`);
  });
});
