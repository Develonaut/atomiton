/**
 * Execution Trace Tests
 * Tests for execution trace capture in results
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
import { toNodeId, toExecutionId } from "#types";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeExecutionGraph } from "@atomiton/nodes/graph";

describe("Execution Trace", () => {
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
      nodeId: toNodeId("test-node"),
      executionId: toExecutionId("exec-123"),
      input: { default: "test-input" },
      variables: {},
      slowMo: 0,
    };

    executionGraphStore = createExecutionGraphStore();
  });

  describe("single node execution", () => {
    it("should capture trace for single node execution", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
        name: "Test Node",
      });

      // Initialize the store with a graph for single node
      const graph = analyzeExecutionGraph(node);
      executionGraphStore.initializeGraph(graph);

      const result = await executeGraph(
        node,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      expect(result.success).toBe(true);
      expect(result.trace).toBeDefined();

      const trace = result.trace!;
      expect(trace.executionId).toBeDefined();
      expect(trace.rootNodeId).toBe("single-node");
      expect(trace.startTime).toBeGreaterThan(0);
      expect(trace.endTime).toBeGreaterThan(trace.startTime);
      expect(trace.duration).toBeGreaterThan(0);
      expect(trace.events.length).toBeGreaterThan(0);
      expect(trace.nodes.length).toBe(1);

      // Verify the node trace
      const nodeTrace = trace.nodes[0];
      expect(nodeTrace.nodeId).toBe("single-node");
      expect(nodeTrace.nodeName).toBe("Test Node");
      expect(nodeTrace.nodeType).toBe("test-type");
    });

    it("should capture started event in trace", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const graph = analyzeExecutionGraph(node);
      executionGraphStore.initializeGraph(graph);

      const result = await executeGraph(
        node,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      const trace = result.trace!;
      const startedEvent = trace.events.find((e) => e.type === "started");
      expect(startedEvent).toBeDefined();
      expect(startedEvent?.data).toMatchObject({
        totalNodes: 1,
        totalWeight: expect.any(Number),
        criticalPath: expect.any(Array),
      });
    });

    it("should capture completed event in trace", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const graph = analyzeExecutionGraph(node);
      executionGraphStore.initializeGraph(graph);

      const result = await executeGraph(
        node,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      const trace = result.trace!;
      const completedEvent = trace.events.find((e) => e.type === "completed");
      expect(completedEvent).toBeDefined();
      expect(completedEvent?.data).toMatchObject({
        totalDuration: expect.any(Number),
        nodesCompleted: expect.any(Number),
        nodesErrored: expect.any(Number),
      });
    });
  });

  describe("group node execution", () => {
    it("should capture trace for all child nodes", async () => {
      const child1 = createNodeDefinition({
        id: "child-1",
        type: "test-type-1",
        name: "Child 1",
      });

      const child2 = createNodeDefinition({
        id: "child-2",
        type: "test-type-2",
        name: "Child 2",
      });

      const child3 = createNodeDefinition({
        id: "child-3",
        type: "test-type-3",
        name: "Child 3",
      });

      const groupNode = createNodeDefinition({
        id: "group-node",
        type: "group",
        name: "Group Node",
        nodes: [child1, child2, child3],
        edges: [
          { id: "e1", source: child1.id, target: child2.id },
          { id: "e2", source: child2.id, target: child3.id },
        ],
      });

      const graph = analyzeExecutionGraph(groupNode);
      executionGraphStore.initializeGraph(graph);

      const result = await executeGraph(
        groupNode,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      expect(result.success).toBe(true);
      expect(result.trace).toBeDefined();

      const trace = result.trace!;
      expect(trace.nodes.length).toBe(3);

      // Verify all child nodes are in the trace
      const nodeIds = trace.nodes.map((n) => n.nodeId);
      expect(nodeIds).toContain("child-1");
      expect(nodeIds).toContain("child-2");
      expect(nodeIds).toContain("child-3");
    });

    it("should include all child nodes in the trace", async () => {
      const child1 = createNodeDefinition({
        id: "child-1",
        type: "test-type-1",
        name: "Child 1",
      });

      const child2 = createNodeDefinition({
        id: "child-2",
        type: "test-type-2",
        name: "Child 2",
      });

      const groupNode = createNodeDefinition({
        id: "group-node",
        type: "group",
        nodes: [child1, child2],
        edges: [{ id: "e1", source: child1.id, target: child2.id }],
      });

      const graph = analyzeExecutionGraph(groupNode);
      executionGraphStore.initializeGraph(graph);

      const result = await executeGraph(
        groupNode,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      const trace = result.trace!;

      // Verify both child nodes are in the trace
      expect(trace.nodes.length).toBe(2);
      const nodeIds = trace.nodes.map((n) => n.nodeId);
      expect(nodeIds).toContain("child-1");
      expect(nodeIds).toContain("child-2");

      // Verify node names are captured
      const child1Trace = trace.nodes.find((n) => n.nodeId === "child-1");
      expect(child1Trace?.nodeName).toBe("Child 1");
    });
  });

  describe("timing accuracy", () => {
    it("should record accurate timestamps and durations", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const graph = analyzeExecutionGraph(node);
      executionGraphStore.initializeGraph(graph);

      const startTime = Date.now();
      const result = await executeGraph(
        node,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );
      const endTime = Date.now();

      const trace = result.trace!;

      // Verify trace timing (allow 2ms margin for CI timing variability)
      expect(trace.startTime).toBeGreaterThanOrEqual(startTime - 2);
      expect(trace.endTime).toBeLessThanOrEqual(endTime + 2);
      expect(trace.duration).toBe(trace.endTime! - trace.startTime);

      // Verify node trace timing
      const nodeTrace = trace.nodes[0];
      expect(nodeTrace.startTime).toBeGreaterThanOrEqual(trace.startTime);
      if (nodeTrace.endTime) {
        expect(nodeTrace.endTime).toBeLessThanOrEqual(trace.endTime!);
        expect(nodeTrace.duration).toBe(
          nodeTrace.endTime - nodeTrace.startTime,
        );
      }
    });

    it("should record event timestamps in chronological order", async () => {
      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const graph = analyzeExecutionGraph(node);
      executionGraphStore.initializeGraph(graph);

      const result = await executeGraph(
        node,
        context,
        config,
        executionGraphStore,
        mockExecute,
      );

      const trace = result.trace!;
      const timestamps = trace.events.map((e) => e.timestamp);

      // Verify timestamps are in chronological order
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
      }
    });
  });

  describe("error scenarios", () => {
    it("should capture trace even when execution fails", async () => {
      const errorMessage = "Test error";

      // Mock the node executor factory to return a failing executor
      const failingConfig: ConductorConfig = {
        ...config,
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: vi.fn().mockRejectedValue(new Error(errorMessage)),
          }),
        },
      };

      const node = createNodeDefinition({
        id: "single-node",
        type: "test-type",
      });

      const graph = analyzeExecutionGraph(node);
      executionGraphStore.initializeGraph(graph);

      const result = await executeGraph(
        node,
        context,
        failingConfig, // Use config with failing executor
        executionGraphStore,
        mockExecute,
      );

      expect(result.success).toBe(false);
      expect(result.trace).toBeDefined();

      const trace = result.trace!;
      expect(trace.executionId).toBeDefined();
      expect(trace.nodes.length).toBeGreaterThan(0);
    });
  });
});
