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
 */
export const csvReaderDefaults = {
  hasHeaders: true,
  delimiter: ",",
  skipEmpty: false,
};

/**
 * Field configurations for CSV reader parameters
 */
export const csvReaderFields: NodeFieldsConfig = {
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
