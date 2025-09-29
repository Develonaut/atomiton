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
      throw new Error(`File write test failed: ${errorText}`);
    }

    expect(hasSuccess).toBe(true);

    // Extract and verify the created file
    const messageText = await successMessage.textContent();
    const filePathMatch = messageText?.match(
      /✅ File write test completed: (.+)/,
    );
    expect(filePathMatch).toBeTruthy();

    if (filePathMatch && filePathMatch[1]) {
      const createdFilePath = filePathMatch[1];

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
