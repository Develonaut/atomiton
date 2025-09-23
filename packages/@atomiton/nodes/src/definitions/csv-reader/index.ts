/**
 * CSV Reader Node Definition
 * Browser-safe configuration for CSV reading node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";

// Parameter schema
const csvReaderSchema = {
  filePath: v.string().optional().describe("Path to the CSV file to read"),

  data: v.string().optional().describe("Raw CSV data as string"),

  hasHeaders: v
    .boolean()
    .default(true)
    .describe("Whether the first row contains column headers"),

  delimiter: v.string().default(",").describe("Field delimiter character"),

  skipEmpty: v.boolean().default(false).describe("Skip empty rows in the CSV"),
};

/**
 * CSV Reader node definition (browser-safe)
 */
export const csvReaderDefinition: NodeDefinition = createNodeDefinition({
  type    : "atomic",
  metadata: createNodeMetadata({
    id          : "csv-reader",
    name        : "CSV Reader",
    variant     : "csv-reader",
    version     : "1.0.0",
    author      : "Atomiton Core Team",
    description : "Read CSV files and spreadsheet data",
    category    : "io",
    icon        : "table-2",
    keywords    : ["csv", "data", "import", "spreadsheet", "table", "file", "read"],
    tags        : ["csv", "data", "import", "spreadsheet", "table"],
    experimental: false,
    deprecated  : false,
  }),
  parameters: createNodeParameters(
    csvReaderSchema,
    {
      hasHeaders: true,
      delimiter : ",",
      skipEmpty : false,
    },
    {
      filePath: {
        controlType: "file",
        label      : "CSV File Path",
        placeholder: "Select or enter path to CSV file",
        helpText   : "The path to the CSV file you want to read",
      },
      data: {
        controlType: "textarea",
        label      : "Raw CSV Data",
        placeholder: "Paste CSV data here...",
        helpText   : "Raw CSV data as an alternative to file path",
      },
      hasHeaders: {
        controlType: "boolean",
        label      : "Has Header Row",
        helpText   : "Check if the first row contains column headers",
      },
      delimiter: {
        controlType: "select",
        label      : "Field Delimiter",
        helpText   : "Character used to separate fields in the CSV",
        options    : [
          { value: ",", label: "Comma (,)" },
          { value: ";", label: "Semicolon (;)" },
          { value: "\t", label: "Tab" },
          { value: "|", label: "Pipe (|)" },
        ],
      },
      skipEmpty: {
        controlType: "boolean",
        label      : "Skip Empty Rows",
        helpText   : "Skip empty rows when parsing CSV data",
      },
    }
  ),
  inputPorts: [
    createNodePort("input", {
      id         : "filePath",
      name       : "File Path",
      dataType   : "string",
      required   : false,
      multiple   : false,
      description: "Path to the CSV file to read",
    }),
    createNodePort("input", {
      id         : "data",
      name       : "CSV Data",
      dataType   : "string",
      required   : false,
      multiple   : false,
      description: "Raw CSV data as string",
    }),
    createNodePort("input", {
      id         : "content",
      name       : "Content",
      dataType   : "string",
      required   : false,
      multiple   : false,
      description: "Alternative input for CSV content",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id         : "records",
      name       : "Records",
      dataType   : "array",
      required   : true,
      multiple   : false,
      description: "Parsed CSV data as array of objects",
    }),
    createNodePort("output", {
      id         : "headers",
      name       : "Headers",
      dataType   : "array",
      required   : false,
      multiple   : false,
      description: "Column headers from CSV",
    }),
    createNodePort("output", {
      id         : "rowCount",
      name       : "Row Count",
      dataType   : "number",
      required   : false,
      multiple   : false,
      description: "Number of data rows",
    }),
  ],
});

export default csvReaderDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullCSVReaderSchema = v.object({
  ...csvReaderSchema,
  enabled    : v.boolean().default(true),
  timeout    : v.number().positive().default(30000),
  retries    : v.number().int().min(0).default(1),
  label      : v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type CSVReaderParameters = VInfer<typeof fullCSVReaderSchema>;
