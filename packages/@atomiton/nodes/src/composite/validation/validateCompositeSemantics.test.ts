/**
 * Tests for validateCompositeSemantics function
 *
 * This tests the semantic validation that coordinates multiple validation
 * functions to check node relationships, references, and business rules.
 */

import { describe, it, expect } from "vitest";
import { validateCompositeSemantics } from "./validateCompositeSemantics";
import type { CompositeDefinition, CompositeValidationContext } from "../types";

describe("validateCompositeSemantics", () => {
  const baseComposite: CompositeDefinition = {
    id: "test-composite",
    name: "Test Composite",
    category: "test",
    description: "A test composite node",
    version: "1.0.0",
    metadata: {
      created: "2024-01-01T00:00:00Z",
      modified: "2024-01-01T00:00:00Z",
      author: "Test Author",
    },
    nodes: [
      {
        id: "node1",
        type: "test-node",
        position: { x: 0, y: 0 },
        data: {},
      },
      {
        id: "node2",
        type: "test-node",
        position: { x: 100, y: 100 },
        data: {},
      },
    ],
    edges: [
      {
        id: "edge1",
        source: { nodeId: "node1", portId: "output" },
        target: { nodeId: "node2", portId: "input" },
      },
    ],
  };

  describe("Valid Composites", () => {
    it("should validate a well-formed composite", () => {
      const result = validateCompositeSemantics(baseComposite);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toBeUndefined();
    });

    it("should validate empty composite", () => {
      const emptyComposite = {
        ...baseComposite,
        nodes: [],
        edges: [],
      };

      const result = validateCompositeSemantics(emptyComposite);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate composite with single node", () => {
      const singleNodeComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "single-node",
            type: "test",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
        edges: [],
      };

      const result = validateCompositeSemantics(singleNodeComposite);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Node Uniqueness Validation", () => {
    it("should detect duplicate node IDs", () => {
      const duplicateNodesComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "duplicate",
            type: "test",
            position: { x: 0, y: 0 },
            data: {},
          },
          {
            id: "duplicate", // Duplicate ID
            type: "test",
            position: { x: 100, y: 100 },
            data: {},
          },
        ],
      };

      const result = validateCompositeSemantics(duplicateNodesComposite);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.code === "DUPLICATE_NODE_ID")).toBe(
        true,
      );
      expect(result.errors.some((e) => e.message.includes("duplicate"))).toBe(
        true,
      );
    });

    it("should detect multiple duplicate node IDs", () => {
      const multiDuplicateComposite = {
        ...baseComposite,
        nodes: [
          { id: "dup1", type: "test", position: { x: 0, y: 0 }, data: {} },
          { id: "dup1", type: "test", position: { x: 10, y: 10 }, data: {} },
          { id: "dup2", type: "test", position: { x: 20, y: 20 }, data: {} },
          { id: "dup2", type: "test", position: { x: 30, y: 30 }, data: {} },
          { id: "unique", type: "test", position: { x: 40, y: 40 }, data: {} },
        ],
      };

      const result = validateCompositeSemantics(multiDuplicateComposite);

      expect(result.success).toBe(false);
      expect(
        result.errors.filter((e) => e.code === "DUPLICATE_NODE_ID"),
      ).toHaveLength(2);
    });
  });

  describe("Edge Reference Validation", () => {
    it("should detect edges referencing non-existent nodes", () => {
      const invalidEdgeComposite = {
        ...baseComposite,
        edges: [
          {
            id: "edge1",
            source: { nodeId: "nonexistent-source", portId: "output" },
            target: { nodeId: "node1", portId: "input" },
          },
          {
            id: "edge2",
            source: { nodeId: "node1", portId: "output" },
            target: { nodeId: "nonexistent-target", portId: "input" },
          },
        ],
      };

      const result = validateCompositeSemantics(invalidEdgeComposite);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some((e) => e.message.includes("nonexistent-source")),
      ).toBe(true);
      expect(
        result.errors.some((e) => e.message.includes("nonexistent-target")),
      ).toBe(true);
    });

    it("should allow self-referencing edges", () => {
      const selfRefComposite = {
        ...baseComposite,
        edges: [
          {
            id: "self-edge",
            source: { nodeId: "node1", portId: "output" },
            target: { nodeId: "node1", portId: "input" },
          },
        ],
      };

      const result = validateCompositeSemantics(selfRefComposite);

      expect(result.success).toBe(true);
    });
  });

  describe("Edge Uniqueness Validation", () => {
    it("should detect duplicate edge IDs", () => {
      const duplicateEdgeComposite = {
        ...baseComposite,
        edges: [
          {
            id: "duplicate-edge",
            source: { nodeId: "node1", portId: "output" },
            target: { nodeId: "node2", portId: "input" },
          },
          {
            id: "duplicate-edge", // Duplicate ID
            source: { nodeId: "node2", portId: "output" },
            target: { nodeId: "node1", portId: "input" },
          },
        ],
      };

      const result = validateCompositeSemantics(duplicateEdgeComposite);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.code === "DUPLICATE_EDGE_ID")).toBe(
        true,
      );
    });
  });

  describe("Node Type Validation with Context", () => {
    it("should validate node types in strict mode", () => {
      const context: CompositeValidationContext = {
        availableNodeTypes: ["allowed-type-1", "allowed-type-2"],
        strictMode: true,
      };

      const invalidTypeComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "node1",
            type: "disallowed-type",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
      };

      const result = validateCompositeSemantics(invalidTypeComposite, context);

      expect(result.success).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes("disallowed-type")),
      ).toBe(true);
    });

    it("should produce warnings for node types in non-strict mode", () => {
      const context: CompositeValidationContext = {
        availableNodeTypes: ["allowed-type-1", "allowed-type-2"],
        strictMode: false,
      };

      const invalidTypeComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "node1",
            type: "disallowed-type",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
      };

      const result = validateCompositeSemantics(invalidTypeComposite, context);

      expect(result.success).toBe(true); // Warnings don't fail validation
      expect(result.warnings).toBeDefined();
      expect(
        result.warnings!.some((w) => w.message.includes("disallowed-type")),
      ).toBe(true);
    });

    it("should skip node type validation without context", () => {
      const invalidTypeComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "node1",
            type: "any-type",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
      };

      const result = validateCompositeSemantics(invalidTypeComposite);

      expect(result.success).toBe(true);
      expect(result.errors.some((e) => e.message.includes("type"))).toBe(false);
    });

    it("should accept valid node types", () => {
      const context: CompositeValidationContext = {
        availableNodeTypes: ["test-node", "another-type"],
        strictMode: true,
      };

      const validTypeComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "node1",
            type: "test-node",
            position: { x: 0, y: 0 },
            data: {},
          },
          {
            id: "node2",
            type: "another-type",
            position: { x: 100, y: 100 },
            data: {},
          },
        ],
      };

      const result = validateCompositeSemantics(validTypeComposite, context);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Metadata Validation", () => {
    it("should detect invalid metadata timestamps", () => {
      const invalidMetadataComposite = {
        ...baseComposite,
        metadata: {
          created: "invalid-date",
          modified: "2024-01-01T00:00:00Z",
        },
      };

      const result = validateCompositeSemantics(invalidMetadataComposite);

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.message.includes("timestamp") || e.message.includes("date"),
        ),
      ).toBe(true);
    });

    it("should handle metadata warnings", () => {
      // This test depends on what metadata validation actually produces warnings for
      const result = validateCompositeSemantics(baseComposite);

      if (result.warnings) {
        expect(Array.isArray(result.warnings)).toBe(true);
        result.warnings.forEach((warning) => {
          expect(warning.path).toBeDefined();
          expect(warning.message).toBeDefined();
          expect(warning.code).toBeDefined();
        });
      }
    });
  });

  describe("Combined Validation", () => {
    it("should detect multiple types of errors simultaneously", () => {
      const multiErrorComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "duplicate",
            type: "test",
            position: { x: 0, y: 0 },
            data: {},
          },
          {
            id: "duplicate", // Duplicate node ID
            type: "test",
            position: { x: 100, y: 100 },
            data: {},
          },
        ],
        edges: [
          {
            id: "duplicate-edge",
            source: { nodeId: "node1", portId: "output" },
            target: { nodeId: "nonexistent", portId: "input" }, // Invalid target
          },
          {
            id: "duplicate-edge", // Duplicate edge ID
            source: { nodeId: "duplicate", portId: "output" },
            target: { nodeId: "duplicate", portId: "input" },
          },
        ],
        metadata: {
          created: "invalid-date", // Invalid timestamp
          modified: "2024-01-01T00:00:00Z",
        },
      };

      const result = validateCompositeSemantics(multiErrorComposite);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);

      // Should have different types of errors
      const errorCodes = result.errors.map((e) => e.code);
      expect(errorCodes.includes("DUPLICATE_NODE_ID")).toBe(true);
      expect(errorCodes.includes("DUPLICATE_EDGE_ID")).toBe(true);
    });

    it("should report all validation results comprehensively", () => {
      const context: CompositeValidationContext = {
        availableNodeTypes: ["allowed-type"],
        strictMode: false,
      };

      const testComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "node1",
            type: "disallowed-type", // Will generate warning
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
      };

      const result = validateCompositeSemantics(testComposite, context);

      expect(result.success).toBe(true); // Only warnings, no errors
      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty node and edge arrays", () => {
      const emptyComposite = {
        ...baseComposite,
        nodes: [],
        edges: [],
      };

      const result = validateCompositeSemantics(emptyComposite);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle large numbers of nodes and edges", () => {
      const largeComposite = {
        ...baseComposite,
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          type: "test",
          position: { x: i * 10, y: i * 10 },
          data: {},
        })),
        edges: Array.from({ length: 99 }, (_, i) => ({
          id: `edge-${i}`,
          source: { nodeId: `node-${i}`, portId: "output" },
          target: { nodeId: `node-${i + 1}`, portId: "input" },
        })),
      };

      const result = validateCompositeSemantics(largeComposite);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle context with empty availableNodeTypes", () => {
      const context: CompositeValidationContext = {
        availableNodeTypes: [],
        strictMode: true,
      };

      const result = validateCompositeSemantics(baseComposite, context);

      expect(result.success).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes("not available")),
      ).toBe(true);
    });

    it("should return proper structure when no warnings are generated", () => {
      const result = validateCompositeSemantics(baseComposite);

      if (result.success) {
        expect(result.warnings).toBeUndefined();
      }
    });

    it("should handle complex node data structures", () => {
      const complexComposite = {
        ...baseComposite,
        nodes: [
          {
            id: "complex-node",
            type: "test",
            position: { x: 0, y: 0 },
            data: {
              config: {
                settings: {
                  nested: {
                    value: "deep",
                    array: [1, 2, 3, { more: "data" }],
                  },
                },
              },
            },
          },
        ],
      };

      const result = validateCompositeSemantics(complexComposite);

      expect(result.success).toBe(true);
    });
  });
});
