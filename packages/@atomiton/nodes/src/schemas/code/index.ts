/**
 * Code Node Schema
 * Runtime validation schema for code execution node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Code node specific schema (without base fields)
 * MVP: Core code execution only
 */
export const codeSchemaShape = {
  code: v
    .string()
    .min(1, "Code expression is required")
    .describe("JavaScript expression to execute"),

  returnType: v
    .enum(["auto", "string", "number", "boolean", "object", "array"])
    .default("auto")
    .describe("Expected return type"),

  context: v
    .record(v.unknown())
    .default({})
    .describe("Variables to make available in code execution context"),
};

/**
 * Full Code schema including base fields
 */
export const codeSchema = baseSchema.extend(codeSchemaShape);

/**
 * Type for Code parameters
 */
export type CodeParameters = VInfer<typeof codeSchema>;

/**
 * Default export for registry
 */
export default codeSchemaShape;
