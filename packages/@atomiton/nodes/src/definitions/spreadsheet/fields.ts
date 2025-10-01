/**
 * Spreadsheet Reader Field Configuration
 * UI field configurations for spreadsheet reader parameters
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { spreadsheetSchema } from "#schemas/spreadsheet";

/**
 * Field configuration for spreadsheet reader parameters
 *
 * Auto-derived from spreadsheetSchema with selective overrides for:
 * - format: enum with descriptive labels
 * - delimiter: enum with descriptive labels for common delimiters
 * - range: text input with placeholder
 */
export const spreadsheetFields = createFieldsFromSchema(spreadsheetSchema, {
  format: {
    options: [
      { value: "csv", label: "CSV - Comma Separated Values" },
      { value: "xlsx", label: "XLSX - Excel 2007+" },
      { value: "xls", label: "XLS - Excel 97-2003" },
      { value: "xlsb", label: "XLSB - Excel Binary" },
      { value: "ods", label: "ODS - OpenDocument Spreadsheet" },
      { value: "fods", label: "FODS - Flat OpenDocument Spreadsheet" },
    ],
  },
  delimiter: {
    options: [
      { value: ",", label: "Comma (,)" },
      { value: ";", label: "Semicolon (;)" },
      { value: "\t", label: "Tab (\\t)" },
      { value: "|", label: "Pipe (|)" },
    ],
  },
  range: {
    placeholder: "e.g., A1:D10",
  },
});
