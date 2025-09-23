/**
 * Contract tests for createNodeExecutable factory
 *
 * Tests the contracts that createNodeExecutable establishes:
 * - Input validation and error handling
 * - Output shape and type guarantees
 * - Default value application
 * - Edge cases and boundary conditions
 */

import { describe, expect, it, vi } from "vitest";
import { createNodeExecutable } from "./createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutableInput,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@/types/nodeExecutable";

describe("createNodeExecutable - Contract Tests", () => {
  const mockContext: NodeExecutionContext = {
    nodeId: "test-node",
    inputs: { data: "test" },
    parameters: { enabled: true },
  };

  const mockResult: NodeExecutionResult = {
    success: true,
    outputs: { result: "processed" },
  };

  describe("Input validation contracts", () => {
    it("requires execute function", () => {
      const result = createNodeExecutable({
        // @ts-expect-error - Intentionally testing missing execute
        execute: undefined,
      });

      // Factory doesn't validate - just passes through undefined
      expect(result.execute).toBeUndefined();
    });

    it("accepts minimal valid input", () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const executable = createNodeExecutable({ execute });

      expect(executable).toBeDefined();
      expect(typeof executable.execute).toBe("function");
      expect(typeof executable.getValidatedParams).toBe("function");
    });

    it("handles null/undefined input gracefully", () => {
      // Factory throws when accessing properties on null/undefined
      expect(() => {
        // @ts-expect-error - Intentionally testing null input
        createNodeExecutable(null);
      }).toThrow();

      expect(() => {
        // @ts-expect-error - Intentionally testing undefined input
        createNodeExecutable(undefined);
      }).toThrow();
    });
  });

  describe("Execute function contract", () => {
    it("preserves execute function signature", async () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const executable = createNodeExecutable({ execute });

      const result = await executable.execute(mockContext, {});

      expect(execute).toHaveBeenCalledWith(mockContext, {});
      expect(result).toEqual(mockResult);
    });

    it("handles execute function errors", async () => {
      const error = new Error("Execution failed");
      const execute = vi.fn().mockRejectedValue(error);
      const executable = createNodeExecutable({ execute });

      await expect(executable.execute(mockContext, {})).rejects.toThrow(
        "Execution failed",
      );
    });

    it("preserves async behavior", async () => {
      let resolvePromise: (value: NodeExecutionResult) => void;
      const promise = new Promise<NodeExecutionResult>((resolve) => {
        resolvePromise = resolve;
      });

      const execute = vi.fn().mockReturnValue(promise);
      const executable = createNodeExecutable({ execute });

      const executionPromise = executable.execute(mockContext, {});

      // Should not resolve immediately
      expect(execute).toHaveBeenCalled();

      resolvePromise!(mockResult);
      const result = await executionPromise;

      expect(result).toEqual(mockResult);
    });
  });

  describe("getValidatedParams contract", () => {
    it("uses provided getValidatedParams when available", () => {
      const mockParams = { custom: "validated" };
      const getValidatedParams = vi.fn().mockReturnValue(mockParams);
      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable({
        execute,
        getValidatedParams,
      });

      const result = executable.getValidatedParams(mockContext);

      expect(getValidatedParams).toHaveBeenCalledWith(mockContext);
      expect(result).toEqual(mockParams);
    });

    it("provides default getValidatedParams when not provided", () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const executable = createNodeExecutable({ execute });

      const result = executable.getValidatedParams(mockContext);

      expect(result).toEqual(mockContext.parameters);
    });

    it("handles empty parameters in default getValidatedParams", () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const executable = createNodeExecutable({ execute });

      const contextWithoutParams = { ...mockContext, parameters: undefined };
      const result = executable.getValidatedParams(contextWithoutParams);

      expect(result).toEqual({});
    });

    it("uses validateConfig when provided and no getValidatedParams", () => {
      const validateConfig = vi.fn().mockReturnValue({ validated: true });
      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable({
        execute,
        validateConfig,
      });

      const result = executable.getValidatedParams(mockContext);

      expect(validateConfig).toHaveBeenCalledWith(mockContext.parameters);
      expect(result).toEqual({ validated: true });
    });

    it("getValidatedParams takes precedence over validateConfig", () => {
      const getValidatedParams = vi.fn().mockReturnValue({ custom: true });
      const validateConfig = vi.fn().mockReturnValue({ validated: true });
      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable({
        execute,
        getValidatedParams,
        validateConfig,
      });

      const result = executable.getValidatedParams(mockContext);

      expect(getValidatedParams).toHaveBeenCalledWith(mockContext);
      expect(validateConfig).not.toHaveBeenCalled();
      expect(result).toEqual({ custom: true });
    });
  });

  describe("Type safety contracts", () => {
    it("preserves generic type parameter", () => {
      type CustomConfig = {
        setting: string;
        value: number;
      };

      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable: NodeExecutable<CustomConfig> =
        createNodeExecutable<CustomConfig>({
          execute,
        });

      // Type should be enforced at compile time
      expect(executable).toBeDefined();
    });

    it("handles complex config types", () => {
      type ComplexConfig = {
        nested: {
          array: string[];
          optional?: number;
        };
        union: "option1" | "option2";
      };

      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable<ComplexConfig>({
        execute,
      });

      expect(executable).toBeDefined();
    });
  });

  describe("Edge cases and boundary conditions", () => {
    it("handles execute function that returns synchronously resolved promise", async () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const executable = createNodeExecutable({ execute });

      const result = await executable.execute(mockContext, {});

      expect(result).toEqual(mockResult);
    });

    it("handles large config objects", () => {
      const largeConfig = { data: "x".repeat(10000) };
      const getValidatedParams = vi.fn().mockReturnValue(largeConfig);
      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable({
        execute,
        getValidatedParams,
      });

      const result = executable.getValidatedParams(mockContext);

      expect(result).toEqual(largeConfig);
    });

    it("handles circular references in config", () => {
      const circularConfig: Record<string, unknown> = { self: null };
      circularConfig.self = circularConfig;

      const getValidatedParams = vi.fn().mockReturnValue(circularConfig);
      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable({
        execute,
        getValidatedParams,
      });

      const result = executable.getValidatedParams(mockContext);

      expect(result).toBe(circularConfig);
    });

    it("preserves function identity", () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const getValidatedParams = vi.fn().mockReturnValue({});

      const input: NodeExecutableInput = { execute, getValidatedParams };
      const executable = createNodeExecutable(input);

      expect(executable.execute).toBe(execute);
      expect(executable.getValidatedParams).toBe(getValidatedParams);
    });

    it("handles context mutations during execution", async () => {
      const execute = vi.fn().mockImplementation((context) => {
        // Simulate mutation of context during execution
        context.inputs.mutated = true;
        return Promise.resolve(mockResult);
      });

      const executable = createNodeExecutable({ execute });
      const mutableContext = { ...mockContext };

      await executable.execute(mutableContext, {});

      expect(mutableContext.inputs.mutated).toBe(true);
    });
  });

  describe("Error handling contracts", () => {
    it("preserves validation errors from validateConfig", () => {
      const validationError = new Error("Invalid configuration");
      const validateConfig = vi.fn().mockImplementation(() => {
        throw validationError;
      });
      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable({
        execute,
        validateConfig,
      });

      expect(() => executable.getValidatedParams(mockContext)).toThrow(
        "Invalid configuration",
      );
    });

    it("preserves errors from custom getValidatedParams", () => {
      const customError = new Error("Custom validation failed");
      const getValidatedParams = vi.fn().mockImplementation(() => {
        throw customError;
      });
      const execute = vi.fn().mockResolvedValue(mockResult);

      const executable = createNodeExecutable({
        execute,
        getValidatedParams,
      });

      expect(() => executable.getValidatedParams(mockContext)).toThrow(
        "Custom validation failed",
      );
    });

    it("handles errors in execute function", async () => {
      const executionError = new Error("Node execution failed");
      const execute = vi.fn().mockRejectedValue(executionError);

      const executable = createNodeExecutable({ execute });

      await expect(executable.execute(mockContext, {})).rejects.toThrow(
        "Node execution failed",
      );
    });
  });

  describe("Output guarantees", () => {
    it("always returns object with execute and getValidatedParams", () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const executable = createNodeExecutable({ execute });

      expect(executable).toHaveProperty("execute");
      expect(executable).toHaveProperty("getValidatedParams");
      expect(typeof executable.execute).toBe("function");
      expect(typeof executable.getValidatedParams).toBe("function");
    });

    it("returns exactly two properties", () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const executable = createNodeExecutable({ execute });

      const keys = Object.keys(executable);
      expect(keys).toHaveLength(2);
      expect(keys.sort()).toEqual(["execute", "getValidatedParams"]);
    });

    it("does not include input properties in output", () => {
      const execute = vi.fn().mockResolvedValue(mockResult);
      const validateConfig = vi.fn().mockReturnValue({});

      const executable = createNodeExecutable({
        execute,
        validateConfig,
      });

      expect(executable).not.toHaveProperty("validateConfig");
    });
  });
});
