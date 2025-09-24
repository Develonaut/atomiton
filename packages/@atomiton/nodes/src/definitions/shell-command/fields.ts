/**
 * Shell Command Field Configuration
 * UI field configurations for shell command parameters
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for shell command parameters
 */
export const shellCommandFields: NodeFieldsConfig = {
  command: {
    controlType: "textarea",
    label: "Command",
    placeholder: "ls -la",
    helpText: "Shell command to execute",
    rows: 3,
    required: true,
  },
  shell: {
    controlType: "select",
    label: "Shell",
    helpText: "Shell interpreter to use",
    options: [
      { value: "bash", label: "Bash" },
      { value: "sh", label: "Shell (sh)" },
      { value: "zsh", label: "Zsh" },
      { value: "powershell", label: "PowerShell" },
      { value: "cmd", label: "Command Prompt (Windows)" },
    ],
  },
  workingDirectory: {
    controlType: "text",
    label: "Working Directory",
    placeholder: "/path/to/directory",
    helpText: "Directory to execute command in",
  },
  env: {
    controlType: "textarea",
    label: "Environment Variables",
    placeholder: '{"PATH": "/usr/bin", "NODE_ENV": "production"}',
    helpText: "Environment variables as JSON object",
    rows: 3,
  },
  timeout: {
    controlType: "number",
    label: "Timeout (ms)",
    helpText: "Maximum time to wait for command completion",
    min: 1000,
    max: 3600000,
    step: 1000,
  },
  captureOutput: {
    controlType: "boolean",
    label: "Capture Output",
    helpText: "Capture stdout and stderr",
  },
  encoding: {
    controlType: "select",
    label: "Output Encoding",
    helpText: "Encoding for captured output",
    options: [
      { value: "utf8", label: "UTF-8" },
      { value: "base64", label: "Base64" },
      { value: "binary", label: "Binary" },
      { value: "ascii", label: "ASCII" },
      { value: "hex", label: "Hex" },
    ],
  },
  throwOnError: {
    controlType: "boolean",
    label: "Throw On Error",
    helpText: "Throw error if command exits with non-zero code",
  },
  stdin: {
    controlType: "textarea",
    label: "Stdin Data",
    placeholder: "Data to pipe to command",
    helpText: "Data to send to command's stdin",
    rows: 3,
  },
  maxBuffer: {
    controlType: "number",
    label: "Max Buffer Size",
    helpText: "Maximum buffer size for output (bytes)",
    min: 1024,
    max: 104857600,
    step: 1024,
  },
  killSignal: {
    controlType: "text",
    label: "Kill Signal",
    placeholder: "SIGTERM",
    helpText: "Signal to send when killing process",
  },
  args: {
    controlType: "textarea",
    label: "Command Arguments",
    placeholder: '["--verbose", "--output", "result.txt"]',
    helpText: "Command arguments as JSON array",
    rows: 2,
  },
  environment: {
    controlType: "textarea",
    label: "Environment Variables",
    placeholder: '{"PATH": "/usr/bin", "NODE_ENV": "production"}',
    helpText: "Additional environment variables as JSON object",
    rows: 3,
  },
  inheritStdio: {
    controlType: "boolean",
    label: "Inherit Stdio",
    helpText: "Inherit parent process standard I/O streams",
  },
};
