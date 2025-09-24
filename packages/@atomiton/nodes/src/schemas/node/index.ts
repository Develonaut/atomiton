/**
 * Node Schemas
 * Core validation schemas for node system components
 */

import v, { type VInfer } from "@atomiton/validation";

// Export base schema
export const baseSchema = v.object({
  enabled: v
    .boolean()
    .default(true)
    .describe("Whether this node is enabled for execution"),

  timeout: v
    .number()
    .positive()
    .default(30000)
    .describe("Maximum execution time in milliseconds"),

  retries: v
    .number()
    .int()
    .min(0)
    .default(1)
    .describe("Number of retry attempts on failure"),

  label: v.string().optional().describe("Custom label for this node instance"),

  description: v
    .string()
    .optional()
    .describe("Custom description for this node instance"),
});

export type BaseNodeParameters = VInfer<typeof baseSchema>;

// Export all node-related schemas
export { default as nodeDefinitionSchema } from "#schemas/node/definition";
export { default as nodeEdgeSchema } from "#schemas/node/edge";
export { default as nodeMetadataSchema } from "#schemas/node/metadata";
export { default as nodeParametersSchema } from "#schemas/node/parameters";
export { default as nodePortSchema } from "#schemas/node/port";
export { default as nodePositionSchema } from "#schemas/node/position";
export { default as nodeVariableSchema } from "#schemas/node/variable";
