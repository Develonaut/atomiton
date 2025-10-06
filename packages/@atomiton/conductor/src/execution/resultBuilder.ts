/**
 * Execution result building utilities
 */

import type {
  ConductorExecutionContext,
  ExecutionError,
  ExecutionResult,
  ExecutionTrace,
} from "#types";

type SuccessResultOptions = {
  success: true;
  data: unknown;
  duration: number;
  executedNodes: string[];
  context?: ConductorExecutionContext;
  trace?: ExecutionTrace;
};

type ErrorResultOptions = {
  success: false;
  error: ExecutionError;
  duration: number;
  executedNodes: string[];
  context?: ConductorExecutionContext;
  trace?: ExecutionTrace;
};

/**
 * Create a typed execution result object
 */
export function createExecutionResult(
  options: SuccessResultOptions | ErrorResultOptions,
): ExecutionResult {
  return options as ExecutionResult;
}
