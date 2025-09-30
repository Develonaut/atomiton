/**
 * Transform Schema
 * Runtime validation schema for data transformation node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Transform specific schema (without base fields)
 * MVP: Core transformation operations only
 */
export const transformSchemaShape = {
  operation: v
    .enum(["map", "filter", "sort", "flatten"])
    .default("map")
    .describe("Type of transformation operation"),

  transformFunction: v
    .string()
    .default("item => item")
    .describe("JavaScript function for map/filter operations"),

  sortKey: v.string().optional().describe("Property key to sort by"),

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
