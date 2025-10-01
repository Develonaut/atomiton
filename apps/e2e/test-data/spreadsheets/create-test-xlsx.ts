/**
 * Create test Excel files for e2e tests
 * Run with: node create-test-xlsx.js
 */

import XLSX from "xlsx";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a simple workbook with multiple sheets
const workbook = XLSX.utils.book_new();

// Sheet 1: Users data
const usersData = [
  ["name", "age", "email", "city"],
  ["Alice", 30, "alice@example.com", "New York"],
  ["Bob", 25, "bob@example.com", "Los Angeles"],
  ["Charlie", 35, "charlie@example.com", "Chicago"],
  ["Diana", 28, "diana@example.com", "Houston"],
];

const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

// Sheet 2: Products data
const productsData = [
  ["product", "price", "stock", "category"],
  ["Laptop", 999.99, 15, "Electronics"],
  ["Mouse", 29.99, 100, "Electronics"],
  ["Desk", 299.99, 25, "Furniture"],
  ["Chair", 199.99, 40, "Furniture"],
];

const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");

// Sheet 3: Sales data
const salesData = [
  ["date", "amount", "region", "product_id"],
  ["2024-01-01", 1500.0, "North", 1],
  ["2024-01-02", 2300.5, "South", 2],
  ["2024-01-03", 1800.75, "East", 3],
];

const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");

// Write XLSX file
XLSX.writeFile(workbook, `${__dirname}/test-data.xlsx`);
console.log("Created test-data.xlsx");

// Also create ODS version
XLSX.writeFile(workbook, `${__dirname}/test-data.ods`);
console.log("Created test-data.ods");

// Create a workbook without headers
const noHeadersData = [
  ["Alice", 30, "alice@example.com", "New York"],
  ["Bob", 25, "bob@example.com", "Los Angeles"],
  ["Charlie", 35, "charlie@example.com", "Chicago"],
];

const noHeadersWorkbook = XLSX.utils.book_new();
const noHeadersSheet = XLSX.utils.aoa_to_sheet(noHeadersData);
XLSX.utils.book_append_sheet(noHeadersWorkbook, noHeadersSheet, "Sheet1");
XLSX.writeFile(noHeadersWorkbook, `${__dirname}/test-data-no-headers.xlsx`);
console.log("Created test-data-no-headers.xlsx");

console.log("All test files created successfully!");
