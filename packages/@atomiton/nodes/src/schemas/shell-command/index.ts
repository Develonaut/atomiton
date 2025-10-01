/**
 * Shell Command Schema
 * Runtime validation schema for shell command node
 *
 * Security: Uses structured command format (program + args)
 * instead of shell strings to prevent command injection
 */

import v, { jsonString } from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Shell Command specific schema (without base fields)
 * Security: Structured API prevents command injection
 */
export const shellCommandSchemaShape = {
  program: v
    .string()
    .min(1, "Program is required")
    .describe("Program to execute (e.g., git, npm, echo)"),

  args: v
    .union([v.array(v.string()), jsonString(v.array(v.string()))])
    .default([])
    .describe(
      "Program arguments as array (e.g., ['status'], ['run', 'build'])",
    ),

  stdin: v.string().optional().describe("Data to pipe to stdin"),

  captureOutput: v
    .boolean()
    .default(true)
    .describe("Whether to capture command output"),
};

/**
 * Full Shell Command schema including base fields
 */
export const shellCommandSchema = baseSchema.extend(shellCommandSchemaShape);

/**
 * Type for Shell Command parameters
 */
export type ShellCommandParameters = VInfer<typeof shellCommandSchema>;

/**
 * Default export for registry
 */
export default shellCommandSchemaShape;
