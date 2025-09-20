/**
 * Error Handling Integration Tests
 *
 * Tests that nodes handle errors gracefully
 */

import { describe, expect, it } from "vitest";
import { code } from "../atomic/nodes/code";
import { validateComposite } from "../composite/validation/validateComposite";
import type { NodeExecutionContext } from "../exports/executable/execution-types";

describe("Error Handling Integration", () => {
  describe("Code Execution Errors", () => {
    it("handles JavaScript runtime errors", async () => {
      const context: NodeExecutionContext = {
        nodeId: "runtime-error",
        inputs: { obj: null },
        parameters: {
          code: "return obj.property;", // Will throw TypeError
          inputParams: "obj",
          returnType: "any",
          async: false,
        },
      };

      const result = await code.execute(context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.outputs?.success).toBe(false);
    });

    it("handles async errors", async () => {
      const context: NodeExecutionContext = {
        nodeId: "async-error",
        inputs: {},
        parameters: {
          code: "await Promise.reject(new Error('Async failure'));",
          inputParams: "",
          returnType: "any",
          async: true,
        },
      };

      const result = await code.execute(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Async failure");
    });

    it("handles syntax errors", async () => {
      const context: NodeExecutionContext = {
        nodeId: "syntax-error",
        inputs: {},
        parameters: {
          code: "return invalid syntax here {",
          inputParams: "",
          returnType: "any",
          async: false,
        },
      };

      const result = await code.execute(context);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Validation Errors", () => {
    it("handles invalid composite definition", () => {
      const invalidDefinition = {
        id: "test",
        name: "Test",
        type: "composite" as const,
        nodes: [
          { id: "duplicate", type: "code", position: { x: 0, y: 0 } },
          { id: "duplicate", type: "transform", position: { x: 100, y: 0 } },
        ],
        edges: [],
      };

      const result = validateComposite(invalidDefinition);

      expect(result.success).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("handles missing context gracefully", async () => {
      // Test with minimal context
      const minimalContext: NodeExecutionContext = {
        nodeId: "minimal",
        inputs: {},
      };

      const result = await code.execute(minimalContext);

      // Should handle gracefully even without full context
      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("outputs");
    });
  });
});
