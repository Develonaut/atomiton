import type { EditorEdge } from "#hooks/useEditorEdges";
import type { EditorNode } from "#types/EditorNode";
import {
  calculateNodePosition,
  createEdgeFromLastNode,
  createNode,
  updateEdgesWithNewEdge,
  updateNodesWithNewNode,
} from "#utils/index.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@atomiton/nodes/definitions", () => ({
  createNodeDefinition: vi.fn((input) => ({
    id: input.id || "generated-id",
    name: input.name || "Test Node",
    description: input.description,
    category: input.category || "utility",
    version: input.version || "1.0.0",
    inputPorts: input.inputPorts || [],
    outputPorts: input.outputPorts || [],
    metadata: input.metadata || {},
  })),
  getNodeDefinition: vi.fn(() => ({
    metadata: {
      name: "Test Node",
      category: "utility",
      version: "1.0.0",
      description: "A test node",
    },
    inputPorts: [],
    outputPorts: [],
    parameters: {
      schema: {},
      defaults: {},
    },
  })),
  // Aliases for backward compatibility
  createNode: vi.fn((input) => ({
    id: input.id || "generated-id",
    name: input.name || "Test Node",
    description: input.description,
    category: input.category || "utility",
    version: input.version || "1.0.0",
    inputPorts: input.inputPorts || [],
    outputPorts: input.outputPorts || [],
    metadata: input.metadata || {},
  })),
  getNodeByType: vi.fn(() => ({
    metadata: {
      name: "Test Node",
      category: "utility",
      version: "1.0.0",
      description: "A test node",
    },
    inputPorts: [],
    outputPorts: [],
    parameters: {
      schema: {},
      defaults: {},
    },
  })),
}));

vi.mock("@atomiton/utils", () => ({
  generateNodeId: vi.fn(() => "generated-node-id"),
  generateEdgeId: vi.fn((nodeId: string) => `edge-${nodeId}`),
}));

