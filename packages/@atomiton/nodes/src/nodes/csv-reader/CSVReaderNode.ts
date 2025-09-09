/**
 * CSV Reader Node
 *
 * Node for reading CSV files and spreadsheet data
 */

import { Node, NodeMetadata } from "../../base";
import { createNodeComponent } from "../../base/components";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import { csvReaderConfig, type CSVReaderConfig } from "./CSVReaderNodeConfig";
import { CSVReaderLogic } from "./CSVReaderNodeLogic";

/**
 * CSV Reader Node Class
 */
class CSVReaderNode extends Node<CSVReaderConfig> {
  // Create a component with the CSV Reader icon baked in
  readonly component = createNodeComponent("table-2", "CSVReader");

  readonly metadata = new NodeMetadata({
    id: "csv-reader",
    name: "CSV Reader",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Read CSV files",
    category: "io",
    type: "csv-reader",
    keywords: ["csv", "data", "import", "spreadsheet", "table"],
    icon: "table-2",
    tags: ["csv", "data", "import"],
    experimental: false,
    deprecated: false,
  });

  readonly config = csvReaderConfig;

  readonly logic = new CSVReaderLogic();

  readonly definition: NodeDefinition = {
    id: "csv-reader",
    name: "CSV Reader",
    description: "Read CSV files",
    category: "io",
    type: "csv-reader",
    version: "1.0.0",

    inputPorts: [] as NodePortDefinition[],

    outputPorts: [
      {
        id: "data",
        name: "Data",
        type: "output",
        dataType: "array",
        required: true,
        multiple: false,
        description: "Parsed CSV data as array of objects",
      },
      {
        id: "headers",
        name: "Headers",
        type: "output",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Column headers from CSV",
      },
      {
        id: "rowCount",
        name: "Row Count",
        type: "output",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Number of data rows",
      },
    ] as NodePortDefinition[],

    configSchema: csvReaderConfig.getShape() as unknown as Record<
      string,
      unknown
    >,
    defaultConfig: csvReaderConfig.defaults,

    metadata: {
      executionSettings: {
        timeout: 30000,
        retries: 1,
        sandbox: false,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["csv", "data", "import", "spreadsheet", "table"],
      icon: "table-2",
    },

    execute: async (context) => {
      return csvReader.execute(context);
    },
  };
}

// Export singleton instance
export const csvReader = new CSVReaderNode();
export default csvReader;

// Export types and schemas for external use
export {
  csvReaderConfigSchema,
  defaultCSVReaderConfig,
} from "./CSVReaderNodeConfig";
export type { CSVReaderConfig } from "./CSVReaderNodeConfig";
export { CSVReaderLogic } from "./CSVReaderNodeLogic";
