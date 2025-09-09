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
    super(csvReaderSchema, {
      hasHeaders: true,
      delimiter: ",",
    });
  }
}

// Create singleton instance
export const csvReaderConfig = new CSVReaderConfigClass();

// Export for backward compatibility
export const csvReaderConfigSchema = csvReaderConfig.schema;
export const defaultCSVReaderConfig = csvReaderConfig.defaults;
export type CSVReaderConfig = z.infer<typeof csvReaderConfig.schema>;
