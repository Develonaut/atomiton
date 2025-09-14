/**
 * JavaScript Code Logic Implementation - Pure business logic
 *
 * NO UI IMPORTS ALLOWED IN THIS FILE
 * Handles the business logic for executing custom JavaScript code
 */

import { NodeLogic } from "../../base/NodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { CodeConfig } from "./CodeNodeConfig";

export class CodeLogic extends NodeLogic<CodeConfig> {
  async execute(
    context: NodeExecutionContext,
    config: CodeConfig,
  ): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Starting JavaScript code execution", {
        config,
      });

      if (!config.code.trim()) {
        throw new Error("No code provided");
      }

      // Prepare input parameters
      const inputValues = config.inputParams.map((param: string) => {
        return context.inputs?.[param];
      });

      this.log(
        context,
        "info",
        `Executing ${config.async ? "async" : "sync"} JavaScript code`,
      );

      let result: unknown;

      if (config.async) {
        result = await this.executeAsyncCode(
          config.code,
          config.inputParams,
          inputValues,
          config.timeout,
        );
      } else {
        result = await this.executeSyncCode(
          config.code,
          config.inputParams,
          inputValues,
          config.timeout,
        );
      }

      // Validate return type if specified
      if (config.returnType !== "any") {
        this.validateReturnType(result, config.returnType);
      }

      this.log(
        context,
        "info",
        "JavaScript code execution completed successfully",
      );

      return this.createSuccessResult({
        result: result,
        returnType: typeof result,
        executionTime: Date.now(), // Would track actual execution time in real implementation
      });
    } catch (error) {
      this.log(context, "error", "JavaScript code execution failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  private async executeSyncCode(
    code: string,
    paramNames: string[],
    paramValues: unknown[],
    timeout: number,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Code execution timed out after ${timeout}ms`));
      }, timeout);

      try {
        // Create a function with the provided parameter names
        const func = new Function(...paramNames, code);
        const result = func(...paramValues);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private async executeAsyncCode(
    code: string,
    paramNames: string[],
    paramValues: unknown[],
    timeout: number,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Async code execution timed out after ${timeout}ms`));
      }, timeout);

      try {
        // Wrap code in async function
        const asyncFunc = new (Function.constructor.bind.apply(Function, [
          null,
          ...paramNames,
          `return (async () => { ${code} })()`,
        ]))();

        Promise.resolve(asyncFunc(...paramValues))
          .then((result) => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private validateReturnType(value: unknown, expectedType: string): void {
    const actualType = Array.isArray(value) ? "array" : typeof value;

    if (expectedType !== actualType) {
      throw new Error(
        `Expected return type '${expectedType}' but got '${actualType}'`,
      );
    }
  }

  validateConfig(config: unknown): config is CodeConfig {
    return (
      typeof config === "object" &&
      config !== null &&
      "code" in config &&
      "inputParams" in config &&
      "timeout" in config &&
      typeof (config as Record<string, unknown>).code === "string" &&
      Array.isArray((config as Record<string, unknown>).inputParams) &&
      typeof (config as Record<string, unknown>).timeout === "number"
    );
  }

  getDefaultConfig(): Partial<CodeConfig> {
    return {
      code: "// Write your JavaScript code here\nreturn data;",
      inputParams: ["data"],
      returnType: "any",
      async: false,
      timeout: 5000,
    };
  }
}
