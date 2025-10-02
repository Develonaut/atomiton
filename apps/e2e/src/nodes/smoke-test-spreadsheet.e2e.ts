/**
 * Spreadsheet Node Smoke Test E2E
 * Validates tangible results from spreadsheet smoke tests
 */

import { test, expect } from "#fixtures/electron";

test.describe("Spreadsheet Smoke Tests", () => {
  test.beforeEach(async ({ electronPage }) => {
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });

    // Select spreadsheet node
    await electronPage.locator('[data-testid="node-type-selector"]').click();
    await electronPage.getByRole("option", { name: "spreadsheet" }).click();
  });

  test("validates read CSV with headers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    // Wait for test to complete
    const testLog = electronPage.locator(
      '[data-testid="smoke-test-spreadsheet-read-CSV-with-headers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    // Get the data-output attribute
    const dataOutput = await testLog.getAttribute("data-output");
    expect(dataOutput).toBeTruthy();

    const result = JSON.parse(dataOutput!);
    expect(result.data.records).toBeDefined();
    expect(Array.isArray(result.data.records)).toBe(true);
    expect(result.data.records.length).toBeGreaterThan(0);
    expect(result.data.headers).toBeDefined();
    expect(Array.isArray(result.data.headers)).toBe(true);
    expect(result.data.headers).toContain("name");
    expect(result.data.format).toBe("csv");
  });

  test("validates read TSV file", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-spreadsheet-read-TSV-file"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.records)).toBe(true);
    expect(result.data.records.length).toBeGreaterThan(0);
    expect(result.data.headers).toBeDefined();
    expect(result.data.format).toBe("csv");
  });

  test("validates read XLSX default sheet", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-spreadsheet-read-XLSX-default-sheet"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.records)).toBe(true);
    expect(result.data.records.length).toBeGreaterThan(0);
    expect(result.data.headers).toEqual(["name", "age", "email", "city"]);
    expect(result.data.format).toBe("xlsx");
    expect(result.data.sheetName).toBe("Users");
    expect(Array.isArray(result.data.sheetNames)).toBe(true);
    expect(result.data.sheetNames).toContain("Users");
  });

  test("validates read XLSX by sheet name", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-spreadsheet-read-XLSX-by-sheet-name"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.sheetName).toBe("Products");
    expect(Array.isArray(result.data.records)).toBe(true);
    expect(result.data.records.length).toBeGreaterThan(0);
    expect(result.data.headers).toEqual([
      "product",
      "price",
      "stock",
      "category",
    ]);
    expect(result.data.format).toBe("xlsx");
  });

  test("validates read XLSX by sheet index", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-spreadsheet-read-XLSX-by-sheet-index"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(result.data.sheetName).toBe("Sales");
    expect(Array.isArray(result.data.records)).toBe(true);
    expect(result.data.headers).toEqual([
      "date",
      "amount",
      "region",
      "product_id",
    ]);
    expect(result.data.format).toBe("xlsx");
  });

  test("validates read ODS file", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-spreadsheet-read-ODS-file"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.records)).toBe(true);
    expect(result.data.records.length).toBeGreaterThan(0);
    expect(result.data.headers).toEqual(["name", "age", "email", "city"]);
    expect(result.data.format).toBe("ods");
    expect(Array.isArray(result.data.sheetNames)).toBe(true);
  });

  test("validates read without headers", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const testLog = electronPage.locator(
      '[data-testid="smoke-test-spreadsheet-read-without-headers"]',
    );
    await expect(testLog).toBeVisible({ timeout: 10000 });

    const dataOutput = await testLog.getAttribute("data-output");
    const result = JSON.parse(dataOutput!);

    expect(Array.isArray(result.data.records)).toBe(true);
    expect(result.data.records.length).toBeGreaterThan(0);
    expect(result.data.format).toBe("csv");
  });

  test("all smoke tests pass", async ({ electronPage }) => {
    await electronPage.click('[data-testid="run-smoke-tests"]');

    const logs = electronPage.locator('[data-testid="debug-logs"]');
    await expect(logs).toContainText("📊 Results: 7/7 passed", {
      timeout: 15000,
    });
  });
});
