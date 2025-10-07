/**
 * Spreadsheet Node Smoke Tests
 * Covers CSV, XLSX, and ODS file reading with various sheet selections
 */

export type SmokeTest = {
  name: string;
  config: Record<string, unknown>;
};

// Inline test data for smoke tests
const csvTestData = `name,age,city
Alice,30,NYC
Bob,25,LA
Charlie,35,Chicago`;

const tsvTestData = `name\tage\tcity
Alice\t30\tNYC
Bob\t25\tLA
Charlie\t35\tChicago`;

// Path to test data files
// Use environment variable VITE_REPO_ROOT set by Vite to construct absolute path
// Falls back to relative path if env var not available
const repoRoot = import.meta.env.VITE_REPO_ROOT || "../..";
const testDataPath = `${repoRoot}/apps/e2e/test-data/spreadsheets`;

export const spreadsheetSmokeTests: SmokeTest[] = [
  {
    name: "read CSV with headers",
    config: {
      data: csvTestData,
      format: "csv",
      hasHeaders: true,
    },
  },
  {
    name: "read TSV file",
    config: {
      data: tsvTestData,
      format: "csv",
      delimiter: "\t",
      hasHeaders: true,
    },
  },
  {
    name: "read XLSX default sheet",
    config: {
      path: `${testDataPath}/test-data.xlsx`,
      format: "xlsx",
      hasHeaders: true,
    },
  },
  {
    name: "read XLSX by sheet name",
    config: {
      path: `${testDataPath}/test-data.xlsx`,
      format: "xlsx",
      sheetName: "Products",
      hasHeaders: true,
    },
  },
  {
    name: "read XLSX by sheet index",
    config: {
      path: `${testDataPath}/test-data.xlsx`,
      format: "xlsx",
      sheetIndex: 2,
      hasHeaders: true,
    },
  },
  {
    name: "read ODS file",
    config: {
      path: `${testDataPath}/test-data.ods`,
      format: "ods",
      hasHeaders: true,
    },
  },
  {
    name: "read without headers",
    config: {
      data: csvTestData,
      format: "csv",
      hasHeaders: false,
    },
  },
];
