/**
 * Transform Node Executable
 * Node.js implementation with data transformation logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { TransformParameters } from "#definitions/transform";
import { transformDefinition } from "#definitions/transform";
import {
  simpleGroupBy,
  simpleOrderBy,
  createSafeFunction,
  parseInitialValue,
  uniqueArray,
} from "./helpers";

// Types for transform operations
export type TransformOutput = {
  result: unknown;
  data: unknown;
  inputCount: number;
  outputCount: number;
  operation: string;
  success: boolean;
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
 * Transform node executable
 */
export const transformExecutable: NodeExecutable<TransformParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: TransformParameters
    ): Promise<NodeExecutionResult> {
      try {
        // Get input data
        const inputData = getInputValue<unknown[]>(context, "data") || [];
        const functionOverride = getInputValue<string>(context, "function");

        context.log?.info?.(`Performing ${config.operation} transformation`, {
          operation: config.operation,
          inputCount: Array.isArray(inputData) ? inputData.length : 0,
        });

        if (!Array.isArray(inputData)) {
          throw new Error("Input data must be an array for transformation");
        }

        let transformedData: unknown;
        const transformFunction = functionOverride || config.transformFunction;

        switch (config.operation) {
          case "map": {
            try {
              if (typeof transformFunction !== "string") {
                throw new Error("Transform function must be a string");
              }
              const mapFn = createSafeFunction(transformFunction);
              transformedData = inputData.map((item) =>
                mapFn(item as Record<string, unknown>)
              );
            } catch (error) {
              // Fallback to simple transformation
              context.log?.warn?.(
                "Function evaluation failed, using fallback transformation",
                {
                  error: error instanceof Error ? error.message : String(error),
                }
              );
              transformedData = inputData.map((item, index) => ({
                ...(typeof item === "object" && item !== null
                  ? item
                  : { value: item }),
                transformed: true,
                index,
              }));
            }
            break;
          }

          case "filter": {
            try {
              const filterCondition =
                config.filterCondition || transformFunction;
              if (typeof filterCondition !== "string") {
                throw new Error("Filter condition must be a string");
              }
              const filterFn = createSafeFunction(filterCondition);
              transformedData = inputData.filter((item) =>
                filterFn(item as Record<string, unknown>)
              );
            } catch (error) {
              // Fallback to null filtering
              context.log?.warn?.(
                "Filter condition evaluation failed, filtering null/undefined values",
                {
                  error: error instanceof Error ? error.message : String(error),
                }
              );
              transformedData = inputData.filter((item) => item != null);
            }
            break;
          }

          case "reduce": {
            try {
              if (typeof config.reduceFunction !== "string") {
                throw new Error("Reduce function must be a string");
              }
              if (typeof config.reduceInitial !== "string") {
                throw new Error("Reduce initial value must be a string");
              }
              const reduceFn = createSafeFunction(config.reduceFunction);
              const initialValue = parseInitialValue(config.reduceInitial);
              transformedData = inputData.reduce(
                (acc, item, index) => reduceFn({ acc, item, index }),
                initialValue
              );
            } catch (error) {
              context.log?.warn?.(
                "Reduce function evaluation failed, using sum fallback",
                {
                  error: error instanceof Error ? error.message : String(error),
                }
              );
              // Fallback to sum for numbers
              transformedData = inputData.reduce(
                (acc: number, item: unknown) => {
                  const num =
                    typeof item === "number"
                      ? item
                      : typeof item === "string"
                        ? parseFloat(item)
                        : 0;
                  return acc + (isNaN(num) ? 0 : num);
                },
                0
              );
            }
            break;
          }

          case "sort": {
            const sortKeys = config.sortKey
              ? [config.sortKey]
              : [(item: unknown) => item];
            const sortOrders: ("asc" | "desc")[] = [
              config.sortDirection as "asc" | "desc",
            ];
            transformedData = simpleOrderBy(
              inputData,
              sortKeys as (string | ((item: unknown) => unknown))[],
              sortOrders
            );
            break;
          }

          case "group": {
            if (!config.groupBy) {
              throw new Error("groupBy key is required for group operation");
            }
            transformedData = simpleGroupBy(inputData, config.groupBy);
            break;
          }

          case "flatten": {
            const depth =
              typeof config.flattenDepth === "number" ? config.flattenDepth : 1;
            transformedData = inputData.flat(depth);
            break;
          }

          case "unique": {
            transformedData = uniqueArray(inputData);
            break;
          }

          case "reverse": {
            transformedData = [...inputData].reverse();
            break;
          }

          default:
            transformedData = inputData;
        }

        // Calculate output count
        let outputCount: number;
        if (Array.isArray(transformedData)) {
          outputCount = transformedData.length;
        } else if (transformedData && typeof transformedData === "object") {
          outputCount = Object.keys(transformedData).length;
        } else {
          outputCount = 1;
        }

        const output: TransformOutput = {
          result: transformedData,
          data: transformedData,
          inputCount: inputData.length,
          outputCount,
          operation: config.operation || "unknown",
          success: true,
        };

        context.log?.info?.(`Transformation completed: ${config.operation}`, {
          inputCount: inputData.length,
          outputCount,
        });

        return {
          success: true,
          outputs: output,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("Transformation failed", {
          error: errorMessage,
          operation: config.operation,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: {
            result: null,
            data: null,
            inputCount: 0,
            outputCount: 0,
            operation: config.operation,
            success: false,
          },
        };
      }
    },

    validateConfig(config: unknown): TransformParameters {
      const result = transformDefinition.parameters.safeParse(config);
      if (!result.success) {
        throw new Error(
          `Invalid transform parameters: ${result.error?.message || "Unknown validation error"}`
        );
      }
      return result.data;
    },
  });

export default transformExecutable;