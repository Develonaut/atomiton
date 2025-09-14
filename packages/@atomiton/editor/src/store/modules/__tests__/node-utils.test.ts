/**
 * Unit tests for node-utils.ts
 *
 * Tests all pure utility functions for node operations
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { Node, Edge } from "@xyflow/react";
import {
  generateNodeId,
  calculateNodePosition,
  createNode,
  updateNodeSelection,
  createAutoConnection,
  prepareNodeAddition,
  type NodeCreationOptions,
} from "../node-utils";

describe("node-utils", () => {
  describe("generateNodeId", () => {
    it("should generate a unique ID with node- prefix", async () => {
      const id1 = generateNodeId();
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1));
      const id2 = generateNodeId();

      expect(id1).toMatch(/^node-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^node-\d+-[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it("should generate timestamp-based IDs", () => {
      const before = Date.now();
      const id = generateNodeId();
      const after = Date.now();

      const timestampPart = id.split("-")[1];
      const timestamp = parseInt(timestampPart);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("calculateNodePosition", () => {
    it("should return fallback position when no existing nodes", () => {
      const position = calculateNodePosition([]);
      expect(position).toEqual({ x: 100, y: 100 });
    });

    it("should use custom fallback position", () => {
      const customFallback = { x: 50, y: 75 };
      const position = calculateNodePosition([], customFallback);
      expect(position).toEqual(customFallback);
    });

    it("should calculate position relative to rightmost node", () => {
      const existingNodes: Node[] = [
        { id: "1", type: "test", position: { x: 100, y: 200 }, data: {} },
        { id: "2", type: "test", position: { x: 300, y: 150 }, data: {} },
        { id: "3", type: "test", position: { x: 200, y: 250 }, data: {} },
      ];

      const position = calculateNodePosition(existingNodes);
      expect(position).toEqual({ x: 500, y: 150 }); // 300 + 200, keep y from rightmost
    });

    it("should handle nodes with negative positions", () => {
      const existingNodes: Node[] = [
        { id: "1", type: "test", position: { x: -100, y: 100 }, data: {} },
        { id: "2", type: "test", position: { x: 50, y: 200 }, data: {} },
      ];

      const position = calculateNodePosition(existingNodes);
      expect(position).toEqual({ x: 250, y: 200 }); // 50 + 200
    });
  });

  describe("createNode", () => {
    it("should create a node with provided options", () => {
      const options: NodeCreationOptions = {
        nodeType: "test-node",
        position: { x: 150, y: 250 },
        selected: false,
      };

      const node = createNode(options, []);

      expect(node.type).toBe("test-node");
      expect(node.position).toEqual({ x: 150, y: 250 });
      expect(node.selected).toBe(false);
      expect(node.data).toEqual({});
      expect(node.id).toMatch(/^node-\d+-[a-z0-9]+$/);
    });

    it("should default selected to true when not specified", () => {
      const options: NodeCreationOptions = {
        nodeType: "test-node",
      };

      const node = createNode(options, []);
      expect(node.selected).toBe(true);
    });

    it("should calculate position when not provided", () => {
      const existingNodes: Node[] = [
        { id: "1", type: "test", position: { x: 100, y: 200 }, data: {} },
      ];
      const options: NodeCreationOptions = {
        nodeType: "test-node",
      };

      const node = createNode(options, existingNodes);
      expect(node.position).toEqual({ x: 300, y: 200 });
    });
  });

  describe("updateNodeSelection", () => {
    let testNodes: Node[];

    beforeEach(() => {
      testNodes = [
        {
          id: "1",
          type: "test",
          position: { x: 0, y: 0 },
          data: {},
          selected: true,
        },
        {
          id: "2",
          type: "test",
          position: { x: 100, y: 0 },
          data: {},
          selected: false,
        },
        {
          id: "3",
          type: "test",
          position: { x: 200, y: 0 },
          data: {},
          selected: true,
        },
      ];
    });

    it("should select only the specified node", () => {
      const updatedNodes = updateNodeSelection(testNodes, "2");

      expect(updatedNodes[0].selected).toBe(false); // node 1
      expect(updatedNodes[1].selected).toBe(true); // node 2
      expect(updatedNodes[2].selected).toBe(false); // node 3
    });

    it("should deselect all nodes when selectedNodeId not found", () => {
      const updatedNodes = updateNodeSelection(testNodes, "nonexistent");

      expect(updatedNodes.every((node) => !node.selected)).toBe(true);
    });

    it("should not mutate original nodes array", () => {
      const originalNode = testNodes[0];
      const updatedNodes = updateNodeSelection(testNodes, "2");

      expect(testNodes[0]).toBe(originalNode); // same reference
      expect(updatedNodes[0]).not.toBe(originalNode); // different reference
    });
  });

  describe("createAutoConnection", () => {
    it("should return null when no existing nodes", () => {
      const edge = createAutoConnection([], "new-node");
      expect(edge).toBeNull();
    });

    it("should create edge from last node to new node", () => {
      const existingNodes: Node[] = [
        { id: "1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "2", type: "test", position: { x: 100, y: 0 }, data: {} },
      ];

      const edge = createAutoConnection(existingNodes, "new-node");

      expect(edge).toEqual({
        id: "edge-2-new-node",
        source: "2",
        target: "new-node",
        type: "default",
      });
    });

    it("should handle single existing node", () => {
      const existingNodes: Node[] = [
        { id: "only-node", type: "test", position: { x: 0, y: 0 }, data: {} },
      ];

      const edge = createAutoConnection(existingNodes, "new-node");

      expect(edge).toEqual({
        id: "edge-only-node-new-node",
        source: "only-node",
        target: "new-node",
        type: "default",
      });
    });
  });

  describe("prepareNodeAddition", () => {
    let existingNodes: Node[];
    let existingEdges: Edge[];

    beforeEach(() => {
      existingNodes = [
        {
          id: "1",
          type: "test",
          position: { x: 0, y: 0 },
          data: {},
          selected: true,
        },
        {
          id: "2",
          type: "test",
          position: { x: 100, y: 0 },
          data: {},
          selected: false,
        },
      ];
      existingEdges = [
        { id: "edge-1-2", source: "1", target: "2", type: "default" },
      ];
    });

    it("should prepare complete node addition with all updates", () => {
      const options: NodeCreationOptions = {
        nodeType: "new-type",
        position: { x: 300, y: 100 },
      };

      const result = prepareNodeAddition(options, existingNodes, existingEdges);

      // Check new node
      expect(result.newNode.type).toBe("new-type");
      expect(result.newNode.position).toEqual({ x: 300, y: 100 });
      expect(result.newNode.selected).toBe(true);

      // Check updated nodes (existing nodes deselected, new node added)
      expect(result.updatedNodes).toHaveLength(3);
      expect(result.updatedNodes[0].selected).toBe(false); // node 1
      expect(result.updatedNodes[1].selected).toBe(false); // node 2
      expect(result.updatedNodes[2].selected).toBe(true); // new node
      expect(result.updatedNodes[2]).toBe(result.newNode);

      // Check auto-connection added
      expect(result.updatedEdges).toHaveLength(2);
      expect(result.updatedEdges[0]).toBe(existingEdges[0]); // original edge preserved
      expect(result.updatedEdges[1]).toEqual({
        id: `edge-2-${result.newNode.id}`,
        source: "2",
        target: result.newNode.id,
        type: "default",
      });
    });

    it("should handle first node (no auto-connection)", () => {
      const options: NodeCreationOptions = {
        nodeType: "first-node",
      };

      const result = prepareNodeAddition(options, [], []);

      expect(result.updatedNodes).toHaveLength(1);
      expect(result.updatedNodes[0]).toBe(result.newNode);
      expect(result.updatedEdges).toHaveLength(0); // no auto-connection
    });

    it("should calculate position when not provided", () => {
      const options: NodeCreationOptions = {
        nodeType: "auto-positioned",
      };

      const result = prepareNodeAddition(options, existingNodes, existingEdges);

      expect(result.newNode.position).toEqual({ x: 300, y: 0 }); // 100 + 200
    });

    it("should preserve existing edge references", () => {
      const options: NodeCreationOptions = {
        nodeType: "new-type",
      };

      const result = prepareNodeAddition(options, existingNodes, existingEdges);

      expect(result.updatedEdges[0]).toBe(existingEdges[0]); // same reference
    });
  });
});
