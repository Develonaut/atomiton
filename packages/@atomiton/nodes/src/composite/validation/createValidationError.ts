import type { ValidationError } from "../types";

/**
 * Create a validation error
 */
export function createValidationError(
  path: string,
  message: string,
  code: string,
  data?: unknown,
): ValidationError {
  return { path, message, code, data };
}
