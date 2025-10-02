/**
 * File System Node Smoke Test E2E
 * Validates tangible results from file-system smoke tests
 */

import { test, expect } from "#fixtures/electron";
import { existsSync, readFileSync } from "fs";

// Run file-system tests serially to avoid race conditions when multiple workers
// create/delete the same files in .tmp directory simultaneously
test.describe.configure({ mode: "serial" });

test.describe("File System Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select file-system node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "file-system" }).click();
  });

  test("validates write file operation", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    // Wait for test to complete
    const testLog = electronPage.locator(
      '[data-testid="smoke-test-file-system-write-file"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    // Get the data-output attribute
    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data.size).toBeGreaterThan(0);

    // Verify actual file was written
    expect(existsSync("./.tmp/smoke-test-write.txt")).toBe(true);

    // Verify file contents
    const content = readFileSync("./.tmp/smoke-test-write.txt", "utf8");
    expect(content).toBe("Test content written by smoke test");
  });

  test("validates write without overwrite", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-file-system-write-file-without-overwrite"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.size).toBeGreaterThan(0);
    expect(existsSync("./.tmp/smoke-test-no-overwrite.txt")).toBe(true);
  });

  test("validates list directory operation", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-file-system-list-directory"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    // Should list files in .tmp directory
    expect(Array.isArray(result.data.files)).toBe(true);
    expect(result.data.files.length).toBeGreaterThan(0);

    // Should include our smoke test files
    const hasWriteFile = result.data.files.some((f: string) =>
      f.includes("smoke-test-write.txt"),
    );
    expect(hasWriteFile).toBe(true);
  });

  test("validates read file operation", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-file-system-read-file"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.content).toBe("Test content written by smoke test");
  });

  test("validates file exists check", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-file-system-check-if-file-exists"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.exists).toBe(true);
  });

  test("validates delete file operation", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    // Wait for all tests to complete
    await expect(
      electronPage.locator('[data-testid="debug-logs"]'),
    ).toContainText("📊 Results:", { timeout: 15000 });

    // Then check delete operation
    const deleteLog = electronPage.locator(
      '[data-testid="smoke-test-file-system-delete-file"]',
    );
    await expect(deleteLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await deleteLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    // File might already be deleted from previous run, so check if operation succeeded
    // Either deleted=true or an error about file not existing
    const deletedSuccessfully =
      result.data.deleted === true ||
      (result.data.deleted === false && result.data.error?.includes("ENOENT"));

    expect(deletedSuccessfully).toBe(true);

    // Verify file was actually deleted
    expect(existsSync("./.tmp/smoke-test-to-delete.txt")).toBe(false);
  });

  test("validates write JSON content", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-file-system-write-JSON-content"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.size).toBeGreaterThan(0);

    // Verify actual file was written
    expect(existsSync("./.tmp/smoke-test.json")).toBe(true);

    // Verify JSON content is valid
    const content = readFileSync("./.tmp/smoke-test.json", "utf8");
    const jsonData = JSON.parse(content);
    expect(jsonData.test).toBe(true);
    expect(typeof jsonData.timestamp).toBe("number");
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 8/8 passed", {
      timeout: 10000,
    });
  });
});
