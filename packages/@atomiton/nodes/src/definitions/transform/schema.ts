/**
 * Transform Schema
 * Parameter validation schema for data transformation node
 */

import v from "@atomiton/validation";

/**
 * Transform parameter schema
 */
export const transformSchema = {
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
 * Default values for transform parameters
 */
export const transformDefaults = {
  operation        : "map" as const,
  transformFunction: "item => item",
  sortDirection    : "asc" as const,
  reduceFunction   : "(acc, item) => acc + item",
  reduceInitial    : "0",
  flattenDepth     : 1,
};