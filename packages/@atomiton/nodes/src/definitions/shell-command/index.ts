/**
 * Shell Command Node Definition
 * Browser-safe configuration for shell command execution node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";

// Parameter schema using validation library
const shellCommandSchema = {
  command: v
    .string()
    .min(1, "Command is required")
    .describe("Shell command to execute"),

  args: v
    .array(v.string())
    .default([])
    .describe("Command arguments as array of strings"),

  workingDirectory: v
    .string()
    .optional()
    .describe("Working directory for command execution"),

  environment: v
    .record(v.string())
    .default({})
    .describe("Environment variables as key-value pairs"),

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

  timeout: v
    .number()
    .min(1000)
    .max(300000)
    .default(30000)
    .describe("Command timeout in milliseconds"),

  killSignal: v
    .enum(["SIGTERM", "SIGKILL", "SIGINT"])
    .default("SIGTERM")
    .describe("Signal to use when killing timed out processes"),
};

/**
 * Shell Command node definition (browser-safe)
 */
export const shellCommandDefinition: NodeDefinition = createNodeDefinition({
  type: "atomic",
  metadata: createNodeMetadata({
    id: "shell-command",
    name: "Shell Command",
    variant: "shell-command",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Execute shell commands and capture output",
    category: "system",
    icon: "terminal",
    keywords: [
      "shell",
      "command",
      "terminal",
      "bash",
      "execute",
      "process",
      "system",
      "cli",
      "script",
    ],
    tags: ["shell", "command", "terminal", "system", "process"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    shellCommandSchema,
    {
      command: "echo 'Hello World'",
      args: [],
      environment: {},
      shell: "/bin/bash",
      captureOutput: true,
      inheritStdio: false,
      timeout: 30000,
      killSignal: "SIGTERM" as const,
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
        placeholder: '["--help", "--verbose"]',
        helpText: "Command arguments as JSON array",
        rows: 2,
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
        placeholder: '{"NODE_ENV": "production", "DEBUG": "true"}',
        helpText: "Environment variables as JSON object",
        rows: 3,
      },
      shell: {
        controlType: "select",
        label: "Shell",
        helpText: "Shell to use for command execution",
        options: [
          { value: "/bin/bash", label: "Bash" },
          { value: "/bin/sh", label: "Shell" },
          { value: "/bin/zsh", label: "Zsh" },
          { value: "powershell", label: "PowerShell (Windows)" },
          { value: "cmd", label: "Command Prompt (Windows)" },
        ],
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
      timeout: {
        controlType: "number",
        label: "Timeout (ms)",
        helpText: "Command timeout in milliseconds",
        min: 1000,
        max: 300000,
        step: 1000,
      },
      killSignal: {
        controlType: "select",
        label: "Kill Signal",
        helpText: "Signal to use when killing timed out processes",
        options: [
          { value: "SIGTERM", label: "SIGTERM - Graceful termination" },
          { value: "SIGKILL", label: "SIGKILL - Force kill" },
          { value: "SIGINT", label: "SIGINT - Interrupt" },
        ],
      },
    }
  ),
  inputPorts: [
    createNodePort("input", {
      id: "command",
      name: "Command",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Shell command to execute (overrides parameter)",
    }),
    createNodePort("input", {
      id: "args",
      name: "Arguments",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Command arguments (overrides parameter)",
    }),
    createNodePort("input", {
      id: "workingDirectory",
      name: "Working Directory",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Working directory (overrides parameter)",
    }),
    createNodePort("input", {
      id: "environment",
      name: "Environment",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Environment variables (merges with parameter)",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id: "result",
      name: "Result",
      dataType: "object",
      required: true,
      multiple: false,
      description: "Command execution result",
    }),
    createNodePort("output", {
      id: "stdout",
      name: "stdout",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Standard output",
    }),
    createNodePort("output", {
      id: "stderr",
      name: "stderr",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Standard error",
    }),
    createNodePort("output", {
      id: "exitCode",
      name: "Exit Code",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Command exit code",
    }),
    createNodePort("output", {
      id: "duration",
      name: "Duration",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Command execution duration in milliseconds",
    }),
    createNodePort("output", {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the command executed successfully",
    }),
    createNodePort("output", {
      id: "command",
      name: "Executed Command",
      dataType: "string",
      required: false,
      multiple: false,
      description: "The full command that was executed",
    }),
  ],
});

export default shellCommandDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullShellCommandSchema = v.object({
  ...shellCommandSchema,
  enabled: v.boolean().default(true),
  timeout: v.number().positive().default(30000),
  retries: v.number().int().min(0).default(1),
  label: v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type ShellCommandParameters = VInfer<typeof fullShellCommandSchema>;
