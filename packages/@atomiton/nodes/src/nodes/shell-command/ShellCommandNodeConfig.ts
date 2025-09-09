/**
 * Shell Command Configuration
 *
 * Configuration for executing system shell commands
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * Shell Command specific configuration schema
 */
const shellCommandSchema = {
  command: z
    .string()
    .min(1, "Command is required")
    .describe("Shell command to execute"),

  args: z.array(z.string()).default([]).describe("Command line arguments"),

  workingDirectory: z
    .string()
    .optional()
    .describe("Working directory for command execution"),

  timeout: z
    .number()
    .min(1000)
    .max(300000)
    .default(30000)
    .describe("Command timeout in milliseconds"),

  shell: z.string().optional().describe("Shell to use for command execution"),

  environment: z
    .record(z.string())
    .default({})
    .describe("Environment variables"),

  captureOutput: z
    .boolean()
    .default(true)
    .describe("Whether to capture stdout and stderr"),

  inheritEnv: z
    .boolean()
    .default(true)
    .describe("Whether to inherit parent environment"),
};

/**
 * Shell Command Configuration Class
 */
class ShellCommandConfigClass extends NodeConfig<typeof shellCommandSchema> {
  constructor() {
    super(shellCommandSchema, {
      command: "echo",
      args: ["Hello World"],
      timeout: 30000,
      environment: {},
      captureOutput: true,
      inheritEnv: true,
    });
  }
}

// Create singleton instance
export const shellCommandConfig = new ShellCommandConfigClass();

// Export for backward compatibility and external use
export const shellCommandConfigSchema = shellCommandConfig.schema;
export const defaultShellCommandConfig = shellCommandConfig.defaults;
export type ShellCommandConfig = z.infer<typeof shellCommandConfig.schema>;

// Input/Output schemas for external use
export const ShellCommandInputSchema = z.object({
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  workingDirectory: z.string().optional(),
  stdin: z.string().optional(),
});

export type ShellCommandInput = z.infer<typeof ShellCommandInputSchema>;

export const ShellCommandOutputSchema = z.object({
  stdout: z.string(),
  stderr: z.string(),
  exitCode: z.number(),
  success: z.boolean(),
  command: z.string(),
  duration: z.number(),
  pid: z.number().optional(),
});

export type ShellCommandOutput = z.infer<typeof ShellCommandOutputSchema>;
