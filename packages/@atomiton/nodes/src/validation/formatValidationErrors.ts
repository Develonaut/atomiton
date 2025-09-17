import type { ValidationError } from "./types";

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map((error) => `${error.path}: ${error.message} (${error.code})`)
    .join("\n");
}
