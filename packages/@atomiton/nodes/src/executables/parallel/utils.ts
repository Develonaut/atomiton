/**
 * Parallel Utilities
 * Helper functions for parallel execution
 */

import type { OperationResult } from "#executables/parallel/operations";

/**
 * Parallel execution output
 */
export type ParallelOutput = {
  results: unknown[];
  completed: number;
  failed: number;
  duration: number;
  success: boolean;
};

/**
 * Calculate execution statistics
 */
export function calculateStats(
  operationResults: OperationResult[],
  startTime: number,
): {
  completed: number;
  failed: number;
  duration: number;
  results: unknown[];
} {
  const completed = operationResults.filter(
    (r) => r.status === "fulfilled",
  ).length;
  const failed = operationResults.filter((r) => r.status === "rejected").length;
  const duration = Date.now() - startTime;

  // Extract values from results
  const results = operationResults.map((r) =>
    r.status === "fulfilled" ? r.value : { error: r.reason },
  );

  return { completed, failed, duration, results };
}

/**
 * Create parallel output
 */
export function createParallelOutput(
  completed: number,
  failed: number,
  duration: number,
  results: unknown[],
): ParallelOutput {
  return {
    results,
    completed,
    failed,
    duration,
    success: failed === 0,
  };
}

/**
 * Create empty output for edge cases
 */
export function createEmptyOutput(): ParallelOutput {
  return {
    results: [],
    completed: 0,
    failed: 0,
    duration: 0,
    success: true,
  };
}

/**
 * Create error output
 */
export function createErrorOutput(duration: number): ParallelOutput {
  return {
    results: [],
    completed: 0,
    failed: 0,
    duration,
    success: false,
  };
}
