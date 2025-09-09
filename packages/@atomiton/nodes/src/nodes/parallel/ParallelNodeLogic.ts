/**
 * Parallel Logic Implementation - Pure business logic
 *
 * NO UI IMPORTS ALLOWED IN THIS FILE
 * Handles the business logic for running multiple operations simultaneously
 */

import { NodeLogic } from "../../base/NodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { ParallelConfig } from "./ParallelNodeConfig";

export class ParallelLogic extends NodeLogic<ParallelConfig> {
  async execute(
    context: NodeExecutionContext,
    config: ParallelConfig,
  ): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Starting parallel execution", { config });

      const inputData = context.inputs?.data;
      if (!Array.isArray(inputData)) {
        throw new Error("Parallel node requires array input data");
      }

      const startTime = Date.now();
      let results: unknown[] = [];
      let errors: unknown[] = [];
      let completed = 0;
      let failed = 0;

      switch (config.strategy) {
        case "all":
          ({ results, errors, completed, failed } = await this.executeAll(
            inputData,
            config,
            context,
          ));
          break;
        case "race":
          ({ results, errors, completed, failed } = await this.executeRace(
            inputData,
            config,
            context,
          ));
          break;
        case "allSettled":
          ({ results, errors, completed, failed } =
            await this.executeAllSettled(inputData, config, context));
          break;
        default:
          throw new Error(`Unknown parallel strategy: ${config.strategy}`);
      }

      const executionTime = Date.now() - startTime;

      this.log(
        context,
        "info",
        `Parallel execution completed: ${completed} succeeded, ${failed} failed, ${executionTime}ms total`,
      );

      return this.createSuccessResult({
        results: results,
        errors: errors,
        totalItems: inputData.length,
        completedItems: completed,
        failedItems: failed,
        executionTime: executionTime,
        strategy: config.strategy,
      });
    } catch (error) {
      this.log(context, "error", "Parallel execution failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  private async executeAll(
    inputData: unknown[],
    config: ParallelConfig,
    context: NodeExecutionContext,
  ): Promise<{
    results: unknown[];
    errors: unknown[];
    completed: number;
    failed: number;
  }> {
    const operations = inputData.map((item, index) =>
      this.createOperation(item, index, config, context),
    );

    const results = await this.executeWithGlobalTimeout(
      Promise.all(operations),
      config.globalTimeout,
    );

    return {
      results: results,
      errors: [],
      completed: results.length,
      failed: 0,
    };
  }

  private async executeRace(
    inputData: unknown[],
    config: ParallelConfig,
    context: NodeExecutionContext,
  ): Promise<{
    results: unknown[];
    errors: unknown[];
    completed: number;
    failed: number;
  }> {
    const operations = inputData.map((item, index) =>
      this.createOperation(item, index, config, context),
    );

    const result = await this.executeWithGlobalTimeout(
      Promise.race(operations),
      config.globalTimeout,
    );

    return {
      results: [result],
      errors: [],
      completed: 1,
      failed: 0,
    };
  }

  private async executeAllSettled(
    inputData: unknown[],
    config: ParallelConfig,
    context: NodeExecutionContext,
  ): Promise<{
    results: unknown[];
    errors: unknown[];
    completed: number;
    failed: number;
  }> {
    const operations = inputData.map((item, index) =>
      this.createOperation(item, index, config, context),
    );

    const settledResults = await this.executeWithGlobalTimeout(
      this.executeWithConcurrency(operations, config.concurrency),
      config.globalTimeout,
    );

    const results: unknown[] = [];
    const errors: unknown[] = [];
    let completed = 0;
    let failed = 0;

    settledResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        if (config.maintainOrder) {
          results[index] = result.value;
        } else {
          results.push(result.value);
        }
        completed++;
      } else {
        errors.push({
          index: index,
          item: inputData[index],
          error:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        });
        failed++;
      }
    });

    // Remove undefined elements if maintaining order
    if (config.maintainOrder) {
      results.filter((r) => r !== undefined);
    }

    return { results, errors, completed, failed };
  }

  private async createOperation(
    item: unknown,
    index: number,
    config: ParallelConfig,
    context: NodeExecutionContext,
  ): Promise<unknown> {
    const operationWithTimeout = async (): Promise<unknown> => {
      // In a real implementation, this would execute the connected sub-workflow
      // For MVP, we simulate processing the item
      return this.processItemParallel(item, index, context);
    };

    const operationWithRetry = async (): Promise<unknown> => {
      let lastError: Error = new Error("No attempts made");

      for (let attempt = 0; attempt <= config.retryCount; attempt++) {
        try {
          return await this.executeWithTimeout(
            operationWithTimeout(),
            config.operationTimeout,
          );
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (attempt < config.retryCount) {
            await this.delay(config.retryDelay);
          }
        }
      }

      throw lastError;
    };

    return operationWithRetry();
  }

  private async executeWithConcurrency<T>(
    operations: Promise<T>[],
    concurrency: number,
  ): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = new Array(operations.length);
    const executing: Promise<void>[] = [];

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i].then(
        (value) => {
          results[i] = { status: "fulfilled", value };
        },
        (reason) => {
          results[i] = { status: "rejected", reason };
        },
      );

      executing.push(operation);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === operation),
          1,
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private async executeWithGlobalTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return this.executeWithTimeout(promise, timeoutMs);
  }

  private async processItemParallel(
    item: unknown,
    index: number,
    _context: NodeExecutionContext,
  ): Promise<unknown> {
    // Simulate async processing time
    const processingTime = Math.random() * 1000 + 500; // 500-1500ms
    await this.delay(processingTime);

    // In a real implementation, this would execute the connected sub-workflow
    return {
      originalItem: item,
      index: index,
      processedAt: new Date().toISOString(),
      processingTime: processingTime,
      // Additional processing would happen here in real implementation
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  validateConfig(config: unknown): config is ParallelConfig {
    return (
      typeof config === "object" &&
      config !== null &&
      "concurrency" in config &&
      "strategy" in config &&
      "operationTimeout" in config &&
      typeof (config as Record<string, unknown>).concurrency === "number" &&
      typeof (config as Record<string, unknown>).strategy === "string" &&
      typeof (config as Record<string, unknown>).operationTimeout === "number"
    );
  }

  getDefaultConfig(): Partial<ParallelConfig> {
    return {
      concurrency: 5,
      strategy: "allSettled",
      operationTimeout: 30000,
      globalTimeout: 120000,
      failFast: false,
      maintainOrder: true,
    };
  }
}
