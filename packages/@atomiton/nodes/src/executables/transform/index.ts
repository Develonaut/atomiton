/**
 * Transform Node Executable
 * Node.js implementation with data transformation logic
 */

import { createExecutable } from "#core/utils/executable";
import { executeTransformation } from "#executables/transform/operations";
import {
  createTransformOutput,
  logTransformResult,
  type TransformOutput,
} from "#executables/transform/utils";
import type { TransformParameters } from "#schemas/transform";

export type { TransformOutput };

/**
 * Transform node executable
 */
export const transformExecutable = createExecutable<TransformParameters>(
  "transform",
  async ({ getInput, config, context }) => {
    // Get input data using the smart helper
    const inputData = getInput<unknown[]>("data") || [];
    const functionOverride = getInput<string>("function");

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

    return output;
  },
);

export default transformExecutable;
