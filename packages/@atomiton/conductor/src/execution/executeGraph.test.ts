/**
 * Execute Graph Tests
 * Tests for graph execution logic including topological sorting, data flow, and error handling
 */

import { executeGraph } from "#execution/executeGraph";
import {
  createExecutionGraphStore,
  type ExecutionGraphStore,
} from "#execution/executionGraphStore";
import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
} from "#types";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("executeGraph", () => {
  let mockExecute: (
    node: NodeDefinition,
    context: ConductorExecutionContext,
    config: ConductorConfig,
    store?: ExecutionGraphStore,
  ) => Promise<ExecutionResult>;
  let config: ConductorConfig;
  let context: ConductorExecutionContext;
  let executionGraphStore: ExecutionGraphStore;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock execute function that returns success with the node's type as data
    mockExecute = vi.fn().mockImplementation(async (node) => ({
      success: true,
      data: `result-${node.type}`,
      duration: 10,
      executedNodes: [node.id],
      context,
    }));

    config = {
      nodeExecutorFactory: {
        getNodeExecutable: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue("test"),
        }),
      },
    };

    context = {
      nodeId: "test-node",
      executionId: "exec-123",
      input: { default: "test-input" },
      variables: {},
      slowMo: 0,
    };

    executionGraphStore = createExecutionGraphStore();
  });

  describe("critical: single node execution", () => {
    it("should execute single node locally with executor factory", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const result = await executeGraph(
        node,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      expect(result.success).toBe(true);
      expect(result.executedNodes).toContain("single-node");
      expect(executionGraphStore.getState().isExecuting).toBe(false);
    });

    it("should use transport for single node when configured", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const mockTransport = {
        execute: vi.fn().mockResolvedValue({
          success: true,
          data: "transport-result",
          duration: 5,
          executedNodes: ["single-node"],
        }),
      };

      const configWithTransport: ConductorConfig = {
        ...config,
        transport: mockTransport,
      };

      const result = await executeGraph(
        node,
        context,
        configWithTransport,
        executionGraphStore,
        mockExecute,
      );

      expect(mockTransport.execute).toHaveBeenCalledWith(node, context);
      expect(result.success).toBe(true);
      expect(result.data).toBe("transport-result");
      expect(mockExecute).not.toHaveBeenCalled();
    });

    it("should complete execution in store for single node", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const completeExecutionSpy = vi.spyOn(
        executionGraphStore,
        "completeExecution",
      );

      await executeGraph(
        node,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      expect(completeExecutionSpy).toHaveBeenCalled();
    });
  });

  describe("critical: graph execution with edges", () => {
    it("should execute nodes in topological order", async () => {
      const executionOrder: string[] = [];

      const trackingExecute = vi
        .fn()
        .mockImplementation(async (node: NodeDefinition) => {
          executionOrder.push(node.id);
          return {
            success: true,
            data: `output-${node.id}`,
            duration: 5,
            executedNodes: [node.id],
            context,
          };
        });

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });
      const node2 = createNodeDefinition({ id: "node-2", type: "type-2" });
      const node3 = createNodeDefinition({ id: "node-3", type: "type-3" });

      // Graph: node-1 -> node-2 -> node-3
      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2, node3],
        edges: [
          { id: "e1", source: "node-1", target: "node-2" },
          { id: "e2", source: "node-2", target: "node-3" },
        ],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        trackingExecute,
      );

      expect(result.success).toBe(true);
      expect(executionOrder).toEqual(["node-1", "node-2", "node-3"]);
    });

    it("should pass edge data between nodes", async () => {
      const receivedInputs = new Map<string, unknown>();

      const trackingExecute = vi
        .fn()
        .mockImplementation(
          async (node: NodeDefinition, ctx: ConductorExecutionContext) => {
            receivedInputs.set(node.id, ctx.input);
            return {
              success: true,
              data: `output-${node.id}`,
              duration: 5,
              executedNodes: [node.id],
              context: ctx,
            };
          },
        );

      const node1 = createNodeDefinition({ id: "node-1", type: "source" });
      const node2 = createNodeDefinition({ id: "node-2", type: "target" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2],
        edges: [
          {
            id: "e1",
            source: "node-1",
            target: "node-2",
            targetHandle: "input-handle",
          },
        ],
      });

      await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        trackingExecute,
      );

      // Node 2 should receive output from node 1 on the specified handle
      expect(receivedInputs.get("node-2")).toEqual({
        "input-handle": "output-node-1",
      });
    });

    it("should return output from last node", async () => {
      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });
      const node2 = createNodeDefinition({ id: "node-2", type: "type-2" });
      const node3 = createNodeDefinition({ id: "node-3", type: "type-3" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2, node3],
        edges: [
          { id: "e1", source: "node-1", target: "node-2" },
          { id: "e2", source: "node-2", target: "node-3" },
        ],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe("result-type-3"); // Last node output
    });

    it("should include all executed nodes in result", async () => {
      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });
      const node2 = createNodeDefinition({ id: "node-2", type: "type-2" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2],
        edges: [{ id: "e1", source: "node-1", target: "node-2" }],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      expect(result.executedNodes).toEqual(["graph", "node-1", "node-2"]);
    });
  });

  describe("critical: nodes without edges", () => {
    it("should execute nodes without edges using parent context input", async () => {
      const receivedInputs = new Map<string, unknown>();

      const trackingExecute = vi
        .fn()
        .mockImplementation(
          async (node: NodeDefinition, ctx: ConductorExecutionContext) => {
            receivedInputs.set(node.id, ctx.input);
            return {
              success: true,
              data: "output",
              duration: 5,
              executedNodes: [node.id],
              context: ctx,
            };
          },
        );

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });
      const node2 = createNodeDefinition({ id: "node-2", type: "type-2" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2],
        edges: [], // No edges!
      });

      const parentContext = {
        ...context,
        input: { default: "parent-input" },
      };

      await executeGraph(
        graph,
        parentContext,
        config,
        executionGraphStore,
        trackingExecute,
      );

      // Both nodes should receive parent context input
      expect(receivedInputs.get("node-1")).toEqual({ default: "parent-input" });
      expect(receivedInputs.get("node-2")).toEqual({ default: "parent-input" });
    });
  });

  describe("critical: error handling", () => {
    it("should stop execution on first node error", async () => {
      const executionOrder: string[] = [];

      const errorExecute = vi
        .fn()
        .mockImplementation(async (node: NodeDefinition) => {
          executionOrder.push(node.id);

          if (node.id === "node-2") {
            return {
              success: false,
              error: {
                nodeId: "node-2",
                message: "Node 2 failed",
                timestamp: new Date(),
              },
              duration: 5,
              executedNodes: ["node-2"],
            };
          }

          return {
            success: true,
            data: "output",
            duration: 5,
            executedNodes: [node.id],
            context,
          };
        });

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });
      const node2 = createNodeDefinition({ id: "node-2", type: "type-2" });
      const node3 = createNodeDefinition({ id: "node-3", type: "type-3" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2, node3],
        edges: [
          { id: "e1", source: "node-1", target: "node-2" },
          { id: "e2", source: "node-2", target: "node-3" },
        ],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        errorExecute,
      );

      expect(result.success).toBe(false);
      expect(result.error?.nodeId).toBe("node-2");
      expect(executionOrder).toEqual(["node-1", "node-2"]); // node-3 never executed
      expect(executionGraphStore.getState().isExecuting).toBe(false);
    });

    it("should handle exceptions during graph execution", async () => {
      const throwingExecute = vi.fn().mockImplementation(async () => {
        throw new Error("Unexpected error");
      });

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1],
        edges: [],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        throwingExecute,
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        nodeId: "graph",
        message: "Unexpected error",
      });
      expect(result.error?.stack).toBeDefined();
      expect(executionGraphStore.getState().isExecuting).toBe(false);
    });

    it("should handle non-Error exceptions", async () => {
      const throwingExecute = vi.fn().mockImplementation(async () => {
        throw "String error";
      });

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1],
        edges: [],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        throwingExecute,
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("String error");
      expect(result.error?.stack).toBeUndefined();
    });
  });

  describe("critical: context propagation", () => {
    it("should create child context with parent reference", async () => {
      const receivedContexts = new Map<string, ConductorExecutionContext>();

      const trackingExecute = vi
        .fn()
        .mockImplementation(
          async (node: NodeDefinition, ctx: ConductorExecutionContext) => {
            receivedContexts.set(node.id, ctx);
            return {
              success: true,
              data: "output",
              duration: 5,
              executedNodes: [node.id],
              context: ctx,
            };
          },
        );

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1],
        edges: [],
      });

      await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        trackingExecute,
      );

      const childContext = receivedContexts.get("node-1");
      expect(childContext?.parentContext).toBe(context);
      expect(childContext?.nodeId).toBe("node-1");
      expect(childContext?.variables).toBe(context.variables);
      expect(childContext?.slowMo).toBe(context.slowMo);
    });

    it("should preserve variables across child executions", async () => {
      const receivedVariables: Array<Record<string, unknown> | undefined> = [];

      const trackingExecute = vi
        .fn()
        .mockImplementation(
          async (node: NodeDefinition, ctx: ConductorExecutionContext) => {
            receivedVariables.push(ctx.variables);
            return {
              success: true,
              data: "output",
              duration: 5,
              executedNodes: [node.id],
              context: ctx,
            };
          },
        );

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });
      const node2 = createNodeDefinition({ id: "node-2", type: "type-2" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2],
        edges: [{ id: "e1", source: "node-1", target: "node-2" }],
      });

      const contextWithVars = {
        ...context,
        variables: { userId: "123", env: "test" },
      };

      await executeGraph(
        graph,
        contextWithVars,
        config,
        executionGraphStore,
        trackingExecute,
      );

      // All nodes should receive same variables
      expect(receivedVariables[0]).toEqual({ userId: "123", env: "test" });
      expect(receivedVariables[1]).toEqual({ userId: "123", env: "test" });
    });
  });

  describe("without execution graph store", () => {
    it("should execute successfully without store", async () => {
      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1],
        edges: [],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        undefined,
        mockExecute,
      );

      expect(result.success).toBe(true);
      expect(mockExecute).toHaveBeenCalled();
    });

    it("should handle errors without store", async () => {
      const errorExecute = vi.fn().mockResolvedValue({
        success: false,
        error: {
          nodeId: "node-1",
          message: "Failed",
          timestamp: new Date(),
        },
        duration: 5,
        executedNodes: ["node-1"],
      });

      const node1 = createNodeDefinition({ id: "node-1", type: "type-1" });

      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1],
        edges: [],
      });

      const result = await executeGraph(
        graph,
        context,
        config,
        undefined,
        errorExecute,
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Failed");
    });
  });

  describe("critical: complex graph topologies", () => {
    it("should handle parallel branches", async () => {
      const executionOrder: string[] = [];

      const trackingExecute = vi
        .fn()
        .mockImplementation(async (node: NodeDefinition) => {
          executionOrder.push(node.id);
          return {
            success: true,
            data: `output-${node.id}`,
            duration: 5,
            executedNodes: [node.id],
            context,
          };
        });

      const node1 = createNodeDefinition({ id: "node-1", type: "source" });
      const node2 = createNodeDefinition({ id: "node-2", type: "branch-a" });
      const node3 = createNodeDefinition({ id: "node-3", type: "branch-b" });

      // Graph:    node-1
      //          /      \
      //       node-2  node-3
      const graph = createNodeDefinition({
        id: "graph",
        type: "group",
        nodes: [node1, node2, node3],
        edges: [
          { id: "e1", source: "node-1", target: "node-2" },
          { id: "e2", source: "node-1", target: "node-3" },
        ],
      });

      await executeGraph(
        graph,
        context,
        config,
        executionGraphStore,
        trackingExecute,
      );

      // node-1 must execute first, then node-2 and node-3 (order between them doesn't matter)
      expect(executionOrder[0]).toBe("node-1");
      expect(executionOrder.slice(1)).toContain("node-2");
      expect(executionOrder.slice(1)).toContain("node-3");
    });
  });
});
