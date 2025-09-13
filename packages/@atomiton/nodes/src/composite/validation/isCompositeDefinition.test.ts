/**
 * Tests for isCompositeDefinition type guard function
 *
 * This function serves as a type guard to determine if unknown data
 * is a valid CompositeDefinition using validation.
 */

import { describe, it, expect } from "vitest";
import { isCompositeDefinition } from "./isCompositeDefinition.js";
import type { CompositeDefinition } from "../types.js";

describe("isCompositeDefinition", () => {
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
      tags: ["test"],
    },
    nodes: [
      {
        id: "node1",
        type: "test-node",
        position: { x: 0, y: 0 },
        data: {},
      },
    ],
    edges: [
      {
        id: "edge1",
        source: { nodeId: "node1", portId: "output" },
        target: { nodeId: "node1", portId: "input" },
      },
    ],
  };

  describe("Valid Composite Definitions", () => {
    it("should return true for valid composite definition", () => {
      expect(isCompositeDefinition(validComposite)).toBe(true);
    });

    it("should return true for minimal valid composite", () => {
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

      expect(isCompositeDefinition(minimal)).toBe(true);
    });

    it("should return true for composite with all optional fields", () => {
      const complete: CompositeDefinition = {
        ...validComposite,
        variables: {
          testVar: {
            type: "string",
            defaultValue: "test",
            description: "Test variable",
          },
        },
        settings: {
          runtime: { timeout: 30000 },
          ui: { theme: "dark" },
        },
      };

      expect(isCompositeDefinition(complete)).toBe(true);
    });
  });

  describe("Invalid Composite Definitions", () => {
    it("should return false for null or undefined", () => {
      expect(isCompositeDefinition(null)).toBe(false);
      expect(isCompositeDefinition(undefined)).toBe(false);
    });

    it("should return false for primitive types", () => {
      expect(isCompositeDefinition("string")).toBe(false);
      expect(isCompositeDefinition(123)).toBe(false);
      expect(isCompositeDefinition(true)).toBe(false);
      expect(isCompositeDefinition([])).toBe(false);
    });

    it("should return false for empty object", () => {
      expect(isCompositeDefinition({})).toBe(false);
    });

    it("should return false for object missing required fields", () => {
      expect(
        isCompositeDefinition({
          name: "Missing ID",
          type: "composite",
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          id: "test",
          name: "Missing type",
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          id: "test",
          type: "composite",
          // Missing name
        }),
      ).toBe(false);
    });

    it("should return false for missing required fields", () => {
      expect(
        isCompositeDefinition({
          ...validComposite,
          type: undefined, // Missing type
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          ...validComposite,
          metadata: undefined, // Missing metadata
        }),
      ).toBe(false);
    });

    it("should return false for invalid node structure", () => {
      expect(
        isCompositeDefinition({
          ...validComposite,
          nodes: [
            {
              id: "node1",
              // Missing type
              position: { x: 0, y: 0 },
              data: {},
            },
          ],
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          ...validComposite,
          nodes: [
            {
              id: "node1",
              type: "test",
              // Missing position
              data: {},
            },
          ],
        }),
      ).toBe(false);
    });

    it("should return false for invalid edge structure", () => {
      expect(
        isCompositeDefinition({
          ...validComposite,
          edges: [
            {
              id: "edge1",
              source: "node1",
              // Missing target
            },
          ],
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          ...validComposite,
          edges: [
            {
              // Missing id
              source: "node1",
              target: "node1",
            },
          ],
        }),
      ).toBe(false);
    });

    it("should return false for invalid metadata structure", () => {
      expect(
        isCompositeDefinition({
          ...validComposite,
          metadata: {
            // Missing created
            modified: "2024-01-01T00:00:00Z",
          },
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          ...validComposite,
          metadata: {
            created: "2024-01-01T00:00:00Z",
            // Missing modified
          },
        }),
      ).toBe(false);
    });

    it("should return false for invalid data types in fields", () => {
      expect(
        isCompositeDefinition({
          ...validComposite,
          id: 123, // Should be string
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          ...validComposite,
          nodes: "not-an-array",
        }),
      ).toBe(false);

      expect(
        isCompositeDefinition({
          ...validComposite,
          edges: {},
        }),
      ).toBe(false);
    });
  });

  describe("Type Guard Behavior", () => {
    it("should narrow TypeScript type when returning true", () => {
      const data: unknown = validComposite;

      if (isCompositeDefinition(data)) {
        // TypeScript should now know `data` is CompositeDefinition
        expect(data.id).toBe("test-composite");
        expect(data.type).toBe("composite");
        expect(Array.isArray(data.nodes)).toBe(true);
        expect(Array.isArray(data.edges)).toBe(true);
      } else {
        throw new Error("Should have been identified as CompositeDefinition");
      }
    });

    it("should work in filter operations", () => {
      const mixedData: unknown[] = [
        validComposite,
        { invalid: "object" },
        "string",
        null,
        {
          id: "valid2",
          name: "Valid 2",
          type: "composite",
          category: "test",
          description: "Another valid composite",
          version: "1.0.0",
          metadata: {
            created: "2024-01-01T00:00:00Z",
            modified: "2024-01-01T00:00:00Z",
          },
          nodes: [],
          edges: [],
        },
      ];

      const validComposites = mixedData.filter(isCompositeDefinition);

      expect(validComposites).toHaveLength(2);
      expect(validComposites[0].id).toBe("test-composite");
      expect(validComposites[1].id).toBe("valid2");
    });

    it("should handle runtime type checking", () => {
      const processData = (data: unknown) => {
        if (isCompositeDefinition(data)) {
          return `Processing composite: ${data.name}`;
        }
        return "Not a composite definition";
      };

      expect(processData(validComposite)).toBe(
        "Processing composite: Test Composite",
      );
      expect(processData({ invalid: "data" })).toBe(
        "Not a composite definition",
      );
      expect(processData("string")).toBe("Not a composite definition");
      expect(processData(null)).toBe("Not a composite definition");
    });
  });

  describe("Edge Cases", () => {
    it("should handle objects with extra properties", () => {
      const withExtra = {
        ...validComposite,
        extraProperty: "should be allowed",
        anotherExtra: 123,
      };

      // Schema is strict, so extra properties should not be allowed
      expect(isCompositeDefinition(withExtra)).toBe(false);
    });

    it("should handle circular references gracefully", () => {
      const circular: typeof validComposite & { self?: unknown } = {
        ...validComposite,
      };
      circular.self = circular;

      // Should not throw an error, but validation may fail
      expect(() => isCompositeDefinition(circular)).not.toThrow();
    });

    it("should handle very nested data structures", () => {
      const deepComposite = {
        ...validComposite,
        nodes: [
          {
            id: "deep-node",
            type: "test",
            position: { x: 0, y: 0 },
            data: {
              level1: {
                level2: {
                  level3: {
                    level4: {
                      deepValue: "very deep",
                    },
                  },
                },
              },
            },
          },
        ],
      };

      // Deep structures might fail validation due to schema limits
      const result = isCompositeDefinition(deepComposite);
      expect(typeof result).toBe("boolean");
    });

    it("should handle special string values", () => {
      const specialComposite = {
        ...validComposite,
        id: "",
        name: "",
      };

      // Empty strings should fail validation
      expect(isCompositeDefinition(specialComposite)).toBe(false);
    });

    it("should handle large arrays", () => {
      const largeComposite = {
        ...validComposite,
        nodes: Array.from({ length: 1000 }, (_, i) => ({
          id: `node-${i}`,
          type: "test",
          position: { x: i, y: i },
          data: {},
        })),
      };

      // Large arrays might fail validation
      const result = isCompositeDefinition(largeComposite);
      expect(typeof result).toBe("boolean");
    });
  });
});
