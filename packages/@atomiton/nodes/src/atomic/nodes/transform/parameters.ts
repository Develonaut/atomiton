/**
 * Transform Node Parameters
 *
 * Parameter schema for data transformation operations
 */

import { z } from "zod";
import { createAtomicParameters } from "../../createAtomicParameters";

const transformSchema = {
  operation: z
    .enum(["map", "filter", "reduce", "sort", "group", "flatten"])
    .default("map")
    .describe("Type of transformation operation"),

  transformFunction: z
    .string()
    .default("item => item")
    .describe("JavaScript function for transformation"),

  filterCondition: z
    .string()
    .optional()
    .describe("Condition for filter operation"),

  sortKey: z.string().optional().describe("Key to sort by"),

  sortDirection: z
    .enum(["asc", "desc"])
    .default("asc")
    .describe("Sort direction"),

  groupBy: z.string().optional().describe("Key to group by"),

  reduceInitial: z
    .string()
    .default("0")
    .describe("Initial value for reduce operation"),
};

export const transformParameters = createAtomicParameters(
  transformSchema,
  {
    operation: "map" as const,
    transformFunction: "item => item",
    sortDirection: "asc" as const,
    reduceInitial: "0",
  },
  {
    operation: {
      controlType: "select",
      label: "Operation",
      helpText: "Type of transformation to perform",
      options: [
        { value: "map", label: "Map - Transform each item" },
        { value: "filter", label: "Filter - Keep items matching condition" },
        { value: "reduce", label: "Reduce - Combine items into single value" },
        { value: "sort", label: "Sort - Order items" },
        { value: "group", label: "Group - Group items by key" },
        { value: "flatten", label: "Flatten - Flatten nested arrays" },
      ],
    },
    transformFunction: {
      controlType: "code",
      label: "Transform Function",
      placeholder: "item => item",
      helpText: "JavaScript function for transformation",
      rows: 5,
    },
    filterCondition: {
      controlType: "code",
      label: "Filter Condition",
      placeholder: "item => item.value > 0",
      helpText: "Condition for filter operation",
      rows: 3,
    },
    sortKey: {
      controlType: "text",
      label: "Sort Key",
      placeholder: "name",
      helpText: "Property to sort by",
    },
    sortDirection: {
      controlType: "select",
      label: "Sort Direction",
      options: [
        { value: "asc", label: "Ascending" },
        { value: "desc", label: "Descending" },
      ],
    },
    groupBy: {
      controlType: "text",
      label: "Group By",
      placeholder: "category",
      helpText: "Property to group by",
    },
    reduceInitial: {
      controlType: "text",
      label: "Initial Value",
      placeholder: "0",
      helpText: "Initial value for reduce operation",
    },
  },
);

export type TransformParameters = z.infer<typeof transformParameters.schema>;
