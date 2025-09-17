/**
 * Transform Node Logic
 *
 * Business logic for data transformation operations
 */

import { createAtomicExecutable } from "../../createAtomicExecutable";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../../exports/executable/execution-types";
import type { TransformParameters } from "./parameters";
import {
  createSuccessResult,
  createErrorResult,
  logNodeExecution,
  getInputValue,
} from "../../../utils";

export type TransformOutput = {
  data: unknown;
  inputCount: number;
  outputCount: number;
  operation: string;
  success: boolean;
};

export const transformExecutable = createAtomicExecutable<TransformParameters>({
  async execute(
    context: NodeExecutionContext,
    config: TransformParameters,
  ): Promise<NodeExecutionResult> {
    try {
      const inputData = getInputValue(context, "data") || [];

      logNodeExecution(
        context,
        "info",
        `Performing ${config.operation} transformation`,
        { config },
      );

      if (!Array.isArray(inputData)) {
        return createErrorResult(
          "Input data must be an array for transformation",
        );
      }

      let transformedData: unknown;

      switch (config.operation) {
        case "map":
          // Mock implementation - in real version would use safe eval
          transformedData = inputData.map((item, index) => ({
            ...item,
            transformed: true,
            index,
          }));
          break;
        case "filter":
          transformedData = inputData.filter((item: unknown) => item != null);
          break;
        case "sort":
          transformedData = [...inputData].sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) => {
              const aVal = config.sortKey ? a[config.sortKey] : a;
              const bVal = config.sortKey ? b[config.sortKey] : b;
              const aNum = typeof aVal === "number" ? aVal : 0;
              const bNum = typeof bVal === "number" ? bVal : 0;
              return config.sortDirection === "asc" ? aNum - bNum : bNum - aNum;
            },
          );
          break;
        case "flatten":
          transformedData = inputData.flat();
          break;
        default:
          transformedData = inputData;
      }

      const output: TransformOutput = {
        data: transformedData,
        inputCount: inputData.length,
        outputCount: Array.isArray(transformedData)
          ? transformedData.length
          : 1,
        operation: config.operation,
        success: true,
      };

      logNodeExecution(
        context,
        "info",
        `Transformation completed: ${config.operation}`,
      );
      return createSuccessResult(output);
    } catch (error) {
      logNodeExecution(context, "error", "Transformation failed", { error });
      return createErrorResult(
        error instanceof Error ? error : new Error("Unknown error"),
      );
    }
  },
});
