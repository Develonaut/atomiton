import { describe, it, expect } from "vitest";
import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import {
  analyzeExecutionGraph,
  topologicalSort,
  findCriticalPath,
  findParallelBranches,
} from "#graph/graphAnalyzer";

describe("Graph Analyzer", () => {
  describe("topologicalSort", () => {
    it("should sort nodes in dependency order", () => {
      const node1 = createNodeDefinition({ id: "node-1", type: "test" });
      const node2 = createNodeDefinition({ id: "node-2", type: "test" });
      const node3 = createNodeDefinition({ id: "node-3", type: "test" });

      const edges = [
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
      ];

      const result = topologicalSort([node1, node2, node3], edges);

      expect(result).toEqual([["node-1"], ["node-2"], ["node-3"]]);
    });

    it("should detect parallel execution opportunities", () => {
      const node1 = createNodeDefinition({ id: "node-1", type: "test" });
      const node2 = createNodeDefinition({ id: "node-2", type: "test" });
      const node3 = createNodeDefinition({ id: "node-3", type: "test" });

      const edges = [
        {
          id: "e1",
          source: "node-1",
          target: "node-2",
          sourceHandle: "out",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "node-1",
          target: "node-3",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];

      const result = topologicalSort([node1, node2, node3], edges);

      expect(result).toEqual([["node-1"], ["node-2", "node-3"]]);
    });

    it("should throw error on cycle detection", () => {
      const node1 = createNodeDefinition({ id: "node-1", type: "test" });
      const node2 = createNodeDefinition({ id: "node-2", type: "test" });

      const edges = [
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
          target: "node-1",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ];

      expect(() => topologicalSort([node1, node2], edges)).toThrow(
        "Cycle detected",
      );
    });
  });

  describe("findParallelBranches", () => {
    it("should return max parallelism level", () => {
      const executionOrder = [
        ["node-1"],
        ["node-2", "node-3", "node-4"],
        ["node-5"],
      ];
      expect(findParallelBranches(executionOrder)).toBe(3);
    });

    it("should handle sequential execution", () => {
      const executionOrder = [["node-1"], ["node-2"], ["node-3"]];
      expect(findParallelBranches(executionOrder)).toBe(1);
    });
  });

  describe("findCriticalPath", () => {
    it("should find longest path through graph", () => {
      const node1 = createNodeDefinition({ id: "node-1", type: "httpRequest" });
      const node2 = createNodeDefinition({ id: "node-2", type: "transform" });
      const node3 = createNodeDefinition({ id: "node-3", type: "httpRequest" });

      const edges = [
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
      ];

      const result = findCriticalPath([node1, node2, node3], edges);

      expect(result.path).toEqual(["node-1", "node-2", "node-3"]);
      expect(result.weight).toBe(1050); // 500 + 50 + 500
    });
  });

  describe("analyzeExecutionGraph", () => {
    it("should handle single nodes as 1-node graphs", () => {
      const node = createNodeDefinition({ id: "node-1", type: "test" });
      const result = analyzeExecutionGraph(node);

      expect(result).not.toBeNull();
      expect(result?.nodes.size).toBe(1);
      expect(result?.executionOrder).toEqual([["node-1"]]);
      expect(result?.maxParallelism).toBe(1);
      expect(result?.criticalPath).toEqual(["node-1"]);
    });

    it("should analyze group node graph", () => {
      const child1 = createNodeDefinition({
        id: "child-1",
        type: "httpRequest",
      });
      const child2 = createNodeDefinition({ id: "child-2", type: "transform" });

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

      const result = analyzeExecutionGraph(group);

      expect(result).not.toBeNull();
      expect(result!.nodes.size).toBe(2);
      expect(result!.executionOrder).toEqual([["child-1"], ["child-2"]]);
      expect(result!.criticalPath).toEqual(["child-1", "child-2"]);
      expect(result!.maxParallelism).toBe(1);
      expect(result!.totalWeight).toBe(550); // 500 + 50
    });
  });
});