describe("node-creation utils - edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateNodePosition edge cases", () => {
    it("should handle nodes with negative positions", () => {
      const existingNodes: EditorNode[] = [
        { id: "1", position: { x: -100, y: -200 } } as EditorNode,
        { id: "2", position: { x: -50, y: -100 } } as EditorNode,
      ];

      const position = calculateNodePosition(existingNodes);
      expect(position).toEqual({ x: -50 + 200, y: -100 });
    });

    it("should handle nodes at same x position", () => {
      const existingNodes: EditorNode[] = [
        { id: "1", position: { x: 100, y: 50 } } as EditorNode,
        { id: "2", position: { x: 100, y: 150 } } as EditorNode,
        { id: "3", position: { x: 100, y: 100 } } as EditorNode,
      ];

      const position = calculateNodePosition(existingNodes);
      // Should use the y of the first node found at max x
      expect(position.x).toBe(300);
      expect(position.y).toBe(50);
    });

    it("should handle very large position values", () => {
      const existingNodes: EditorNode[] = [
        {
          id: "1",
          position: { x: Number.MAX_SAFE_INTEGER - 1000, y: 100 },
        } as unknown as EditorNode,
      ];

      const position = calculateNodePosition(existingNodes);
      expect(position.x).toBe(Number.MAX_SAFE_INTEGER - 1000 + 200);
    });

    it("should handle zero positions", () => {
      const existingNodes: EditorNode[] = [
        { id: "1", position: { x: 0, y: 0 } } as EditorNode,
      ];

      const position = calculateNodePosition(existingNodes);
      expect(position).toEqual({ x: 200, y: 0 });
    });

    it("should handle floating point positions", () => {
      const existingNodes: EditorNode[] = [
        { id: "1", position: { x: 100.5, y: 200.7 } } as EditorNode,
        { id: "2", position: { x: 300.9, y: 150.3 } } as EditorNode,
      ];

      const position = calculateNodePosition(existingNodes);
      expect(position).toEqual({ x: 500.9, y: 150.3 });
    });
  });

  describe("createNode edge cases", () => {
    it("should handle nodes with consistent metadata structure", () => {
      // Test that the node creation follows expected structure regardless of type
      const node = createNode("test-node", { x: 100, y: 200 });

      // All nodes should have these required properties
      expect(node.data.metadata).toBeDefined();
      expect(node.data.metadata.name).toBe("Test Node");
      expect(node.data.metadata.category).toBe("utility");
      expect(Array.isArray(node.data.inputPorts)).toBe(true);
      expect(Array.isArray(node.data.outputPorts)).toBe(true);
      expect(typeof node.data.parameters).toBe("object");
      expect(typeof node.data.fields).toBe("object");
    });

    it("should create nodes with proper data structure", () => {
      // Test that node creation produces proper data structure
      const node = createNode("test-node", { x: 50, y: 75 });

      // Should have all required properties
      expect(node.data.name).toBe("Test Node");
      expect(node.data.parameters).toEqual({ schema: {}, defaults: {} });
      expect(node.position).toEqual({ x: 50, y: 75 });
      expect(node.data.fields).toEqual({});
      expect(node.data.inputPorts).toEqual([]);
      expect(node.data.outputPorts).toEqual([]);
      expect(node.data.metadata).toBeDefined();
    });

    it("should preserve position and basic node structure", () => {
      // Test basic node creation behavior
      const node = createNode("test-node", { x: 100, y: 200 });

      // Should preserve position and have expected structure
      expect(node.position).toEqual({ x: 100, y: 200 });
      expect(node.data.parameters).toEqual({ schema: {}, defaults: {} });
      expect(node.id).toBeDefined();
      expect(node.type).toBeDefined();
      expect(typeof node.data.name).toBe("string");
    });
  });

  describe("updateNodesWithNewNode edge cases", () => {
    it("should handle nodes with partial selection state", () => {
      // Create minimal test nodes with just required properties
      const existingNodes: EditorNode[] = [
        {
          id: "1",
          type: "test",
          name: "Node 1",
          category: "utility",
          position: { x: 0, y: 0 },
          data: {},
          inputPorts: [],
          outputPorts: [],
          selected: undefined,
        } as unknown as EditorNode,
        {
          id: "2",
          type: "test",
          name: "Node 2",
          category: "utility",
          position: { x: 0, y: 0 },
          data: {},
          inputPorts: [],
          outputPorts: [],
          // No selected property
        } as unknown as EditorNode,
        { id: "3", selected: true } as unknown as EditorNode,
      ];
      const newNode = { id: "4", selected: true } as unknown as EditorNode;

      const updatedNodes = updateNodesWithNewNode(existingNodes, newNode);

      expect(updatedNodes[0].selected).toBe(false);
      expect(updatedNodes[1].selected).toBe(false);
      expect(updatedNodes[2].selected).toBe(false);
      expect(updatedNodes[3].selected).toBe(true);
    });

    it("should preserve all other node properties", () => {
      // Create a proper test node with all required properties
      const existingNodes: EditorNode[] = [
        {
          id: "1",
          selected: true,
          type: "test",
          name: "Test Node",
          position: { x: 0, y: 0 },
          data: { customProperty: "preserved" }, // Put custom props in data
          inputPorts: [],
          outputPorts: [],
          metadata: {
            id: "1",
            name: "Test Node",
            type: "template" as const,
            version: "1.0.0",
            author: "test",
            description: "Test node",
            category: "utility" as const,
            icon: "zap" as const,
          },
          parameters: {
            defaults: {},
            fields: {},
          },
        } as unknown as EditorNode,
      ];
      const newNode = { id: "2", selected: true } as unknown as EditorNode;

      const updatedNodes = updateNodesWithNewNode(existingNodes, newNode);

      expect(updatedNodes[0]).toMatchObject({
        id: "1",
        selected: false,
        type: "test",
        name: "Test Node",
        data: { customProperty: "preserved" },
        position: { x: 0, y: 0 },
      });
    });

    it("should handle large numbers of nodes efficiently", () => {
      const existingNodes: EditorNode[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `node-${i}`,
          selected: true,
          position: { x: i, y: i },
        }),
      ) as EditorNode[];
      const newNode = { id: "new-node", selected: true } as EditorNode;

      const start = performance.now();
      const updatedNodes = updateNodesWithNewNode(existingNodes, newNode);
      const end = performance.now();

      expect(updatedNodes).toHaveLength(1001);
      expect(
        updatedNodes.slice(0, 1000).every((node: EditorNode) => !node.selected),
      ).toBe(true);
      expect(updatedNodes[1000].selected).toBe(true);
      expect(end - start).toBeLessThan(50); // Should be fast
    });
  });

  describe("updateEdgesWithNewEdge edge cases", () => {
    it("should preserve edge object references", () => {
      const existingEdge = {
        id: "edge-1",
        source: "1",
        target: "2",
        type: "default",
      };
      const existingEdges = [existingEdge];
      const newEdge = {
        id: "edge-2",
        source: "2",
        target: "3",
        type: "default",
      };

      const updatedEdges = updateEdgesWithNewEdge(existingEdges, newEdge);

      expect(updatedEdges[0]).toBe(existingEdge); // Same reference
      expect(updatedEdges[1]).toBe(newEdge); // Same reference
    });

    it("should handle edges with additional properties", () => {
      const existingEdge: EditorEdge = {
        id: "edge-1",
        source: "1",
        target: "2",
        type: "custom",
        animated: true,
        style: { stroke: "red" },
        data: { weight: 5 },
      };

      const newEdge: EditorEdge = {
        id: "edge-2",
        source: "2",
        target: "3",
        type: "default",
      };

      const updatedEdges = updateEdgesWithNewEdge([existingEdge], newEdge);

      expect(updatedEdges[0]).toMatchObject({
        id: "edge-1",
        animated: true,
        style: { stroke: "red" },
        data: { weight: 5 },
      });
    });
  });

  describe("createEdgeFromLastNode edge cases", () => {
    it("should handle nodes with special characters in IDs", () => {
      const lastNodeId = "node-with-special!@#$%^&*()";
      const targetNodeId = "target-with-spaces and symbols";

      const edge = createEdgeFromLastNode(lastNodeId, targetNodeId);

      expect(edge.source).toBe(lastNodeId);
      expect(edge.target).toBe(targetNodeId);
      expect(edge.id).toBe(`edge-${lastNodeId}`);
    });

    it("should handle empty string node IDs", () => {
      const edge = createEdgeFromLastNode("", "");

      expect(edge.source).toBe("");
      expect(edge.target).toBe("");
      expect(edge.id).toBe("edge-");
      expect(edge.type).toBe("default");
    });

    it("should create unique edge IDs based on source", () => {
      const edges = [];
      for (let i = 0; i < 100; i++) {
        edges.push(createEdgeFromLastNode(`node-${i}`, `target-${i}`));
      }

      const edgeIds = edges.map((e) => e.id);
      expect(new Set(edgeIds).size).toBe(100); // All unique
    });
  });
});
