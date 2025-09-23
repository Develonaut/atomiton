/**
 * Parallel Node Executable
 * Node.js implementation with actual business logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { ParallelParameters } from "#definitions/parallel";
import { executeStrategy } from "#executables/parallel/operations";
import {
  calculateStats,
  createEmptyOutput,
  createErrorOutput,
  createParallelOutput,
  type ParallelOutput,
} from "#executables/parallel/utils";

export type { ParallelOutput };

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
            strategy   : config.strategy,
            concurrency: config.concurrency,
          }
        );

        if (operations.length === 0) {
          return {
            success: true,
            outputs: createEmptyOutput(),
          };
        }

        // Execute operations based on strategy
        const operationResults = await executeStrategy(
          operations,
          config,
          context
        );

        // Calculate statistics and create output
        const { completed, failed, duration, results } = calculateStats(
          operationResults,
          startTime
        );

        const output = createParallelOutput(completed, failed, duration, results);

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
          error  : errorMessage,
          outputs: createErrorOutput(Date.now() - startTime),
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
