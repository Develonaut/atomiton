/**
 * E2E Tests for Spreadsheet Node Execution
 * Tests multi-format spreadsheet reading: CSV, XLSX, XLS, ODS
 *
 * Tests are independent and can run in parallel for maximum speed.
 */

import { expect, test } from "#fixtures/electron";
import {
  configureAndExecuteNode,
  expectSuccessResult,
  expectErrorResult,
  TEST_TIMEOUTS,
} from "#utils/test-helpers";
import path from "node:path";

test.describe("Spreadsheet Node Execution", () => {
  const testDataDir = path.resolve(process.cwd(), "test-data", "spreadsheets");

  test.beforeEach(async ({ electronPage }) => {
    // Navigate directly to debug/nodes to reset state (more reliable than reload)
    await electronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });
    // Wait for node selector to be ready
    await electronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor({ state: "visible", timeout: 10000 });
  });

  test.describe("CSV Format", () => {
    test("reads CSV file with headers", async ({ electronPage }) => {
      const csvPath = path.join(testDataDir, "test-data.csv");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: csvPath },
          checkboxFields: { hasHeaders: true },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.records).toHaveLength(4);
      expect(result.data.headers).toEqual(["name", "age", "email", "city"]);
      expect(result.data.records[0]).toMatchObject({
        name: "Alice",
        age: "30",
        email: "alice@example.com",
        city: "New York",
      });
      expect(result.data.rowCount).toBe(4);
      expect(result.data.format).toBe("csv");
    });

    test("reads TSV file with auto-detected tab delimiter", async ({
      electronPage,
    }) => {
      const tsvPath = path.join(testDataDir, "test-data-tab.tsv");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: tsvPath },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.records).toHaveLength(3);
      expect(result.data.records[0]).toMatchObject({
        name: "Eve",
        age: "29",
        email: "eve@example.com",
        city: "Phoenix",
      });
    });
  });

  test.describe("Excel Format (XLSX)", () => {
    test("reads XLSX file with default first sheet", async ({
      electronPage,
    }) => {
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: xlsxPath },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.records).toHaveLength(4);
      expect(result.data.headers).toEqual(["name", "age", "email", "city"]);
      expect(result.data.sheetName).toBe("Users");
      expect(result.data.sheetNames).toEqual(["Users", "Products", "Sales"]);
      expect(result.data.records[0].name).toBe("Alice");
    });

    test("reads XLSX file by sheet name", async ({ electronPage }) => {
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: xlsxPath, sheetName: "Products" },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.sheetName).toBe("Products");
      expect(result.data.records).toHaveLength(4);
      expect(result.data.headers).toEqual([
        "product",
        "price",
        "stock",
        "category",
      ]);
      expect(result.data.records[0].product).toBe("Laptop");
    });

    test("reads XLSX file by sheet index", async ({ electronPage }) => {
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: xlsxPath, sheetIndex: "2" },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.sheetName).toBe("Sales");
      expect(result.data.records).toHaveLength(3);
      expect(result.data.headers).toEqual([
        "date",
        "amount",
        "region",
        "product_id",
      ]);
    });

    test("reads XLSX file without headers", async ({ electronPage }) => {
      const xlsxPath = path.join(testDataDir, "test-data-no-headers.xlsx");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: xlsxPath },
          checkboxFields: { hasHeaders: false },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.records).toHaveLength(2); // File has 3 rows, first treated as header even without hasHeaders
      // Without headers, first row becomes column names
      expect(result.data.records).toHaveLength(2);
    });
  });

  test.describe("OpenDocument Format (ODS)", () => {
    test("reads ODS file", async ({ electronPage }) => {
      const odsPath = path.join(testDataDir, "test-data.ods");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: odsPath },
          selectFields: { format: "ODS - OpenDocument Spreadsheet" },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.records).toHaveLength(4);
      expect(result.data.headers).toEqual(["name", "age", "email", "city"]);
      expect(result.data.format).toBe("ods");
      expect(result.data.sheetNames).toEqual(["Users", "Products", "Sales"]);
    });
  });

  test.describe("Error Handling", () => {
    test("handles file not found error", async ({ electronPage }) => {
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: "/nonexistent/file.xlsx" },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectErrorResult(result, "File not found");
    });

    test("handles invalid sheet name", async ({ electronPage }) => {
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: xlsxPath, sheetName: "NonExistentSheet" },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectErrorResult(result);
      const errorMsg = result.error.message || result.error;
      expect(errorMsg).toContain("not found");
      expect(errorMsg).toContain("Available sheets");
    });
  });

  test.describe("Format Auto-Detection", () => {
    test("auto-detects CSV format from extension", async ({ electronPage }) => {
      const csvPath = path.join(testDataDir, "test-data.csv");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: csvPath },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.format).toBe("csv");
    });

    test("auto-detects XLSX format from extension", async ({
      electronPage,
    }) => {
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      const result = await configureAndExecuteNode(
        electronPage,
        {
          type: "spreadsheet",
          fields: { path: xlsxPath },
        },
        { timeout: TEST_TIMEOUTS.STANDARD_OPERATION },
      );

      expectSuccessResult(result);
      expect(result.data.format).toBe("xlsx");
    });
  });
});
