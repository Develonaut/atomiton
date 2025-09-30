/**
 * CSV Reader Schema
 * Runtime validation schema for CSV reader node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * CSV Reader specific schema (without base fields)
 * MVP: Core CSV parsing only
 */
export const csvReaderSchemaShape = {
  path: v.string().describe("Path to the CSV file to read"),

  hasHeaders: v
    .boolean()
    .default(true)
    .describe("Whether the first row contains column headers"),

  delimiter: v.string().default(",").describe("Field delimiter character"),
};

/**
 * Full CSV Reader schema including base fields
 */
export const csvReaderSchema = baseSchema.extend(csvReaderSchemaShape);

/**
 * Type for CSV Reader parameters
 */
export type CSVReaderParameters = VInfer<typeof csvReaderSchema>;

/**
 * Default export for registry
 */
export default csvReaderSchemaShape;
