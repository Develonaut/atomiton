/**
 * useBlueprints Hook Tests
 *
 * Tests for the blueprints list hook used for catalog/gallery views
 * Covers store integration and data retrieval patterns
 */

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Blueprint } from "../types";
import { useBlueprints } from "./useBlueprints";

// Mock dependencies
vi.mock("@atomiton/store", () => ({
  useStore: vi.fn(),
}));

vi.mock("..", () => ({
  blueprintStore: {
    // Mock store methods if needed
    getState: vi.fn(),
    setState: vi.fn(),
    subscribe: vi.fn(),
  },
}));

vi.mock("../../selectors", () => ({
  selectBlueprints: vi.fn(),
  selectIsLoading: vi.fn(),
}));

import { useStore } from "@atomiton/store";
import { blueprintStore } from "..";
import { selectBlueprints, selectIsLoading } from "../selectors";

const mockUseStore = vi.mocked(useStore);
const mockSelectBlueprints = vi.mocked(selectBlueprints);
const mockSelectIsLoading = vi.mocked(selectIsLoading);

describe("useBlueprints Hook", () => {
  let mockBlueprints: Blueprint[];

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock blueprints
    mockBlueprints = [
      {
        id: "blueprint-1",
        name: "First Blueprint",
        metadata: {
          description: "First test blueprint",
          category: "examples",
          authorId: "user-1",
        },
        getChildNodes: () => [
          { id: "node-1", type: "input" },
          { id: "node-2", type: "output" },
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
          category: "data",
          authorId: "user-2",
        },
        getChildNodes: () => [{ id: "node-3", type: "process" }],
        getExecutionFlow: () => [],
      } as Blueprint,
      {
        id: "blueprint-3",
        name: "Third Blueprint",
        metadata: {
          description: "Third test blueprint",
          category: "advanced",
          authorId: "user-1",
        },
        getChildNodes: () => [],
        getExecutionFlow: () => [],
      } as Blueprint,
    ];

    // Setup default mock returns
    mockUseStore
      .mockReturnValueOnce(mockBlueprints) // blueprints
      .mockReturnValueOnce(false); // isLoading
  });

  describe("basic functionality", () => {
    it("should return blueprints and loading state", () => {
      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toBe(mockBlueprints);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.blueprints).toHaveLength(3);
    });

    it("should return empty array when no blueprints", () => {
      const emptyBlueprints: Blueprint[] = [];

      mockUseStore
        .mockReturnValueOnce(emptyBlueprints) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.blueprints).toHaveLength(0);
    });

    it("should return loading state correctly", () => {
      mockUseStore
        .mockReturnValueOnce([]) // blueprints
        .mockReturnValueOnce(true); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toEqual([]);
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("store integration", () => {
    it("should use correct selectors with store", () => {
      renderHook(() => useBlueprints());

      expect(mockUseStore).toHaveBeenCalledWith(
        blueprintStore,
        selectBlueprints,
      );
      expect(mockUseStore).toHaveBeenCalledWith(
        blueprintStore,
        selectIsLoading,
      );
      expect(mockUseStore).toHaveBeenCalledTimes(2);
    });

    it("should call selectors in correct order", () => {
      renderHook(() => useBlueprints());

      // Verify the sequence of useStore calls
      expect(mockUseStore).toHaveBeenNthCalledWith(
        1,
        blueprintStore,
        selectBlueprints,
      );
      expect(mockUseStore).toHaveBeenNthCalledWith(
        2,
        blueprintStore,
        selectIsLoading,
      );
    });

    it("should handle store updates correctly", () => {
      let blueprints = mockBlueprints;
      let isLoading = false;

      mockUseStore.mockImplementation((store, selector) => {
        if (selector === selectBlueprints) return blueprints;
        if (selector === selectIsLoading) return isLoading;
        return undefined;
      });

      const { result, rerender } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);

      // Simulate store update
      blueprints = [mockBlueprints[0]]; // Remove some blueprints
      isLoading = true;
      rerender();

      expect(result.current.blueprints).toHaveLength(1);
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("blueprint data handling", () => {
    it("should preserve blueprint object references", () => {
      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints[0]).toBe(mockBlueprints[0]);
      expect(result.current.blueprints[1]).toBe(mockBlueprints[1]);
      expect(result.current.blueprints[2]).toBe(mockBlueprints[2]);
    });

    it("should handle blueprints with different structures", () => {
      const mixedBlueprints = [
        {
          id: "simple-blueprint",
          name: "Simple Blueprint",
          metadata: { category: "simple" },
        } as Blueprint,
        {
          id: "complex-blueprint",
          name: "Complex Blueprint",
          metadata: {
            description: "A complex blueprint",
            category: "advanced",
            tags: ["complex", "advanced"],
            authorId: "expert-user",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-02T00:00:00Z",
          },
          getChildNodes: () => [
            { id: "node-1", type: "input", data: { label: "Input Node" } },
            { id: "node-2", type: "process", data: { operation: "transform" } },
          ],
          getExecutionFlow: () => [
            { id: "edge-1", source: "node-1", target: "node-2", type: "data" },
          ],
        } as Blueprint,
      ];

      mockUseStore
        .mockReturnValueOnce(mixedBlueprints) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toHaveLength(2);
      expect(result.current.blueprints[0].name).toBe("Simple Blueprint");
      expect(result.current.blueprints[1].name).toBe("Complex Blueprint");
    });

    it("should handle blueprints with missing optional properties", () => {
      const incompleteBlueprints = [
        {
          id: "minimal-blueprint",
          name: "Minimal Blueprint",
          // Missing metadata entirely
        } as Blueprint,
        {
          id: "partial-blueprint",
          name: "Partial Blueprint",
          metadata: {
            // Only some metadata fields
            category: "partial",
          },
          // Missing getChildNodes and getExecutionFlow
        } as Blueprint,
      ];

      mockUseStore
        .mockReturnValueOnce(incompleteBlueprints) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toHaveLength(2);
      expect(result.current.blueprints[0].id).toBe("minimal-blueprint");
      expect(result.current.blueprints[1].id).toBe("partial-blueprint");
    });
  });

  describe("loading states", () => {
    it("should handle loading state changes", () => {
      let isLoading = true;
      const blueprints: Blueprint[] = [];

      mockUseStore.mockImplementation((store, selector) => {
        if (selector === selectBlueprints) return blueprints;
        if (selector === selectIsLoading) return isLoading;
        return undefined;
      });

      const { result, rerender } = renderHook(() => useBlueprints());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.blueprints).toEqual([]);

      // Simulate loading completion
      isLoading = false;
      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.blueprints).toEqual([]);
    });

    it("should handle loading with data", () => {
      mockUseStore
        .mockReturnValueOnce(mockBlueprints) // blueprints
        .mockReturnValueOnce(true); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toHaveLength(3);
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle undefined blueprints from store", () => {
      mockUseStore
        .mockReturnValueOnce(undefined) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle null blueprints from store", () => {
      mockUseStore
        .mockReturnValueOnce(null) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle undefined loading state from store", () => {
      mockUseStore
        .mockReturnValueOnce([]) // blueprints
        .mockReturnValueOnce(undefined); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toEqual([]);
      expect(result.current.isLoading).toBeUndefined();
    });

    it("should handle very large arrays of blueprints", () => {
      const largeBlueprints = Array.from({ length: 1000 }, (_, index) => ({
        id: `blueprint-${index}`,
        name: `Blueprint ${index}`,
        metadata: {
          category: index % 2 === 0 ? "even" : "odd",
          authorId: `user-${index % 10}`,
        },
      })) as Blueprint[];

      mockUseStore
        .mockReturnValueOnce(largeBlueprints) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toHaveLength(1000);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.blueprints[0].name).toBe("Blueprint 0");
      expect(result.current.blueprints[999].name).toBe("Blueprint 999");
    });
  });

  describe("performance considerations", () => {
    it("should not cause unnecessary re-renders when data does not change", () => {
      const { result, rerender } = renderHook(() => useBlueprints());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      // If the underlying store data hasn't changed, the references should be the same
      expect(firstResult.blueprints).toBe(secondResult.blueprints);
      expect(firstResult.isLoading).toBe(secondResult.isLoading);
    });

    it("should handle rapid state changes gracefully", () => {
      let callCount = 0;
      const states = [
        { blueprints: [], isLoading: true },
        { blueprints: [mockBlueprints[0]], isLoading: true },
        { blueprints: mockBlueprints.slice(0, 2), isLoading: true },
        { blueprints: mockBlueprints, isLoading: false },
      ];

      mockUseStore.mockImplementation((store, selector) => {
        const state = states[Math.min(callCount, states.length - 1)];
        callCount++;
        if (selector === selectBlueprints) return state.blueprints;
        if (selector === selectIsLoading) return state.isLoading;
        return undefined;
      });

      const { result, rerender } = renderHook(() => useBlueprints());

      expect(result.current.blueprints).toEqual([]);
      expect(result.current.isLoading).toBe(true);

      rerender();
      expect(result.current.blueprints).toHaveLength(1);

      rerender();
      expect(result.current.blueprints).toHaveLength(2);

      rerender();
      expect(result.current.blueprints).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("type safety", () => {
    it("should maintain correct return type structure", () => {
      const { result } = renderHook(() => useBlueprints());

      // Verify return type structure
      expect(result.current).toHaveProperty("blueprints");
      expect(result.current).toHaveProperty("isLoading");

      // Verify property types
      expect(
        Array.isArray(result.current.blueprints) ||
          result.current.blueprints === undefined ||
          result.current.blueprints === null,
      ).toBe(true);
      expect(
        typeof result.current.isLoading === "boolean" ||
          result.current.isLoading === undefined,
      ).toBe(true);

      // Verify it only returns the expected properties
      const keys = Object.keys(result.current);
      expect(keys).toEqual(["blueprints", "isLoading"]);
    });

    it("should handle typescript blueprint type constraints", () => {
      const typedBlueprints: Blueprint[] = mockBlueprints;

      mockUseStore
        .mockReturnValueOnce(typedBlueprints) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      // TypeScript should ensure these properties exist
      result.current.blueprints.forEach((blueprint) => {
        expect(typeof blueprint.id).toBe("string");
        expect(typeof blueprint.name).toBe("string");
        expect(blueprint.metadata).toBeDefined();
      });
    });
  });

  describe("hook stability", () => {
    it("should provide stable hook behavior across multiple renders", () => {
      const { result, rerender } = renderHook(() => useBlueprints());

      const initialResult = { ...result.current };

      // Multiple re-renders
      for (let i = 0; i < 5; i++) {
        rerender();
      }

      // Should maintain consistency
      expect(result.current.blueprints).toBe(initialResult.blueprints);
      expect(result.current.isLoading).toBe(initialResult.isLoading);
    });

    it("should work correctly with multiple hook instances", () => {
      const { result: result1 } = renderHook(() => useBlueprints());
      const { result: result2 } = renderHook(() => useBlueprints());

      // Both hooks should return the same data
      expect(result1.current.blueprints).toBe(result2.current.blueprints);
      expect(result1.current.isLoading).toBe(result2.current.isLoading);
    });
  });

  describe("real-world usage scenarios", () => {
    it("should support catalog/gallery view use case", () => {
      const catalogBlueprints = [
        {
          id: "hello-world",
          name: "Hello World",
          metadata: {
            description: "A simple hello world example",
            category: "examples",
            tags: ["beginner", "example"],
            authorId: "system",
          },
        } as Blueprint,
        {
          id: "data-processor",
          name: "Data Processor",
          metadata: {
            description: "Process and transform data",
            category: "data",
            tags: ["intermediate", "data"],
            authorId: "expert-user",
          },
        } as Blueprint,
      ];

      mockUseStore
        .mockReturnValueOnce(catalogBlueprints) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      // Perfect for rendering in a catalog/gallery
      expect(result.current.blueprints).toHaveLength(2);

      const blueprintCards = result.current.blueprints.map((bp) => ({
        id: bp.id,
        title: bp.name,
        description: bp.metadata?.description,
        category: bp.metadata?.category,
        tags: bp.metadata?.tags,
      }));

      expect(blueprintCards[0]).toEqual({
        id: "hello-world",
        title: "Hello World",
        description: "A simple hello world example",
        category: "examples",
        tags: ["beginner", "example"],
      });
    });

    it("should handle homepage blueprint display scenario", () => {
      mockUseStore
        .mockReturnValueOnce(mockBlueprints) // blueprints
        .mockReturnValueOnce(false); // isLoading

      const { result } = renderHook(() => useBlueprints());

      // Simulate homepage filtering for recent/featured blueprints
      const recentBlueprints = result.current.blueprints.slice(0, 6); // First 6 for homepage
      expect(recentBlueprints).toHaveLength(3); // We only have 3 mock blueprints

      // Should provide enough data for homepage preview cards
      recentBlueprints.forEach((blueprint) => {
        expect(blueprint.id).toBeDefined();
        expect(blueprint.name).toBeDefined();
        expect(blueprint.metadata).toBeDefined();
      });
    });
  });
});
