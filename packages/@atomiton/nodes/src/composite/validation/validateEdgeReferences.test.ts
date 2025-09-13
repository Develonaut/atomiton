/**
 * Tests for validateEdgeReferences function
 *
 * This tests the validation that ensures all edges reference existing nodes
 * in the composite definition.
 */

import { describe, it, expect } from "vitest";
import { validateEdgeReferences } from "./validateEdgeReferences.js";
import type { CompositeNodeSpec } from "../types.js";
import type { CompositeEdge } from "../../base/INode.js";

describe("validateEdgeReferences", () => {
  const sampleNodes: CompositeNodeSpec[] = [
    {
      id: "node1",
      type: "test",
      position: { x: 0, y: 0 },
      data: {},
    },
    {
      id: "node2",
      type: "test",
      position: { x: 100, y: 100 },
      data: {},
    },
    {
      id: "node3",
      type: "test",
      position: { x: 200, y: 200 },
      data: {},
    },
  ];

  describe("Valid Edge References", () => {
    it("should validate empty edges array", () => {
      const result = validateEdgeReferences([], sampleNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate edges with no nodes", () => {
      const result = validateEdgeReferences([], []);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate simple valid edge", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "node2", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate multiple valid edges", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "node2", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "node2", portId: "output" },
          target: { nodeId: "node3", portId: "input" },
        },
        {
          id: "edge3",
          source: { nodeId: "node3", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate self-referencing edge", () => {
      const edges: CompositeEdge[] = [
        {
          id: "self-edge",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate edges with handles", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "node2", portId: "input" },
          data: { sourceHandle: "output", targetHandle: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate edges with data", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "node2", portId: "input" },
          data: {
            label: "connection",
            weight: 1.5,
            config: { animated: true },
          },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Invalid Source References", () => {
    it("should detect invalid source node", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "nonexistent-source", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("INVALID_SOURCE_NODE");
      expect(result.errors[0].message).toContain("nonexistent-source");
      expect(result.errors[0].path).toBe("edges[0].source");
      expect(result.errors[0].data).toEqual({
        edgeId: "edge1",
        sourceId: "nonexistent-source",
      });
    });

    it("should detect multiple invalid source nodes", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "invalid1", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "invalid2", portId: "output" },
          target: { nodeId: "node2", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.every((e) => e.code === "INVALID_SOURCE_NODE")).toBe(
        true,
      );

      const sourceIds = result.errors.map(
        (e) => (e.data as { sourceId?: string })?.sourceId,
      );
      expect(sourceIds).toContain("invalid1");
      expect(sourceIds).toContain("invalid2");
    });
  });

  describe("Invalid Target References", () => {
    it("should detect invalid target node", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "nonexistent-target", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("INVALID_TARGET_NODE");
      expect(result.errors[0].message).toContain("nonexistent-target");
      expect(result.errors[0].path).toBe("edges[0].target");
      expect(result.errors[0].data).toEqual({
        edgeId: "edge1",
        targetId: "nonexistent-target",
      });
    });

    it("should detect multiple invalid target nodes", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "invalid1", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "node2", portId: "output" },
          target: { nodeId: "invalid2", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.every((e) => e.code === "INVALID_TARGET_NODE")).toBe(
        true,
      );

      const targetIds = result.errors.map(
        (e) => (e.data as { targetId?: string })?.targetId,
      );
      expect(targetIds).toContain("invalid1");
      expect(targetIds).toContain("invalid2");
    });
  });

  describe("Combined Invalid References", () => {
    it("should detect both invalid source and target in same edge", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "invalid-source", portId: "output" },
          target: { nodeId: "invalid-target", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const codes = result.errors.map((e) => e.code);
      expect(codes).toContain("INVALID_SOURCE_NODE");
      expect(codes).toContain("INVALID_TARGET_NODE");
    });

    it("should detect mixed valid and invalid references", () => {
      const edges: CompositeEdge[] = [
        {
          id: "valid-edge",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "node2", portId: "input" },
        },
        {
          id: "invalid-source-edge",
          source: { nodeId: "invalid-source", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
        {
          id: "invalid-target-edge",
          source: { nodeId: "node2", portId: "output" },
          target: { nodeId: "invalid-target", portId: "input" },
        },
        {
          id: "another-valid-edge",
          source: { nodeId: "node3", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const codes = result.errors.map((e) => e.code);
      expect(codes).toContain("INVALID_SOURCE_NODE");
      expect(codes).toContain("INVALID_TARGET_NODE");
    });
  });

  describe("Error Information", () => {
    it("should provide correct path information", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "node2", portId: "input" },
        }, // Index 0 - valid
        {
          id: "edge2",
          source: { nodeId: "invalid", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        }, // Index 1 - invalid source
        {
          id: "edge3",
          source: { nodeId: "node2", portId: "output" },
          target: { nodeId: "invalid", portId: "input" },
        }, // Index 2 - invalid target
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain("edges[1].source");
      expect(paths).toContain("edges[2].target");
    });

    it("should include edge ID in error data", () => {
      const edges: CompositeEdge[] = [
        {
          id: "my-edge-id",
          source: { nodeId: "invalid-node", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as { edgeId?: string })?.edgeId).toBe(
        "my-edge-id",
      );
      expect((result.errors[0].data as { sourceId?: string })?.sourceId).toBe(
        "invalid-node",
      );
    });

    it("should provide meaningful error messages", () => {
      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "missing-source", portId: "output" },
          target: { nodeId: "missing-target", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, sampleNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const messages = result.errors.map((e) => e.message);
      expect(messages).toContain("Source node not found: missing-source");
      expect(messages).toContain("Target node not found: missing-target");
    });
  });

  describe("Edge Cases", () => {
    it("should handle edges referencing nodes with special characters", () => {
      const specialNodes: CompositeNodeSpec[] = [
        {
          id: "node-with-dashes",
          type: "test",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node_with_underscores",
          type: "test",
          position: { x: 10, y: 10 },
          data: {},
        },
        {
          id: "node.with.dots",
          type: "test",
          position: { x: 20, y: 20 },
          data: {},
        },
        {
          id: "node with spaces",
          type: "test",
          position: { x: 30, y: 30 },
          data: {},
        },
      ];

      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "node-with-dashes", portId: "output" },
          target: { nodeId: "node_with_underscores", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "node.with.dots", portId: "output" },
          target: { nodeId: "node with spaces", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, specialNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle nodes with Unicode characters", () => {
      const unicodeNodes: CompositeNodeSpec[] = [
        { id: "节点-1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "nœud-2", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "узел-3", type: "test", position: { x: 20, y: 20 }, data: {} },
      ];

      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "节点-1", portId: "output" },
          target: { nodeId: "nœud-2", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "nœud-2", portId: "output" },
          target: { nodeId: "узел-3", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, unicodeNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle empty string node IDs", () => {
      const nodesWithEmpty: CompositeNodeSpec[] = [
        { id: "", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "node1", type: "test", position: { x: 10, y: 10 }, data: {} },
      ];

      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "", portId: "output" },
          target: { nodeId: "node1", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "node1", portId: "output" },
          target: { nodeId: "", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, nodesWithEmpty);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle very long node IDs", () => {
      const longId = "a".repeat(1000);
      const nodesWithLongId: CompositeNodeSpec[] = [
        { id: longId, type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "short", type: "test", position: { x: 10, y: 10 }, data: {} },
      ];

      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: longId, portId: "output" },
          target: { nodeId: "short", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, nodesWithLongId);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle numeric-like node IDs", () => {
      const numericNodes: CompositeNodeSpec[] = [
        { id: "123", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "456.789", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "0", type: "test", position: { x: 20, y: 20 }, data: {} },
      ];

      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "123", portId: "output" },
          target: { nodeId: "456.789", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "456.789", portId: "output" },
          target: { nodeId: "0", portId: "input" },
        },
      ];

      const result = validateEdgeReferences(edges, numericNodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle case-sensitive node IDs", () => {
      const caseSensitiveNodes: CompositeNodeSpec[] = [
        { id: "Node", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "node", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "NODE", type: "test", position: { x: 20, y: 20 }, data: {} },
      ];

      const edges: CompositeEdge[] = [
        {
          id: "edge1",
          source: { nodeId: "Node", portId: "output" },
          target: { nodeId: "node", portId: "input" },
        },
        {
          id: "edge2",
          source: { nodeId: "node", portId: "output" },
          target: { nodeId: "invalid", portId: "input" },
        }, // Should fail
      ];

      const result = validateEdgeReferences(edges, caseSensitiveNodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as { targetId?: string })?.targetId).toBe(
        "invalid",
      );
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of nodes and edges efficiently", () => {
      const manyNodes: CompositeNodeSpec[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `node-${i}`,
          type: "test",
          position: { x: i, y: i },
          data: {},
        }),
      );

      const manyEdges: CompositeEdge[] = Array.from(
        { length: 999 },
        (_, i) => ({
          id: `edge-${i}`,
          source: { nodeId: `node-${i}`, portId: "output" },
          target: { nodeId: `node-${i + 1}`, portId: "input" },
        }),
      );

      const startTime = performance.now();
      const result = validateEdgeReferences(manyEdges, manyNodes);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should handle large numbers of invalid references efficiently", () => {
      const fewNodes: CompositeNodeSpec[] = [
        { id: "node1", type: "test", position: { x: 0, y: 0 }, data: {} },
      ];

      const manyInvalidEdges: CompositeEdge[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `edge-${i}`,
          source: {
            nodeId: i % 2 === 0 ? "node1" : `invalid-${i}`,
            portId: "output",
          },
          target: {
            nodeId: i % 3 === 0 ? "node1" : `invalid-${i}`,
            portId: "input",
          },
        }),
      );

      const startTime = performance.now();
      const result = validateEdgeReferences(manyInvalidEdges, fewNodes);
      const endTime = performance.now();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(200); // Should still be reasonably fast
    });
  });
});
