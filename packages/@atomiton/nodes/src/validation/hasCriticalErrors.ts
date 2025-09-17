import type { ValidationResult } from "./types";

/**
 * Check if validation result has critical errors
 */
export function hasCriticalErrors(result: ValidationResult): boolean {
  const criticalCodes = [
    "DUPLICATE_NODE_ID",
    "DUPLICATE_EDGE_ID",
    "INVALID_SOURCE_NODE",
    "INVALID_TARGET_NODE",
    "INVALID_TIMESTAMP",
  ];

  return result.errors.some((error) => criticalCodes.includes(error.code));
}
