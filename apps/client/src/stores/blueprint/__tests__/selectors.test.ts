/**
 * Blueprint Selectors Tests
 *
 * Tests for all blueprint store selectors
 * Covers state selection, blueprint filtering, and data extraction
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  selectBlueprints,
  selectIsLoading,
  selectError,
  selectBlueprintById,
  selectBlueprintNodesAndEdges,
} from "../selectors";
import type { Blueprint, BlueprintState } from "../types";

describe("Blueprint Selectors", () => {
  let mockState: BlueprintState;
  let mockBlueprints: Blueprint[];

  beforeEach(() => {
    // Create mock blueprints
    mockBlueprints = [
      {
        id: "blueprint-1",
        name: "First Blueprint",
        metadata: {
          description: "First test blueprint",
          category: "test",
        },
        getChildNodes: () => [
          { id: "node-1", type: "input", position: { x: 0, y: 0 } },
          { id: "node-2", type: "output", position: { x: 100, y: 100 } },
        ],
        getExecutionFlow: () => [
          { id: "edge-1", source: "node-1", target: "node-2" },
        ],
      } as Blueprint,
      {
        id: "blueprint-2",
        name: "Second Blueprint",
        metadata: {
          description: "Second test blueprint",
          category: "examples",
        },
        getChildNodes: () => [
          { id: "node-3", type: "process", position: { x: 50, y: 50 } },
        ],
        getExecutionFlow: () => [],
      } as Blueprint,
      {
        id: "blueprint-3",
        name: "Third Blueprint",
        metadata: {
          description: "Third test blueprint",
          category: "advanced",
        },
        // Missing getChildNodes and getExecutionFlow methods to test edge case
      } as Blueprint,
    ];

    // Create mock state
    mockState = {
      blueprints: mockBlueprints,
      isLoading: false,
      isDirty: true,
      error: null,
    };
  });

  describe("selectBlueprints", () => {
    it("should return all blueprints from state", () => {
      const result = selectBlueprints(mockState);

      expect(result).toBe(mockBlueprints);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("blueprint-1");
      expect(result[1].id).toBe("blueprint-2");
      expect(result[2].id).toBe("blueprint-3");
    });

    it("should return empty array when no blueprints", () => {
      const emptyState: BlueprintState = {
        ...mockState,
        blueprints: [],
      };

      const result = selectBlueprints(emptyState);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle state with undefined blueprints gracefully", () => {
      const invalidState = {
        ...mockState,
        blueprints: undefined as any,
      };

      const result = selectBlueprints(invalidState);

      expect(result).toBeUndefined();
    });
  });

  describe("selectIsLoading", () => {
    it("should return loading state when false", () => {
      const result = selectIsLoading(mockState);

      expect(result).toBe(false);
    });

    it("should return loading state when true", () => {
      const loadingState: BlueprintState = {
        ...mockState,
        isLoading: true,
      };

      const result = selectIsLoading(loadingState);

      expect(result).toBe(true);
    });

    it("should handle undefined loading state", () => {
      const invalidState = {
        ...mockState,
        isLoading: undefined as any,
      };

      const result = selectIsLoading(invalidState);

      expect(result).toBeUndefined();
    });
  });

  describe("selectError", () => {
    it("should return null when no error", () => {
      const result = selectError(mockState);

      expect(result).toBeNull();
    });

    it("should return error message when present", () => {
      const errorState: BlueprintState = {
        ...mockState,
        error: "Something went wrong",
      };

      const result = selectError(errorState);

      expect(result).toBe("Something went wrong");
    });

    it("should return empty string error", () => {
      const errorState: BlueprintState = {
        ...mockState,
        error: "",
      };

      const result = selectError(errorState);

      expect(result).toBe("");
    });
  });

  describe("selectBlueprintById", () => {
    it("should return blueprint when ID exists", () => {
      const selector = selectBlueprintById("blueprint-2");
      const result = selector(mockState);

      expect(result).toBeDefined();
      expect(result?.id).toBe("blueprint-2");
      expect(result?.name).toBe("Second Blueprint");
      expect(result?.metadata?.category).toBe("examples");
    });

    it("should return undefined when ID does not exist", () => {
      const selector = selectBlueprintById("non-existent-id");
      const result = selector(mockState);

      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const selector = selectBlueprintById(undefined);
      const result = selector(mockState);

      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is empty string", () => {
      const selector = selectBlueprintById("");
      const result = selector(mockState);

      expect(result).toBeUndefined();
    });

    it("should handle case-sensitive ID matching", () => {
      const selector = selectBlueprintById("BLUEPRINT-1");
      const result = selector(mockState);

      expect(result).toBeUndefined();
    });

    it("should return first match when multiple blueprints have same ID", () => {
      const duplicateBlueprints: Blueprint[] = [
        ...mockBlueprints,
        {
          id: "blueprint-1", // Duplicate ID
          name: "Duplicate Blueprint",
          metadata: { description: "Duplicate", category: "duplicate" },
        } as Blueprint,
      ];

      const stateWithDuplicates: BlueprintState = {
        ...mockState,
        blueprints: duplicateBlueprints,
      };

      const selector = selectBlueprintById("blueprint-1");
      const result = selector(stateWithDuplicates);

      expect(result?.name).toBe("First Blueprint"); // Should return first match
    });

    it("should handle empty blueprints array", () => {
      const emptyState: BlueprintState = {
        ...mockState,
        blueprints: [],
      };

      const selector = selectBlueprintById("blueprint-1");
      const result = selector(emptyState);

      expect(result).toBeUndefined();
    });
  });

  describe("selectBlueprintNodesAndEdges", () => {
    it("should return nodes and edges when blueprint has methods", () => {
      const blueprint = mockBlueprints[0]; // First blueprint with nodes and edges

      const result = selectBlueprintNodesAndEdges(blueprint);

      expect(result).toEqual({
        nodes: [
          { id: "node-1", type: "input", position: { x: 0, y: 0 } },
          { id: "node-2", type: "output", position: { x: 100, y: 100 } },
        ],
        edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
      });
    });

    it("should return empty arrays when blueprint methods return empty arrays", () => {
      const blueprint = mockBlueprints[1]; // Second blueprint with empty edges

      const result = selectBlueprintNodesAndEdges(blueprint);

      expect(result).toEqual({
        nodes: [{ id: "node-3", type: "process", position: { x: 50, y: 50 } }],
        edges: [],
      });
    });

    it("should return empty arrays when blueprint is undefined", () => {
      const result = selectBlueprintNodesAndEdges(undefined);

      expect(result).toEqual({
        nodes: [],
        edges: [],
      });
    });

    it("should return empty arrays when blueprint is null", () => {
      const result = selectBlueprintNodesAndEdges(null as any);

      expect(result).toEqual({
        nodes: [],
        edges: [],
      });
    });

    it("should return empty arrays when blueprint methods are missing", () => {
      const blueprint = mockBlueprints[2]; // Third blueprint without methods

      const result = selectBlueprintNodesAndEdges(blueprint);

      expect(result).toEqual({
        nodes: [],
        edges: [],
      });
    });

    it("should handle blueprint with only getChildNodes method", () => {
      const blueprint = {
        id: "partial-blueprint",
        name: "Partial Blueprint",
        getChildNodes: () => [{ id: "node-1", type: "input" }],
        // Missing getExecutionFlow method
      } as Blueprint;

      const result = selectBlueprintNodesAndEdges(blueprint);

      expect(result).toEqual({
        nodes: [{ id: "node-1", type: "input" }],
        edges: [],
      });
    });

    it("should handle blueprint with only getExecutionFlow method", () => {
      const blueprint = {
        id: "partial-blueprint",
        name: "Partial Blueprint",
        getExecutionFlow: () => [
          { id: "edge-1", source: "node-1", target: "node-2" },
        ],
        // Missing getChildNodes method
      } as Blueprint;

      const result = selectBlueprintNodesAndEdges(blueprint);

      expect(result).toEqual({
        nodes: [],
        edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
      });
    });

    it("should handle methods that throw errors gracefully", () => {
      const blueprint = {
        id: "error-blueprint",
        name: "Error Blueprint",
        getChildNodes: () => {
          throw new Error("Node retrieval failed");
        },
        getExecutionFlow: () => {
          throw new Error("Edge retrieval failed");
        },
      } as Blueprint;

      expect(() => {
        selectBlueprintNodesAndEdges(blueprint);
      }).toThrow();
    });

    it("should handle methods returning null or undefined", () => {
      const blueprint = {
        id: "null-blueprint",
        name: "Null Blueprint",
        getChildNodes: () => null as any,
        getExecutionFlow: () => undefined as any,
      } as Blueprint;

      const result = selectBlueprintNodesAndEdges(blueprint);

      expect(result).toEqual({
        nodes: null,
        edges: undefined,
      });
    });

    it("should preserve reference equality for same blueprint", () => {
      const blueprint = mockBlueprints[0];

      const result1 = selectBlueprintNodesAndEdges(blueprint);
      const result2 = selectBlueprintNodesAndEdges(blueprint);

      // Results should be equal but not necessarily the same reference
      expect(result1).toEqual(result2);
    });
  });

  describe("selector composition", () => {
    it("should work with composed selectors", () => {
      const getFirstBlueprintNodes = (state: BlueprintState) => {
        const blueprints = selectBlueprints(state);
        const firstBlueprint = blueprints?.[0];
        return selectBlueprintNodesAndEdges(firstBlueprint);
      };

      const result = getFirstBlueprintNodes(mockState);

      expect(result).toEqual({
        nodes: [
          { id: "node-1", type: "input", position: { x: 0, y: 0 } },
          { id: "node-2", type: "output", position: { x: 100, y: 100 } },
        ],
        edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
      });
    });

    it("should work with curried selector followed by nodes/edges selector", () => {
      const getBlueprintNodesById = (id: string) => (state: BlueprintState) => {
        const blueprint = selectBlueprintById(id)(state);
        return selectBlueprintNodesAndEdges(blueprint);
      };

      const selector = getBlueprintNodesById("blueprint-1");
      const result = selector(mockState);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });
  });

  describe("edge cases", () => {
    it("should handle state with missing properties", () => {
      const incompleteState = {} as BlueprintState;

      expect(selectBlueprints(incompleteState)).toBeUndefined();
      expect(selectIsLoading(incompleteState)).toBeUndefined();
      expect(selectError(incompleteState)).toBeUndefined();
    });

    it("should handle malformed blueprint objects", () => {
      const malformedBlueprints = [
        null,
        undefined,
        {},
        { id: null },
        { id: "valid-id", name: null },
      ] as Blueprint[];

      const malformedState: BlueprintState = {
        ...mockState,
        blueprints: malformedBlueprints,
      };

      const selector = selectBlueprintById("valid-id");
      const result = selector(malformedState);

      expect(result).toBeDefined();
      expect(result?.id).toBe("valid-id");
    });

    it("should handle very large blueprints array", () => {
      const largeBlueprintArray = Array.from({ length: 10000 }, (_, index) => ({
        id: `blueprint-${index}`,
        name: `Blueprint ${index}`,
        metadata: { category: "test" },
      })) as Blueprint[];

      const largeState: BlueprintState = {
        ...mockState,
        blueprints: largeBlueprintArray,
      };

      // Should still work efficiently for large arrays
      const selector = selectBlueprintById("blueprint-5000");
      const result = selector(largeState);

      expect(result).toBeDefined();
      expect(result?.id).toBe("blueprint-5000");
    });
  });
});
