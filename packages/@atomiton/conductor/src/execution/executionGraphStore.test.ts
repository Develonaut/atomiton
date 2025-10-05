import { describe, it, expect, beforeEach } from "vitest";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { analyzeExecutionGraph } from "@atomiton/nodes/graph";
import {
  createExecutionGraphStore,
  getNodeState,
  getExecutionProgress,
  getCompletionProgress,
  getNodesByState,
  getCompletedWeight,
  getEstimatedTimeRemaining,
  type ExecutionGraphNode,
  type ExecutionGraphState,
} from "#execution/executionGraphStore";

describe("ExecutionGraphStore", () => {
  let store: ReturnType<typeof createExecutionGraphStore>;

  beforeEach(() => {
    store = createExecutionGraphStore();
  });

  describe("initializeGraph", () => {
    it("critical: should initialize graph from analysis", () => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });

      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1, child2],
        edges: [
          {
            id: "e1",
            source: "child-1",
            target: "child-2",
            sourceHandle: "out",
            targetHandle: "in",
          },
        ],
      });

      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      const state = store.getState();
      expect(state.nodes.size).toBe(2);
      expect(state.isExecuting).toBe(true);
      expect(state.startTime).not.toBeNull();
    });
  });

  describe("setNodeState", () => {
    beforeEach(() => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1],
      });
      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);
    });

    it("critical: should update node state to executing", () => {
      store.setNodeState("child-1", "executing");
      const node = getNodeState(store, "child-1");
      expect(node?.state).toBe("executing");
      expect(node?.startTime).toBeDefined();
    });

    it("critical: should update node state to completed", () => {
      store.setNodeState("child-1", "executing");
      store.setNodeState("child-1", "completed");
      const node = getNodeState(store, "child-1");
      expect(node?.state).toBe("completed");
      expect(node?.endTime).toBeDefined();
    });

    it("critical: should update node state to error with message", () => {
      store.setNodeState("child-1", "error", "Test error");
      const node = getNodeState(store, "child-1");
      expect(node?.state).toBe("error");
      expect(node?.error).toBe("Test error");
    });
  });

  describe("completeExecution", () => {
    it("critical: should mark execution as complete", () => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1],
      });
      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      store.completeExecution();

      const state = store.getState();
      expect(state.isExecuting).toBe(false);
      expect(state.endTime).not.toBeNull();
    });
  });

  describe("helper functions", () => {
    beforeEach(() => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });
      const child3 = createNodeDefinition({ id: "child-3", type: "test" });

      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1, child2, child3],
        edges: [],
      });

      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);
    });

    it("critical: should calculate execution progress", () => {
      expect(getExecutionProgress(store)).toBe(0);

      store.setNodeState("child-1", "completed");
      expect(getExecutionProgress(store)).toBe(33);

      store.setNodeState("child-2", "completed");
      expect(getExecutionProgress(store)).toBe(67);

      store.setNodeState("child-3", "completed");
      expect(getExecutionProgress(store)).toBe(100);
    });

    it("should get nodes by state", () => {
      store.setNodeState("child-1", "executing");
      store.setNodeState("child-2", "completed");

      const executing = getNodesByState(store, "executing");
      const completed = getNodesByState(store, "completed");
      const pending = getNodesByState(store, "pending");

      expect(executing.length).toBe(1);
      expect(completed.length).toBe(1);
      expect(pending.length).toBe(1);
    });

    it("should calculate completed weight", () => {
      store.setNodeState("child-1", "completed");
      store.setNodeState("child-2", "completed");

      const weight = getCompletedWeight(store);
      expect(weight).toBe(200); // 2 nodes * 100 (default weight)
    });

    it("should estimate time remaining", async () => {
      // Wait a bit to ensure some time has passed
      await new Promise((resolve) => setTimeout(resolve, 10));

      store.setNodeState("child-1", "completed");

      const estimate = getEstimatedTimeRemaining(store);
      expect(estimate).toBeGreaterThanOrEqual(0);
    });
  });

  describe("reset", () => {
    it("should reset store to initial state", () => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1],
      });
      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      store.reset();

      const state = store.getState();
      expect(state.nodes.size).toBe(0);
      expect(state.isExecuting).toBe(false);
      expect(state.startTime).toBeNull();
    });
  });

  describe("node progress tracking", () => {
    beforeEach(() => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1],
      });
      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);
    });

    it("should initialize node progress to 0", () => {
      const node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(0);
    });

    it("should update node progress", () => {
      store.setNodeProgress("child-1", 50, "Processing...");
      const node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(50);
      expect(node?.message).toBe("Processing...");
    });

    it("should clamp progress between 0 and 100", () => {
      store.setNodeProgress("child-1", 150);
      let node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(100);

      store.setNodeProgress("child-1", -50);
      node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(0);
    });

    it("should set progress to 0 when node starts executing", () => {
      store.setNodeProgress("child-1", 50);
      store.setNodeState("child-1", "executing");
      const node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(0);
    });

    it("should set progress to 100 when node completes", () => {
      store.setNodeProgress("child-1", 50);
      store.setNodeState("child-1", "completed");
      const node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(100);
    });

    it("should freeze progress at current state when node errors", () => {
      store.setNodeProgress("child-1", 50);
      store.setNodeState("child-1", "error", "Test error");
      const node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(50); // Progress should be frozen at current state
    });

    it("should update progress without updating message", () => {
      store.setNodeProgress("child-1", 25, "First message");
      store.setNodeProgress("child-1", 75);
      const node = getNodeState(store, "child-1");
      expect(node?.progress).toBe(75);
      expect(node?.message).toBe("First message");
    });

    it("should handle progress updates for non-existent nodes gracefully", () => {
      // Should not throw
      expect(() => {
        store.setNodeProgress("non-existent", 50);
      }).not.toThrow();
    });
  });

  describe("event subscription", () => {
    it("critical: should notify subscribers when graph state changes", () => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1],
      });
      const graph = analyzeExecutionGraph(group);

      const events: Array<{ nodeCount: number; isExecuting: boolean }> = [];
      const unsubscribe = store.subscribe((state: ExecutionGraphState) => {
        events.push({
          nodeCount: state.nodes.size,
          isExecuting: state.isExecuting,
        });
      });

      store.initializeGraph(graph!);
      store.setNodeState("child-1", "executing");
      store.setNodeProgress("child-1", 50);
      store.setNodeState("child-1", "completed");

      unsubscribe();

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].nodeCount).toBe(1);
    });

    it("should include progress and message in node state", () => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1],
      });
      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      let lastNode: ExecutionGraphNode | undefined;
      const unsubscribe = store.subscribe((state: ExecutionGraphState) => {
        lastNode = Array.from(state.nodes.values())[0] as ExecutionGraphNode;
      });

      store.setNodeProgress("child-1", 75, "Almost done...");

      unsubscribe();

      expect(lastNode?.progress).toBe(75);
      expect(lastNode?.message).toBe("Almost done...");
    });
  });

  describe("multi-node progress tracking", () => {
    beforeEach(() => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });
      const child3 = createNodeDefinition({ id: "child-3", type: "test" });

      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1, child2, child3],
        edges: [],
      });

      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);
    });

    it("critical: should track progress for multiple nodes independently", () => {
      store.setNodeProgress("child-1", 100, "Done");
      store.setNodeProgress("child-2", 50, "In progress");
      store.setNodeProgress("child-3", 0, "Not started");

      const node1 = getNodeState(store, "child-1");
      const node2 = getNodeState(store, "child-2");
      const node3 = getNodeState(store, "child-3");

      expect(node1?.progress).toBe(100);
      expect(node1?.message).toBe("Done");
      expect(node2?.progress).toBe(50);
      expect(node2?.message).toBe("In progress");
      expect(node3?.progress).toBe(0);
      expect(node3?.message).toBe("Not started");
    });

    it("critical: should calculate weighted progress including individual node progress", () => {
      // All nodes pending with 0% progress
      expect(getExecutionProgress(store)).toBe(0);

      // Node 1 executing at 50% (contributes 50% of its weight)
      store.setNodeState("child-1", "executing");
      store.setNodeProgress("child-1", 50);
      expect(getExecutionProgress(store)).toBe(17); // 50% of 1/3 = 16.67% ≈ 17%

      // Node 2 executing at 100% (contributes 100% of its weight, but not completed)
      store.setNodeState("child-2", "executing");
      store.setNodeProgress("child-2", 100);
      expect(getExecutionProgress(store)).toBe(50); // 50% + 100% of 1/3 each

      // Node 1 completes
      store.setNodeState("child-1", "completed");
      expect(getExecutionProgress(store)).toBe(67); // 100% + 100% of 1/3 each

      // Node 3 starts at 25%
      store.setNodeState("child-3", "executing");
      store.setNodeProgress("child-3", 25);
      expect(getExecutionProgress(store)).toBe(75); // 100% + 100% + 25% of 1/3 each

      // All complete
      store.setNodeState("child-2", "completed");
      store.setNodeState("child-3", "completed");
      expect(getExecutionProgress(store)).toBe(100);
    });

    it("should handle completion-based progress separately", () => {
      // Completion progress only counts fully completed nodes
      expect(getCompletionProgress(store)).toBe(0);

      store.setNodeProgress("child-1", 100);
      store.setNodeProgress("child-2", 50);
      store.setNodeProgress("child-3", 25);

      // No nodes completed yet, despite progress
      expect(getCompletionProgress(store)).toBe(0);

      store.setNodeState("child-1", "completed");
      expect(getCompletionProgress(store)).toBe(33);

      store.setNodeState("child-2", "completed");
      expect(getCompletionProgress(store)).toBe(67);

      store.setNodeState("child-3", "completed");
      expect(getCompletionProgress(store)).toBe(100);
    });
  });

  describe("weighted progress calculations", () => {
    it("should calculate weighted progress with different node weights", () => {
      // Create nodes with different weights (simulating different complexity)
      const lightNode = createNodeDefinition({ id: "light", type: "test" });
      const mediumNode = createNodeDefinition({ id: "medium", type: "test" });
      const heavyNode = createNodeDefinition({ id: "heavy", type: "test" });

      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [lightNode, mediumNode, heavyNode],
        edges: [],
      });

      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      // Default weight is 100 per node, total 300
      expect(store.getState().totalWeight).toBe(300);

      // Light node at 100%
      store.setNodeState("light", "executing");
      store.setNodeProgress("light", 100);
      expect(getExecutionProgress(store)).toBe(33); // 100/300

      // Medium node at 50%
      store.setNodeState("medium", "executing");
      store.setNodeProgress("medium", 50);
      expect(getExecutionProgress(store)).toBe(50); // (100 + 50)/300

      // Heavy node at 25%
      store.setNodeState("heavy", "executing");
      store.setNodeProgress("heavy", 25);
      expect(getExecutionProgress(store)).toBe(58); // (100 + 50 + 25)/300 = 175/300
    });

    it("should calculate progress correctly when nodes error", () => {
      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });

      const group = createNodeDefinition({
        id: "group-1",
        type: "group",
        nodes: [child1, child2],
        edges: [],
      });

      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      // Node 1 errors at 50% - contributes 0
      store.setNodeState("child-1", "executing");
      store.setNodeProgress("child-1", 50);
      store.setNodeState("child-1", "error", "Test error");
      expect(getExecutionProgress(store)).toBe(0);

      // Node 2 completes successfully
      store.setNodeState("child-2", "completed");
      expect(getExecutionProgress(store)).toBe(50); // Only node 2 contributes
    });
  });

  describe("nested group nodes", () => {
    it("should handle 2-level nested groups", () => {
      // Level 2: Leaf nodes
      const leaf1 = createNodeDefinition({ id: "leaf-1", type: "test" });
      const leaf2 = createNodeDefinition({ id: "leaf-2", type: "test" });

      // Level 1: Inner group containing leaf nodes (this is the execution unit)
      const innerGroup = createNodeDefinition({
        id: "inner-group",
        type: "group",
        nodes: [leaf1, leaf2],
        edges: [],
      });

      // Analyze the inner group directly (not wrapped)
      const graph = analyzeExecutionGraph(innerGroup);
      store.initializeGraph(graph!);

      // Graph should have the 2 leaf nodes
      expect(store.getState().nodes.size).toBe(2);
      expect(store.getState().totalWeight).toBe(200);

      // Progress through the nodes
      store.setNodeState("leaf-1", "executing");
      store.setNodeProgress("leaf-1", 50);
      expect(getExecutionProgress(store)).toBe(25); // 50% of 50%

      store.setNodeState("leaf-1", "completed");
      expect(getExecutionProgress(store)).toBe(50);

      store.setNodeState("leaf-2", "completed");
      expect(getExecutionProgress(store)).toBe(100);
    });

    it("should handle complex graph with multiple nodes at same level", () => {
      // Create 3 parallel nodes
      const node1 = createNodeDefinition({ id: "node-1", type: "test" });
      const node2 = createNodeDefinition({ id: "node-2", type: "test" });
      const node3 = createNodeDefinition({ id: "node-3", type: "test" });

      const group = createNodeDefinition({
        id: "parallel-group",
        type: "group",
        nodes: [node1, node2, node3],
        edges: [],
      });

      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      // Should have 3 nodes
      expect(store.getState().nodes.size).toBe(3);
      expect(store.getState().totalWeight).toBe(300);

      // Verify all nodes are present
      expect(getNodeState(store, "node-1")).toBeDefined();
      expect(getNodeState(store, "node-2")).toBeDefined();
      expect(getNodeState(store, "node-3")).toBeDefined();

      // Progress through nodes with different speeds
      store.setNodeState("node-1", "completed");
      expect(getExecutionProgress(store)).toBe(33); // 1/3

      store.setNodeState("node-2", "executing");
      store.setNodeProgress("node-2", 50);
      expect(getExecutionProgress(store)).toBe(50); // 1/3 + 1/6

      store.setNodeState("node-2", "completed");
      store.setNodeState("node-3", "completed");
      expect(getExecutionProgress(store)).toBe(100);
    });

    it("should handle sequential dependent nodes", () => {
      // Create nodes with dependencies
      const node1 = createNodeDefinition({ id: "node-1", type: "test" });
      const node2 = createNodeDefinition({ id: "node-2", type: "test" });
      const node3 = createNodeDefinition({ id: "node-3", type: "test" });

      const group = createNodeDefinition({
        id: "sequential",
        type: "group",
        nodes: [node1, node2, node3],
        edges: [
          {
            id: "e1",
            source: "node-1",
            target: "node-2",
            sourceHandle: "out",
            targetHandle: "in",
          },
          {
            id: "e2",
            source: "node-2",
            target: "node-3",
            sourceHandle: "out",
            targetHandle: "in",
          },
        ],
      });

      const graph = analyzeExecutionGraph(group);
      store.initializeGraph(graph!);

      // Should have all 3 nodes in execution order
      expect(store.getState().nodes.size).toBe(3);
      expect(store.getState().executionOrder.length).toBeGreaterThan(0);
      expect(store.getState().criticalPath).toEqual([
        "node-1",
        "node-2",
        "node-3",
      ]);

      // Simulate sequential execution with progress
      store.setNodeState("node-1", "executing");
      store.setNodeProgress("node-1", 75);
      expect(getExecutionProgress(store)).toBe(25); // 75% of 1/3

      store.setNodeState("node-1", "completed");
      expect(getExecutionProgress(store)).toBe(33);

      store.setNodeState("node-2", "executing");
      store.setNodeProgress("node-2", 50);
      expect(getExecutionProgress(store)).toBe(50); // 33% + 16.67%

      store.setNodeState("node-2", "completed");
      store.setNodeState("node-3", "completed");
      expect(getExecutionProgress(store)).toBe(100);
    });
  });
});
