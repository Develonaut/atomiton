/**
 * Parallel Node Executable
 * Node.js implementation with actual business logic
 */

import { createExecutable } from "#core/utils/executable";
import type { ParallelParameters } from "#schemas/parallel";
import { executeStrategy } from "#executables/parallel/operations";
import {
  calculateStats,
  createEmptyOutput,
  createParallelOutput,
  type ParallelOutput,
} from "#executables/parallel/utils";

export type { ParallelOutput };

/**
 * Parallel node executable
 */
export const parallelExecutable = createExecutable<ParallelParameters>(
  "parallel",
  async ({ getInput, config, context, startTime }) => {
    // Get input operations using the smart helper
    const operations = getInput<unknown[]>("operations") || [];

    if (operations.length === 0) {
      return createEmptyOutput();
    }

    // Execute operations based on strategy
    const operationResults = await executeStrategy(operations, config, context);

    // Calculate statistics and create output
    const { completed, failed, duration, results } = calculateStats(
      operationResults,
      startTime,
    );

    const output = createParallelOutput(completed, failed, duration, results);

    return output;
  },
);

export default parallelExecutable;
