/**
 * Tests for validateNodeTypes function
 *
 * This tests the validation that ensures all node types in a composite
 * are available/registered in the system.
 */

import { describe, it, expect } from "vitest";
import { validateNodeTypes } from "./validateNodeTypes";
import type { CompositeNodeSpec } from "../types";

describe("validateNodeTypes", () => {
  const availableTypes = [
    "http-request",
    "data-transform",
    "file-reader",
    "condition",
    "timer",
  ];

  describe("Valid Node Types", () => {
    it("should validate empty nodes array", () => {
      const result = validateNodeTypes([], availableTypes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate nodes with all available types", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "node1",
          type: "http-request",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node2",
          type: "data-transform",
          position: { x: 10, y: 10 },
          data: {},
        },
        {
          id: "node3",
          type: "file-reader",
          position: { x: 20, y: 20 },
          data: {},
        },
      ];

      const result = validateNodeTypes(nodes, availableTypes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate single node with valid type", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "single", type: "condition", position: { x: 0, y: 0 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, availableTypes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate multiple nodes with same valid type", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "timer1", type: "timer", position: { x: 0, y: 0 }, data: {} },
        { id: "timer2", type: "timer", position: { x: 10, y: 10 }, data: {} },
        { id: "timer3", type: "timer", position: { x: 20, y: 20 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, availableTypes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Invalid Node Types", () => {
    it("should detect single invalid node type", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "invalid-node",
          type: "unknown-type",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      const result = validateNodeTypes(nodes, availableTypes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("UNKNOWN_NODE_TYPE");
      expect(result.errors[0].message).toContain("unknown-type");
      expect(result.errors[0].path).toBe("nodes[0].type");
      expect(result.errors[0].data).toEqual({
        nodeId: "invalid-node",
        nodeType: "unknown-type",
        availableTypes: availableTypes,
      });
    });

    it("should detect multiple invalid node types", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "node1",
          type: "unknown-type-1",
          position: { x: 0, y: 0 },
          data: {},
        },
        {
          id: "node2",
          type: "http-request",
          position: { x: 10, y: 10 },
          data: {},
        }, // Valid
        {
          id: "node3",
          type: "unknown-type-2",
          position: { x: 20, y: 20 },
          data: {},
        },
      ];

      const result = validateNodeTypes(nodes, availableTypes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.every((e) => e.code === "UNKNOWN_NODE_TYPE")).toBe(
        true,
      );

      const invalidTypes = result.errors.map(
        (e) => (e.data as Record<string, unknown>)?.nodeType,
      );
      expect(invalidTypes).toContain("unknown-type-1");
      expect(invalidTypes).toContain("unknown-type-2");

      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain("nodes[0].type");
      expect(paths).toContain("nodes[2].type");
    });

    it("should handle all nodes having invalid types", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "invalid1", position: { x: 0, y: 0 }, data: {} },
        { id: "node2", type: "invalid2", position: { x: 10, y: 10 }, data: {} },
        { id: "node3", type: "invalid3", position: { x: 20, y: 20 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, availableTypes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.every((e) => e.code === "UNKNOWN_NODE_TYPE")).toBe(
        true,
      );
    });
  });

  describe("Edge Cases with Available Types", () => {
    it("should handle empty available types array", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "any-type", position: { x: 0, y: 0 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, []);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("UNKNOWN_NODE_TYPE");
      expect((result.errors[0].data as any)?.availableTypes).toEqual([]);
    });

    it("should handle nodes when no types are available", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "type1", position: { x: 0, y: 0 }, data: {} },
        { id: "node2", type: "type2", position: { x: 10, y: 10 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, []);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should handle single available type", () => {
      const singleType = ["only-type"];
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "only-type", position: { x: 0, y: 0 }, data: {} },
        {
          id: "node2",
          type: "other-type",
          position: { x: 10, y: 10 },
          data: {},
        },
      ];

      const result = validateNodeTypes(nodes, singleType);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeType).toBe("other-type");
      expect((result.errors[0].data as any)?.availableTypes).toEqual(
        singleType,
      );
    });
  });

  describe("Case Sensitivity", () => {
    it("should be case sensitive for node types", () => {
      const caseSensitiveTypes = [
        "Http-Request",
        "DATA-TRANSFORM",
        "file_reader",
      ];
      const nodes: CompositeNodeSpec[] = [
        {
          id: "node1",
          type: "Http-Request",
          position: { x: 0, y: 0 },
          data: {},
        }, // Valid
        {
          id: "node2",
          type: "http-request",
          position: { x: 10, y: 10 },
          data: {},
        }, // Invalid (different case)
        {
          id: "node3",
          type: "DATA-TRANSFORM",
          position: { x: 20, y: 20 },
          data: {},
        }, // Valid
        {
          id: "node4",
          type: "data-transform",
          position: { x: 30, y: 30 },
          data: {},
        }, // Invalid (different case)
      ];

      const result = validateNodeTypes(nodes, caseSensitiveTypes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const invalidTypes = result.errors.map(
        (e) => (e.data as Record<string, unknown>)?.nodeType,
      );
      expect(invalidTypes).toContain("http-request");
      expect(invalidTypes).toContain("data-transform");
    });
  });

  describe("Special Characters in Types", () => {
    it("should handle types with special characters", () => {
      const specialTypes = [
        "node-type",
        "node_type",
        "node.type",
        "node:type",
        "node/type",
      ];
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "node-type", position: { x: 0, y: 0 }, data: {} },
        {
          id: "node2",
          type: "node_type",
          position: { x: 10, y: 10 },
          data: {},
        },
        {
          id: "node3",
          type: "node.type",
          position: { x: 20, y: 20 },
          data: {},
        },
        {
          id: "node4",
          type: "node:type",
          position: { x: 30, y: 30 },
          data: {},
        },
        {
          id: "node5",
          type: "node/type",
          position: { x: 40, y: 40 },
          data: {},
        },
      ];

      const result = validateNodeTypes(nodes, specialTypes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle Unicode characters in types", () => {
      const unicodeTypes = ["节点类型", "nœud-type", "узел-тип"];
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "节点类型", position: { x: 0, y: 0 }, data: {} },
        {
          id: "node2",
          type: "nœud-type",
          position: { x: 10, y: 10 },
          data: {},
        },
        { id: "node3", type: "узел-тип", position: { x: 20, y: 20 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, unicodeTypes);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle empty string types", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "", position: { x: 0, y: 0 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, ["", "valid-type"]);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect empty string types when not available", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "", position: { x: 0, y: 0 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, ["valid-type"]);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeType).toBe("");
    });
  });

  describe("Error Information Validation", () => {
    it("should provide complete error information", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "test-node-id",
          type: "invalid-type",
          position: { x: 0, y: 0 },
          data: {},
        },
      ];

      const testAvailableTypes = ["type1", "type2", "type3"];
      const result = validateNodeTypes(nodes, testAvailableTypes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);

      const error = result.errors[0];
      expect(error.path).toBe("nodes[0].type");
      expect(error.message).toBe("Unknown node type: invalid-type");
      expect(error.code).toBe("UNKNOWN_NODE_TYPE");
      expect((error.data as Record<string, unknown>)?.nodeId).toBe(
        "test-node-id",
      );
      expect((error.data as Record<string, unknown>)?.nodeType).toBe(
        "invalid-type",
      );
      expect((error.data as Record<string, unknown>)?.availableTypes).toEqual(
        testAvailableTypes,
      );
    });

    it("should provide correct indices in error paths", () => {
      const nodes: CompositeNodeSpec[] = [
        { id: "node1", type: "valid", position: { x: 0, y: 0 }, data: {} },
        { id: "node2", type: "invalid1", position: { x: 10, y: 10 }, data: {} },
        { id: "node3", type: "valid", position: { x: 20, y: 20 }, data: {} },
        { id: "node4", type: "invalid2", position: { x: 30, y: 30 }, data: {} },
      ];

      const result = validateNodeTypes(nodes, ["valid"]);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);

      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain("nodes[1].type");
      expect(paths).toContain("nodes[3].type");
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of nodes efficiently", () => {
      const largeAvailableTypes = Array.from(
        { length: 100 },
        (_, i) => `type-${i}`,
      );
      const manyNodes: CompositeNodeSpec[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `node-${i}`,
          type: `type-${i % 100}`, // All valid types
          position: { x: i, y: i },
          data: {},
        }),
      );

      const startTime = performance.now();
      const result = validateNodeTypes(manyNodes, largeAvailableTypes);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should handle large numbers of invalid types efficiently", () => {
      const limitedTypes = ["valid-type"];
      const manyInvalidNodes: CompositeNodeSpec[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `node-${i}`,
          type: `invalid-type-${i}`,
          position: { x: i, y: i },
          data: {},
        }),
      );

      const startTime = performance.now();
      const result = validateNodeTypes(manyInvalidNodes, limitedTypes);
      const endTime = performance.now();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(200); // Should still be reasonably fast
    });

    it("should handle large available types list efficiently", () => {
      const manyTypes = Array.from({ length: 10000 }, (_, i) => `type-${i}`);
      const fewNodes: CompositeNodeSpec[] = [
        { id: "node1", type: "type-5000", position: { x: 0, y: 0 }, data: {} },
        {
          id: "node2",
          type: "invalid-type",
          position: { x: 10, y: 10 },
          data: {},
        },
      ];

      const startTime = performance.now();
      const result = validateNodeTypes(fewNodes, manyTypes);
      const endTime = performance.now();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect((result.errors[0].data as any)?.nodeType).toBe("invalid-type");
      expect(endTime - startTime).toBeLessThan(50); // Should be fast with Set lookup
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle mixed valid and invalid types in large composite", () => {
      const someTypes = ["http", "transform", "file", "condition"];
      const mixedNodes: CompositeNodeSpec[] = [
        ...Array.from({ length: 50 }, (_, i) => ({
          id: `valid-${i}`,
          type: someTypes[i % someTypes.length],
          position: { x: i, y: i },
          data: {},
        })),
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `invalid-${i}`,
          type: `unknown-${i}`,
          position: { x: i + 50, y: i + 50 },
          data: {},
        })),
      ];

      const result = validateNodeTypes(mixedNodes, someTypes);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(10);
      expect(
        result.errors.every((e) =>
          (e.data as Record<string, unknown>)?.nodeType
            ?.toString()
            .startsWith("unknown-"),
        ),
      ).toBe(true);
    });

    it("should handle nodes with complex data structures", () => {
      const nodes: CompositeNodeSpec[] = [
        {
          id: "complex-node",
          type: "valid-type",
          position: { x: 0, y: 0 },
          data: {
            config: {
              nested: {
                deeply: {
                  embedded: "value",
                },
              },
            },
            array: [1, 2, { complex: "object" }],
          },
        },
      ];

      const result = validateNodeTypes(nodes, ["valid-type"]);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
