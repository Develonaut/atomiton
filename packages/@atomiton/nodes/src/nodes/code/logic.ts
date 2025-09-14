/**
 * JavaScript Code Logic Implementation - Pure business logic
 *
 *
 * Handles the business logic for executing custom JavaScript code
 */

import { createNodeLogic } from "../../base/createNodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types";
import type { CodeParameters } from "./parameters";
import { codeParameters } from "./parameters";

async function executeSyncCode(
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
      // Create function with dynamic parameters
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

async function executeAsyncCode(
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
      // Wrap code in async function
      const asyncCode = `
        return (async () => {
          ${code}
        })();
      `;

      const func = new Function(...paramNames, asyncCode);
      const promise = func(...paramValues);

      Promise.resolve(promise)
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

function validateReturnType(value: unknown, expectedType: string): unknown {
  if (expectedType === "any") {
    return value;
  }

  const actualType = Array.isArray(value) ? "array" : typeof value;

  switch (expectedType) {
    case "string":
      if (actualType !== "string") {
        throw new Error(
          `Expected string but got ${actualType}: ${JSON.stringify(value)}`,
        );
      }
      break;
    case "number":
      if (actualType !== "number") {
        throw new Error(
          `Expected number but got ${actualType}: ${JSON.stringify(value)}`,
        );
      }
      break;
    case "boolean":
      if (actualType !== "boolean") {
        throw new Error(
          `Expected boolean but got ${actualType}: ${JSON.stringify(value)}`,
        );
      }
      break;
    case "object":
      if (actualType !== "object" || value === null) {
        throw new Error(
          `Expected object but got ${actualType}: ${JSON.stringify(value)}`,
        );
      }
      break;
    case "array":
      if (!Array.isArray(value)) {
        throw new Error(
          `Expected array but got ${actualType}: ${JSON.stringify(value)}`,
        );
      }
      break;
  }

  return value;
}

const DEFAULT_TIMEOUT = 30000;

export const codeLogic = createNodeLogic<CodeParameters>({
  async execute(
    context: NodeExecutionContext,
    params: CodeParameters,
  ): Promise<NodeExecutionResult> {
    try {
      if (!params.code.trim()) {
        throw new Error("No code provided");
      }

      // Parse input parameters
      const paramNames = params.inputParams
        .split(",")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      // Get values for each parameter
      const paramValues = paramNames.map((param: string) => {
        return context.inputs?.[param] ?? context.inputs?.data;
      });

      let result: unknown;

      if (params.async) {
        result = await executeAsyncCode(
          params.code,
          paramNames,
          paramValues,
          DEFAULT_TIMEOUT,
        );
      } else {
        result = await executeSyncCode(
          params.code,
          paramNames,
          paramValues,
          DEFAULT_TIMEOUT,
        );
      }

      // Validate return type
      const validatedResult = validateReturnType(result, params.returnType);

      return {
        success: true,
        outputs: { result: validatedResult, success: true },
        error: undefined,
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: "code",
          nodeType: "code",
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: { result: undefined, success: false },
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: "code",
          nodeType: "code",
        },
      };
    }
  },

  getValidatedParams(context: NodeExecutionContext): CodeParameters {
    return codeParameters.withDefaults(context.parameters);
  },
});
