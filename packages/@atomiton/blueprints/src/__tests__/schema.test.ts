import { describe, it, expect } from "vitest";
import {
  BLUEPRINT_SCHEMA,
  BlueprintDefinitionSchema,
  BlueprintNodeSchema,
  BlueprintEdgeSchema,
  BlueprintMetadataSchema,
  SCHEMA_VERSION,
  REQUIRED_BLUEPRINT_FIELDS,
} from "../schema.js";

describe("Blueprint Schemas", () => {
  describe("BlueprintDefinitionSchema", () => {
    it("should validate a complete blueprint", () => {
      const validBlueprint = {
        id: "test-blueprint",
        name: "Test Blueprint",
        description: "A test blueprint",
        category: "test",
        type: "blueprint",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00.000Z",
          modified: "2024-01-01T00:00:00.000Z",
          author: "Test Author",
          tags: ["test", "example"],
        },
        nodes: [
          {
            id: "node-1",
            type: "test-node",
            position: { x: 100, y: 200 },
            data: { config: "test" },
          },
        ],
        edges: [
          {
            id: "edge-1",
            source: "node-1",
            target: "node-2",
          },
        ],
        variables: {
          testVar: {
            type: "string",
            defaultValue: "test",
          },
        },
        settings: {
          runtime: { timeout: 5000 },
        },
      };

      const result = BlueprintDefinitionSchema.safeParse(validBlueprint);
      expect(result.success).toBe(true);
    });

    it("should reject blueprint with missing required fields", () => {
      const invalidBlueprint = {
        name: "Invalid Blueprint",
        // Missing required fields: id, category, type, metadata, nodes, edges
      };

      const result = BlueprintDefinitionSchema.safeParse(invalidBlueprint);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
        const missingFields = result.error.errors.map((err) => err.path[0]);
        expect(missingFields).toContain("id");
        expect(missingFields).toContain("category");
        expect(missingFields).toContain("type");
      }
    });

    it("should reject blueprint with invalid metadata", () => {
      const invalidBlueprint = {
        id: "test-blueprint",
        name: "Test Blueprint",
        category: "test",
        type: "blueprint",
        metadata: {
          created: "invalid-date",
          modified: "2024-01-01T00:00:00.000Z",
        },
        nodes: [],
        edges: [],
      };

      const result = BlueprintDefinitionSchema.safeParse(invalidBlueprint);
      expect(result.success).toBe(false);
    });
  });

  describe("BlueprintNodeSchema", () => {
    it("should validate a valid node", () => {
      const validNode = {
        id: "node-1",
        type: "test-node",
        position: { x: 100, y: 200 },
        data: { config: "test", enabled: true },
      };

      const result = BlueprintNodeSchema.safeParse(validNode);
      expect(result.success).toBe(true);
    });

    it("should reject node with missing required fields", () => {
      const invalidNode = {
        type: "test-node",
        // Missing: id, position, data
      };

      const result = BlueprintNodeSchema.safeParse(invalidNode);
      expect(result.success).toBe(false);
    });

    it("should reject node with invalid position", () => {
      const invalidNode = {
        id: "node-1",
        type: "test-node",
        position: { x: "invalid", y: 200 },
        data: {},
      };

      const result = BlueprintNodeSchema.safeParse(invalidNode);
      expect(result.success).toBe(false);
    });
  });

  describe("BlueprintEdgeSchema", () => {
    it("should validate a valid edge", () => {
      const validEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output",
        targetHandle: "input",
        data: { weight: 1.0 },
      };

      const result = BlueprintEdgeSchema.safeParse(validEdge);
      expect(result.success).toBe(true);
    });

    it("should validate edge without optional fields", () => {
      const minimalEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      };

      const result = BlueprintEdgeSchema.safeParse(minimalEdge);
      expect(result.success).toBe(true);
    });

    it("should reject edge with missing required fields", () => {
      const invalidEdge = {
        id: "edge-1",
        // Missing: source, target
      };

      const result = BlueprintEdgeSchema.safeParse(invalidEdge);
      expect(result.success).toBe(false);
    });
  });

  describe("BlueprintMetadataSchema", () => {
    it("should validate valid metadata", () => {
      const validMetadata = {
        created: "2024-01-01T00:00:00.000Z",
        modified: "2024-01-01T00:00:00.000Z",
        author: "Test Author",
        tags: ["test", "example"],
        customField: "custom value",
      };

      const result = BlueprintMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it("should allow metadata with only required fields", () => {
      const minimalMetadata = {
        created: "2024-01-01T00:00:00.000Z",
        modified: "2024-01-01T00:00:00.000Z",
      };

      const result = BlueprintMetadataSchema.safeParse(minimalMetadata);
      expect(result.success).toBe(true);
    });

    it("should reject metadata with invalid timestamps", () => {
      const invalidMetadata = {
        created: "not-a-date",
        modified: "2024-01-01T00:00:00.000Z",
      };

      const result = BlueprintMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });
  });

  describe("Schema Constants", () => {
    it("should have correct schema version", () => {
      expect(SCHEMA_VERSION).toBe("1.0.0");
    });

    it("should have required fields defined", () => {
      expect(REQUIRED_BLUEPRINT_FIELDS).toContain("id");
      expect(REQUIRED_BLUEPRINT_FIELDS).toContain("name");
      expect(REQUIRED_BLUEPRINT_FIELDS).toContain("category");
      expect(REQUIRED_BLUEPRINT_FIELDS).toContain("type");
      expect(REQUIRED_BLUEPRINT_FIELDS).toContain("metadata");
      expect(REQUIRED_BLUEPRINT_FIELDS).toContain("nodes");
      expect(REQUIRED_BLUEPRINT_FIELDS).toContain("edges");
    });

    it("should export main schema", () => {
      expect(BLUEPRINT_SCHEMA).toBeDefined();
      expect(BLUEPRINT_SCHEMA).toBe(BlueprintDefinitionSchema);
    });
  });

  describe("Schema Edge Cases", () => {
    it("should handle empty arrays", () => {
      const blueprintWithEmptyArrays = {
        id: "empty-blueprint",
        name: "Empty Blueprint",
        category: "test",
        type: "blueprint",
        metadata: {
          created: "2024-01-01T00:00:00.000Z",
          modified: "2024-01-01T00:00:00.000Z",
          tags: [],
        },
        nodes: [],
        edges: [],
      };

      const result = BlueprintDefinitionSchema.safeParse(
        blueprintWithEmptyArrays,
      );
      expect(result.success).toBe(true);
    });

    it("should handle additional properties in data fields", () => {
      const blueprintWithExtras = {
        id: "extra-blueprint",
        name: "Blueprint with Extras",
        category: "test",
        type: "blueprint",
        metadata: {
          created: "2024-01-01T00:00:00.000Z",
          modified: "2024-01-01T00:00:00.000Z",
          customField: "allowed",
        },
        nodes: [
          {
            id: "node-1",
            type: "test",
            position: { x: 0, y: 0 },
            data: {
              config: "test",
              customNodeData: { nested: "allowed" },
            },
          },
        ],
        edges: [],
      };

      const result = BlueprintDefinitionSchema.safeParse(blueprintWithExtras);
      expect(result.success).toBe(true);
    });
  });
});
