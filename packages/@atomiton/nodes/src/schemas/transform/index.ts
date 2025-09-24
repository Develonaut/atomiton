/**
 * Transform Schema
 * Runtime validation schema for data transformation node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Transform specific schema (without base fields)
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
    ])
    .default("map")
    .describe("Type of transformation operation"),

  transformFunction: v
    .string()
    .default("item => item")
    .describe("JavaScript function for transformation (map/filter operations)"),

  filterCondition: v
    .string()
    .optional()
    .describe("Condition for filter operation"),

  sortKey: v.string().optional().describe("Property key to sort by"),

  sortDirection: v
    .enum(["asc", "desc"])
    .default("asc")
    .describe("Sort direction"),

  groupBy: v.string().optional().describe("Property key to group by"),

  reduceFunction: v
    .string()
    .default("(acc, item) => acc + item")
    .describe("JavaScript function for reduce operation"),

  reduceInitial: v
    .string()
    .default("0")
    .describe("Initial value for reduce operation"),

  flattenDepth: v
    .number()
    .min(1)
    .max(10)
    .default(1)
    .describe("Depth level for flatten operation"),
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
