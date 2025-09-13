import type { TransformationOptions } from "../types.js";

/**
 * Default transformation options
 */
export const DEFAULT_TRANSFORMATION_OPTIONS: Required<TransformationOptions> = {
  preserveComments: true,
  formatOutput: true,
  validateResult: true,
};
