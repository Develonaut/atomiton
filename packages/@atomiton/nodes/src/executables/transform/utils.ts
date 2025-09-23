/**
 * Transform Utilities
 * Helper functions for transform operations
 */

import type { NodeExecutionContext } from "#core/types/executable";

/**
 * Transform output structure
 */
export type TransformOutput = {
  result: unknown;
  data: unknown;
  inputCount: number;
  outputCount: number;
  operation: string;
  success: boolean;
};

/**
 * Get input value safely
 */
export function getInputValue<T>(
  context: NodeExecutionContext,
  key: string
): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Calculate output count for transformed data
 */
export function calculateOutputCount(transformedData: unknown): number {
  if (Array.isArray(transformedData)) {
    return transformedData.length;
  } else if (transformedData && typeof transformedData === "object") {
    return Object.keys(transformedData).length;
  } else {
    return 1;
  }
}

/**
 * Create transform output
 */
export function createTransformOutput(
  transformedData: unknown,
  inputCount: number,
  operation: string
): TransformOutput {
  const outputCount = calculateOutputCount(transformedData);

  return {
    result : transformedData,
    data   : transformedData,
    inputCount,
    outputCount,
    operation,
    success: true,
  };
}

/**
 * Create error output
 */
export function createErrorOutput(operation: string): TransformOutput {
  return {
    result     : null,
    data       : null,
    inputCount : 0,
    outputCount: 0,
    operation,
    success    : false,
  };
}

/**
 * Log transformation result
 */
export function logTransformResult(
  context: NodeExecutionContext,
  operation: string,
  inputCount: number,
  outputCount: number
): void {
  context.log?.info?.(`Transformation completed: ${operation}`, {
    inputCount,
    outputCount,
  });
}