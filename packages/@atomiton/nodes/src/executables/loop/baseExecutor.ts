/**
 * Base Loop Executor
 * Common execution patterns for all loop types
 */

import type { NodeExecutionContext } from "#core/types/executable";
import type { LoopParameters } from "#definitions/loop";
import {
  type LoopContext,
  type LoopResult,
  applyDelay,
  createIterationResult,
  evaluateCondition,
  handleIterationError,
  logIteration,
} from "#executables/loop/loopUtils";

/**
 * Base loop execution with common error handling and iteration management
 */
export async function executeBaseLoop(
  config: LoopParameters,
  context: NodeExecutionContext,
  iteratorFn: (
    results: unknown[],
    errors: unknown[],
    iterationCount: number,
  ) => Promise<{ shouldContinue: boolean; incrementCount?: boolean }>,
): Promise<LoopResult> {
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let iterationCount = 0;
  const maxIterations = config.maxIterations as number;

  while (iterationCount < maxIterations) {
    try {
      await applyDelay(config.delay as number);

      const { shouldContinue, incrementCount = true } = await iteratorFn(
        results,
        errors,
        iterationCount,
      );

      if (incrementCount) {
        iterationCount++;
      }

      if (!shouldContinue) {
        break;
      }
    } catch (error) {
      const shouldContinue = handleIterationError(
        error,
        iterationCount,
        errors,
        config.continueOnError as boolean,
      );
      if (!shouldContinue) break;
      iterationCount++;
    }
  }

  return { results, errors, iterationCount };
}

/**
 * Execute condition-based loop (while, until, doWhile)
 */
export async function executeConditionLoop(
  condition: string,
  config: LoopParameters,
  context: NodeExecutionContext,
  options: {
    type: "while" | "until" | "doWhile";
    conditionValue?: boolean;
  },
): Promise<LoopResult> {
  const loopContext: LoopContext = {
    iteration: 0,
    lastResult: null,
  };

  const checkCondition = () => {
    const conditionResult = evaluateCondition(condition, loopContext);
    return options.type === "until" ? !conditionResult : conditionResult;
  };

  // For doWhile, execute at least once
  let shouldExecute = options.type === "doWhile" ? true : checkCondition();

  return executeBaseLoop(
    config,
    context,
    async (results, _errors, _iterationCount) => {
      if (!shouldExecute) {
        return { shouldContinue: false };
      }

      const result = createIterationResult("iteration", _iterationCount, {
        condition: options.conditionValue ?? true,
      });

      results.push(result);
      loopContext.iteration = _iterationCount;
      loopContext.lastResult = result;

      logIteration(
        context,
        `${options.type} loop iteration ${_iterationCount + 1}`,
      );

      // Check condition for next iteration
      shouldExecute = checkCondition();

      return { shouldContinue: shouldExecute };
    },
  );
}

/**
 * Execute simple iteration loop (forEach, forRange, times)
 */
export async function executeIterationLoop<T>(
  items: T[],
  config: LoopParameters,
  context: NodeExecutionContext,
  processor: (
    item: T,
    index: number,
  ) => { result: unknown; logMessage: string },
): Promise<LoopResult> {
  let currentIndex = 0;

  return executeBaseLoop(
    config,
    context,
    async (results, _errors, _iterationCount) => {
      if (currentIndex >= items.length) {
        return { shouldContinue: false };
      }

      const { result, logMessage } = processor(
        items[currentIndex],
        currentIndex,
      );
      results.push(result);
      logIteration(context, logMessage);

      currentIndex++;
      return { shouldContinue: currentIndex < items.length };
    },
  );
}
