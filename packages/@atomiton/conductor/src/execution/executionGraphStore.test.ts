import { describe, it, expect, beforeEach } from "vitest";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { analyzeExecutionGraph } from "@atomiton/nodes/graph";
import {
  createExecutionGraphStore,
  getNodeState,
  getExecutionProgress,
  getNodesByState,
  getCompletedWeight,
  getEstimatedTimeRemaining,
} from "#execution/executionGraphStore";

describe("ExecutionGraphStore", () => {
  let store: ReturnType<typeof createExecutionGraphStore>;

  beforeEach(() => {
    store = createExecutionGraphStore();
  });

  describe("initializeGraph", () => {
    it("should initialize graph from analysis", () => {
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

    it("should update node state to executing", () => {
      store.setNodeState("child-1", "executing");
      const node = getNodeState(store, "child-1");
      expect(node?.state).toBe("executing");
      expect(node?.startTime).toBeDefined();
    });

    it("should update node state to completed", () => {
      store.setNodeState("child-1", "executing");
      store.setNodeState("child-1", "completed");
      const node = getNodeState(store, "child-1");
      expect(node?.state).toBe("completed");
      expect(node?.endTime).toBeDefined();
    });

    it("should update node state to error with message", () => {
      store.setNodeState("child-1", "error", "Test error");
      const node = getNodeState(store, "child-1");
      expect(node?.state).toBe("error");
      expect(node?.error).toBe("Test error");
    });
  });

  describe("completeExecution", () => {
    it("should mark execution as complete", () => {
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

    it("should calculate execution progress", () => {
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
});
