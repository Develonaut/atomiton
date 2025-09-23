/**
 * Loop Node Executable
 * Node.js implementation with loop iteration logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { LoopParameters } from "#definitions/loop";

// Types for loop operations
export type LoopOutput = {
  result: {
    results: unknown[];
    iterationCount: number;
    errors: unknown[];
    success: boolean;
    duration: number;
    completed: boolean;
    stopped: boolean;
  };
  results: unknown[];
  iterationCount: number;
  errors: unknown[];
  success: boolean;
  duration: number;
};

/**
 * Get input value safely
 */
function getInputValue<T>(
  context: NodeExecutionContext,
  key: string
): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Simple condition evaluator (simplified - in production, use a proper sandbox)
 */
function evaluateCondition(
  condition: string,
  context: Record<string, unknown>
): boolean {
  try {
    // Simple condition evaluation - in production, use a proper sandbox like vm2
    const func = new Function(...Object.keys(context), `return ${condition}`);
    return Boolean(func(...Object.values(context)));
  } catch (error) {
    throw new Error(
      `Invalid condition: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Execute forEach loop
 */
async function executeForEach(
  items: unknown[],
  config: LoopParameters,
  context: NodeExecutionContext
): Promise<{ results: unknown[]; errors: unknown[]; iterationCount: number }> {
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let iterationCount = 0;

  for (
    let i = 0;
    i < items.length && iterationCount < (config.maxIterations as number);
    i++
  ) {
    try {
      if ((config.delay as number) > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.delay as number)
        );
      }

      // Simple processing - in a real implementation, this would execute a processor function
      const processedItem = {
        index: i,
        item: items[i],
        processed: true,
        timestamp: new Date().toISOString(),
      };

      results.push(processedItem);
      iterationCount++;

      context.log?.debug?.(`Processed item ${i}`, { item: items[i] });
    } catch (error) {
      errors.push({
        index: i,
        item: items[i],
        error: error instanceof Error ? error.message : String(error),
      });

      if (!(config.continueOnError as boolean)) {
        break;
      }
    }
  }

  return { results, errors, iterationCount };
}

/**
 * Execute forRange loop
 */
async function executeForRange(
  config: LoopParameters,
  context: NodeExecutionContext
): Promise<{ results: unknown[]; errors: unknown[]; iterationCount: number }> {
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let iterationCount = 0;

  for (
    let i = config.startValue as number;
    ((config.stepSize as number) > 0
      ? i <= (config.endValue as number)
      : i >= (config.endValue as number)) &&
    iterationCount < (config.maxIterations as number);
    i += config.stepSize as number
  ) {
    try {
      if ((config.delay as number) > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.delay as number)
        );
      }

      results.push({
        value: i,
        iteration: iterationCount,
        timestamp: new Date().toISOString(),
      });
      iterationCount++;

      context.log?.debug?.(`Range iteration ${iterationCount}`, { value: i });
    } catch (error) {
      errors.push({
        value: i,
        iteration: iterationCount,
        error: error instanceof Error ? error.message : String(error),
      });

      if (!(config.continueOnError as boolean)) {
        break;
      }
    }
  }

  return { results, errors, iterationCount };
}

/**
 * Execute times loop
 */
async function executeTimes(
  config: LoopParameters,
  context: NodeExecutionContext
): Promise<{ results: unknown[]; errors: unknown[]; iterationCount: number }> {
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let iterationCount = 0;

  for (
    let i = 0;
    i < (config.times as number) &&
    iterationCount < (config.maxIterations as number);
    i++
  ) {
    try {
      if ((config.delay as number) > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.delay as number)
        );
      }

      results.push({
        iteration: i,
        timestamp: new Date().toISOString(),
      });
      iterationCount++;

      context.log?.debug?.(
        `Times iteration ${i + 1}/${config.times as number}`
      );
    } catch (error) {
      errors.push({
        iteration: i,
        error: error instanceof Error ? error.message : String(error),
      });

      if (!(config.continueOnError as boolean)) {
        break;
      }
    }
  }

  return { results, errors, iterationCount };
}

/**
 * Execute while/until loop
 */
async function executeWhileUntil(
  config: LoopParameters,
  context: NodeExecutionContext
): Promise<{ results: unknown[]; errors: unknown[]; iterationCount: number }> {
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let iterationCount = 0;

  if (!config.condition) {
    throw new Error(`Condition is required for ${config.loopType} loops`);
  }

  while (iterationCount < (config.maxIterations as number)) {
    try {
      if ((config.delay as number) > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.delay as number)
        );
      }

      // Evaluate condition
      const conditionContext = {
        iteration: iterationCount,
        results,
        errors,
      };

      const conditionResult = evaluateCondition(
        config.condition as string,
        conditionContext
      );

      // For while: continue if condition is true
      // For until: continue if condition is false
      const shouldContinue =
        config.loopType === "while" ? conditionResult : !conditionResult;

      if (!shouldContinue) {
        break;
      }

      results.push({
        iteration: iterationCount,
        condition: conditionResult,
        timestamp: new Date().toISOString(),
      });
      iterationCount++;

      context.log?.debug?.(`${config.loopType} iteration ${iterationCount}`, {
        condition: conditionResult,
      });
    } catch (error) {
      errors.push({
        iteration: iterationCount,
        error: error instanceof Error ? error.message : String(error),
      });

      if (!(config.continueOnError as boolean)) {
        break;
      }
      iterationCount++;
    }
  }

  return { results, errors, iterationCount };
}

/**
 * Loop node executable
 */
export const loopExecutable: NodeExecutable<LoopParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: LoopParameters
    ): Promise<NodeExecutionResult> {
      const startTime = Date.now();

      try {
        // Get input data
        const items = getInputValue<unknown[]>(context, "items") || [];

        context.log?.info?.("Starting loop operation", {
          loopType: config.loopType,
          maxIterations: config.maxIterations,
          itemCount: items.length,
        });

        let results: unknown[] = [];
        let iterationCount = 0;
        let errors: unknown[] = [];

        // Execute based on loop type
        switch (config.loopType) {
          case "forEach": {
            if (items.length === 0) {
              context.log?.warn?.("No items provided for forEach loop");
            }
            const result = await executeForEach(items, config, context);
            results = result.results;
            errors = result.errors;
            iterationCount = result.iterationCount;
            break;
          }

          case "forRange": {
            const result = await executeForRange(config, context);
            results = result.results;
            errors = result.errors;
            iterationCount = result.iterationCount;
            break;
          }

          case "times": {
            const result = await executeTimes(config, context);
            results = result.results;
            errors = result.errors;
            iterationCount = result.iterationCount;
            break;
          }

          case "while":
          case "until": {
            const result = await executeWhileUntil(config, context);
            results = result.results;
            errors = result.errors;
            iterationCount = result.iterationCount;
            break;
          }

          default:
            throw new Error(`Unknown loop type: ${config.loopType}`);
        }

        const duration = Date.now() - startTime;
        const success =
          errors.length === 0 || (config.continueOnError as boolean);
        const completed =
          iterationCount < (config.maxIterations as number) ||
          config.loopType === "forEach";

        const output: LoopOutput = {
          result: {
            results,
            iterationCount,
            errors,
            success,
            duration,
            completed,
            stopped: !completed,
          },
          results,
          iterationCount,
          errors,
          success,
          duration,
        };

        context.log?.info?.(`Loop completed: ${config.loopType}`, {
          iterationCount,
          errorCount: errors.length,
          duration,
          success,
          completed,
        });

        return {
          success: true,
          outputs: output,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("Loop operation failed", {
          error: errorMessage,
          loopType: config.loopType,
          duration,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: {
            result: {
              results: [],
              iterationCount: 0,
              errors: [{ error: errorMessage }],
              success: false,
              duration,
              completed: false,
              stopped: true,
            },
            results: [],
            iterationCount: 0,
            errors: [{ error: errorMessage }],
            success: false,
            duration,
          },
        };
      }
    },

    validateConfig(config: unknown): LoopParameters {
      // In a real implementation, this would validate using the schema
      // For now, just cast it
      return config as LoopParameters;
    },
  });

export default loopExecutable;
