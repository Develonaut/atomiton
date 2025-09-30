/**
 * E2E Tests for File System Node Execution
 *
 * Tests the actual execution and side effects of file-system nodes,
 * verifying that files are created, read, deleted, and listed correctly.
 */

import { expect, test } from "#fixtures/electron";
import fs from "fs";
import path from "path";

test.describe("File System Node Execution", () => {
  const testOutputDir = ".tmp/file-system-tests";

  test.beforeAll(async () => {
    await fs.promises.mkdir(testOutputDir, { recursive: true });
  });

  test.afterAll(async () => {
    // Clean up test directory
    await fs.promises.rm(testOutputDir, { recursive: true, force: true });
  });

  test.beforeEach(async ({ sharedElectronPage }) => {
    await sharedElectronPage.goto("http://localhost:5173/debug/nodes");
    await sharedElectronPage.waitForLoadState("networkidle");
    await sharedElectronPage.waitForTimeout(1000);
  });

  test("writes a file with content and verifies file creation", async ({
    sharedElectronPage,
  }) => {
    const testFilePath = path.join(testOutputDir, "write-test.txt");
    const testContent = "E2E test: File system write operation";

    // Select file-system node type
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    // Fill in form fields
    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await operationField.selectOption("write");

    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await pathField.fill(testFilePath);

    const contentField = sharedElectronPage.locator(
      '[data-testid="field-content"]',
    );
    await contentField.fill(testContent);

    const encodingField = sharedElectronPage.locator(
      '[data-testid="field-encoding"]',
    );
    await encodingField.selectOption("utf8");

    const createDirsField = sharedElectronPage.locator(
      '[data-testid="field-createDirectories"]',
    );
    await createDirsField.check();

    const overwriteField = sharedElectronPage.locator(
      '[data-testid="field-overwrite"]',
    );
    await overwriteField.check();

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution
    await sharedElectronPage.waitForTimeout(2000);

    // Verify success message in logs
    const successLog = sharedElectronPage.locator(
      '[data-testid="file-write-success"]',
    );
    await expect(successLog).toBeVisible({ timeout: 5000 });

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 5000 });

    const resultJson = await resultElement.getAttribute("data-output");
    expect(resultJson).toBeTruthy();

    const result = JSON.parse(resultJson!);
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("bytesWritten");
    expect(result.bytesWritten).toBeGreaterThan(0);

    // Verify actual file system side effects
    const fileExists = await fs.promises
      .access(testFilePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    const fileContent = await fs.promises.readFile(testFilePath, "utf8");
    expect(fileContent).toBe(testContent);

    // Clean up
    await fs.promises.unlink(testFilePath).catch(() => {});
  });

  test("reads a file and verifies content is returned", async ({
    sharedElectronPage,
  }) => {
    const testFilePath = path.join(testOutputDir, "read-test.txt");
    const testContent = "E2E test: File system read operation";

    // Create test file
    await fs.promises.writeFile(testFilePath, testContent, "utf8");

    // Select file-system node type
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    // Fill in form fields for read operation
    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await operationField.selectOption("read");

    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await pathField.fill(testFilePath);

    const encodingField = sharedElectronPage.locator(
      '[data-testid="field-encoding"]',
    );
    await encodingField.selectOption("utf8");

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution
    await sharedElectronPage.waitForTimeout(2000);

    // Verify success message
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("file-system execution complete");

    // Verify the JSON result contains the file content
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 5000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("content", testContent);

    // Clean up
    await fs.promises.unlink(testFilePath).catch(() => {});
  });

  test("checks if file exists and returns boolean result", async ({
    sharedElectronPage,
  }) => {
    const existingFilePath = path.join(testOutputDir, "exists-test.txt");
    const nonExistentPath = path.join(testOutputDir, "does-not-exist.txt");

    // Create test file
    await fs.promises.writeFile(existingFilePath, "test", "utf8");

    // Test 1: File exists
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await operationField.selectOption("exists");

    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await pathField.fill(existingFilePath);

    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();
    await sharedElectronPage.waitForTimeout(2000);

    // Verify result shows file exists
    let resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 5000 });

    let resultJson = await resultElement.getAttribute("data-output");
    let result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("exists", true);

    // Test 2: File does not exist
    await pathField.clear();
    await pathField.fill(nonExistentPath);
    await executeButton.click();
    await sharedElectronPage.waitForTimeout(2000);

    // Get the new result (need to re-query as logs updated)
    const allResults = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    const resultCount = await allResults.count();
    resultElement = allResults.nth(resultCount - 1); // Get last result

    resultJson = await resultElement.getAttribute("data-output");
    result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("exists", false);

    // Clean up
    await fs.promises.unlink(existingFilePath).catch(() => {});
  });

  test("deletes a file and verifies deletion", async ({
    sharedElectronPage,
  }) => {
    const testFilePath = path.join(testOutputDir, "delete-test.txt");

    // Create test file
    await fs.promises.writeFile(testFilePath, "to be deleted", "utf8");

    // Verify file exists before deletion
    let fileExists = await fs.promises
      .access(testFilePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    // Select file-system node and delete operation
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await operationField.selectOption("delete");

    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await pathField.fill(testFilePath);

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();
    await sharedElectronPage.waitForTimeout(2000);

    // Verify success
    await expect(
      sharedElectronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("file-system execution complete");

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 5000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("deleted", true);

    // Verify file is actually deleted
    fileExists = await fs.promises
      .access(testFilePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(false);
  });

  test("lists files in directory with filter", async ({
    sharedElectronPage,
  }) => {
    const testSubDir = path.join(testOutputDir, "list-test");

    // Create test directory with files
    await fs.promises.mkdir(testSubDir, { recursive: true });
    await fs.promises.writeFile(path.join(testSubDir, "test1.txt"), "content1");
    await fs.promises.writeFile(path.join(testSubDir, "test2.txt"), "content2");
    await fs.promises.writeFile(path.join(testSubDir, "test3.json"), "{}");

    // Select file-system node and list operation
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await operationField.selectOption("list");

    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await pathField.fill(testSubDir);

    const fileFilterField = sharedElectronPage.locator(
      '[data-testid="field-fileFilter"]',
    );
    await fileFilterField.fill("\\.txt$"); // Only .txt files

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();
    await sharedElectronPage.waitForTimeout(2000);

    // Verify the JSON result
    const resultElement = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(resultElement).toBeVisible({ timeout: 5000 });

    const resultJson = await resultElement.getAttribute("data-output");
    const result = JSON.parse(resultJson!);

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("files");
    expect(Array.isArray(result.files)).toBe(true);
    expect(result.files.length).toBe(2); // Only .txt files
    expect(result.files).toContain("test1.txt");
    expect(result.files).toContain("test2.txt");
    expect(result.files).not.toContain("test3.json");

    // Clean up
    await fs.promises.rm(testSubDir, { recursive: true, force: true });
  });
});
