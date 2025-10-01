/**
 * Shell Command Field Configuration
 * UI field configurations for shell command parameters
 *
 * Security: Uses structured command format (program + args)
 * to prevent command injection attacks
 */

import { createFieldsFromSchema } from "#core/utils/createFieldsFromSchema";
import { shellCommandSchema } from "#schemas/shell-command";

/**
 * Field configuration for shell command parameters
 *
 * Auto-derived from shellCommandSchema with selective overrides for:
 * - program: text input with example placeholder
 * - args: textarea with JSON array placeholder
 * - stdin: textarea with custom placeholder and rows
 */
export const shellCommandFields = createFieldsFromSchema(shellCommandSchema, {
  program: {
    controlType: "text",
    placeholder: "git",
  },
  args: {
    controlType: "textarea",
    placeholder: '["status", "--short"]',
    rows: 3,
  },
  stdin: {
    controlType: "textarea",
    placeholder: "Data to pipe to command",
    rows: 3,
  },
});
