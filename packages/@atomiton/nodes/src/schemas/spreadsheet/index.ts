/**
 * Spreadsheet Reader Schema
 * Runtime validation schema for spreadsheet reader node
 * Supports multiple formats: CSV, XLSX, XLS, ODS, and more
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Supported spreadsheet formats
 */
export const spreadsheetFormats = [
  "csv",
  "xlsx",
  "xls",
  "xlsb",
  "ods",
  "fods",
] as const;

export type SpreadsheetFormat = (typeof spreadsheetFormats)[number];

/**
 * Spreadsheet Reader specific schema (without base fields)
 * Supports multiple spreadsheet formats with automatic format detection
 */
export const spreadsheetSchemaShape = {
  // Input methods (provide either path OR data, not both)
  path: v
    .string()
    .optional()
    .describe("File path to read (desktop environments only)"),

  data: v
    .string()
    .optional()
    .describe(
      "Raw spreadsheet content as string (works in all environments - CSV, TSV, or other text formats)",
    ),

  format: v
    .enum(spreadsheetFormats)
    .optional()
    .describe(
      "Spreadsheet format (auto-detected from file extension if using path)",
    ),

  sheetName: v
    .string()
    .optional()
    .describe(
      "Name of the sheet to read (defaults to first sheet if not provided)",
    ),

  sheetIndex: v
    .number()
    .min(0)
    .optional()
    .describe("Index of the sheet to read (0-based, defaults to 0)"),

  hasHeaders: v
    .boolean()
    .default(true)
    .describe("Whether the first row contains column headers"),

  range: v
    .string()
    .optional()
    .describe("Cell range to read (e.g., 'A1:D10', defaults to entire sheet)"),

  // CSV-specific options (ignored for other formats)
  delimiter: v
    .string()
    .default(",")
    .describe("CSV delimiter character (only used for CSV format)"),

  skipEmptyLines: v
    .boolean()
    .default(true)
    .describe("Skip empty lines when parsing"),
};

/**
 * Full Spreadsheet Reader schema including base fields
 */
export const spreadsheetSchema = baseSchema.extend(spreadsheetSchemaShape);

/**
 * Type for Spreadsheet Reader parameters
 */
export type SpreadsheetParameters = VInfer<typeof spreadsheetSchema>;

/**
 * Default export for registry
 */
export default spreadsheetSchemaShape;
