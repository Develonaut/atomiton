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
import { executeTransformation } from "./operations";
import {
  createErrorOutput,
  createTransformOutput,
  getInputValue,
  logTransformResult,
  type TransformOutput,
} from "./utils";

export type { TransformOutput };

/**
 * Transform node executable
 */
export const transformExecutable: NodeExecutable<TransformParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: TransformParameters,
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

        // Execute the transformation
        const transformedData = executeTransformation(
          config.operation as string,
          inputData,
          config,
          context,
          functionOverride,
        );

        const output = createTransformOutput(
          transformedData,
          inputData.length,
          config.operation || "unknown",
        );

        logTransformResult(
          context,
          config.operation as string,
          inputData.length,
          output.outputCount,
        );

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
          outputs: createErrorOutput(config.operation as string),
        };
      }
    },

    validateConfig(config: unknown): TransformParameters {
      const result = transformDefinition.parameters.safeParse(config);
      if (!result.success) {
        throw new Error(
          `Invalid transform parameters: ${result.error?.message || "Unknown validation error"}`,
        );
      }
      return result.data;
    },
  });

export default transformExecutable;
