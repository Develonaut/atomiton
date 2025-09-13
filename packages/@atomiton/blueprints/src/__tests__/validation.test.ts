import { describe, expect, it } from "vitest";
import type {
  BlueprintDefinition,
  BlueprintValidationContext,
} from "../types.js";
import {
  formatValidationErrors,
  hasCriticalErrors,
  isBlueprintDefinition,
  validateBlueprint,
  validateEdgeReferences,
  validateEdgeUniqueness,
  validateMetadata,
  validateNodeTypes,
  validateNodeUniqueness,
} from "../validation.js";

describe("Blueprint Validation", () => {
  const createValidBlueprint = (): BlueprintDefinition => ({
    id: "test-blueprint",
    name: "Test Blueprint",
    category: "test",
    type: "blueprint",
    metadata: {
      created: "2024-01-01T00:00:00.000Z",
      modified: "2024-01-01T00:00:00.000Z",
    },
    nodes: [
      {
        id: "node-1",
        type: "test-node",
        position: { x: 100, y: 200 },
        data: {},
      },
      {
        id: "node-2",
        type: "another-node",
        position: { x: 300, y: 400 },
        data: {},
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      },
    ],
  });

  describe("validateBlueprint", () => {
    it("should validate a correct blueprint", () => {
      const blueprint = createValidBlueprint();
      const result = validateBlueprint(blueprint);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid blueprint structure", () => {
      const invalidBlueprint = {
        name: "Invalid",
        // Missing required fields
      };

      const result = validateBlueprint(invalidBlueprint);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect duplicate node IDs", () => {
      const blueprint = createValidBlueprint();
      blueprint.nodes.push({
        id: "node-1", // Duplicate ID
        type: "duplicate-node",
        position: { x: 500, y: 600 },
        data: {},
      });

      const result = validateBlueprint(blueprint);
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.code === "DUPLICATE_NODE_ID")).toBe(
        true,
      );
    });

    it("should detect invalid edge references", () => {
      const blueprint = createValidBlueprint();
      blueprint.edges.push({
        id: "edge-2",
        source: "non-existent-node",
        target: "node-1",
      });

      const result = validateBlueprint(blueprint);
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_SOURCE_NODE")).toBe(
        true,
      );
    });

    it("should validate node types when context provided", () => {
      const blueprint = createValidBlueprint();
      const context: BlueprintValidationContext = {
        availableNodeTypes: ["test-node"],
        strictMode: true,
      };

      const result = validateBlueprint(blueprint, context);
      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.code === "UNKNOWN_NODE_TYPE")).toBe(
        true,
      );
    });

    it("should show warnings for unknown node types in non-strict mode", () => {
      const blueprint = createValidBlueprint();
      const context: BlueprintValidationContext = {
        availableNodeTypes: ["test-node"],
        strictMode: false,
      };

      const result = validateBlueprint(blueprint, context);
      expect(result.success).toBe(true);
      expect(result.warnings?.some((w) => w.code === "UNKNOWN_NODE_TYPE")).toBe(
        true,
      );
    });
  });

  describe("isBlueprintDefinition", () => {
    it("should return true for valid blueprint", () => {
      const blueprint = createValidBlueprint();
      expect(isBlueprintDefinition(blueprint)).toBe(true);
    });

    it("should return false for invalid blueprint", () => {
      const invalid = { name: "Invalid" };
      expect(isBlueprintDefinition(invalid)).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isBlueprintDefinition(null)).toBe(false);
      expect(isBlueprintDefinition(undefined)).toBe(false);
    });
  });

  describe("validateNodeUniqueness", () => {
    it("should pass for unique node IDs", () => {
      const nodes = [
        { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "node-2", type: "test", position: { x: 0, y: 0 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail for duplicate node IDs", () => {
      const nodes = [
        { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} },
        { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} },
      ];

      const result = validateNodeUniqueness(nodes);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe("DUPLICATE_NODE_ID");
      expect(result.errors[0].data).toEqual({ nodeId: "node-1", index: 1 });
    });
  });

  describe("validateEdgeReferences", () => {
    const nodes = [
      { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} },
      { id: "node-2", type: "test", position: { x: 0, y: 0 }, data: {} },
    ];

    it("should pass for valid edge references", () => {
      const edges = [{ id: "edge-1", source: "node-1", target: "node-2" }];

      const result = validateEdgeReferences(edges, nodes);
      expect(result.success).toBe(true);
    });

    it("should fail for invalid source reference", () => {
      const edges = [
        { id: "edge-1", source: "non-existent", target: "node-2" },
      ];

      const result = validateEdgeReferences(edges, nodes);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_SOURCE_NODE");
    });

    it("should fail for invalid target reference", () => {
      const edges = [
        { id: "edge-1", source: "node-1", target: "non-existent" },
      ];

      const result = validateEdgeReferences(edges, nodes);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_TARGET_NODE");
    });
  });

  describe("validateNodeTypes", () => {
    const nodes = [
      { id: "node-1", type: "valid-type", position: { x: 0, y: 0 }, data: {} },
      {
        id: "node-2",
        type: "unknown-type",
        position: { x: 0, y: 0 },
        data: {},
      },
    ];

    it("should pass for known node types", () => {
      const availableTypes = ["valid-type", "unknown-type"];
      const result = validateNodeTypes(nodes, availableTypes);
      expect(result.success).toBe(true);
    });

    it("should fail for unknown node types", () => {
      const availableTypes = ["valid-type"];
      const result = validateNodeTypes(nodes, availableTypes);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe("UNKNOWN_NODE_TYPE");
      expect(result.errors[0].data).toMatchObject({
        nodeId: "node-2",
        nodeType: "unknown-type",
      });
    });
  });

  describe("validateEdgeUniqueness", () => {
    it("should pass for unique edge IDs", () => {
      const edges = [
        { id: "edge-1", source: "node-1", target: "node-2" },
        { id: "edge-2", source: "node-2", target: "node-1" },
      ];

      const result = validateEdgeUniqueness(edges);
      expect(result.success).toBe(true);
    });

    it("should fail for duplicate edge IDs", () => {
      const edges = [
        { id: "edge-1", source: "node-1", target: "node-2" },
        { id: "edge-1", source: "node-2", target: "node-1" },
      ];

      const result = validateEdgeUniqueness(edges);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe("DUPLICATE_EDGE_ID");
    });
  });

  describe("validateMetadata", () => {
    it("should pass for valid metadata", () => {
      const metadata = {
        created: "2024-01-01T00:00:00.000Z",
        modified: "2024-01-02T00:00:00.000Z",
        author: "Test Author",
        tags: ["test", "example"],
      };

      const result = validateMetadata(metadata);
      expect(result.success).toBe(true);
    });

    it("should fail for invalid timestamp format", () => {
      const metadata = {
        created: "invalid-date",
        modified: "2024-01-01T00:00:00.000Z",
      };

      const result = validateMetadata(metadata);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_TIMESTAMP");
    });

    it("should warn about timestamp inconsistency", () => {
      const metadata = {
        created: "2024-01-02T00:00:00.000Z",
        modified: "2024-01-01T00:00:00.000Z", // Modified before created
      };

      const result = validateMetadata(metadata);
      expect(result.success).toBe(true);
      expect(result.warnings?.[0].code).toBe("TIMESTAMP_INCONSISTENCY");
    });

    it("should fail for invalid tags type", () => {
      const metadata = {
        created: "2024-01-01T00:00:00.000Z",
        modified: "2024-01-01T00:00:00.000Z",
        tags: "not-an-array" as unknown as string[],
      };

      const result = validateMetadata(metadata);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe("INVALID_TAGS_TYPE");
    });
  });

  describe("Utility Functions", () => {
    describe("formatValidationErrors", () => {
      it("should format errors for display", () => {
        const errors = [
          {
            path: "nodes[0].id",
            message: "Required field",
            code: "MISSING_FIELD",
          },
          {
            path: "edges[0].source",
            message: "Invalid reference",
            code: "INVALID_REF",
          },
        ];

        const formatted = formatValidationErrors(errors);
        expect(formatted).toContain(
          "nodes[0].id: Required field (MISSING_FIELD)",
        );
        expect(formatted).toContain(
          "edges[0].source: Invalid reference (INVALID_REF)",
        );
      });
    });

    describe("hasCriticalErrors", () => {
      it("should detect critical errors", () => {
        const resultWithCritical = {
          success: false,
          errors: [
            {
              path: "test",
              message: "Duplicate",
              code: "DUPLICATE_NODE_ID",
              data: {},
            },
          ],
        };

        expect(hasCriticalErrors(resultWithCritical)).toBe(true);
      });

      it("should not flag non-critical errors", () => {
        const resultWithNonCritical = {
          success: false,
          errors: [
            {
              path: "test",
              message: "Unknown type",
              code: "UNKNOWN_NODE_TYPE",
              data: {},
            },
          ],
        };

        expect(hasCriticalErrors(resultWithNonCritical)).toBe(false);
      });
    });
  });
});
