/**
 * CSV Reader Node Executable
 * Node.js implementation with file system access
 */

import { createExecutable } from "#core/utils/executable";
import type { CSVReaderParameters } from "#schemas/csv-reader";

/**
 * Simple CSV parser utility
 */
function parseCSV(
  content: string,
  delimiter: string = ",",
  hasHeaders: boolean = true,
  skipEmpty: boolean = true,
): Record<string, string>[] | string[][] {
  const lines = content
    .split(/\r?\n/)
    .filter((line) => !skipEmpty || line.trim().length > 0);

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
 * CSV Reader node executable
 */
export const csvReaderExecutable = createExecutable<CSVReaderParameters>(
  "csv-reader",
  async ({ getInput, config, context }) => {
    // Get file path and data using enhanced helper
    const filePath = getInput<string>("filePath");
    const rawData = getInput<string>("data") || getInput<string>("content");

    let csvContent: string;

    // Prioritize file path if provided
    if (filePath) {
      const { readFile } = await import("fs/promises");
      try {
        csvContent = await readFile(String(filePath), "utf-8");
        context.log.debug(`Read CSV file: ${filePath}`);
      } catch (error) {
        // Return proper error for file not found
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
      // Use raw CSV data if no file path provided
      if (typeof rawData === "string") {
        csvContent = rawData;
        context.log.debug("Using raw CSV data input");
      } else {
        throw new Error("Invalid input type. Expected string (CSV content).");
      }
    } else {
      throw new Error(
        "No CSV data provided. Please provide filePath or raw data.",
      );
    }

    // Parse CSV using built-in parser
    const delimiter =
      typeof config.delimiter === "string" ? config.delimiter : ",";
    const hasHeaders =
      typeof config.hasHeaders === "boolean" ? config.hasHeaders : true;

    const records = parseCSV(
      csvContent,
      delimiter,
      hasHeaders,
      typeof config.skipEmpty === "boolean" ? config.skipEmpty : true,
    );

    // Extract headers if available
    let headers: string[] = [];
    let finalRecords = records;

    if (config.hasHeaders && records.length > 0) {
      headers = Object.keys(records[0]);
    } else if (!config.hasHeaders) {
      // Generate column names for headerless CSV
      const firstRecord = records[0];
      if (firstRecord && Array.isArray(firstRecord)) {
        headers = (firstRecord as string[]).map(
          (_, index) => `column_${index}`,
        );
        // Convert array records to objects with generated column names
        finalRecords = records.map((record) => {
          const obj: Record<string, string> = {};
          (record as unknown as string[]).forEach((value, index) => {
            obj[`column_${index}`] = value;
          });
          return obj;
        });
      }
    }

    context.log.info(`Successfully parsed CSV: ${finalRecords.length} records`);

    return {
      records: finalRecords,
      headers,
      rowCount: finalRecords.length,
    };
  },
);

export default csvReaderExecutable;
