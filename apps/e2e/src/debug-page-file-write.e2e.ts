import { expect, test } from "#fixtures/electron";
import fs from "fs";
import path from "path";

test.describe("Debug Page Node Execution", () => {
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

  test("executes file-write node through UI button", async ({
    sharedElectronPage,
  }) => {
    // Ensure .tmp directory exists
    await fs.promises.mkdir(".tmp", { recursive: true });

    // First click the Nodes tab to make the test button visible
    const nodesTab = sharedElectronPage.locator('[data-testid="tab-nodes"]');
    await expect(nodesTab).toBeVisible({ timeout: 5000 });
    await nodesTab.click();

    // Click the Test Node button that uses conductor.node.run()
    const testNodeButton = sharedElectronPage.locator(
      '[data-testid="test-node-execution"]',
    );
    await expect(testNodeButton).toBeVisible({ timeout: 10000 });
    await testNodeButton.click();

    // Wait for execution to complete
    await sharedElectronPage.waitForTimeout(3000);

    // Check for success message
    const successMessage = sharedElectronPage.locator(
      '[data-testid="file-write-success"]',
    );
    const errorMessage = sharedElectronPage.locator(
      '[data-testid="file-write-error"]',
    );

    const hasSuccess = await successMessage
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    const hasError = await errorMessage
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (hasError) {
      const errorText = await errorMessage.textContent();
      const errorDataOutput = await errorMessage.getAttribute("data-output");
      // Use data-output if available, otherwise fall back to text content
      const errorDetail = errorDataOutput || errorText;
      throw new Error(`File write test failed: ${errorDetail}`);
    }

    expect(hasSuccess).toBe(true);

    // Extract the file path from data-output attribute (more reliable than text parsing)
    const dataOutput = await successMessage.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();
    expect(dataOutput).toMatch(/\.tmp\/debug-test-\d+\.txt$/);

    if (dataOutput) {
      const createdFilePath = dataOutput;

      // Verify file was created
      const fileExists = await fs.promises
        .access(createdFilePath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      // Verify file content
      const fileContent = await fs.promises.readFile(createdFilePath, "utf8");
      expect(fileContent).toContain("Debug test executed at");
      expect(fileContent).toContain("Test data: Hello from Debug Page!");
      expect(fileContent).toContain(
        "This file was written by the Conductor via IPC.",
      );
      expect(fileContent).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
      );

      // Clean up
      await fs.promises.unlink(createdFilePath).catch(() => {});
    }
  });
});
