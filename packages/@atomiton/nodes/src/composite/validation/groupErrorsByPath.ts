import type { ValidationError } from "../types.js";

/**
 * Group validation errors by path
 */
export function groupErrorsByPath(
  errors: ValidationError[],
): Record<string, ValidationError[]> {
  const grouped: Record<string, ValidationError[]> = {};

  errors.forEach((error) => {
    if (!grouped[error.path]) {
      grouped[error.path] = [];
    }
    grouped[error.path].push(error);
  });

  return grouped;
}
