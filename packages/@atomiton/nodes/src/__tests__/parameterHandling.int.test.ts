/**
 * Parameter Handling Integration Tests
 *
 * Tests parameter validation and processing
 */

import { describe, expect, it } from "vitest";
import { code } from "../atomic/nodes/code";
import type { NodeExecutionContext } from "../exports/executable/execution-types";

describe("Parameter Handling Integration", () => {
  it("handles valid parameters correctly", async () => {
    const context: NodeExecutionContext = {
      nodeId: "param-test",
      inputs: { value: 10 },
      parameters: {
        code: "return value * 2;",
        inputParams: "value",
        returnType: "number",
        async: false,
      },
    };

    const result = await code.execute(context);

    expect(result.success).toBe(true);
    expect(result.outputs?.result).toBe(20);
  });

  it("handles empty code parameter", async () => {
    const context: NodeExecutionContext = {
      nodeId: "empty-param",
      inputs: {},
      parameters: {
        code: "",
        inputParams: "",
        returnType: "any",
        async: false,
      },
    };

    const result = await code.execute(context);

    expect(result.success).toBe(false);
    expect(result.error).toContain("No code provided");
  });

  it("validates return types", async () => {
    const context: NodeExecutionContext = {
      nodeId: "type-validation",
      inputs: {},
      parameters: {
        code: "return 42;",
        inputParams: "",
        returnType: "string",
        async: false,
      },
    };

    const result = await code.execute(context);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Expected string but got number");
  });

  it("handles missing inputs gracefully", async () => {
    const context: NodeExecutionContext = {
      nodeId: "missing-input",
      inputs: {},
      parameters: {
        code: "return typeof missingVar === 'undefined' ? 'not found' : missingVar;",
        inputParams: "missingVar",
        returnType: "string",
        async: false,
      },
    };

    const result = await code.execute(context);

    expect(result.success).toBe(true);
    expect(result.outputs?.result).toBe("not found");
  });
});
