import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EditorEdge } from "#hooks/useEditorEdges";
import type { EditorNode } from "#types/EditorNode";
import {
  calculateNodePosition,
  createEdgeFromLastNode,
  createNode,
  updateEdgesWithNewEdge,
  updateNodesWithNewNode,
} from "#utils/nodeCreation";

vi.mock("@atomiton/nodes/browser", () => ({
  createNode: vi.fn((input) => ({
    id: input.id || "generated-id",
    type: "atomic",
    name: input.name || "Test Node",
    description: input.description,
    category: input.category || "test",
    version: input.version || "1.0.0",
    inputPorts: input.inputPorts || [],
    outputPorts: input.outputPorts || [],
    metadata: input.metadata || {},
  })),
  getNodeByType: vi.fn(() => ({
    metadata: {
      name: "Test Node",
      category: "test",
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
        } as EditorNode,
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
    it("should handle nodes with complex metadata", async () => {
      const { getNodeByType } = vi.mocked(
        await import("@atomiton/nodes/browser")
      );
      getNodeByType.mockReturnValueOnce({
        metadata: {
          name: "Complex Node",
          category: "complex",
          version: "2.0.0",
          description: "A complex test node",
          author: "Test Author",
          tags: ["complex", "test"],
          documentation: "https://example.com/docs",
          customProperty: { nested: { value: "test" } },
        },
        inputPorts: [
          { id: "in1", name: "Input 1", type: "string", required: true },
          { id: "in2", name: "Input 2", type: "number", required: false },
        ],
        outputPorts: [{ id: "out1", name: "Output 1", type: "any" }],
        parameters: {
          schema: { type: "object" },
          defaults: { param1: "default", param2: 42 },
        },
      });

      const node = createNode("complex-node", { x: 100, y: 200 });

      expect(node.metadata).toMatchObject({
        name: "Complex Node",
        category: "complex",
        author: "Test Author",
        tags: ["complex", "test"],
        customProperty: { nested: { value: "test" } },
      });
      expect(node.inputPorts).toHaveLength(2);
      expect(node.outputPorts).toHaveLength(1);
      expect(node.parameters).toEqual({ param1: "default", param2: 42 });
      expect(node.data).toEqual({ param1: "default", param2: 42 });
    });

    it("should handle createAtomitonNode returning minimal data", async () => {
      const { createNode: mockCreateNode } = vi.mocked(
        await import("@atomiton/nodes/browser")
      );
      mockCreateNode.mockReturnValueOnce({
        id: "minimal-id",
        type: "atomic",
        name: "Minimal",
        category: "test",
        version: "1.0.0",
        inputPorts: [],
        outputPorts: [],
        metadata: {},
      });

      const node = createNode("test-node", { x: 50, y: 75 });

      expect(node.data).toEqual({});
      expect(node.parameters).toEqual({});
      expect(node.settings?.ui?.position).toEqual({ x: 50, y: 75 });
    });

    it("should override data with parameter defaults when available", async () => {
      const { createNode: mockCreateNode, getNodeByType } = vi.mocked(
        await import("@atomiton/nodes/browser")
      );
      mockCreateNode.mockReturnValueOnce({
        id: "test-id",
        type: "atomic",
        name: "Test",
        category: "test",
        version: "1.0.0",
        inputPorts: [],
        outputPorts: [],
        metadata: {},
        data: { existing: "data" },
        parameters: { existing: "params" },
        settings: { existingSetting: true },
      });

      getNodeByType.mockReturnValueOnce({
        metadata: {
          name: "Test Node",
          category: "test",
          version: "1.0.0",
        },
        inputPorts: [],
        outputPorts: [],
        parameters: {
          defaults: { param1: "default", param2: 42 },
        },
      });

      const node = createNode("test-node", { x: 100, y: 200 });

      // The createNode function overrides data and parameters with defaults
      expect(node.data).toEqual({ param1: "default", param2: 42 });
      expect(node.parameters).toEqual({ param1: "default", param2: 42 });
      expect(node.settings).toMatchObject({
        existingSetting: true,
        ui: { position: { x: 100, y: 200 } },
      });
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
          category: "test",
          position: { x: 0, y: 0 },
          data: {},
          inputPorts: [],
          outputPorts: [],
          selected: undefined,
        } as EditorNode,
        {
          id: "2",
          type: "test",
          name: "Node 2",
          category: "test",
          position: { x: 0, y: 0 },
          data: {},
          inputPorts: [],
          outputPorts: [],
          // No selected property
        } as EditorNode,
        { id: "3", selected: true } as EditorNode,
      ];
      const newNode = { id: "4", selected: true } as EditorNode;

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
          category: "test",
          position: { x: 0, y: 0 },
          data: { customProperty: "preserved" }, // Put custom props in data
          inputPorts: [],
          outputPorts: [],
        },
      ];
      const newNode = { id: "2", selected: true } as EditorNode;

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
        })
      ) as EditorNode[];
      const newNode = { id: "new-node", selected: true } as EditorNode;

      const start = performance.now();
      const updatedNodes = updateNodesWithNewNode(existingNodes, newNode);
      const end = performance.now();

      expect(updatedNodes).toHaveLength(1001);
      expect(
        updatedNodes.slice(0, 1000).every((node: EditorNode) => !node.selected)
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
