import { createExecutable } from "#core/utils/executable";
import {
  convertToType,
  executeSecureCode,
  getActualType,
} from "#executables/code/utils";
import type { CodeParameters } from "#schemas/code";

/**
 * Code execution node executable
 */
export const codeExecutable = createExecutable<CodeParameters>(
  "code",
  async ({ getInput, config, context, getDuration }) => {
    // Get input data from ports using enhanced helper
    const inputData = getInput("input") ?? null;
    const contextData = getInput<Record<string, unknown>>("context") ?? {};

    // Build execution context
    const executionContext = {
      input: inputData,
      ...contextData,
    };

    context.log.info(`Executing code expression: ${config.code}`, {
      inputType: getActualType(inputData),
      timeout: config.timeout,
      returnType: config.returnType,
    });

    // Execute code in isolated VM
    const result = await executeSecureCode(config.code, executionContext, {
      memoryLimit: config.memoryLimit || 32,
      timeoutMs: config.timeout || 5000,
    });

    // Convert result to target type if specified
    const convertedResult = convertToType(result, config.returnType || "auto");
    const actualType = getActualType(convertedResult);
    const duration = getDuration();

    context.log.info("Code execution completed", {
      resultType: actualType,
      duration,
      success: true,
    });

    return {
      result: convertedResult,
      success: true,
      duration,
      type: actualType,
    };
  },
);

export default codeExecutable;
