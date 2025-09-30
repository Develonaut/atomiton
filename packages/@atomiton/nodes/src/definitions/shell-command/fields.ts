/**
 * Shell Command Field Configuration
 * UI field configurations for shell command parameters
 * MVP: Core command execution only
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { shellCommandSchema } from "#schemas/shell-command";

/**
 * Field configuration for shell command parameters
 *
 * Auto-derived from shellCommandSchema with selective overrides for:
 * - command: textarea with custom placeholder and rows
 * - args: textarea with custom placeholder and rows
 * - shell: enum with descriptive labels
 * - stdin: textarea with custom placeholder and rows
 */
export const shellCommandFields = createFieldsFromSchema(shellCommandSchema, {
  command: {
    controlType: "textarea",
    placeholder: "ls -la",
    rows: 3,
  },
  args: {
    controlType: "textarea",
    placeholder: '["--verbose", "--output", "result.txt"]',
    rows: 2,
  },
  shell: {
    options: [
      { value: "bash", label: "Bash" },
      { value: "sh", label: "sh" },
      { value: "zsh", label: "Zsh" },
    ],
  },
  stdin: {
    controlType: "textarea",
    placeholder: "Data to pipe to command",
    rows: 3,
  },
});
