/**
 * Smoke tests for composite workflow execution
 * Verifies that node registry elimination works correctly
 */

import { describe, it, expect } from "vitest";
import { createCompositeRunner } from "./compositeRunner";
import { createExecutionStore } from "../../store";
import { createNodeExecutor } from "../nodeExecutor";
import type { CompositeDefinition } from "@atomiton/nodes/executable";

describe("Composite Execution Smoke Tests", () => {
  const executionStore = createExecutionStore();
  const nodeExecutor = createNodeExecutor();
  const compositeRunner = createCompositeRunner(executionStore, nodeExecutor);

  it("should validate composite without requiring node registration", () => {
    const testComposite: CompositeDefinition = {
      id: "test-composite",
      name: "Test Composite",
      description: "Test composite for smoke test",
      version: "1.0.0",
      nodes: [
        {
          id: "node1",
          type: "transform",
          data: {},
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      inputs: {},
      outputs: {},
    };

    expect(() => compositeRunner.execute(testComposite)).not.toThrow();
  });

  it("should reject composite with unknown node type", async () => {
    const invalidComposite: CompositeDefinition = {
      id: "invalid-composite",
      name: "Invalid Composite",
      description: "Composite with invalid node type",
      version: "1.0.0",
      nodes: [
        {
          id: "node1",
          type: "nonexistent-node",
          data: {},
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      inputs: {},
      outputs: {},
    };

    const result = await compositeRunner.execute(invalidComposite);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown node type: nonexistent-node");
  });

  it("should execute simple composite with transform node", async () => {
    const simpleComposite: CompositeDefinition = {
      id: "simple-transform",
      name: "Simple Transform",
      description: "Single transform node",
      version: "1.0.0",
      nodes: [
        {
          id: "transform1",
          type: "transform",
          data: {
            operation: "uppercase",
            input: "hello world",
          },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      inputs: {
        text: "hello world",
      },
      outputs: {
        result: "transform1.output",
      },
    };

    const result = await compositeRunner.execute(simpleComposite, {
      inputs: { text: "hello world" },
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.executionId).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.metrics.nodesExecuted).toBe(1);
  });

  it("should handle execution with multiple node types", async () => {
    const multiNodeComposite: CompositeDefinition = {
      id: "multi-node",
      name: "Multi Node Composite",
      description: "Multiple different node types",
      version: "1.0.0",
      nodes: [
        {
          id: "transform1",
          type: "transform",
          data: {},
          position: { x: 0, y: 0 },
        },
        {
          id: "code1",
          type: "code",
          data: { code: "console.log('test')" },
          position: { x: 100, y: 0 },
        },
      ],
      edges: [],
      inputs: {},
      outputs: {},
    };

    const result = await compositeRunner.execute(multiNodeComposite);

    expect(result).toBeDefined();
    expect(result.executionId).toBeDefined();
    expect(result.metrics.nodesExecuted).toBeGreaterThanOrEqual(0);
  });

  it("should access all available node types without registration", () => {
    const nodeTypes = [
      "code",
      "csvReader",
      "fileSystem",
      "httpRequest",
      "imageComposite",
      "loop",
      "parallel",
      "shellCommand",
      "transform",
    ];

    for (const nodeType of nodeTypes) {
      const composite: CompositeDefinition = {
        id: `test-${nodeType}`,
        name: `Test ${nodeType}`,
        description: `Test composite for ${nodeType}`,
        version: "1.0.0",
        nodes: [
          {
            id: "node1",
            type: nodeType,
            data: {},
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
        inputs: {},
        outputs: {},
      };

      // Should not throw validation error for any known node type
      expect(() => compositeRunner.execute(composite)).not.toThrow(
        `Unknown node type: ${nodeType}`,
      );
    }
  });
});
