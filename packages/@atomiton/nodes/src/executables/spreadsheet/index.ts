/**
 * Spreadsheet Reader Node Executable
 * Node.js implementation with multi-format spreadsheet support
 * Supports: CSV, XLSX, XLS, XLSB, ODS, FODS, and more
 */

import { createExecutable } from "#core/utils/executable";
import type { SpreadsheetParameters } from "#schemas/spreadsheet";
import {
  readSpreadsheetFromData,
  readSpreadsheetFromFile,
} from "#executables/spreadsheet/fileReader";
import { parseSheetFromWorkbook } from "#executables/spreadsheet/sheetParser";

/**
 * Spreadsheet Reader node executable
 * Supports multiple spreadsheet formats using SheetJS
 */
export const spreadsheetExecutable = createExecutable<SpreadsheetParameters>(
  "spreadsheet",
  async ({ getInput, config, context }) => {
    // Get file path and data
    const filePath = getInput<string>("path");
    const rawData = getInput<string>("data");

    // Read from file or raw data
    if (filePath) {
      const result = await readSpreadsheetFromFile(
        String(filePath),
        config,
        context,
      );

      // If CSV was parsed manually, return early
      if ("records" in result) {
        return result;
      }

      // Otherwise parse the workbook
      return parseSheetFromWorkbook(
        result.workbook,
        config,
        result.detectedFormat,
        context,
      );
    } else if (rawData) {
      if (typeof rawData !== "string") {
        throw new Error(
          "Invalid input type. Expected string (spreadsheet content).",
        );
      }

      const result = readSpreadsheetFromData(rawData, config, context);

      // If CSV was parsed manually, return early
      if ("records" in result) {
        return result;
      }

      // Otherwise parse the workbook
      return parseSheetFromWorkbook(
        result.workbook,
        config,
        result.detectedFormat,
        context,
      );
    } else {
      throw new Error(
        "No spreadsheet data provided. Please provide filePath or raw data.",
      );
    }
  },
);

export default spreadsheetExecutable;
