/**
 * CSV Parser Node Package
 *
 * Complete node package demonstrating the new co-located architecture.
 * This is the SINGLE SOURCE OF TRUTH for the CSV Parser node.
 */

import { CSVParserLogic, csvParserConfigSchema } from "./CSVParser.logic";
import { CSVParserUI } from "./CSVParser.ui";
import { BaseNodePackage } from "../../base/NodePackage";
import type { NodeDefinition, PortDefinition } from "../../types";

/**
 * CSV Parser Node Definition
 * Defines the core node metadata, ports, and execution function
 */
const csvParserDefinition: NodeDefinition = {
  id: "csv-parser",
  name: "CSV Parser",
  description:
    "Parse CSV data into structured records with configurable options for delimiters, headers, and data validation",
  category: "data",
  type: "csv-parser",
  version: "2.0.0",

  // Input port definitions
  inputPorts: [
    {
      id: "csv_data",
      name: "CSV Data",
      type: "input",
      dataType: "string",
      required: true,
      multiple: false,
      description: "Raw CSV data as string",
    },
    {
      id: "headers",
      name: "Custom Headers",
      type: "input",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Optional custom column headers to use instead of first row",
    },
  ] as PortDefinition[],

  // Output port definitions
  outputPorts: [
    {
      id: "records",
      name: "Records",
      type: "output",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Parsed CSV records as array of objects or arrays",
    },
    {
      id: "headers",
      name: "Headers",
      type: "output",
      dataType: "array",
      required: true,
      multiple: false,
      description:
        "Column headers extracted from CSV or generated automatically",
    },
    {
      id: "row_count",
      name: "Row Count",
      type: "output",
      dataType: "number",
      required: true,
      multiple: false,
      description: "Number of data rows successfully parsed",
    },
    {
      id: "metadata",
      name: "Parsing Metadata",
      type: "output",
      dataType: "object",
      required: false,
      multiple: false,
      description:
        "Additional parsing information including timing, statistics, and validation results",
    },
  ] as PortDefinition[],

  // Configuration schema (convert Zod schema to plain object)
  configSchema: csvParserConfigSchema.shape as unknown as Record<
    string,
    unknown
  >,

  // Default configuration values
  defaultConfig: {
    delimiter: ",",
    quote: '"',
    escape: "\\",
    hasHeaders: true,
    skipEmptyLines: true,
    trimFields: true,
    encoding: "utf8",
    validateData: true,
    outputFormat: "objects",
  },

  // Node metadata
  metadata: {
    // Execution settings
    executionSettings: {
      timeout: 300000, // 5 minutes max
      retries: 0, // No retries for parsing operations
      sandbox: false,
      async: true,
    },
    author: "Atomiton Core Team",
    tags: ["data", "parser", "csv", "text", "import"],
    deprecated: false,
    experimental: false,
    icon: "file-csv",
    documentationUrl: "https://docs.atomiton.com/nodes/csv-parser",
  },

  // Main execution function (delegates to logic implementation)
  execute: async (context) => {
    const logic = new CSVParserLogic();
    const config = csvParserConfigSchema.parse(context.config || {});
    return logic.execute(context, config);
  },
};

/**
 * Complete CSV Parser Node Package
 * This is the exported node package that the registry will use
 */
export class CSVParserNodePackage extends BaseNodePackage {
  readonly definition = csvParserDefinition;
  readonly logic = new CSVParserLogic();
  readonly ui = CSVParserUI;
  readonly configSchema = csvParserConfigSchema;
  // Tests are defined in CSVParser.test.ts and not included in production build

  readonly metadata = {
    version: "2.0.0",
    author: "Atomiton Core Team",
    description:
      "Parse CSV data into structured records with comprehensive configuration options",
    keywords: ["csv", "parser", "data", "import", "text", "spreadsheet"],
    icon: "file-csv",
    documentationUrl: "https://docs.atomiton.com/nodes/csv-parser",
    experimental: false,
    deprecated: false,
  };
}

/**
 * Default export - the complete node package
 */
const csvParserNode = new CSVParserNodePackage();
export default csvParserNode;

/**
 * Named exports for individual components
 */
export { csvParserConfigSchema } from "./CSVParser.config";
export type { CSVParserConfig } from "./CSVParser.config";
export { CSVParserLogic } from "./CSVParser.logic";
export { CSVParserUI } from "./CSVParser.ui";

/**
 * Type exports for external use
 */
export type CSVParserNodePackageType = typeof csvParserNode;
