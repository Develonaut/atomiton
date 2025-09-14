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
    super(
      shellCommandSchema,
      {
        command: "echo",
        args: ["Hello World"],
        timeout: 30000,
        environment: {},
        captureOutput: true,
        inheritEnv: true,
      },
      {
        fields: {
          command: {
            controlType: "text",
            label: "Command",
            placeholder: "echo",
            helpText: "Shell command to execute (required)",
          },
          args: {
            controlType: "json",
            label: "Arguments",
            placeholder: '["Hello", "World"]',
            helpText: "Command line arguments as JSON array",
          },
          workingDirectory: {
            controlType: "file",
            label: "Working Directory",
            placeholder: "/path/to/directory",
            helpText: "Working directory for command execution",
          },
          timeout: {
            controlType: "number",
            label: "Timeout (ms)",
            placeholder: "30000",
            helpText: "Command timeout in milliseconds (1000-300000)",
            min: 1000,
            max: 300000,
          },
          shell: {
            controlType: "text",
            label: "Shell",
            placeholder: "/bin/bash",
            helpText: "Shell to use for command execution (optional)",
          },
          environment: {
            controlType: "json",
            label: "Environment Variables",
            placeholder: '{"PATH": "/usr/bin"}',
            helpText: "Environment variables as JSON object",
          },
          captureOutput: {
            controlType: "boolean",
            label: "Capture Output",
            helpText: "Whether to capture stdout and stderr",
          },
          inheritEnv: {
            controlType: "boolean",
            label: "Inherit Environment",
            helpText: "Whether to inherit parent process environment",
          },
        },
      },
    );
  }
}

export const shellCommandConfig = new ShellCommandConfigClass();

export type ShellCommandConfig = z.infer<typeof shellCommandConfig.schema>;

// Types for logic file usage
export type ShellCommandInput = {
  command?: string;
  args?: string[];
  workingDirectory?: string;
  stdin?: string;
};

export type ShellCommandOutput = {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
  command: string;
  duration: number;
  pid?: number;
};
