/**
 * Loop Operations
 * Extracted loop execution logic for different loop types
 */

import type { NodeExecutionContext } from "#core/types/executable";
import type { LoopParameters } from "#schemas/loop";
import {
  executeConditionLoop,
  executeIterationLoop,
} from "#executables/loop/baseExecutor";
import {
  type LoopResult,
  createIterationResult,
} from "#executables/loop/loopUtils";

/**
 * Execute forEach loop
 */
export async function executeForEach(
  items: unknown[],
  config: LoopParameters,
  context: NodeExecutionContext,
): Promise<LoopResult> {
  return executeIterationLoop(items, config, context, (item, index) => ({
    result: createIterationResult("item", item, { index }),
    logMessage: `Processed item ${index}`,
  }));
}

/**
 * Execute while loop
 */
export async function executeWhile(
  condition: string,
  config: LoopParameters,
  context: NodeExecutionContext,
): Promise<LoopResult> {
  return executeConditionLoop(condition, config, context, {
    type: "while",
    conditionValue: true,
  });
}

/**
 * Execute doWhile loop
 */
export async function executeDoWhile(
  condition: string,
  config: LoopParameters,
  context: NodeExecutionContext,
): Promise<LoopResult> {
  return executeConditionLoop(condition, config, context, {
    type: "doWhile",
  });
}

/**
 * Execute for range loop
 */
export async function executeForRange(
  start: number,
  end: number,
  step: number,
  config: LoopParameters,
  context: NodeExecutionContext,
): Promise<LoopResult> {
  // Generate range values
  const values: number[] = [];
  for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
    values.push(i);
  }

  return executeIterationLoop(values, config, context, (value, _index) => ({
    result: createIterationResult("index", value),
    logMessage: `For range loop iteration ${value}`,
  }));
}

/**
 * Execute until loop
 */
export async function executeUntil(
  condition: string,
  config: LoopParameters,
  context: NodeExecutionContext,
): Promise<LoopResult> {
  return executeConditionLoop(condition, config, context, {
    type: "until",
    conditionValue: false,
  });
}

/**
 * Execute times loop (repeat n times)
 */
export async function executeTimesLoop(
  times: number,
  config: LoopParameters,
  context: NodeExecutionContext,
): Promise<LoopResult> {
  const maxTimes = Math.min(times, config.maxIterations as number);
  const indices = Array.from({ length: maxTimes }, (_, i) => i);

  return executeIterationLoop(indices, config, context, (index, _) => ({
    result: createIterationResult("iteration", index),
    logMessage: `Times loop iteration ${index + 1}/${times}`,
  }));
}
