/**
 * Spreadsheet Reader Node Definition
 * Browser-safe configuration for multi-format spreadsheet reading node
 * Supports: CSV, XLSX, XLS, XLSB, ODS, FODS
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import { spreadsheetFields } from "#definitions/spreadsheet/fields";

/**
 * Default values for spreadsheet reader parameters
 */
export const spreadsheetDefaults = {
  hasHeaders: true,
  delimiter: ",",
  skipEmptyLines: true,
  sheetIndex: 0,
};

/**
 * Spreadsheet Reader node definition (browser-safe)
 */
export const spreadsheetDefinition: NodeDefinition = createNodeDefinition({
  type: "spreadsheet",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "spreadsheet",
    name: "Spreadsheet Reader",
    author: "Atomiton Core Team",
    description:
      "Read and parse spreadsheet files in multiple formats (CSV, XLSX, XLS, ODS, etc.)",
    category: "io",
    icon: "table-2",
    keywords: [
      "spreadsheet",
      "excel",
      "csv",
      "xlsx",
      "xls",
      "ods",
      "data",
      "import",
      "table",
      "file",
      "read",
    ],
    tags: ["spreadsheet", "data", "import", "io", "excel"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(spreadsheetDefaults),
  fields: spreadsheetFields,
  inputPorts: [
    createNodePort("input", {
      id: "filePath",
      name: "File Path",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Path to the spreadsheet file to read",
    }),
    createNodePort("input", {
      id: "data",
      name: "Raw Data",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Raw spreadsheet data content",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id: "records",
      name: "Records",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Parsed spreadsheet data as array of objects",
    }),
    createNodePort("output", {
      id: "headers",
      name: "Headers",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Column headers from the spreadsheet",
    }),
    createNodePort("output", {
      id: "rowCount",
      name: "Row Count",
      dataType: "number",
      required: true,
      multiple: false,
      description: "Number of data rows parsed",
    }),
    createNodePort("output", {
      id: "sheetName",
      name: "Sheet Name",
      dataType: "string",
      required: true,
      multiple: false,
      description: "Name of the sheet that was read",
    }),
  ],
});

export default spreadsheetDefinition;
