/**
 * Spreadsheet File Reading Utilities
 */

import type { NodeExecutionContext } from "#core/utils/executable";
import type { SpreadsheetParameters } from "#schemas/spreadsheet";
import * as XLSX from "xlsx";
import { detectDelimiter, detectFormat, parseCSVManually } from "./csvParser";

/**
 * Read spreadsheet from file path
 */
export async function readSpreadsheetFromFile(
  filePath: string,
  config: SpreadsheetParameters,
  context: NodeExecutionContext,
) {
  const { readFile } = await import("fs/promises");
  const { resolve } = await import("path");

  try {
    // Resolve path relative to process.cwd()
    const resolvedPath = resolve(String(filePath));
    const buffer = await readFile(resolvedPath);
    const detectedFormat = config.format || detectFormat(String(filePath));
    const delimiter = detectDelimiter(String(filePath), config.delimiter);

    context.log.debug(
      `Reading spreadsheet file: ${filePath} (format: ${detectedFormat}, delimiter: ${delimiter === "\t" ? "\\t" : delimiter})`,
    );

    // For CSV/TSV with custom delimiter, use manual parser
    if (detectedFormat === "csv" && delimiter !== ",") {
      const content = buffer.toString("utf-8");
      const records = parseCSVManually(
        content,
        delimiter,
        config.hasHeaders,
        config.skipEmptyLines,
      );

      const headers =
        config.hasHeaders && records.length > 0 ? Object.keys(records[0]) : [];

      context.log.info(
        `Successfully parsed CSV/TSV with delimiter '${delimiter === "\t" ? "\\t" : delimiter}': ${records.length} records`,
      );

      return {
        records,
        headers,
        rowCount: records.length,
        format: detectedFormat,
        sheetName: "Sheet1",
        delimiter,
      };
    }

    // Use SheetJS for all other formats
    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    return { workbook, detectedFormat };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Read spreadsheet from raw data string
 */
export function readSpreadsheetFromData(
  rawData: string,
  config: SpreadsheetParameters,
  context: NodeExecutionContext,
) {
  const detectedFormat = config.format || "csv";
  const delimiter = config.delimiter || ",";

  context.log.debug(
    `Using raw spreadsheet data (format: ${detectedFormat}, delimiter: ${delimiter === "\t" ? "\\t" : delimiter})`,
  );

  // For CSV with custom delimiter
  if (detectedFormat === "csv" && delimiter !== ",") {
    const records = parseCSVManually(
      rawData,
      delimiter,
      config.hasHeaders,
      config.skipEmptyLines,
    );

    const headers =
      config.hasHeaders && records.length > 0 ? Object.keys(records[0]) : [];

    context.log.info(
      `Successfully parsed CSV/TSV with delimiter '${delimiter === "\t" ? "\\t" : delimiter}': ${records.length} records`,
    );

    return {
      records,
      headers,
      rowCount: records.length,
      format: detectedFormat,
      sheetName: "Sheet1",
      delimiter,
    };
  }

  // Use SheetJS for other formats
  const workbook = XLSX.read(rawData, {
    type: "string",
    cellDates: true,
    cellNF: false,
    cellText: false,
  });

  return { workbook, detectedFormat };
}
