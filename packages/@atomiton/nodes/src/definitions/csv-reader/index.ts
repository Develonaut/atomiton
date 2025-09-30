/**
 * CSV Reader Node Definition
 * Browser-safe configuration for CSV reading node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { NodeFieldsConfig } from "#core/types/parameters.js";

/**
 * Default values for CSV reader parameters
 * MVP: Core CSV parsing only
 */
export const csvReaderDefaults = {
  hasHeaders: true,
  delimiter: ",",
};

/**
 * Field configurations for CSV reader parameters
 * MVP: Core CSV parsing only
 */
export const csvReaderFields: NodeFieldsConfig = {
  path: {
    controlType: "text",
    label: "CSV File Path",
    placeholder: "/path/to/file.csv",
    helpText: "Path to the CSV file",
    required: true,
  },
  hasHeaders: {
    controlType: "boolean",
    label: "Has Headers",
    helpText: "First row contains column headers",
  },
  delimiter: {
    controlType: "select",
    label: "Delimiter",
    helpText: "Field separator character",
    options: [
      { value: ",", label: "Comma" },
      { value: ";", label: "Semicolon" },
      { value: "\t", label: "Tab" },
      { value: "|", label: "Pipe" },
    ],
  },
};

/**
 * CSV Reader node definition (browser-safe)
 */
export const csvReaderDefinition: NodeDefinition = createNodeDefinition({
  type: "csv-reader",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "csv-reader",
    name: "CSV Reader",
    author: "Atomiton Core Team",
    description: "Read CSV files and spreadsheet data",
    category: "io",
    icon: "table-2",
    keywords: ["csv", "data", "import", "spreadsheet", "table", "file", "read"],
    tags: ["csv", "data", "import", "spreadsheet", "table"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(csvReaderDefaults),
  fields: csvReaderFields,
  inputPorts: [
    createNodePort("input", {
      id: "filePath",
      name: "File Path",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Path to the CSV file to read",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id: "records",
      name: "Records",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Parsed CSV data as array of objects",
    }),
  ],
});

export default csvReaderDefinition;
