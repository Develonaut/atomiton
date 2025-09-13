import { describe, it, expect } from "vitest";
import type {
  BlueprintDefinition,
  BlueprintNode,
  BlueprintEdge,
  ValidationError,
  ValidationResult,
} from "../types.js";

describe("Blueprint Types", () => {
  describe("BlueprintDefinition", () => {
    it("should have all required fields", () => {
      const blueprint: BlueprintDefinition = {
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
          tags: ["test"],
        },
        nodes: [],
        edges: [],
      };

      expect(blueprint.id).toBe("test-blueprint");
      expect(blueprint.name).toBe("Test Blueprint");
      expect(blueprint.metadata).toBeDefined();
      expect(blueprint.nodes).toEqual([]);
      expect(blueprint.edges).toEqual([]);
    });

    it("should allow optional fields", () => {
      const blueprint: BlueprintDefinition = {
        id: "minimal-blueprint",
        name: "Minimal Blueprint",
        category: "test",
        type: "blueprint",
        metadata: {
          created: "2024-01-01T00:00:00.000Z",
          modified: "2024-01-01T00:00:00.000Z",
        },
        nodes: [],
        edges: [],
        variables: {
          testVar: {
            type: "string",
            defaultValue: "test",
            description: "Test variable",
          },
        },
        settings: {
          runtime: { timeout: 5000 },
          ui: { theme: "dark" },
        },
      };

      expect(blueprint.variables).toBeDefined();
      expect(blueprint.settings).toBeDefined();
      expect(blueprint.variables?.testVar.type).toBe("string");
    });
  });

  describe("BlueprintNode", () => {
    it("should have correct structure", () => {
      const node: BlueprintNode = {
        id: "node-1",
        type: "test-node",
        position: { x: 100, y: 200 },
        data: {
          config: "test",
          value: 42,
        },
      };

      expect(node.id).toBe("node-1");
      expect(node.type).toBe("test-node");
      expect(node.position.x).toBe(100);
      expect(node.position.y).toBe(200);
      expect(node.data.config).toBe("test");
    });
  });

  describe("BlueprintEdge", () => {
    it("should have correct structure", () => {
      const edge: BlueprintEdge = {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output",
        targetHandle: "input",
        data: { weight: 1.0 },
      };

      expect(edge.id).toBe("edge-1");
      expect(edge.source).toBe("node-1");
      expect(edge.target).toBe("node-2");
      expect(edge.sourceHandle).toBe("output");
      expect(edge.targetHandle).toBe("input");
    });

    it("should allow optional handle fields", () => {
      const edge: BlueprintEdge = {
        id: "simple-edge",
        source: "node-a",
        target: "node-b",
      };

      expect(edge.sourceHandle).toBeUndefined();
      expect(edge.targetHandle).toBeUndefined();
      expect(edge.data).toBeUndefined();
    });
  });

  describe("ValidationResult", () => {
    it("should represent successful validation", () => {
      const result: ValidationResult = {
        success: true,
        errors: [],
      };

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeUndefined();
    });

    it("should represent failed validation with errors", () => {
      const error: ValidationError = {
        path: "nodes[0].id",
        message: "Node ID is required",
        code: "MISSING_FIELD",
        data: { field: "id" },
      };

      const result: ValidationResult = {
        success: false,
        errors: [error],
        warnings: [],
      };

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe("nodes[0].id");
      expect(result.errors[0].code).toBe("MISSING_FIELD");
    });
  });
});
