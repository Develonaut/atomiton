/**
 * Tests for validateNodeUniqueness function
 *
 * This tests the validation of node ID uniqueness within a composite.
 * Each node must have a unique ID for proper graph operations.
 */

import { describe, it, expect } from "vitest";
import { validateNodeUniqueness } from "./validateNodeUniqueness";
import type { CompositeNodeSpec } from "../types";

describe("validateNodeUniqueness", () => {
  describe("Valid Node Arrays", () => {
    it("should validate empty node array", () => {
      const result = validateNodeUniqueness([]);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate single node", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "single-node",
          type: "test",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate multiple unique nodes", () => {
      const nodes: CompositeNodeSpec[] = [
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

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate many unique nodes", () => {
      const nodes: CompositeNodeSpec[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `node-${i}`,
          type: "test",
          position: { x: i * 10, y: i * 10 },
          data: {},
        }),
      );

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Duplicate Node IDs", () => {
    it("should detect simple duplicate", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "duplicate",
          type: "test",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "duplicate",
          type: "test",
          position: { x: 100, y: 100 },
          data: {},
        },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("DUPLICATE_NODE_ID");
      expect(result.errors[0].message).toContain("duplicate");
      expect(result.errors[0].path).toBe("nodes[1].id");
      expect(result.errors[0].data).toEqual({ nodeId: "duplicate", index: 1 });
    });

    it("should detect multiple duplicates", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "dup1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "unique1", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "dup1", type: "test", position: { x: 20, y: 20 }, data: {} }, // First duplicate
        { id: "dup2", type: "test", position: { x: 30, y: 30 }, data: {} },
        { id: "dup2", type: "test", position: { x: 40, y: 40 }, data: {} }, // Second duplicate
        { id: "unique2", type: "test", position: { x: 50, y: 50 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const errorNodeIds = result.errors.map((e) => (e.data as any)?.nodeId);
      expect(errorNodeIds).toContain("dup1");
      expect(errorNodeIds).toContain("dup2");

      const errorIndices = result.errors.map((e) => (e.data as any)?.index);
      expect(errorIndices).toContain(2); // First duplicate at index 2
      expect(errorIndices).toContain(4); // Second duplicate at index 4
    });

    it("should detect triple duplicates", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "triple", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "triple", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "triple", type: "test", position: { x: 20, y: 20 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2); // Second and third occurrences are errors
      expect((result.errors[0].data as any)?.index).toBe(1);
      expect((result.errors[1].data as any)?.index).toBe(2);
    });

    it("should handle mixed unique and duplicate IDs", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "unique1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "unique2", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "duplicate", type: "test", position: { x: 20, y: 20 }, data: {} },
        { id: "unique3", type: "test", position: { x: 30, y: 30 }, data: {} },
        { id: "duplicate", type: "test", position: { x: 40, y: 40 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      const errorData = result.errors[0].data as {
        nodeId: string;
        index: number;
      };
      expect(errorData?.nodeId).toBe("duplicate");
      expect(errorData?.index).toBe(4);
    });
  });

  describe("Error Information", () => {
    it("should provide detailed error information", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "test-id", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "test-id", type: "test", position: { x: 100, y: 100 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);

      const error = result.errors[0];
      expect(error.path).toBe("nodes[1].id");
      expect(error.message).toBe("Duplicate node ID: test-id");
      expect(error.code).toBe("DUPLICATE_NODE_ID");
      expect(error.data).toEqual({ nodeId: "test-id", index: 1 });
    });

    it("should include correct path for each duplicate", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "a", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "b", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "a", type: "test", position: { x: 20, y: 20 }, data: {} }, // Index 2
        { id: "c", type: "test", position: { x: 30, y: 30 }, data: {} },
        { id: "b", type: "test", position: { x: 40, y: 40 }, data: {} }, // Index 4
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain("nodes[2].id");
      expect(paths).toContain("nodes[4].id");
    });
  });

  describe("Edge Cases", () => {
    it("should handle nodes with different types but same IDs", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "same-id", type: "type1", position: { x: 0, y: 0 }, data: {} },
        {
          id: "same-id",
          type: "type2",
          position: { x: 100, y: 100 },
          data: {},
        },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeId).toBe("same-id");
    });

    it("should handle nodes with different data but same IDs", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "same-id",
          type: "test",
          position: { x: 0, y: 0 },
          data: { config: "value1" },
        },
        {
          id: "same-id",
          type: "test",
          position: { x: 100, y: 100 },
          data: { config: "value2" },
        },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle special characters in node IDs", () => {
      const nodes: CompositeNodeSpec[] = [
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
        {
          id: "node-with-dashes",
          type: "test",
          position: { x: 40, y: 40 },
          data: {},
        },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeId).toBe("node-with-dashes");
    });

    it("should handle Unicode characters in node IDs", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "节点-1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "nœud-2", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "узел-3", type: "test", position: { x: 20, y: 20 }, data: {} },
        { id: "节点-1", type: "test", position: { x: 30, y: 30 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeId).toBe("节点-1");
    });

    it("should handle empty string node IDs", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "", type: "test", position: { x: 10, y: 10 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeId).toBe("");
    });

    it("should handle very long node IDs", () => {
      const longId = "a".repeat(1000);
      const nodes: CompositeNodeSpec[] = [
        { id: longId, type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: longId, type: "test", position: { x: 10, y: 10 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeId).toBe(longId);
    });

    it("should handle numeric-like node IDs", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "123", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "123.456", type: "test", position: { x: 10, y: 10 }, data: {} },
        { id: "123", type: "test", position: { x: 20, y: 20 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeId).toBe("123");
    });
  });

  describe("Performance", () => {
    it("should handle large arrays efficiently", () => {
      const nodes: CompositeNodeSpec[] = Array.from(
        { length: 10000 },
        (_, i) => ({
          id: `node-${i}`,
          type: "test",
          position: { x: i, y: i },
          data: {},
        }),
      );

      const startTime = performance.now();
      const result = validateNodeUniqueness(nodes);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should handle large arrays with duplicates efficiently", () => {
      const nodes: CompositeNodeSpec[] = [
        ...Array.from({ length: 5000 }, (_, i) => ({
          id: `unique-${i}`,
          type: "test",
          position: { x: i, y: i },
          data: {},
        })),
        { id: "duplicate", type: "test", position: { x: 0, y: 0 }, data: {} },
        ...Array.from({ length: 5000 }, (_, i) => ({
          id: `unique-${i + 5000}`,
          type: "test",
          position: { x: i, y: i },
          data: {},
        })),
        {
          id: "duplicate",
          type: "test",
          position: { x: 100, y: 100 },
          data: {},
        },
      ];

      const startTime = performance.now();
      const result = validateNodeUniqueness(nodes);
      const endTime = performance.now();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeId).toBe("duplicate");
      expect(endTime - startTime).toBeLessThan(100); // Should still be fast
    });
  });
});
