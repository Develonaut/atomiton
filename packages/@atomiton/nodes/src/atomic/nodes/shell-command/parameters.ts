/**
 * Shell Command Node Parameters
 *
 * Parameter schema for executing shell commands
 */

import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { createAtomicParameters } from "../../createAtomicParameters";

const shellCommandSchema = {
  command: v
    .string()
    .min(1, "Command is required")
    .describe("Shell command to execute"),

  args: v.array(v.string()).default([]).describe("Command arguments"),

  workingDirectory: v
    .string()
    .optional()
    .describe("Working directory for command execution"),

  environment: v
    .record(v.string())
    .default({})
    .describe("Environment variables"),

  shell: v
    .string()
    .default("/bin/bash")
    .describe("Shell to use for command execution"),

  captureOutput: v
    .boolean()
    .default(true)
    .describe("Whether to capture stdout/stderr"),

  inheritStdio: v
    .boolean()
    .default(false)
    .describe("Whether to inherit stdio from parent process"),
};

export const shellCommandParameters = createAtomicParameters(
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

export type ShellCommandParameters = VInfer<
  typeof shellCommandParameters.schema
>;
