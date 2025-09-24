import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { CodeParameters } from "#schemas/code";
import {
  convertToType,
  executeSecureCode,
  getActualType,
} from "#executables/code/utils";

/**
 * Code execution node executable
 */
export const codeExecutable: NodeExecutable<CodeParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: CodeParameters,
    ): Promise<NodeExecutionResult> {
      const startTime = Date.now();

      try {
        // Get input data from ports
        const inputData = context.inputs?.input ?? null;
        const contextData = context.inputs?.context ?? {};

        // Build execution context
        const executionContext = {
          input: inputData,
          ...contextData,
        };

        context.log?.info?.(`Executing code expression: ${config.code}`, {
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
        const convertedResult = convertToType(
          result,
          config.returnType || "auto",
        );
        const actualType = getActualType(convertedResult);
        const duration = Date.now() - startTime;

        context.log?.info?.("Code execution completed", {
          resultType: actualType,
          duration,
          success: true,
        });

        return {
          success: true,
          outputs: {
            result: convertedResult,
            success: true,
            duration,
            type: actualType,
          },
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("Code execution failed", {
          error: errorMessage,
          duration,
          code: config.code,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: {
            result: null,
            success: false,
            duration,
            type: "error",
          },
        };
      }
    },

    validateConfig(config: unknown): CodeParameters {
      // Validate config using the schema
      if (!config || typeof config !== "object") {
        throw new Error("Invalid configuration: must be an object");
      }

      const configObj = config as Record<string, unknown>;

      // Validate required fields
      if (typeof configObj.code !== "string" || !configObj.code.trim()) {
        throw new Error(
          "Invalid configuration: code must be a non-empty string",
        );
      }

      // Validate timeout
      const timeout = configObj.timeout;
      if (
        timeout !== undefined &&
        (typeof timeout !== "number" || timeout < 100 || timeout > 30000)
      ) {
        throw new Error(
          "Invalid configuration: timeout must be between 100 and 30000 milliseconds",
        );
      }

      // Validate memoryLimit
      const memoryLimit = configObj.memoryLimit;
      if (
        memoryLimit !== undefined &&
        (typeof memoryLimit !== "number" ||
          memoryLimit < 8 ||
          memoryLimit > 128)
      ) {
        throw new Error(
          "Invalid configuration: memoryLimit must be between 8 and 128 MB",
        );
      }

      // Validate returnType
      const returnType = configObj.returnType;
      const validReturnTypes = [
        "auto",
        "string",
        "number",
        "boolean",
        "object",
        "array",
      ];
      if (
        returnType !== undefined &&
        !validReturnTypes.includes(returnType as string)
      ) {
        throw new Error(
          `Invalid configuration: returnType must be one of ${validReturnTypes.join(", ")}`,
        );
      }

      return config as CodeParameters;
    },
  });

export default codeExecutable;
