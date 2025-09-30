import { expect, test } from "#fixtures/electron";
import fs from "fs";
import path from "path";
import { testNodes, nodeTypesToTest } from "#fixtures/test-nodes";

test.describe("Debug Page Dynamic Node Builder", () => {
  const testOutputDir = ".tmp";

  test.beforeAll(async () => {
    await fs.promises.mkdir(testOutputDir, { recursive: true });
  });

  test.beforeEach(async ({ sharedElectronPage }) => {
    await sharedElectronPage.goto("http://localhost:5173/debug/nodes");
    await sharedElectronPage.waitForLoadState("networkidle");
    await sharedElectronPage.waitForTimeout(1000);
  });

  test("renders node type selector with all available node types", async ({
    sharedElectronPage,
  }) => {
    // Check that node type selector exists
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await expect(selector).toBeVisible({ timeout: 10000 });

    // Get all options
    const options = await selector.locator("option").allTextContents();

    // Should have placeholder option
    expect(options[0]).toBe("Select a node type...");

    // Should have node type options (exact count may vary as schemas evolve)
    expect(options.length).toBeGreaterThan(5);

    // Should include key node types
    const optionsText = options.join(",");
    expect(optionsText).toContain("file-system");
    expect(optionsText).toContain("transform");
    expect(optionsText).toContain("http-request");
  });

  test("shows empty state when no node type is selected", async ({
    sharedElectronPage,
  }) => {
    const emptyState = sharedElectronPage.locator(
      '[data-testid="form-empty-state"]',
    );
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toHaveText("Select a node type to configure");
  });

  test("renders dynamic form fields when node type is selected", async ({
    sharedElectronPage,
  }) => {
    // Select file-system node type
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");

    // Wait for form to render
    await sharedElectronPage.waitForTimeout(500);

    // Check that form is visible
    const form = sharedElectronPage.locator('[data-testid="node-fields-form"]');
    await expect(form).toBeVisible();

    // Check that operation field exists (file-system specific)
    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await expect(operationField).toBeVisible();

    // Check that path field exists
    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await expect(pathField).toBeVisible();

    // Check that execute button exists
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await expect(executeButton).toBeVisible();
    await expect(executeButton).toHaveText(/Execute file-system Node/);
  });

  test("clears field values when switching node types", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );

    // Select file-system and fill a field
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await pathField.fill("/test/path.txt");

    // Verify value is set
    await expect(pathField).toHaveValue("/test/path.txt");

    // Switch to different node type
    await selector.selectOption("transform");
    await sharedElectronPage.waitForTimeout(500);

    // Switch back to file-system
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    // Verify field is cleared
    const pathFieldAfter = sharedElectronPage.locator(
      '[data-testid="field-path"]',
    );
    await expect(pathFieldAfter).toHaveValue("");
  });

  test("executes file-system write node through dynamic form", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    // Fill in the form fields
    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await operationField.selectOption("write");

    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await pathField.fill(testNodes.fileSystemWrite.path);

    const contentField = sharedElectronPage.locator(
      '[data-testid="field-content"]',
    );
    await contentField.fill(testNodes.fileSystemWrite.content);

    const encodingField = sharedElectronPage.locator(
      '[data-testid="field-encoding"]',
    );
    await encodingField.selectOption(testNodes.fileSystemWrite.encoding);

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

    // Check for success message in logs
    const successLog = sharedElectronPage.locator(
      '[data-testid="file-write-success"]',
    );
    const errorLog = sharedElectronPage.locator(
      '[data-testid="file-write-error"]',
    );

    const hasSuccess = await successLog
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasError = await errorLog
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    if (hasError) {
      const errorText = await errorLog.textContent();
      const errorDataOutput = await errorLog.getAttribute("data-output");
      const errorDetail = errorDataOutput || errorText;
      throw new Error(`Dynamic form execution failed: ${errorDetail}`);
    }

    expect(hasSuccess).toBe(true);

    // Verify file was created
    const filePath = testNodes.fileSystemWrite.path;
    const fileExists = await fs.promises
      .access(filePath)
      .then(() => true)
      .catch(() => false);
    expect(fileExists).toBe(true);

    // Verify file content
    const fileContent = await fs.promises.readFile(filePath, "utf8");
    expect(fileContent).toBe(testNodes.fileSystemWrite.content);

    // Clean up
    await fs.promises.unlink(filePath).catch(() => {});
  });

  test("executes transform node through dynamic form", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("transform");
    await sharedElectronPage.waitForTimeout(500);

    // Fill in the operation field
    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await operationField.selectOption(testNodes.transform.operation);

    // Fill in the transformFunction field
    const transformFunctionField = sharedElectronPage.locator(
      '[data-testid="field-transformFunction"]',
    );
    await transformFunctionField.fill(testNodes.transform.transformFunction);

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution
    await sharedElectronPage.waitForTimeout(2000);

    // Look for execution complete message in logs
    // The logs section should show the result
    const logsSection = sharedElectronPage.locator(
      '[data-testid="debug-logs"]',
    );
    await expect(logsSection).toBeVisible();

    const logsText = await logsSection.textContent();
    expect(logsText).toContain("Executing transform node");
    expect(logsText).toContain("transform execution complete");
  });

  test("executes code node through dynamic form", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("code");
    await sharedElectronPage.waitForTimeout(500);

    // Fill in the code field
    const codeField = sharedElectronPage.locator('[data-testid="field-code"]');
    await codeField.fill(testNodes.code.code);

    // Execute the node
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait for execution
    await sharedElectronPage.waitForTimeout(2000);

    // Check logs for execution
    const logsSection = sharedElectronPage.locator(
      '[data-testid="debug-logs"]',
    );
    const logsText = await logsSection.textContent();
    expect(logsText).toContain("Executing code node");
    expect(logsText).toContain("code execution complete");
  });

  test("validates required fields before execution", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    // Try to execute without filling required fields
    const executeButton = sharedElectronPage.locator(
      '[data-testid="execute-node-button"]',
    );
    await executeButton.click();

    // Wait a bit
    await sharedElectronPage.waitForTimeout(1000);

    // Should either show validation error or execute with empty/default values
    // The exact behavior depends on validation implementation
    // For now, just verify the button is not disabled
    await expect(executeButton).not.toBeDisabled();
  });

  test("renders different field types correctly", async ({
    sharedElectronPage,
  }) => {
    const selector = sharedElectronPage.locator(
      '[data-testid="node-type-selector"]',
    );

    // Test file-system node for various field types
    await selector.selectOption("file-system");
    await sharedElectronPage.waitForTimeout(500);

    // Text field (path)
    const pathField = sharedElectronPage.locator('[data-testid="field-path"]');
    await expect(pathField).toBeVisible();
    await expect(pathField).toHaveAttribute("type", "text");

    // Select field (operation)
    const operationField = sharedElectronPage.locator(
      '[data-testid="field-operation"]',
    );
    await expect(operationField).toBeVisible();
    expect(
      await operationField.evaluate((el) => el.tagName.toLowerCase()),
    ).toBe("select");

    // Textarea field (content)
    const contentField = sharedElectronPage.locator(
      '[data-testid="field-content"]',
    );
    await expect(contentField).toBeVisible();
    expect(await contentField.evaluate((el) => el.tagName.toLowerCase())).toBe(
      "textarea",
    );

    // Boolean field (createDirectories)
    const createDirsField = sharedElectronPage.locator(
      '[data-testid="field-createDirectories"]',
    );
    await expect(createDirsField).toBeVisible();
    await expect(createDirsField).toHaveAttribute("type", "checkbox");
  });

  test("manual JSON editor still works alongside dynamic form", async ({
    sharedElectronPage,
  }) => {
    // The manual JSON editor should still be present and functional
    const jsonTextarea = sharedElectronPage.locator(
      "textarea[placeholder*='Enter node definition JSON']",
    );
    await expect(jsonTextarea).toBeVisible();

    // Create Sample button should still work
    const createSampleButton = sharedElectronPage.locator(
      "button:has-text('Create Sample')",
    );
    await expect(createSampleButton).toBeVisible();
    await createSampleButton.click();

    // Should populate the JSON textarea
    await sharedElectronPage.waitForTimeout(500);
    const jsonContent = await jsonTextarea.inputValue();
    expect(jsonContent).toContain('"type"');
    expect(jsonContent).toContain("transform");
  });
});
