/**
 * Loop Logic Implementation - Pure business logic
 *
 * NO UI IMPORTS ALLOWED IN THIS FILE
 * Handles the business logic for looping and iterating over data
 */

import { NodeLogic } from "../../base/NodeLogic.js";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types.js";
import type { LoopConfig } from "./LoopNodeConfig.js";

export class LoopLogic extends NodeLogic<LoopConfig> {
  async execute(
    context: NodeExecutionContext,
    config: LoopConfig,
  ): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Starting loop operation", { config });

      let results: unknown[] = [];
      let iterationCount = 0;
      let errors: unknown[] = [];

      switch (config.loopType) {
        case "forEach":
          ({ results, errors, iterationCount } = await this.executeForEach(
            context,
            config,
          ));
          break;
        case "forRange":
          ({ results, errors, iterationCount } = await this.executeForRange(
            context,
            config,
          ));
          break;
        case "while":
          ({ results, errors, iterationCount } = await this.executeWhile(
            context,
            config,
          ));
          break;
        case "until":
          ({ results, errors, iterationCount } = await this.executeUntil(
            context,
            config,
          ));
          break;
        default:
          throw new Error(`Unknown loop type: ${config.loopType}`);
      }

      this.log(
        context,
        "info",
        `Loop completed: ${iterationCount} iterations, ${results.length} results, ${errors.length} errors`,
      );

      return this.createSuccessResult({
        results: results,
        iterationCount: iterationCount,
        errors: errors,
        hasErrors: errors.length > 0,
        totalProcessed: results.length,
      });
    } catch (error) {
      this.log(context, "error", "Loop operation failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  private async executeForEach(
    context: NodeExecutionContext,
    config: LoopConfig,
  ): Promise<{
    results: unknown[];
    errors: unknown[];
    iterationCount: number;
  }> {
    const inputData = context.inputs?.data;
    if (!Array.isArray(inputData)) {
      throw new Error("forEach loop requires array input data");
    }

    const results: unknown[] = [];
    const errors: unknown[] = [];
    let iterationCount = 0;

    for (
      let i = 0;
      i < inputData.length && iterationCount < config.maxIterations;
      i += config.batchSize
    ) {
      const batch = inputData.slice(i, i + config.batchSize);

      for (const item of batch) {
        try {
          iterationCount++;

          // In a real implementation, this would execute the connected sub-workflow
          // For MVP, we'll simulate processing the item
          const processedItem = await this.processItem(
            item,
            iterationCount,
            context,
          );
          results.push(processedItem);

          if (config.delay > 0) {
            await this.delay(config.delay);
          }
        } catch (error) {
          errors.push({
            item,
            error: error instanceof Error ? error.message : String(error),
            iteration: iterationCount,
          });

          if (!config.continueOnError) {
            throw error;
          }
        }
      }
    }

    return { results, errors, iterationCount };
  }

  private async executeForRange(
    context: NodeExecutionContext,
    config: LoopConfig,
  ): Promise<{
    results: unknown[];
    errors: unknown[];
    iterationCount: number;
  }> {
    const results: unknown[] = [];
    const errors: unknown[] = [];
    let iterationCount = 0;

    for (
      let i = config.startValue;
      (config.stepSize > 0 ? i < config.endValue : i > config.endValue) &&
      iterationCount < config.maxIterations;
      i += config.stepSize
    ) {
      try {
        iterationCount++;

        // Process current index value
        const processedValue = await this.processItem(
          i,
          iterationCount,
          context,
        );
        results.push(processedValue);

        if (config.delay > 0) {
          await this.delay(config.delay);
        }
      } catch (error) {
        errors.push({
          value: i,
          error: error instanceof Error ? error.message : String(error),
          iteration: iterationCount,
        });

        if (!config.continueOnError) {
          throw error;
        }
      }
    }

    return { results, errors, iterationCount };
  }

  private async executeWhile(
    context: NodeExecutionContext,
    config: LoopConfig,
  ): Promise<{
    results: unknown[];
    errors: unknown[];
    iterationCount: number;
  }> {
    if (!config.condition) {
      throw new Error("While loop requires a condition");
    }

    const results: unknown[] = [];
    const errors: unknown[] = [];
    let iterationCount = 0;

    while (iterationCount < config.maxIterations) {
      try {
        // Evaluate condition
        const conditionResult = this.evaluateCondition(
          config.condition,
          context,
          iterationCount,
        );
        if (!conditionResult) break;

        iterationCount++;

        // Process current iteration
        const processedValue = await this.processItem(
          iterationCount,
          iterationCount,
          context,
        );
        results.push(processedValue);

        if (config.delay > 0) {
          await this.delay(config.delay);
        }
      } catch (error) {
        errors.push({
          error: error instanceof Error ? error.message : String(error),
          iteration: iterationCount,
        });

        if (!config.continueOnError) {
          throw error;
        }
        break;
      }
    }

    return { results, errors, iterationCount };
  }

  private async executeUntil(
    context: NodeExecutionContext,
    config: LoopConfig,
  ): Promise<{
    results: unknown[];
    errors: unknown[];
    iterationCount: number;
  }> {
    if (!config.condition) {
      throw new Error("Until loop requires a condition");
    }

    const results: unknown[] = [];
    const errors: unknown[] = [];
    let iterationCount = 0;

    do {
      try {
        iterationCount++;

        // Process current iteration
        const processedValue = await this.processItem(
          iterationCount,
          iterationCount,
          context,
        );
        results.push(processedValue);

        if (config.delay > 0) {
          await this.delay(config.delay);
        }

        // Evaluate condition (continue until condition is true)
        const conditionResult = this.evaluateCondition(
          config.condition!,
          context,
          iterationCount,
        );
        if (conditionResult) break;
      } catch (error) {
        errors.push({
          error: error instanceof Error ? error.message : String(error),
          iteration: iterationCount,
        });

        if (!config.continueOnError) {
          throw error;
        }
        break;
      }
    } while (iterationCount < config.maxIterations);

    return { results, errors, iterationCount };
  }

  private async processItem(
    item: unknown,
    iteration: number,
    _context: NodeExecutionContext,
  ): Promise<unknown> {
    // In a real implementation, this would execute the connected sub-workflow
    // For MVP, we simulate processing by returning the item with iteration metadata
    return {
      originalItem: item,
      iteration: iteration,
      processedAt: new Date().toISOString(),
      // Additional processing would happen here in real implementation
    };
  }

  private evaluateCondition(
    condition: string,
    context: NodeExecutionContext,
    iteration: number,
  ): boolean {
    try {
      // Create a simple condition evaluator
      const func = new Function(
        "context",
        "iteration",
        "data",
        `return ${condition}`,
      );
      return Boolean(func(context, iteration, context.inputs?.data));
    } catch (error) {
      throw new Error(
        `Condition evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  validateConfig(config: unknown): config is LoopConfig {
    return (
      typeof config === "object" &&
      config !== null &&
      "loopType" in config &&
      "batchSize" in config &&
      "maxIterations" in config &&
      typeof (config as Record<string, unknown>).loopType === "string" &&
      typeof (config as Record<string, unknown>).batchSize === "number" &&
      typeof (config as Record<string, unknown>).maxIterations === "number"
    );
  }

  getDefaultConfig(): Partial<LoopConfig> {
    return {
      loopType: "forEach",
      batchSize: 1,
      maxIterations: 1000,
      delay: 0,
      continueOnError: true,
    };
  }
}
