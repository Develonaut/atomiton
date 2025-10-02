/**
 * Transform Schema
 * Runtime validation schema for data transformation node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Transform specific schema (without base fields)
 * Enhanced with all transformation operations
 */
export const transformSchemaShape = {
  operation: v
    .enum([
      "map",
      "filter",
      "reduce",
      "sort",
      "group",
      "flatten",
      "unique",
      "reverse",
      "limit",
      "skip",
      "slice",
    ])
    .default("map")
    .describe("Type of transformation operation"),

  transformFunction: v
    .string()
    .default("item => item")
    .describe("JavaScript function for map/filter/reduce operations"),

  sortKey: v.string().optional().describe("Property key to sort by"),

  sortDirection: v
    .enum(["asc", "desc"])
    .default("asc")
    .describe("Sort direction (ascending or descending)"),

  reduceInitial: v
    .string()
    .optional()
    .describe("Initial value for reduce operation"),

  groupKey: v.string().optional().describe("Property key to group by"),

  flattenDepth: v
    .number()
    .min(1)
    .max(10)
    .default(1)
    .describe("Depth level for flatten operation"),

  limitCount: v
    .number()
    .min(1)
    .optional()
    .describe("Number of items to return for limit operation"),

  skipCount: v
    .number()
    .min(0)
    .optional()
    .describe("Number of items to skip for skip operation"),

  sliceStart: v
    .number()
    .min(0)
    .optional()
    .describe("Start index for slice operation"),

  sliceEnd: v
    .number()
    .optional()
    .describe("End index for slice operation (exclusive)"),

  data: v
    .array(v.unknown())
    .optional()
    .describe(
      "Input data array for transformation (used for testing/standalone execution)",
    ),
};

/**
 * Full Transform schema including base fields
 */
export const transformSchema = baseSchema.extend(transformSchemaShape);

/**
 * Type for Transform parameters
 */
export type TransformParameters = VInfer<typeof transformSchema>;

/**
 * Default export for registry
 */
export default transformSchemaShape;
