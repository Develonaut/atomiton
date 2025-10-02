/**
 * Sheet Parsing Utilities
 */

import type { NodeExecutionContext } from "#core/utils/executable";
import type { SpreadsheetParameters } from "#schemas/spreadsheet";
import * as XLSX from "xlsx";

/**
 * Select and parse sheet from workbook
 */
export function parseSheetFromWorkbook(
  workbook: XLSX.WorkBook,
  config: SpreadsheetParameters,
  detectedFormat: string,
  context: NodeExecutionContext,
) {
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
    header: config.hasHeaders ? undefined : 1,
    range: config.range,
    defval: "",
    raw: false,
    dateNF: "yyyy-mm-dd",
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
}
