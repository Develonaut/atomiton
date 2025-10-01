/**
 * E2E Tests for File System Node Execution
 *
 * Tests are independent and can run in parallel for maximum speed.
 */

import { expect, test } from "#fixtures/electron";
import fs from "fs";
import path from "node:path";

test.describe.configure({ mode: "serial" });

test.describe("File System Node Execution", () => {
  const testOutputDir = ".tmp/file-system-tests";
  const testFile = path.join(testOutputDir, "pipeline-test.txt");
  const content = "Pipeline test content";

  test.beforeAll(async ({ sharedElectronPage }) => {
    // Clean up and create test directory
    await fs.promises.rm(testOutputDir, { recursive: true, force: true });
    await fs.promises.mkdir(testOutputDir, { recursive: true });

    // Navigate once to debug nodes page
    await sharedElectronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });

    // Wait for node selector to be ready
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor();
  });

  test.afterAll(async () => {
    await fs.promises.rm(testOutputDir, { recursive: true, force: true });
  });

  test("writes a file", async ({ sharedElectronPage }) => {
    // Select file-system node for first test
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "file-system" })
      .click();

    await sharedElectronPage.locator('[data-testid="field-operation"]').click();
    await sharedElectronPage.getByRole("option", { name: "write" }).click();
    await sharedElectronPage
      .locator('[data-testid="field-path"]')
      .fill(testFile);
    await sharedElectronPage
      .locator('[data-testid="field-content"]')
      .fill(content);
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 1000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.size).toBeGreaterThan(0);
  });

  test("lists files in directory", async ({ sharedElectronPage }) => {
    // Re-select node type after execution
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "file-system" })
      .click();

    await sharedElectronPage.locator('[data-testid="field-operation"]').click();
    await sharedElectronPage.getByRole("option", { name: "list" }).click();
    await sharedElectronPage
      .locator('[data-testid="field-path"]')
      .fill(testOutputDir);
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 1000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.files.length).toBeGreaterThan(0);
    expect(
      data.data.files.some((f: string) => f.includes("pipeline-test.txt")),
    ).toBe(true);
  });

  test("reads the file", async ({ sharedElectronPage }) => {
    // Re-select node type after execution
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "file-system" })
      .click();

    await sharedElectronPage.locator('[data-testid="field-operation"]').click();
    await sharedElectronPage.getByRole("option", { name: "read" }).click();
    await sharedElectronPage
      .locator('[data-testid="field-path"]')
      .fill(testFile);
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 1000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.content).toBe(content);
  });

  test("checks if file exists", async ({ sharedElectronPage }) => {
    // Re-select node type after execution
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "file-system" })
      .click();

    await sharedElectronPage.locator('[data-testid="field-operation"]').click();
    await sharedElectronPage.getByRole("option", { name: "exists" }).click();
    await sharedElectronPage
      .locator('[data-testid="field-path"]')
      .fill(testFile);
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 1000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.exists).toBe(true);
  });

  test("deletes the file", async ({ sharedElectronPage }) => {
    // Re-select node type after execution
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .click();
    await sharedElectronPage
      .getByRole("option", { name: "file-system" })
      .click();

    await sharedElectronPage.locator('[data-testid="field-operation"]').click();
    await sharedElectronPage.getByRole("option", { name: "delete" }).click();
    await sharedElectronPage
      .locator('[data-testid="field-path"]')
      .fill(testFile);
    await sharedElectronPage
      .locator('[data-testid="execute-node-button"]')
      .click();

    const result = sharedElectronPage.locator(
      '[data-testid="execution-result-json"]',
    );
    await expect(result).toBeVisible({ timeout: 1000 });

    const data = JSON.parse((await result.getAttribute("data-output"))!);
    expect(data.success).toBe(true);
    expect(data.data.deleted).toBe(true);

    // Verify file no longer exists
    await expect(fs.promises.access(testFile)).rejects.toThrow();
  });
});
