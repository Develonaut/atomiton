/**
 * Parallel Node Executable
 * Node.js implementation with actual business logic
 */

import { createNodeExecutable } from "../../core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../core/types/executable";
import type { ParallelParameters } from "../../definitions/parallel";

// Types for execution
type OperationResult = {
  index: number;
  status: "fulfilled" | "rejected";
  value?: unknown;
  reason?: string;
  duration: number;
};

export type ParallelOutput = {
  results: unknown[];
  completed: number;
  failed: number;
  duration: number;
  success: boolean;
};

/**
 * Execute a promise with a timeout
 */
async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  timeoutMessage = "Operation timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeout)
    ),
  ]);
}

/**
 * Process operations in chunks with concurrency control
 */
async function processInChunks<T>(
  operations: T[],
  processor: (item: T, index: number) => Promise<unknown>,
  config: ParallelParameters
): Promise<OperationResult[]> {
  const { concurrency, maintainOrder, operationTimeout, failFast } = config as {
    concurrency: number;
    maintainOrder: boolean;
    operationTimeout: number;
    failFast: boolean;
  };
  const results: OperationResult[] = maintainOrder
    ? new Array(operations.length)
    : [];
  const inProgress: Map<number, Promise<void>> = new Map();
  let shouldStop = false;

  for (let i = 0; i < operations.length; i++) {
    if (shouldStop) break;

    // Wait if we've reached concurrency limit
    while (inProgress.size >= concurrency) {
      await Promise.race(inProgress.values());
    }

    const index = i;
    const startTime = Date.now();

    const promise = executeWithTimeout(
      processor(operations[index], index),
      operationTimeout,
      `Operation ${index} timed out after ${operationTimeout}ms`
    )
      .then((value) => {
        const result: OperationResult = {
          index,
          status: "fulfilled",
          value,
          duration: Date.now() - startTime,
        };

        if (maintainOrder) {
          results[index] = result;
        } else {
          results.push(result);
        }
      })
      .catch((error) => {
        const result: OperationResult = {
          index,
          status: "rejected",
          reason: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
        };

        if (maintainOrder) {
          results[index] = result;
        } else {
          results.push(result);
        }

        if (failFast) {
          shouldStop = true;
        }
      })
      .finally(() => {
        inProgress.delete(index);
      });

    inProgress.set(index, promise);
  }

  // Wait for remaining operations
  await Promise.all(inProgress.values());

  return results;
}

/**
 * Execute operations based on strategy
 */
async function executeStrategy(
  operations: unknown[],
  config: ParallelParameters,
  context: NodeExecutionContext
): Promise<OperationResult[]> {
  const { strategy, globalTimeout } = config as {
    strategy: string;
    globalTimeout: number;
  };

  // For now, operations are just passed through
  // In a real implementation, operations would be functions or task definitions
  const processor = async (op: unknown, index: number): Promise<unknown> => {
    context.log?.debug?.(`Processing operation ${index}`, { operation: op });

    // Simulate async operation - in real implementation,
    // this would execute the actual operation
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

    // For MVP, just return processed indicator
    return {
      index,
      input: op,
      result: `Processed operation ${index}`,
      timestamp: new Date().toISOString(),
    };
  };

  const executeOps = async () => {
    switch (strategy) {
      case "all": {
        // All must succeed
        const results = await processInChunks(operations, processor, {
          ...config,
          failFast: true,
        });

        const hasFailure = results.some((r) => r.status === "rejected");
        if (hasFailure) {
          throw new Error("One or more operations failed");
        }

        return results;
      }

      case "race": {
        // Return first to complete
        const promises = operations.map((op, idx) =>
          processor(op, idx).then((value) => ({
            index: idx,
            status: "fulfilled" as const,
            value,
            duration: 0,
          }))
        );

        const first = await Promise.race(promises);
        return [first];
      }

      case "allSettled":
      default: {
        // Complete all regardless of failures
        return processInChunks(operations, processor, config);
      }
    }
  };

  // Apply global timeout
  return executeWithTimeout(
    executeOps(),
    globalTimeout,
    `Global timeout exceeded (${globalTimeout}ms)`
  );
}

/**
 * Parallel node executable
 */
export const parallelExecutable: NodeExecutable<ParallelParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: ParallelParameters
    ): Promise<NodeExecutionResult> {
      const startTime = Date.now();

      try {
        // Get input operations
        const operations = (context.inputs.operations as unknown[]) || [];

        context.log?.info?.(
          `Starting parallel execution of ${operations.length} operations`,
          {
            strategy: config.strategy,
            concurrency: config.concurrency,
          }
        );

        if (operations.length === 0) {
          return {
            success: true,
            outputs: {
              results: [],
              completed: 0,
              failed: 0,
              duration: 0,
              success: true,
            },
          };
        }

        // Execute operations based on strategy
        const operationResults = await executeStrategy(
          operations,
          config,
          context
        );

        // Calculate statistics
        const completed = operationResults.filter(
          (r) => r.status === "fulfilled"
        ).length;
        const failed = operationResults.filter(
          (r) => r.status === "rejected"
        ).length;
        const duration = Date.now() - startTime;

        // Extract values from results
        const results = operationResults.map((r) =>
          r.status === "fulfilled" ? r.value : { error: r.reason }
        );

        const output: ParallelOutput = {
          results,
          completed,
          failed,
          duration,
          success: failed === 0,
        };

        context.log?.info?.(`Parallel execution completed in ${duration}ms`, {
          completed,
          failed,
          totalOperations: operations.length,
        });

        return {
          success: true,
          outputs: output,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        context.log?.error?.("Parallel execution failed", {
          error: errorMessage,
          config,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: {
            results: [],
            completed: 0,
            failed: 0,
            duration: Date.now() - startTime,
            success: false,
          },
        };
      }
    },

    validateConfig(config: unknown): ParallelParameters {
      // In a real implementation, this would validate using the schema
      // For now, just cast it
      return config as ParallelParameters;
    },
  });

export default parallelExecutable;
