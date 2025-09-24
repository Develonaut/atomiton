/**
 * Loop Utilities
 * Common utilities for loop operations
 */

import type { NodeExecutionContext } from "#core/types/executable";

/**
 * Loop execution result
 */
export type LoopResult = {
  results: unknown[];
  errors: unknown[];
  iterationCount: number;
};

/**
 * Loop context for condition evaluation
 */
export type LoopContext = {
  iteration: number;
  lastResult: unknown;
};

/**
 * Simple condition evaluator (simplified - in production, use a proper sandbox)
 */
export function evaluateCondition(
  condition: string,
  context: Record<string, unknown>,
): boolean {
  try {
    // Simple condition evaluation - in production, use a proper sandbox like vm2
    const func = new Function(...Object.keys(context), `return ${condition}`);
    return Boolean(func(...Object.values(context)));
  } catch (error) {
    throw new Error(
      `Invalid condition: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Apply delay between iterations
 */
export async function applyDelay(delay: number): Promise<void> {
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

/**
 * Handle loop iteration error
 */
export function handleIterationError(
  error: unknown,
  index: number,
  errors: unknown[],
  continueOnError: boolean,
  item?: unknown,
): boolean {
  const errorInfo =
    item !== undefined
      ? {
          index,
          item,
          error: error instanceof Error ? error.message : String(error),
        }
      : {
          iteration: index,
          error: error instanceof Error ? error.message : String(error),
        };

  errors.push(errorInfo);
  return continueOnError;
}

/**
 * Log iteration debug info
 */
export function logIteration(
  context: NodeExecutionContext,
  message: string,
  data?: Record<string, unknown>,
): void {
  context.log?.debug?.(message, data);
}

/**
 * Create iteration result
 */
export function createIterationResult(
  type: "index" | "iteration" | "item",
  value: unknown,
  extra?: Record<string, unknown>,
): unknown {
  const base = {
    timestamp: new Date().toISOString(),
    ...extra,
  };

  switch (type) {
    case "index":
      return { index: value, value, ...base };
    case "iteration":
      return { iteration: value, ...base };
    case "item":
      return { index: value, item: value, processed: true, ...base };
    default:
      return base;
  }
}
