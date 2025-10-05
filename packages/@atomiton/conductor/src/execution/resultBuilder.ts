/**
 * Execution result building utilities
 */

import type {
  ConductorExecutionContext,
  ExecutionError,
  ExecutionResult,
} from "#types";

type SuccessResultOptions = {
  success: true;
  data: unknown;
  duration: number;
  executedNodes: string[];
  context?: ConductorExecutionContext;
};

type ErrorResultOptions = {
  success: false;
  error: ExecutionError;
  duration: number;
  executedNodes: string[];
  context?: ConductorExecutionContext;
};

/**
 * Create a typed execution result object
 */
export function createExecutionResult(
  options: SuccessResultOptions | ErrorResultOptions,
): ExecutionResult {
  return options as ExecutionResult;
}
