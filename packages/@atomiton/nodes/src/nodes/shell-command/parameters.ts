/**
 * Shell Command Node Parameters
 *
 * Parameter schema for executing shell commands
 */

import { z } from "zod";
import { createNodeParameters } from "../../base/createNodeParameters";

const shellCommandSchema = {
  command: z
    .string()
    .min(1, "Command is required")
    .describe("Shell command to execute"),

  args: z.array(z.string()).default([]).describe("Command arguments"),

  workingDirectory: z
    .string()
    .optional()
    .describe("Working directory for command execution"),

  environment: z
    .record(z.string())
    .default({})
    .describe("Environment variables"),

  shell: z
    .string()
    .default("/bin/bash")
    .describe("Shell to use for command execution"),

  captureOutput: z
    .boolean()
    .default(true)
    .describe("Whether to capture stdout/stderr"),

  inheritStdio: z
    .boolean()
    .default(false)
    .describe("Whether to inherit stdio from parent process"),
};

export const shellCommandParameters = createNodeParameters(
  shellCommandSchema,
  {
    command: "echo 'Hello World'",
    args: [],
    environment: {},
    shell: "/bin/bash",
    captureOutput: true,
    inheritStdio: false,
  },
  {
    command: {
      controlType: "textarea",
      label: "Command",
      placeholder: "echo 'Hello World'",
      helpText: "Shell command to execute",
      rows: 3,
    },
    args: {
      controlType: "textarea",
      label: "Arguments",
      placeholder: '["arg1", "arg2"]',
      helpText: "Command arguments as JSON array",
    },
    workingDirectory: {
      controlType: "text",
      label: "Working Directory",
      placeholder: "/path/to/directory",
      helpText: "Working directory for command execution",
    },
    environment: {
      controlType: "textarea",
      label: "Environment Variables",
      placeholder: '{"NODE_ENV": "production"}',
      helpText: "Environment variables as JSON object",
    },
    shell: {
      controlType: "text",
      label: "Shell",
      placeholder: "/bin/bash",
      helpText: "Shell to use for command execution",
    },
    captureOutput: {
      controlType: "boolean",
      label: "Capture Output",
      helpText: "Whether to capture stdout/stderr",
    },
    inheritStdio: {
      controlType: "boolean",
      label: "Inherit Stdio",
      helpText: "Whether to inherit stdio from parent process",
    },
  },
);

export type ShellCommandParameters = z.infer<
  typeof shellCommandParameters.schema
>;
