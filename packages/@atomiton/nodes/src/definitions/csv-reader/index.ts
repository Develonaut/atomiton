/**
 * CSV Reader Node Definition
 * Browser-safe configuration for CSV reading node
 */

import v from '@atomiton/validation';
import type { VInfer } from '@atomiton/validation';
import type { NodeDefinition } from '../../core/types/definition';
import { createNodeDefinition } from '../../core/factories/createNodeDefinition';
import createNodeMetadata from '../../core/factories/createNodeMetadata';
import createNodeParameters from '../../core/factories/createNodeParameters';
import createNodePorts from '../../core/factories/createNodePorts';

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
  type: "atomic",
  metadata: createNodeMetadata({
    id: "csv-reader",
    name: "CSV Reader",
    variant: "csv-reader",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Read CSV files and spreadsheet data",
    category: "io",
    icon: "table-2",
    keywords: ["csv", "data", "import", "spreadsheet", "table", "file", "read"],
    tags: ["csv", "data", "import", "spreadsheet", "table"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    csvReaderSchema,
    {
      hasHeaders: true,
      delimiter: ",",
      skipEmpty: false,
    },
    {
      filePath: {
        controlType: "file",
        label: "CSV File Path",
        placeholder: "Select or enter path to CSV file",
        helpText: "The path to the CSV file you want to read",
      },
      data: {
        controlType: "textarea",
        label: "Raw CSV Data",
        placeholder: "Paste CSV data here...",
        helpText: "Raw CSV data as an alternative to file path",
      },
      hasHeaders: {
        controlType: "boolean",
        label: "Has Header Row",
        helpText: "Check if the first row contains column headers",
      },
      delimiter: {
        controlType: "select",
        label: "Field Delimiter",
        helpText: "Character used to separate fields in the CSV",
        options: [
          { value: ",", label: "Comma (,)" },
          { value: ";", label: "Semicolon (;)" },
          { value: "\t", label: "Tab" },
          { value: "|", label: "Pipe (|)" },
        ],
      },
      skipEmpty: {
        controlType: "boolean",
        label: "Skip Empty Rows",
        helpText: "Skip empty rows when parsing CSV data",
      },
    }
  ),
  ports: createNodePorts({
    input: [
      {
        id: "filePath",
        name: "File Path",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Path to the CSV file to read",
      },
      {
        id: "data",
        name: "CSV Data",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Raw CSV data as string",
      },
      {
        id: "content",
        name: "Content",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Alternative input for CSV content",
      },
    ],
    output: [
      {
        id: "records",
        name: "Records",
        dataType: "array",
        required: true,
        multiple: false,
        description: "Parsed CSV data as array of objects",
      },
      {
        id: "headers",
        name: "Headers",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Column headers from CSV",
      },
      {
        id: "rowCount",
        name: "Row Count",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Number of data rows",
      },
    ],
  }),
});

export default csvReaderDefinition;

// Export the parameter type for use in the executable
export type CSVReaderParameters = VInfer<typeof csvReaderDefinition.parameters.schema>;