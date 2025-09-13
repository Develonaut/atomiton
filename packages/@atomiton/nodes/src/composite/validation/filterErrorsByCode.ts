import type { ValidationError } from "../types.js";

/**
 * Filter validation errors by code
 */
export function filterErrorsByCode(
  errors: ValidationError[],
  codes: string[],
): ValidationError[] {
  const codeSet = new Set(codes);
  return errors.filter((error) => codeSet.has(error.code));
}
