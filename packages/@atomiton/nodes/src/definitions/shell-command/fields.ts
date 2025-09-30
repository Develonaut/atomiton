/**
 * Shell Command Field Configuration
 * UI field configurations for shell command parameters
 * MVP: Core command execution only
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
  args: {
    controlType: "textarea",
    label: "Arguments (optional)",
    placeholder: '["--verbose", "--output", "result.txt"]',
    helpText: "Command arguments as JSON array",
    rows: 2,
  },
  shell: {
    controlType: "select",
    label: "Shell",
    helpText: "Shell interpreter to use",
    options: [
      { value: "bash", label: "Bash" },
      { value: "sh", label: "sh" },
      { value: "zsh", label: "Zsh" },
    ],
  },
  stdin: {
    controlType: "textarea",
    label: "Stdin (optional)",
    placeholder: "Data to pipe to command",
    helpText: "Data to send to command's stdin",
    rows: 3,
  },
  captureOutput: {
    controlType: "boolean",
    label: "Capture Output",
    helpText: "Capture stdout and stderr",
  },
};
