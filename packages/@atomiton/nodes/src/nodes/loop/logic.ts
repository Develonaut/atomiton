/**
 * Loop Node Logic
 *
 * Business logic for looping and iterating over data items
 */

import { createNodeLogic } from "../../base/createNodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { LoopParameters } from "./parameters";
import {
  createSuccessResult,
  createErrorResult,
  logNodeExecution,
  getInputValue,
} from "../../base/NodeUtils";

export type LoopOutput = {
  results: unknown[];
  iterationCount: number;
  errors: unknown[];
  success: boolean;
};

export const loopLogic = createNodeLogic<LoopParameters>({
  async execute(
    context: NodeExecutionContext,
    config: LoopParameters,
  ): Promise<NodeExecutionResult> {
    try {
      const items = getInputValue<unknown[]>(context, "items") || [];

      logNodeExecution(context, "info", "Starting loop operation", { config });

      let results: unknown[] = [];
      let iterationCount = 0;
      let errors: unknown[] = [];

      switch (config.loopType) {
        case "forEach":
          ({ results, errors, iterationCount } = await executeForEach(
            context,
            config,
            items,
          ));
          break;
        case "forRange":
          ({ results, errors, iterationCount } = await executeForRange(
            context,
            config,
          ));
          break;
        case "while":
        case "until":
          logNodeExecution(
            context,
            "warn",
            "While/Until loops not fully implemented",
          );
          results = [];
          break;
        default:
          return createErrorResult(`Unknown loop type: ${config.loopType}`);
      }

      const output: LoopOutput = {
        results,
        iterationCount,
        errors,
        success: errors.length === 0 || config.continueOnError,
      };

      logNodeExecution(
        context,
        "info",
        `Loop completed with ${iterationCount} iterations`,
      );
      return createSuccessResult(output);
    } catch (error) {
      logNodeExecution(context, "error", "Loop operation failed", { error });
      return createErrorResult(
        error instanceof Error ? error : new Error("Unknown error"),
      );
    }
  },
});

async function executeForEach(
  context: NodeExecutionContext,
  config: LoopParameters,
  items: unknown[],
): Promise<{ results: unknown[]; errors: unknown[]; iterationCount: number }> {
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let iterationCount = 0;

  for (
    let i = 0;
    i < items.length && iterationCount < config.maxIterations;
    i++
  ) {
    try {
      if (config.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, config.delay));
      }

      results.push(items[i]);
      iterationCount++;
    } catch (error) {
      errors.push(error);
      if (!config.continueOnError) {
        break;
      }
    }
  }

  return { results, errors, iterationCount };
}

async function executeForRange(
  context: NodeExecutionContext,
  config: LoopParameters,
): Promise<{ results: unknown[]; errors: unknown[]; iterationCount: number }> {
  const results: unknown[] = [];
  const errors: unknown[] = [];
  let iterationCount = 0;

  for (
    let i = config.startValue;
    i <= config.endValue && iterationCount < config.maxIterations;
    i += config.stepSize
  ) {
    try {
      if (config.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, config.delay));
      }

      results.push(i);
      iterationCount++;
    } catch (error) {
      errors.push(error);
      if (!config.continueOnError) {
        break;
      }
    }
  }

  return { results, errors, iterationCount };
}
