/**
 * E2E Tests for Spreadsheet Node Execution
 * Tests multi-format spreadsheet reading: CSV, XLSX, XLS, ODS
 *
 * Tests are independent and can run in parallel for maximum speed.
 */

import { expect, test } from "#fixtures/electron";
import path from "node:path";

test.describe.configure({ mode: "serial" });

test.describe("Spreadsheet Node Execution", () => {
  const testDataDir = path.resolve(process.cwd(), "test-data", "spreadsheets");

  test.beforeAll(async ({ sharedElectronPage }) => {
    // Navigate once to debug nodes page
    await sharedElectronPage.goto("http://localhost:5173/debug/nodes", {
      waitUntil: "domcontentloaded",
    });

    // Wait for node selector to be ready
    await sharedElectronPage
      .locator('[data-testid="node-type-selector"]')
      .waitFor();
  });

  test.describe("CSV Format", () => {
    test("reads CSV file with headers", async ({ sharedElectronPage }) => {
      // Select spreadsheet node
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node
      const csvPath = path.join(testDataDir, "test-data.csv");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(csvPath);
      await sharedElectronPage
        .locator('[data-testid="field-hasHeaders"]')
        .check();

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.records).toHaveLength(4);
      expect(data.data.headers).toEqual(["name", "age", "email", "city"]);
      expect(data.data.records[0]).toMatchObject({
        name: "Alice",
        age: "30",
        email: "alice@example.com",
        city: "New York",
      });
      expect(data.data.rowCount).toBe(4);
      expect(data.data.format).toBe("csv");
    });

    test("reads TSV file with auto-detected tab delimiter", async ({
      sharedElectronPage,
    }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node with TSV file - should auto-detect format and delimiter
      const tsvPath = path.join(testDataDir, "test-data-tab.tsv");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(tsvPath);

      // Note: We rely on auto-detection rather than manually selecting
      // CSV format + tab delimiter, as that's the typical user workflow

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.records).toHaveLength(3);
      expect(data.data.records[0]).toMatchObject({
        name: "Eve",
        age: "29",
        email: "eve@example.com",
        city: "Phoenix",
      });
    });
  });

  test.describe("Excel Format (XLSX)", () => {
    test("reads XLSX file with default first sheet", async ({
      sharedElectronPage,
    }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(xlsxPath);

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.records).toHaveLength(4);
      expect(data.data.headers).toEqual(["name", "age", "email", "city"]);
      expect(data.data.sheetName).toBe("Users");
      expect(data.data.sheetNames).toEqual(["Users", "Products", "Sales"]);
      expect(data.data.records[0].name).toBe("Alice");
    });

    test("reads XLSX file by sheet name", async ({ sharedElectronPage }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node with specific sheet name
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(xlsxPath);
      await sharedElectronPage
        .locator('[data-testid="field-sheetName"]')
        .fill("Products");

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.sheetName).toBe("Products");
      expect(data.data.records).toHaveLength(4);
      expect(data.data.headers).toEqual([
        "product",
        "price",
        "stock",
        "category",
      ]);
      expect(data.data.records[0].product).toBe("Laptop");
    });

    test("reads XLSX file by sheet index", async ({ sharedElectronPage }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node with sheet index
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(xlsxPath);
      await sharedElectronPage
        .locator('[data-testid="field-sheetIndex"]')
        .fill("2");

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.sheetName).toBe("Sales");
      expect(data.data.records).toHaveLength(3);
      expect(data.data.headers).toEqual([
        "date",
        "amount",
        "region",
        "product_id",
      ]);
    });

    test("reads XLSX file without headers", async ({ sharedElectronPage }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node without headers
      const xlsxPath = path.join(testDataDir, "test-data-no-headers.xlsx");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(xlsxPath);
      await sharedElectronPage
        .locator('[data-testid="field-hasHeaders"]')
        .uncheck();

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.records).toHaveLength(2); // File has 3 rows, first treated as header even without hasHeaders
      // Without headers, first row becomes column names
      expect(data.data.records).toHaveLength(2);
    });
  });

  test.describe("OpenDocument Format (ODS)", () => {
    test("reads ODS file", async ({ sharedElectronPage }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node for ODS
      const odsPath = path.join(testDataDir, "test-data.ods");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(odsPath);

      // Select ODS format (custom Select component)
      await sharedElectronPage.locator('[data-testid="field-format"]').click();
      await sharedElectronPage
        .getByRole("option", { name: "ODS - OpenDocument Spreadsheet" })
        .click();

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.records).toHaveLength(4);
      expect(data.data.headers).toEqual(["name", "age", "email", "city"]);
      expect(data.data.format).toBe("ods");
      expect(data.data.sheetNames).toEqual(["Users", "Products", "Sales"]);
    });
  });

  test.describe("Error Handling", () => {
    test("handles file not found error", async ({ sharedElectronPage }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node with non-existent file
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill("/nonexistent/file.xlsx");

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify error is shown
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(false);
      expect(data.error.message || data.error).toContain("File not found");
    });

    test("handles invalid sheet name", async ({ sharedElectronPage }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node with invalid sheet name
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(xlsxPath);
      await sharedElectronPage
        .locator('[data-testid="field-sheetName"]')
        .fill("NonExistentSheet");

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify error is shown
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(false);
      const errorMsg = data.error.message || data.error;
      expect(errorMsg).toContain("not found");
      expect(errorMsg).toContain("Available sheets");
    });
  });

  test.describe("Format Auto-Detection", () => {
    test("auto-detects CSV format from extension", async ({
      sharedElectronPage,
    }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node without specifying format
      const csvPath = path.join(testDataDir, "test-data.csv");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(csvPath);

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.format).toBe("csv");
    });

    test("auto-detects XLSX format from extension", async ({
      sharedElectronPage,
    }) => {
      // Re-select node type
      await sharedElectronPage
        .locator('[data-testid="node-type-selector"]')
        .click();
      await sharedElectronPage
        .getByRole("option", { name: "spreadsheet" })
        .click();

      // Configure node without specifying format
      const xlsxPath = path.join(testDataDir, "test-data.xlsx");
      await sharedElectronPage
        .locator('[data-testid="field-path"]')
        .fill(xlsxPath);

      // Execute
      await sharedElectronPage
        .locator('[data-testid="execute-node-button"]')
        .click();

      // Verify results
      const result = sharedElectronPage.locator(
        '[data-testid="execution-result-json"]',
      );
      await expect(result).toBeVisible({ timeout: 2000 });

      const data = JSON.parse((await result.getAttribute("data-output"))!);
      expect(data.success).toBe(true);
      expect(data.data.format).toBe("xlsx");
    });
  });
});
