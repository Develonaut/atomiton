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
import {
  executeDoWhile,
  executeForEach,
  executeForRange,
  executeTimesLoop,
  executeUntil,
  executeWhile,
} from "./operations";

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
        const loopType = config.loopType || "forEach";
        let results: unknown[] = [];
        let errors: unknown[] = [];
        let iterationCount = 0;

        context.log?.info?.(`Starting ${loopType} loop`, {
          maxIterations: config.maxIterations,
          parallel     : config.parallel,
          concurrency  : config.concurrency,
        });

        switch (loopType) {
          case "forEach": {
            const items = getInputValue<unknown[]>(context, "items") || [];
            const loopResult = await executeForEach(items, config, context);
            results = loopResult.results;
            errors = loopResult.errors;
            iterationCount = loopResult.iterationCount;
            break;
          }

          case "while": {
            const condition = (config.condition as string) || "false";
            const loopResult = await executeWhile(condition, config, context);
            results = loopResult.results;
            errors = loopResult.errors;
            iterationCount = loopResult.iterationCount;
            break;
          }

          case "doWhile": {
            const condition = (config.condition as string) || "false";
            const loopResult = await executeDoWhile(condition, config, context);
            results = loopResult.results;
            errors = loopResult.errors;
            iterationCount = loopResult.iterationCount;
            break;
          }

          case "forRange": {
            const start = (config.startValue as number) || 0;
            const end = (config.endValue as number) || 10;
            const step = (config.stepSize as number) || 1;
            const loopResult = await executeForRange(
              start,
              end,
              step,
              config,
              context
            );
            results = loopResult.results;
            errors = loopResult.errors;
            iterationCount = loopResult.iterationCount;
            break;
          }

          case "until": {
            const condition = (config.condition as string) || "false";
            const loopResult = await executeUntil(condition, config, context);
            results = loopResult.results;
            errors = loopResult.errors;
            iterationCount = loopResult.iterationCount;
            break;
          }

          case "times": {
            const times = (config.times as number) || 1;
            const loopResult = await executeTimesLoop(times, config, context);
            results = loopResult.results;
            errors = loopResult.errors;
            iterationCount = loopResult.iterationCount;
            break;
          }

          default:
            throw new Error(`Unknown loop type: ${loopType}`);
        }

        const duration = Date.now() - startTime;
        const success = errors.length === 0;
        const completed = iterationCount > 0;

        const output: LoopOutput = {
          result: {
            results,
            iterationCount,
            errors,
            success,
            duration,
            completed,
            stopped:
              !completed && iterationCount < (config.maxIterations as number),
          },
          results,
          iterationCount,
          errors,
          success,
          duration,
        };

        context.log?.info?.(`Loop completed`, {
          loopType,
          iterationCount,
          errorCount: errors.length,
          duration,
        });

        return {
          success: true,
          outputs: output,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.(`Loop execution failed`, {
          error   : errorMessage,
          loopType: config.loopType,
        });

        return {
          success: false,
          error  : errorMessage,
          outputs: {
            result: {
              results       : [],
              iterationCount: 0,
              errors        : [errorMessage],
              success       : false,
              duration,
              completed     : false,
              stopped       : true,
            },
            results       : [],
            iterationCount: 0,
            errors        : [errorMessage],
            success       : false,
            duration,
          },
        };
      }
    },

    validateConfig(config: unknown): LoopParameters {
      // In a real implementation, validate using the schema
      return config as LoopParameters;
    },
  });

export default loopExecutable;
