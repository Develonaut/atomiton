/**
 * Validation Types
 *
 * Shared types for validation across all node types
 */

/**
 * Validation error structure
 */
export type ValidationError = {
  path: string;
  message: string;
  code: string;
  data?: unknown;
};

/**
 * Validation result
 */
export type ValidationResult = {
  success: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
};

/**
 * Validation severity levels
 */
export type ValidationSeverity = "error" | "warning" | "info";

/**
 * Validation context for passing state through validators
 */
export type ValidationContext = {
  nodeType?: "atomic" | "composite";
  strict?: boolean;
  [key: string]: unknown;
};
