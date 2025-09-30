/**
 * Loop Schema
 * Runtime validation schema for loop node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Loop specific schema (without base fields)
 * MVP: Core loop types only
 */
export const loopSchemaShape = {
  loopType: v
    .enum(["forEach", "times", "while"])
    .default("forEach")
    .describe("Type of loop operation"),

  array: v
    .array(v.unknown())
    .optional()
    .describe("Array to iterate over (for forEach)"),

  count: v
    .number()
    .min(1)
    .max(10000)
    .default(10)
    .describe("Number of iterations (for times)"),

  condition: v
    .string()
    .optional()
    .describe("JavaScript condition expression (for while)"),

  collectResults: v
    .boolean()
    .default(true)
    .describe("Collect results from each iteration into an array"),
};

/**
 * Full Loop schema including base fields
 */
export const loopSchema = baseSchema.extend(loopSchemaShape);

/**
 * Type for Loop parameters
 */
export type LoopParameters = VInfer<typeof loopSchema>;

/**
 * Default export for registry
 */
export default loopSchemaShape;
