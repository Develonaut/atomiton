/**
 * Code Node Schema
 * Runtime validation schema for code execution node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Code node specific schema (without base fields)
 */
export const codeSchemaShape = {
  code: v
    .string()
    .min(1, "Code expression is required")
    .describe("JavaScript expression to execute"),

  timeout: v
    .number()
    .min(100)
    .max(30000)
    .default(5000)
    .describe("Execution timeout in milliseconds"),

  returnType: v
    .enum(["auto", "string", "number", "boolean", "object", "array"])
    .default("auto")
    .describe("Expected return type"),

  memoryLimit: v
    .number()
    .min(8)
    .max(128)
    .default(32)
    .describe("Memory limit for isolated execution in MB"),
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
