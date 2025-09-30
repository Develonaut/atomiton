/**
 * Loop Node Executable
 * Node.js implementation with loop iteration logic
 * MVP: Core loop types only (forEach, times, while)
 */

import { createExecutable } from "#core/utils/executable";
import type { LoopParameters } from "#schemas/loop";
import {
  executeForEach,
  executeTimesLoop,
  executeWhile,
} from "#executables/loop/operations";

const MVP_DEFAULTS = {
  maxIterations: 1000,
  delay: 0,
  continueOnError: false,
  parallel: false,
  concurrency: 1,
};

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
 * Loop node executable
 */
export const loopExecutable = createExecutable<LoopParameters>(
  "loop",
  async ({ getInput, config, context, getDuration }) => {
    const loopType = config.loopType || "forEach";
    let results: unknown[] = [];
    let errors: unknown[] = [];
    let iterationCount = 0;

    context.log.info(`Starting ${loopType} loop`, {
      maxIterations: MVP_DEFAULTS.maxIterations,
    });

    const configWithDefaults = {
      ...config,
      maxIterations: MVP_DEFAULTS.maxIterations,
      delay: MVP_DEFAULTS.delay,
      continueOnError: MVP_DEFAULTS.continueOnError,
      parallel: MVP_DEFAULTS.parallel,
      concurrency: MVP_DEFAULTS.concurrency,
    };

    switch (loopType) {
      case "forEach": {
        const array =
          (config.array as unknown[]) || getInput<unknown[]>("array") || [];
        const loopResult = await executeForEach(
          array,
          configWithDefaults,
          context,
        );
        results = loopResult.results;
        errors = loopResult.errors;
        iterationCount = loopResult.iterationCount;
        break;
      }

      case "while": {
        const condition = (config.condition as string) || "false";
        const loopResult = await executeWhile(
          condition,
          configWithDefaults,
          context,
        );
        results = loopResult.results;
        errors = loopResult.errors;
        iterationCount = loopResult.iterationCount;
        break;
      }

      case "times": {
        const count = (config.count as number) || 1;
        const loopResult = await executeTimesLoop(
          count,
          configWithDefaults,
          context,
        );
        results = loopResult.results;
        errors = loopResult.errors;
        iterationCount = loopResult.iterationCount;
        break;
      }

      default:
        throw new Error(`Unknown loop type: ${loopType}`);
    }

    const duration = getDuration();
    const success = errors.length === 0;
    const completed = iterationCount > 0;

    const collectResults = config.collectResults !== false;
    const finalResults = collectResults ? results : [];

    const output: LoopOutput = {
      result: {
        results: finalResults,
        iterationCount,
        errors,
        success,
        duration,
        completed,
        stopped: !completed && iterationCount < MVP_DEFAULTS.maxIterations,
      },
      results: finalResults,
      iterationCount,
      errors,
      success,
      duration,
    };

    context.log.info(`Loop completed`, {
      loopType,
      iterationCount,
      errorCount: errors.length,
      duration,
    });

    return output;
  },
);

export default loopExecutable;
