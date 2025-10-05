/**
 * Data Flow Integration Tests
 * Tests to verify that data correctly flows from one node to the next in sequential execution
 */

import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";
import type { ConductorExecutionContext } from "#types/execution";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Data Flow Between Nodes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass data from one node to the next in a sequential chain", async () => {
    // Track what each node receives and outputs
    const executionLog: Array<{
      node: string;
      input: Record<string, unknown>;
      output: unknown;
    }> = [];

    // Node 1: Double the input
    const doubleExecutable: NodeExecutable = {
      execute: vi
        .fn()
        .mockImplementation(async (params: ConductorExecutionContext) => {
          const input = (params.input?.default as number) ?? 5;
          const output = input * 2;
          executionLog.push({ node: "double", input: params, output });
          return output;
        }),
    };

    // Node 2: Add 10 to the input
    const addTenExecutable: NodeExecutable = {
      execute: vi
        .fn()
        .mockImplementation(async (params: ConductorExecutionContext) => {
          const input = (params.input?.default as number) ?? 0;
          const output = input + 10;
          executionLog.push({ node: "addTen", input: params, output });
          return output;
        }),
    };

    // Node 3: Square the input
    const squareExecutable: NodeExecutable = {
      execute: vi
        .fn()
        .mockImplementation(async (params: ConductorExecutionContext) => {
          const input = (params.input?.default as number) ?? 0;
          const output = input * input;
          executionLog.push({ node: "square", input: params, output });
          return output;
        }),
    };

    const conductor = createConductor({
      nodeExecutorFactory: {
        getNodeExecutable: vi.fn().mockImplementation((nodeType: string) => {
          switch (nodeType) {
            case "double":
              return doubleExecutable;
            case "addTen":
              return addTenExecutable;
            case "square":
              return squareExecutable;
            default:
              return undefined;
          }
        }),
      },
    });

    // Create a flow: 5 -> double (10) -> addTen (20) -> square (400)
    const node1 = createNodeDefinition({
      id: "node-1",
      type: "double",
    });

    const node2 = createNodeDefinition({
      id: "node-2",
      type: "addTen",
    });

    const node3 = createNodeDefinition({
      id: "node-3",
      type: "square",
    });

    const flow = createNodeDefinition({
      id: "test-flow",
      type: "group",
      nodes: [node1, node2, node3],
      edges: [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
          // targetHandle defaults to "default" when omitted
        },
        {
          id: "edge-2",
          source: "node-2",
          target: "node-3",
          // targetHandle defaults to "default" when omitted
        },
      ],
    });

    const result = await conductor.node.run(flow, {
      input: { default: 5 },
      slowMo: 0,
    });

    // Verify execution succeeded
    expect(result.success).toBe(true);

    // Expected flow:
    // Input: 5
    // Node 1 (double): 5 * 2 = 10
    // Node 2 (addTen): 10 + 10 = 20
    // Node 3 (square): 20 * 20 = 400

    // Log execution details for debugging
    console.log("\n=== EXECUTION LOG ===");
    executionLog.forEach((log, i) => {
      console.log(`\nNode ${i + 1} (${log.node}):`);
      console.log("  Input:", JSON.stringify(log.input, null, 2));
      console.log("  Output:", log.output);
    });
    console.log("\nFinal result.data:", result.data);

    // Verify final output is correct
    expect(result.data).toBe(400);

    // Verify each node received the correct data
    expect(executionLog).toHaveLength(3);

    // Node 1 should receive initial input
    expect(executionLog[0].node).toBe("double");
    expect(executionLog[0].output).toBe(10);

    // Node 2 should receive output from Node 1
    expect(executionLog[1].node).toBe("addTen");
    expect(
      (executionLog[1].input.input as Record<string, unknown> | undefined)
        ?.default,
    ).toBe(10); // Critical: should be 10, not undefined!
    expect(executionLog[1].output).toBe(20);

    // Node 3 should receive output from Node 2
    expect(executionLog[2].node).toBe("square");
    expect(
      (executionLog[2].input.input as Record<string, unknown> | undefined)
        ?.default,
    ).toBe(20); // Critical: should be 20, not undefined!
    expect(executionLog[2].output).toBe(400);
  });

  it("should handle missing edges gracefully (nodes receive initial input)", async () => {
    const executionLog: Array<{
      node: string;
      input: Record<string, unknown>;
      output: unknown;
    }> = [];

    const doubleExecutable: NodeExecutable = {
      execute: vi
        .fn()
        .mockImplementation(async (params: ConductorExecutionContext) => {
          const input = (params.input?.default as number) ?? 5;
          const output = input * 2;
          executionLog.push({ node: "double", input: params, output });
          return output;
        }),
    };

    const conductor = createConductor({
      nodeExecutorFactory: {
        getNodeExecutable: vi.fn().mockReturnValue(doubleExecutable),
      },
    });

    const node1 = createNodeDefinition({ id: "node-1", type: "double" });
    const node2 = createNodeDefinition({ id: "node-2", type: "double" });

    // Flow with NO edges - nodes should receive initial context input
    const flow = createNodeDefinition({
      id: "test-flow",
      type: "group",
      nodes: [node1, node2],
      edges: [], // No edges!
    });

    const result = await conductor.node.run(flow, {
      input: { default: 5 },
      slowMo: 0,
    });

    expect(result.success).toBe(true);

    // Both nodes should execute
    expect(executionLog).toHaveLength(2);

    // Both should receive the initial input (since no edges connect them)
    expect(executionLog[0].output).toBe(10); // 5 * 2
    expect(executionLog[1].output).toBe(10); // 5 * 2 (same input)
  });

  it("should pass data through multiple output/input handles", async () => {
    const executionLog: Array<{
      node: string;
      input: Record<string, unknown>;
      output: unknown;
    }> = [];

    const sourceExecutable: NodeExecutable = {
      execute: vi
        .fn()
        .mockImplementation(async (params: ConductorExecutionContext) => {
          const output = { value: 42 };
          executionLog.push({ node: "source", input: params, output });
          return output;
        }),
    };

    const targetExecutable: NodeExecutable = {
      execute: vi
        .fn()
        .mockImplementation(async (params: ConductorExecutionContext) => {
          const input = params.input?.customHandle as
            | { value: number }
            | undefined;
          const output = input?.value ?? 0;
          executionLog.push({ node: "target", input: params, output });
          return output;
        }),
    };

    const conductor = createConductor({
      nodeExecutorFactory: {
        getNodeExecutable: vi.fn().mockImplementation((nodeType: string) => {
          return nodeType === "source" ? sourceExecutable : targetExecutable;
        }),
      },
    });

    const sourceNode = createNodeDefinition({ id: "source", type: "source" });
    const targetNode = createNodeDefinition({ id: "target", type: "target" });

    const flow = createNodeDefinition({
      id: "test-flow",
      type: "group",
      nodes: [sourceNode, targetNode],
      edges: [
        {
          id: "edge-1",
          source: "source",
          target: "target",
          sourceHandle: "outHandle",
          targetHandle: "customHandle", // Custom handle name
        },
      ],
    });

    const result = await conductor.node.run(flow, { slowMo: 0 });

    expect(result.success).toBe(true);

    // Verify target received data on custom handle
    expect(
      (executionLog[1].input.input as Record<string, unknown> | undefined)
        ?.customHandle,
    ).toEqual({ value: 42 });
    expect(executionLog[1].output).toBe(42);
  });

  it("should preserve context variables across node executions", async () => {
    let receivedVariables: Record<string, unknown> | undefined;

    const executable: NodeExecutable = {
      execute: vi
        .fn()
        .mockImplementation(async (params: ConductorExecutionContext) => {
          receivedVariables = params.variables;
          return "ok";
        }),
    };

    const conductor = createConductor({
      nodeExecutorFactory: {
        getNodeExecutable: vi.fn().mockReturnValue(executable),
      },
    });

    const node1 = createNodeDefinition({ id: "node-1", type: "test" });
    const node2 = createNodeDefinition({ id: "node-2", type: "test" });

    const flow = createNodeDefinition({
      id: "test-flow",
      type: "group",
      nodes: [node1, node2],
      edges: [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ],
    });

    await conductor.node.run(flow, {
      variables: { userId: "123", env: "test" },
      slowMo: 0,
    });

    // Variables should be passed through context
    expect(receivedVariables).toEqual({ userId: "123", env: "test" });
  });
});
