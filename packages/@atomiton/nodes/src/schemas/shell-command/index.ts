/**
 * Shell Command Schema
 * Runtime validation schema for shell command node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Shell Command specific schema (without base fields)
 * MVP: Core command execution only
 */
export const shellCommandSchemaShape = {
  command: v
    .string()
    .min(1, "Command is required")
    .describe("Shell command to execute"),

  args: v.array(v.string()).default([]).describe("Command arguments as array"),

  shell: v
    .enum(["bash", "sh", "zsh"])
    .default("bash")
    .describe("Shell to use for execution"),

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
