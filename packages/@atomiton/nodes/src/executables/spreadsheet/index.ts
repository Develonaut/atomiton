/**
 * Spreadsheet Reader Node Executable
 * Node.js implementation with multi-format spreadsheet support
 * Supports: CSV, XLSX, XLS, XLSB, ODS, FODS, and more
 */

import { createExecutable } from "#core/utils/executable";
import type { SpreadsheetParameters } from "#schemas/spreadsheet";
import * as XLSX from "xlsx";

/**
 * Detect format from file extension
 */
function detectFormat(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  // TSV files are treated as CSV with tab delimiter
  if (ext === "tsv") return "csv";
  return ext || "csv";
}

/**
 * Auto-detect delimiter for CSV-like files
 */
function detectDelimiter(filePath: string, configDelimiter?: string): string {
  if (configDelimiter) return configDelimiter;

  const ext = filePath.split(".").pop()?.toLowerCase();
  // TSV files use tab delimiter by default
  if (ext === "tsv") return "\t";

  // Default to comma for CSV and other formats
  return ",";
}

/**
 * Parse CSV data manually (for backward compatibility)
 */
function parseCSVManually(
  content: string,
  delimiter: string = ",",
  hasHeaders: boolean = true,
  skipEmptyLines: boolean = true,
): Record<string, string>[] | string[][] {
  const lines = content
    .split(/\r?\n/)
    .filter((line) => !skipEmptyLines || line.trim().length > 0);

  if (lines.length === 0) return [];

  const rows = lines.map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === delimiter && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  });

  if (!hasHeaders) {
    return rows;
  }

  if (rows.length === 0) return [];

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
}

/**
 * Spreadsheet Reader node executable
 * Supports multiple spreadsheet formats using SheetJS
 */
export const spreadsheetExecutable = createExecutable<SpreadsheetParameters>(
  "spreadsheet",
  async ({ getInput, config, context }) => {
    // Get file path and data
    const filePath = getInput<string>("path");
    const rawData = getInput<string>("data") || getInput<string>("content");

    let workbook: XLSX.WorkBook;
    let detectedFormat: string;

    // Read file or parse raw data
    if (filePath) {
      const { readFile } = await import("fs/promises");
      try {
        const buffer = await readFile(String(filePath));
        detectedFormat = config.format || detectFormat(String(filePath));

        // Auto-detect delimiter for CSV/TSV files
        const delimiter = detectDelimiter(String(filePath), config.delimiter);

        context.log.debug(
          `Reading spreadsheet file: ${filePath} (format: ${detectedFormat}, delimiter: ${delimiter === "\t" ? "\\t" : delimiter})`,
        );

        // For CSV/TSV, use manual parser if delimiter is non-standard (not comma)
        if (detectedFormat === "csv" && delimiter !== ",") {
          const content = buffer.toString("utf-8");
          const records = parseCSVManually(
            content,
            delimiter,
            config.hasHeaders,
            config.skipEmptyLines,
          );

          let headers: string[] = [];
          if (config.hasHeaders && records.length > 0) {
            headers = Object.keys(records[0]);
          }

          context.log.info(
            `Successfully parsed CSV/TSV with delimiter '${delimiter === "\t" ? "\\t" : delimiter}': ${records.length} records`,
          );

          return {
            records,
            headers,
            rowCount: records.length,
            format: detectedFormat,
            sheetName: "Sheet1",
            delimiter, // Include delimiter in output for transparency
          };
        }

        // Use SheetJS for all other formats
        workbook = XLSX.read(buffer, {
          type: "buffer",
          cellDates: true,
          cellNF: false,
          cellText: false,
        });
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          throw new Error(`File not found: ${filePath}`);
        }
        throw error;
      }
    } else if (rawData) {
      if (typeof rawData === "string") {
        detectedFormat = config.format || "csv";
        const delimiter = config.delimiter || ","; // Use config delimiter or default to comma for raw data

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

          let headers: string[] = [];
          if (config.hasHeaders && records.length > 0) {
            headers = Object.keys(records[0]);
          }

          context.log.info(
            `Successfully parsed CSV/TSV with delimiter '${delimiter === "\t" ? "\\t" : delimiter}': ${records.length} records`,
          );

          return {
            records,
            headers,
            rowCount: records.length,
            format: detectedFormat,
            sheetName: "Sheet1",
            delimiter, // Include delimiter in output for transparency
          };
        }

        // Use SheetJS for other formats
        workbook = XLSX.read(rawData, {
          type: "string",
          cellDates: true,
          cellNF: false,
          cellText: false,
        });
      } else {
        throw new Error(
          "Invalid input type. Expected string (spreadsheet content).",
        );
      }
    } else {
      throw new Error(
        "No spreadsheet data provided. Please provide filePath or raw data.",
      );
    }

    // Select sheet to read
    let sheetName: string;
    if (config.sheetName) {
      sheetName = config.sheetName;
      if (!workbook.Sheets[sheetName]) {
        throw new Error(
          `Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(", ")}`,
        );
      }
    } else if (config.sheetIndex !== undefined) {
      if (config.sheetIndex >= workbook.SheetNames.length) {
        throw new Error(
          `Sheet index ${config.sheetIndex} out of range. Workbook has ${workbook.SheetNames.length} sheets.`,
        );
      }
      sheetName = workbook.SheetNames[config.sheetIndex];
    } else {
      // Default to first sheet
      sheetName = workbook.SheetNames[0];
    }

    const worksheet = workbook.Sheets[sheetName];

    // Parse sheet to JSON
    const records = XLSX.utils.sheet_to_json(worksheet, {
      header: config.hasHeaders ? undefined : 1, // Use row 1 as headers if hasHeaders=true
      range: config.range,
      defval: "", // Default value for empty cells
      raw: false, // Get formatted strings instead of raw values
      dateNF: "yyyy-mm-dd", // Date format
    });

    // Extract headers
    let headers: string[] = [];
    if (records.length > 0) {
      const firstRecord = records[0];
      if (firstRecord && typeof firstRecord === "object") {
        headers = Object.keys(firstRecord);
      }
    } else if (worksheet["!ref"]) {
      // Try to get headers from first row even if no data
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const firstRow = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        firstRow.push(cell ? XLSX.utils.format_cell(cell) : `Column${col}`);
      }
      headers = firstRow;
    }

    context.log.info(
      `Successfully parsed ${detectedFormat} spreadsheet: ${records.length} records from sheet "${sheetName}"`,
    );

    return {
      records,
      headers,
      rowCount: records.length,
      format: detectedFormat,
      sheetName,
      sheetNames: workbook.SheetNames,
    };
  },
);

export default spreadsheetExecutable;
