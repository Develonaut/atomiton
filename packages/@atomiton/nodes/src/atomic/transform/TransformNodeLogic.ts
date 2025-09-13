/**
 * Transform Logic Implementation - Pure business logic
 *
 * NO UI IMPORTS ALLOWED IN THIS FILE
 * Handles the business logic for data transformation operations
 */

import { NodeLogic } from "../../base/NodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { TransformConfig } from "./TransformNodeConfig";

export class TransformLogic extends NodeLogic<TransformConfig> {
  async execute(
    context: NodeExecutionContext,
    config: TransformConfig,
  ): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Starting transform operation", { config });

      const inputData = context.inputs?.data;
      if (!inputData) {
        throw new Error("No input data provided");
      }

      let result: unknown;

      switch (config.operation) {
        case "map":
          result = await this.performMapOperation(inputData, config.expression);
          break;
        case "filter":
          result = await this.performFilterOperation(
            inputData,
            config.expression,
          );
          break;
        case "template":
          result = await this.performTemplateOperation(
            inputData,
            config.expression,
            config.templateVars,
          );
          break;
        case "jsonPath":
          result = await this.performJsonPathOperation(
            inputData,
            config.jsonPath || "",
          );
          break;
        case "custom":
        default:
          result = await this.performCustomOperation(
            inputData,
            config.expression,
          );
          break;
      }

      this.log(context, "info", "Transform operation completed successfully");

      return this.createSuccessResult({
        result,
        originalCount: Array.isArray(inputData) ? inputData.length : 1,
        resultCount: Array.isArray(result) ? result.length : 1,
        operation: config.operation,
        success: true,
      });
    } catch (error) {
      this.log(context, "error", "Transform operation failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  private async performMapOperation(
    data: unknown,
    expression: string,
  ): Promise<unknown> {
    if (!Array.isArray(data)) {
      throw new Error("Map operation requires array input");
    }

    // For MVP, simple property mapping
    const func = new Function("item", "index", `return ${expression}`);
    return data.map((item: unknown, index: number) => func(item, index));
  }

  private async performFilterOperation(
    data: unknown,
    expression: string,
  ): Promise<unknown> {
    if (!Array.isArray(data)) {
      throw new Error("Filter operation requires array input");
    }

    // For MVP, simple filter expression
    const func = new Function("item", "index", `return ${expression}`);
    return data.filter((item: unknown, index: number) => func(item, index));
  }

  private async performCustomOperation(
    data: unknown,
    expression: string,
  ): Promise<unknown> {
    // For MVP, custom JavaScript transformation
    // This is intentionally using Function constructor for dynamic code execution
    // In production, this would be sandboxed or use a safer evaluation method
    const func = new Function("data", expression);
    return func(data);
  }

  private async performTemplateOperation(
    data: unknown,
    template: string,
    vars?: Record<string, unknown>,
  ): Promise<unknown> {
    // Simple template replacement for MVP
    let result = template;

    // Replace variables
    if (vars) {
      Object.entries(vars).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        result = result.replace(regex, String(value));
      });
    }

    // Replace data references if data is an object
    if (typeof data === "object" && data !== null) {
      Object.entries(data as Record<string, unknown>).forEach(
        ([key, value]) => {
          const regex = new RegExp(`{{\\s*data\\.${key}\\s*}}`, "g");
          result = result.replace(regex, String(value));
        },
      );
    }

    return result;
  }

  private async performJsonPathOperation(
    data: unknown,
    path: string,
  ): Promise<unknown> {
    // Simple JSONPath implementation for MVP
    // In production, use a proper JSONPath library

    const pathParts = path.split(".").filter((p) => p);
    let current: unknown = data;

    for (const part of pathParts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array indices
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, prop, index] = arrayMatch;
        current = (current as Record<string, unknown>)[prop];
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        }
      } else {
        // Handle normal property access
        current = (current as Record<string, unknown>)[part];
      }
    }

    return current;
  }

  validateConfig(config: unknown): config is TransformConfig {
    return (
      typeof config === "object" &&
      config !== null &&
      "operation" in config &&
      "expression" in config &&
      typeof (config as Record<string, unknown>).operation === "string" &&
      typeof (config as Record<string, unknown>).expression === "string"
    );
  }

  getDefaultConfig(): Partial<TransformConfig> {
    return {
      operation: "custom",
      expression: "return data",
    };
  }
}
