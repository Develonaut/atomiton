import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EditorEdge } from "../../hooks/useEditorEdges";
import type { EditorNode } from "../../types/EditorNode";
import {
  calculateNodePosition,
  createDefaultEditorNode,
  createEdgeFromLastNode,
  createNode,
  updateEdgesWithNewEdge,
  updateNodesWithNewNode,
} from "../nodeCreation";

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

describe("node-creation utils - basic functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateNodePosition", () => {
    it("should return explicit position when provided", () => {
      const existingNodes: EditorNode[] = [];
      const explicitPosition = { x: 200, y: 300 };

      const position = calculateNodePosition(existingNodes, explicitPosition);

      expect(position).toEqual(explicitPosition);
    });

    it("should return default position for empty nodes array", () => {
      const existingNodes: EditorNode[] = [];

      const position = calculateNodePosition(existingNodes);

      expect(position).toEqual({ x: 100, y: 100 });
    });

    it("should calculate position to the right of rightmost node", () => {
      const existingNodes: EditorNode[] = [
        { id: "1", position: { x: 100, y: 100 } } as EditorNode,
        { id: "2", position: { x: 300, y: 200 } } as EditorNode,
        { id: "3", position: { x: 200, y: 150 } } as EditorNode,
      ];

      const position = calculateNodePosition(existingNodes);

      expect(position).toEqual({ x: 500, y: 200 });
    });
  });

  describe("createNode", () => {
    it("should create a node with all required fields", () => {
      const nodeType = "test-node";
      const position = { x: 100, y: 200 };

      const node = createNode(nodeType, position);

      expect(node).toMatchObject({
        id: "generated-node-id",
        type: nodeType,
        position,
        selected: true,
        name: "Test Node",
        category: "test",
        metadata: {
          name: "Test Node",
          category: "test",
          version: "1.0.0",
          description: "A test node",
        },
        inputPorts: [],
        outputPorts: [],
        parameters: {},
        data: {},
        settings: {
          ui: {
            position,
          },
        },
      });
    });

    it("should use custom node ID when provided", () => {
      const nodeType = "test-node";
      const position = { x: 100, y: 200 };
      const customId = "custom-node-id";

      const node = createNode(nodeType, position, customId);

      expect(node.id).toBe(customId);
    });

    it("should handle unknown node type gracefully", async () => {
      const { getNodeByType } = vi.mocked(
        await import("@atomiton/nodes/browser"),
      );
      getNodeByType.mockReturnValueOnce(undefined);

      const nodeType = "unknown-node";
      const position = { x: 100, y: 200 };

      const node = createNode(nodeType, position);

      expect(node).toMatchObject({
        id: "generated-node-id",
        type: nodeType,
        name: nodeType,
        category: "unknown",
        position,
        selected: true,
      });
    });
  });

  describe("createEdgeFromLastNode", () => {
    it("should create an edge with correct properties", () => {
      const lastNodeId = "node-1";
      const targetNodeId = "node-2";

      const edge = createEdgeFromLastNode(lastNodeId, targetNodeId);

      expect(edge).toEqual({
        id: `edge-${lastNodeId}`,
        source: lastNodeId,
        target: targetNodeId,
        type: "default",
      });
    });
  });

  describe("updateNodesWithNewNode", () => {
    it("should deselect existing nodes and add new node", () => {
      const existingNodes: EditorNode[] = [
        { id: "1", selected: true } as EditorNode,
        { id: "2", selected: true } as EditorNode,
      ];
      const newNode = { id: "3", selected: true } as EditorNode;

      const updatedNodes = updateNodesWithNewNode(existingNodes, newNode);

      expect(updatedNodes).toHaveLength(3);
      expect(updatedNodes[0].selected).toBe(false);
      expect(updatedNodes[1].selected).toBe(false);
      expect(updatedNodes[2].selected).toBe(true);
      expect(updatedNodes[2].id).toBe("3");
    });

    it("should handle empty existing nodes array", () => {
      const existingNodes: EditorNode[] = [];
      const newNode = { id: "1", selected: true } as EditorNode;

      const updatedNodes = updateNodesWithNewNode(existingNodes, newNode);

      expect(updatedNodes).toHaveLength(1);
      expect(updatedNodes[0]).toBe(newNode);
    });
  });

  describe("updateEdgesWithNewEdge", () => {
    it("should add new edge to existing edges", () => {
      const existingEdges: EditorEdge[] = [
        { id: "edge-1", source: "1", target: "2", type: "default" },
        { id: "edge-2", source: "2", target: "3", type: "default" },
      ];
      const newEdge: EditorEdge = {
        id: "edge-3",
        source: "3",
        target: "4",
        type: "default",
      };

      const updatedEdges = updateEdgesWithNewEdge(existingEdges, newEdge);

      expect(updatedEdges).toHaveLength(3);
      expect(updatedEdges[2]).toBe(newEdge);
    });

    it("should handle empty existing edges array", () => {
      const existingEdges: EditorEdge[] = [];
      const newEdge: EditorEdge = {
        id: "edge-1",
        source: "1",
        target: "2",
        type: "default",
      };

      const updatedEdges = updateEdgesWithNewEdge(existingEdges, newEdge);

      expect(updatedEdges).toHaveLength(1);
      expect(updatedEdges[0]).toBe(newEdge);
    });
  });

  describe("createDefaultEditorNode", () => {
    it("should create a minimal EditorNode with all required properties", () => {
      const id = "default-node-1";
      const type = "default-type";
      const position = { x: 150, y: 250 };

      const node = createDefaultEditorNode(id, type, position);

      expect(node).toMatchObject({
        // AtomitonNode properties
        id,
        type,
        name: type,
        category: "default",
        version: "1.0.0",
        description: `Default ${type} node`,
        inputPorts: [],
        outputPorts: [],
        metadata: {},
        data: {},

        // Editor-specific properties
        position,
        selected: false,
        draggable: true,
        selectable: true,
        connectable: true,
        deletable: true,
      });
    });

    it("should handle empty string inputs", () => {
      const node = createDefaultEditorNode("", "", { x: 0, y: 0 });

      expect(node.id).toBe("");
      expect(node.type).toBe("");
      expect(node.name).toBe("");
      expect(node.description).toBe("Default  node");
    });

    it("should handle special characters in id and type", () => {
      const id = "node-with-special-chars!@#$%";
      const type = "type-with-spaces and symbols &*()";
      const position = { x: 100, y: 200 };

      const node = createDefaultEditorNode(id, type, position);

      expect(node.id).toBe(id);
      expect(node.type).toBe(type);
      expect(node.name).toBe(type);
      expect(node.description).toBe(`Default ${type} node`);
    });

    it("should handle extreme position values", () => {
      const extremePosition = { x: -999999.99, y: 999999.99 };
      const node = createDefaultEditorNode(
        "extreme",
        "extreme-type",
        extremePosition,
      );

      expect(node.position).toEqual(extremePosition);
    });

    it("should create independent objects for each call", () => {
      const node1 = createDefaultEditorNode("node1", "type1", { x: 0, y: 0 });
      const node2 = createDefaultEditorNode("node2", "type2", {
        x: 100,
        y: 100,
      });

      // Modifying one shouldn't affect the other
      node1.metadata!.customProp = "test";
      expect(node2.metadata).not.toHaveProperty("customProp");

      node1.inputPorts!.push({
        id: "test",
        name: "test",
        type: "input",
        dataType: "string",
      });
      expect(node2.inputPorts).toHaveLength(0);
    });

    it("should always create objects with proper types", () => {
      const node = createDefaultEditorNode("test", "test-type", { x: 0, y: 0 });

      expect(Array.isArray(node.inputPorts)).toBe(true);
      expect(Array.isArray(node.outputPorts)).toBe(true);
      expect(typeof node.metadata).toBe("object");
      expect(node.metadata).not.toBeNull();
      expect(typeof node.data).toBe("object");
      expect(node.data).not.toBeNull();
      expect(typeof node.position).toBe("object");
      expect(node.position).not.toBeNull();
    });

    describe("stress testing", () => {
      it("should handle rapid creation of many nodes", () => {
        const nodes: EditorNode[] = [];
        const start = performance.now();

        for (let i = 0; i < 1000; i++) {
          nodes.push(
            createDefaultEditorNode(`node-${i}`, `type-${i}`, { x: i, y: i }),
          );
        }

        const end = performance.now();

        expect(nodes).toHaveLength(1000);
        expect(end - start).toBeLessThan(100); // Should be fast

        // Verify all nodes are unique
        const ids = nodes.map((n) => n.id);
        expect(new Set(ids).size).toBe(1000);
      });

      it("should handle very long strings", () => {
        const longString = "a".repeat(10000);
        const node = createDefaultEditorNode(longString, longString, {
          x: 0,
          y: 0,
        });

        expect(node.id).toBe(longString);
        expect(node.type).toBe(longString);
        expect(node.name).toBe(longString);
      });
    });
  });
});
