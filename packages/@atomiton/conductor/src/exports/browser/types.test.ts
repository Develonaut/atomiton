import { describe, it, expect } from "vitest";
import type { NodeProgressEvent } from "#exports/browser/types.js";

describe.concurrent("Browser Export Types", () => {
  describe.concurrent("NodeProgressEvent", () => {
    it.concurrent("should have required basic properties", () => {
      const event: NodeProgressEvent = {
        nodeId: "test-node",
        executionId: "exec-123",
        progress: 50,
        message: "Processing...",
        nodes: [],
        graph: {
          executionOrder: [],
          criticalPath: [],
          totalWeight: 0,
          maxParallelism: 1,
          edges: [],
        },
      };

      expect(event.nodeId).toBe("test-node");
      expect(event.executionId).toBe("exec-123");
      expect(event.progress).toBe(50);
      expect(event.message).toBe("Processing...");
    });

    it.concurrent("should include nodes array for graph tracking", () => {
      const event: NodeProgressEvent = {
        nodeId: "test-node",
        executionId: "exec-123",
        progress: 50,
        message: "Processing...",
        nodes: [
          {
            id: "child-1",
            name: "Child Node 1",
            type: "test",
            weight: 100,
            dependencies: [],
            dependents: ["child-2"],
            level: 0,
            state: "completed",
            startTime: Date.now(),
            endTime: Date.now(),
          },
          {
            id: "child-2",
            name: "Child Node 2",
            type: "test",
            weight: 100,
            dependencies: ["child-1"],
            dependents: [],
            level: 1,
            state: "executing",
            startTime: Date.now(),
          },
        ],
        graph: {
          executionOrder: [["child-1"], ["child-2"]],
          criticalPath: ["child-1", "child-2"],
          totalWeight: 200,
          maxParallelism: 1,
          edges: [{ from: "child-1", to: "child-2" }],
        },
      };

      expect(event.nodes).toHaveLength(2);
      expect(event.nodes[0].state).toBe("completed");
      expect(event.nodes[1].state).toBe("executing");
    });

    it.concurrent("should include graph structure information", () => {
      const event: NodeProgressEvent = {
        nodeId: "test-node",
        executionId: "exec-123",
        progress: 50,
        message: "Processing...",
        nodes: [],
        graph: {
          executionOrder: [["node-1", "node-2"], ["node-3"]],
          criticalPath: ["node-1", "node-3"],
          totalWeight: 300,
          maxParallelism: 2,
          edges: [
            { from: "node-1", to: "node-3" },
            { from: "node-2", to: "node-3" },
          ],
        },
      };

      expect(event.graph.executionOrder).toHaveLength(2);
      expect(event.graph.criticalPath).toContain("node-1");
      expect(event.graph.totalWeight).toBe(300);
      expect(event.graph.maxParallelism).toBe(2);
      expect(event.graph.edges).toHaveLength(2);
    });

    it.concurrent("should support atomic node with trivial graph", () => {
      // For atomic nodes, graph is trivial (single node, no dependencies)
      const event: NodeProgressEvent = {
        nodeId: "atomic-node",
        executionId: "exec-456",
        progress: 100,
        message: "Completed",
        nodes: [
          {
            id: "atomic-node",
            name: "Atomic Node",
            type: "test",
            weight: 100,
            dependencies: [],
            dependents: [],
            level: 0,
            state: "completed",
            startTime: Date.now() - 1000,
            endTime: Date.now(),
          },
        ],
        graph: {
          executionOrder: [["atomic-node"]],
          criticalPath: ["atomic-node"],
          totalWeight: 100,
          maxParallelism: 1,
          edges: [],
        },
      };

      expect(event.nodes).toHaveLength(1);
      expect(event.graph.executionOrder).toEqual([["atomic-node"]]);
      expect(event.graph.edges).toHaveLength(0);
    });

    it.concurrent("should support node error state", () => {
      const event: NodeProgressEvent = {
        nodeId: "test-node",
        executionId: "exec-789",
        progress: 50,
        message: "Error occurred",
        nodes: [
          {
            id: "failed-node",
            name: "Failed Node",
            type: "test",
            weight: 100,
            dependencies: [],
            dependents: [],
            level: 0,
            state: "error",
            startTime: Date.now(),
            error: "Network timeout",
          },
        ],
        graph: {
          executionOrder: [["failed-node"]],
          criticalPath: ["failed-node"],
          totalWeight: 100,
          maxParallelism: 1,
          edges: [],
        },
      };

      expect(event.nodes[0].state).toBe("error");
      expect(event.nodes[0].error).toBe("Network timeout");
    });

    it.concurrent("should support progressive disclosure pattern", () => {
      // Simple use case: just progress and message
      const simpleEvent: NodeProgressEvent = {
        nodeId: "node",
        executionId: "exec",
        progress: 75,
        message: "Almost done...",
        nodes: [],
        graph: {
          executionOrder: [],
          criticalPath: [],
          totalWeight: 0,
          maxParallelism: 1,
          edges: [],
        },
      };

      // Consumer can use just basic properties
      expect(simpleEvent.progress).toBe(75);
      expect(simpleEvent.message).toBe("Almost done...");

      // Advanced use case: full graph details
      const advancedEvent: NodeProgressEvent = {
        nodeId: "node",
        executionId: "exec",
        progress: 75,
        message: "Almost done...",
        nodes: [
          {
            id: "n1",
            name: "Node 1",
            type: "test",
            weight: 100,
            dependencies: [],
            dependents: [],
            level: 0,
            state: "completed",
          },
        ],
        graph: {
          executionOrder: [["n1"]],
          criticalPath: ["n1"],
          totalWeight: 100,
          maxParallelism: 1,
          edges: [],
        },
      };

      // Consumer can also access detailed graph information
      expect(advancedEvent.nodes).toHaveLength(1);
      expect(advancedEvent.graph.totalWeight).toBe(100);
    });
  });
});
