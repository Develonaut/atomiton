/**
 * Parallel Node Logic
 *
 * Business logic for running multiple operations simultaneously
 */

import { createAtomicExecutable } from "../../createAtomicExecutable";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../../exports/executable/execution-types";
import type { ParallelParameters } from "./parameters";
import {
  createSuccessResult,
  createErrorResult,
  logNodeExecution,
  getInputValue,
} from "../../../utils";

export type ParallelOutput = {
  results: unknown[];
  completed: number;
  failed: number;
  duration: number;
  success: boolean;
};

export const parallelExecutable = createAtomicExecutable<ParallelParameters>({
  async execute(
    context: NodeExecutionContext,
    config: ParallelParameters,
  ): Promise<NodeExecutionResult> {
    try {
      const operations = getInputValue<unknown[]>(context, "operations") || [];
      const startTime = Date.now();

      logNodeExecution(
        context,
        "info",
        `Starting parallel execution of ${operations.length} operations`,
        { config },
      );

      // Mock implementation for MVP
      const results = operations.map((op: unknown, index: number) => ({
        index,
        result: `Processed operation ${index}`,
        status: "completed",
      }));

      const duration = Date.now() - startTime;
      const output: ParallelOutput = {
        results,
        completed: operations.length,
        failed: 0,
        duration,
        success: true,
      };

      logNodeExecution(
        context,
        "info",
        `Parallel execution completed in ${duration}ms`,
      );
      return createSuccessResult(output);
    } catch (error) {
      logNodeExecution(context, "error", "Parallel execution failed", {
        error,
      });
      return createErrorResult(
        error instanceof Error ? error : new Error("Unknown error"),
      );
    }
  },
});
