/**
 * Tests for validateComposite function
 *
 * This tests the core validation function that combines Zod schema validation
 * with semantic validation for composite definitions.
 */

import { describe, it, expect } from "vitest";
import { validateComposite } from "./validateComposite";
import type { CompositeDefinition, CompositeValidationContext } from "../types";

describe("validateComposite", () => {
  const validComposite: CompositeDefinition = {
    id: "test-composite",
    name: "Test Composite",
    type: "composite",
    category: "test",
    description: "A test composite node",
    version: "1.0.0",
    metadata: {
      created: "2024-01-01T00:00:00Z",
      modified: "2024-01-01T00:00:00Z",
      author: "Test Author",
      tags: ["test", "composite"],
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
        source: "node1.output",
        target: "node2.input",
        data: {},
      },
    ],
    variables: {
      testVar: {
        type: "string",
        defaultValue: "test",
        description: "Test variable",
      },
    },
    settings: {
      runtime: { timeout: 30000 },
      ui: { theme: "light" },
    },
  };

  describe("Valid Composites", () => {
    it("should validate a complete valid composite", () => {
      const result = validateComposite(validComposite);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toBeUndefined();
    });

    it("should validate a minimal valid composite", () => {
      const minimal: CompositeDefinition = {
        id: "minimal",
        name: "Minimal",
        type: "composite",
        category: "test",
        description: "Minimal composite",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          modified: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [],
      };

      const result = validateComposite(minimal);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate composite with optional fields omitted", () => {
      const composite: CompositeDefinition = {
        id: "test",
        name: "Test",
        type: "composite",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          modified: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
        edges: [],
      };

      const result = validateComposite(composite);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Schema Validation Errors", () => {
    it("should reject composite with missing required fields", () => {
      const invalid = {
        name: "Missing ID",
        type: "composite",
      };

      const result = validateComposite(invalid);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.path.includes("id"))).toBe(true);
    });

    it("should reject composite with missing type", () => {
      const invalid = {
        ...validComposite,
        type: undefined,
      };

      const result = validateComposite(invalid);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.path.includes("type"))).toBe(true);
    });

    it("should reject composite with invalid node structure", () => {
      const invalid = {
        ...validComposite,
        nodes: [
          {
            id: "node1",
            // Missing type
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
      };

      const result = validateComposite(invalid);

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.path.includes("nodes") && e.path.includes("type"),
        ),
      ).toBe(true);
    });

    it("should reject composite with invalid edge structure", () => {
      const invalid = {
        ...validComposite,
        edges: [
          {
            id: "edge1",
            source: "node1",
            // Missing target
          },
        ],
      };

      const result = validateComposite(invalid);

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.path.includes("edges") && e.path.includes("target"),
        ),
      ).toBe(true);
    });

    it("should reject composite with invalid position values", () => {
      const invalid = {
        ...validComposite,
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: "invalid", y: 0 },
            data: {},
          },
        ],
      };

      const result = validateComposite(invalid);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.path.includes("position"))).toBe(true);
    });

    it("should reject non-object input", () => {
      const result1 = validateComposite(null);
      const result2 = validateComposite("string");
      const result3 = validateComposite(123);
      const result4 = validateComposite([]);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
      expect(result4.success).toBe(false);
    });
  });

  describe("Semantic Validation", () => {
    it("should perform semantic validation after schema validation passes", () => {
      // This composite has valid schema but semantic issues (duplicate node IDs)
      const composite = {
        ...validComposite,
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

      const result = validateComposite(composite);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.message.includes("duplicate"))).toBe(
        true,
      );
    });

    it("should pass validation context to semantic validation", () => {
      const context: CompositeValidationContext = {
        availableNodeTypes: ["allowed-type"],
        strictMode: true,
      };

      const composite = {
        ...validComposite,
        nodes: [
          {
            id: "node1",
            type: "disallowed-type",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
        edges: [], // Override edges to avoid reference errors
      };

      const result = validateComposite(composite, context);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.message.includes("type"))).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle validation exceptions gracefully", () => {
      // Create a circular reference that might cause JSON serialization issues
      const circular: typeof validComposite & { self?: unknown } = {
        ...validComposite,
      };
      circular.self = circular;

      const result = validateComposite(circular);

      // Should not throw, but should return validation error
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should provide meaningful error information", () => {
      const invalid = {
        id: 123, // Should be string
        name: null, // Should be string
        type: "composite",
      };

      const result = validateComposite(invalid);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      result.errors.forEach((error) => {
        expect(error.path).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.code).toBeDefined();
        expect(typeof error.path).toBe("string");
        expect(typeof error.message).toBe("string");
        expect(typeof error.code).toBe("string");
      });
    });

    it("should handle undefined and null inputs", () => {
      const result1 = validateComposite(undefined);
      const result2 = validateComposite(null);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);
      expect(result2.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Warnings", () => {
    it("should include warnings when semantic validation produces them", () => {
      // This would depend on semantic validation producing warnings
      // For now, test that warnings structure is properly handled
      const result = validateComposite(validComposite);

      if (result.warnings) {
        expect(Array.isArray(result.warnings)).toBe(true);
        result.warnings.forEach((warning) => {
          expect(warning.path).toBeDefined();
          expect(warning.message).toBeDefined();
          expect(warning.code).toBeDefined();
        });
      }
    });

    it("should omit warnings field when no warnings exist", () => {
      const result = validateComposite(validComposite);

      if (result.success) {
        expect(result.warnings).toBeUndefined();
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings in required fields", () => {
      const invalid = {
        ...validComposite,
        id: "",
        name: "",
      };

      const result = validateComposite(invalid);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.path.includes("id"))).toBe(true);
      expect(result.errors.some((e) => e.path.includes("name"))).toBe(true);
    });

    it("should handle very large composite definitions", () => {
      const largeComposite = {
        ...validComposite,
        nodes: Array.from({ length: 1000 }, (_, i) => ({
          id: `node${i}`,
          type: "test",
          position: { x: i * 10, y: i * 10 },
          data: {},
        })),
        edges: Array.from({ length: 999 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i}.output`,
          target: `node${i + 1}.input`,
        })),
      };

      const result = validateComposite(largeComposite);

      // Should handle large data without issues
      expect(typeof result.success).toBe("boolean");
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should handle special characters in string fields", () => {
      const composite = {
        ...validComposite,
        id: "test-üñiçødé-💯",
        name: "Test with émojis 🎉 and speçial chars",
        description: "Contains\nnewlines\tand\ttabs",
      };

      const result = validateComposite(composite);

      // Should handle Unicode and special characters
      expect(typeof result.success).toBe("boolean");
    });
  });
});
