/**
 * CSV Reader Configuration
 *
 * Configuration for reading CSV files and spreadsheet data
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * CSV Reader specific configuration schema
 */
const csvReaderSchema = {
  // File source options
  filePath: z.string().optional().describe("Path to the CSV file to read"),

  hasHeaders: z
    .boolean()
    .default(true)
    .describe("Whether the first row contains column headers"),

  delimiter: z.string().default(",").describe("Field delimiter character"),
};

/**
 * CSV Reader Configuration Class
 */
class CSVReaderConfigClass extends NodeConfig<typeof csvReaderSchema> {
  constructor() {
    super(
      csvReaderSchema,
      {
        hasHeaders: true,
        delimiter: ",",
      },
      {
        fields: {
          filePath: {
            controlType: "file",
            label: "CSV File Path",
            placeholder: "Select or enter path to CSV file",
            helpText: "The path to the CSV file you want to read",
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
        },
        layout: {
          groups: {
            file: { label: "File Settings", order: 1 },
            format: { label: "Format Settings", order: 2 },
          },
        },
      },
    );
  }
}

// Create singleton instance
export const csvReaderConfig = new CSVReaderConfigClass();

// Export for backward compatibility
export const csvReaderConfigSchema = csvReaderConfig.schema;
export const defaultCSVReaderConfig = csvReaderConfig.defaults;
export type CSVReaderConfig = z.infer<typeof csvReaderConfig.schema>;
