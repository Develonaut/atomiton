/**
 * Transform Node Definition
 * Browser-safe configuration for data transformation node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";

// Parameter schema using validation library
const transformSchema = {
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
 * Transform node definition (browser-safe)
 */
export const transformDefinition: NodeDefinition = createNodeDefinition({
  type: "atomic",
  metadata: createNodeMetadata({
    id: "transform",
    name: "Transform",
    variant: "transform",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Transform and manipulate data arrays",
    category: "data",
    icon: "wand-2",
    keywords: [
      "transform",
      "map",
      "filter",
      "reduce",
      "sort",
      "group",
      "data",
      "array",
      "manipulation",
      "flatten",
      "unique",
    ],
    tags: ["transform", "data", "array", "manipulation", "processing"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    transformSchema,
    {
      operation: "map" as const,
      transformFunction: "item => item",
      sortDirection: "asc" as const,
      reduceFunction: "(acc, item) => acc + item",
      reduceInitial: "0",
      flattenDepth: 1,
    },
    {
      operation: {
        controlType: "select",
        label: "Operation",
        helpText: "Type of transformation to perform",
        options: [
          { value: "map", label: "Map - Transform each item" },
          { value: "filter", label: "Filter - Keep items matching condition" },
          {
            value: "reduce",
            label: "Reduce - Combine items into single value",
          },
          { value: "sort", label: "Sort - Order items" },
          { value: "group", label: "Group - Group items by key" },
          { value: "flatten", label: "Flatten - Flatten nested arrays" },
          { value: "unique", label: "Unique - Remove duplicate items" },
          { value: "reverse", label: "Reverse - Reverse array order" },
        ],
      },
      transformFunction: {
        controlType: "code",
        label: "Transform Function",
        placeholder: "item => ({ ...item, processed: true })",
        helpText: "JavaScript function for map/filter transformation",
        rows: 5,
      },
      filterCondition: {
        controlType: "code",
        label: "Filter Condition",
        placeholder: "item => item.value > 0",
        helpText: "Condition function for filter operation",
        rows: 3,
      },
      sortKey: {
        controlType: "text",
        label: "Sort Key",
        placeholder: "name",
        helpText: "Property to sort by (leave empty to sort primitive values)",
      },
      sortDirection: {
        controlType: "select",
        label: "Sort Direction",
        helpText: "Sort order direction",
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
      reduceFunction: {
        controlType: "code",
        label: "Reduce Function",
        placeholder:
          "(accumulator, currentItem, index) => accumulator + currentItem",
        helpText: "Function to combine array items",
        rows: 3,
      },
      reduceInitial: {
        controlType: "text",
        label: "Initial Value",
        placeholder: "0",
        helpText: "Initial value for reduce operation (JSON format)",
      },
      flattenDepth: {
        controlType: "number",
        label: "Flatten Depth",
        helpText: "How many levels deep to flatten",
        min: 1,
        max: 10,
      },
    }
  ),
  inputPorts: [
    createNodePort("input", {
      id: "data",
      name: "Data",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Array of data to transform",
    }),
    createNodePort("input", {
      id: "function",
      name: "Function",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Transform function (overrides parameter)",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id: "result",
      name: "Result",
      dataType: "object",
      required: true,
      multiple: false,
      description: "Transformed data result",
    }),
    createNodePort("output", {
      id: "data",
      name: "Data",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Transformed data (alias for result)",
    }),
    createNodePort("output", {
      id: "inputCount",
      name: "Input Count",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of input items",
    }),
    createNodePort("output", {
      id: "outputCount",
      name: "Output Count",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of output items",
    }),
    createNodePort("output", {
      id: "operation",
      name: "Operation",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Type of transformation performed",
    }),
    createNodePort("output", {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the transformation was successful",
    }),
  ],
});

export default transformDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullTransformSchema = v.object({
  ...transformSchema,
  enabled: v.boolean().default(true),
  timeout: v.number().positive().default(30000),
  retries: v.number().int().min(0).default(1),
  label: v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type TransformParameters = VInfer<typeof fullTransformSchema>;
