/**
 * useBlueprint Hook Tests
 *
 * Tests for the main blueprint hook that handles loading, saving, and providing blueprint data
 * Covers React hook behavior, store integration, and side effects
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Blueprint } from "../types";
import { useBlueprint } from "./useBlueprint";

// Mock dependencies
vi.mock("@atomiton/store", () => ({
  useStore: vi.fn(),
}));

vi.mock("..", () => ({
  blueprintStore: {
    loadBlueprint: vi.fn(),
    saveBlueprint: vi.fn(),
  },
}));

vi.mock("../selectors", () => ({
  selectBlueprintById: vi.fn(),
  selectBlueprintNodesAndEdges: vi.fn(),
  selectError: vi.fn(),
  selectIsLoading: vi.fn(),
}));

import { useStore } from "@atomiton/store";
import { blueprintStore } from "..";
import {
  selectBlueprintById,
  selectBlueprintNodesAndEdges,
  selectError,
  selectIsLoading,
} from "../selectors";

const mockUseStore = vi.mocked(useStore);
const mockBlueprintStore = vi.mocked(blueprintStore);
const mockSelectBlueprintById = vi.mocked(selectBlueprintById);
const mockSelectBlueprintNodesAndEdges = vi.mocked(
  selectBlueprintNodesAndEdges,
);
const mockSelectError = vi.mocked(selectError);
const mockSelectIsLoading = vi.mocked(selectIsLoading);

describe("useBlueprint Hook", () => {
  let mockBlueprint: Blueprint;
  let mockNodes: any[];
  let mockEdges: any[];

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock data
    mockBlueprint = {
      id: "test-blueprint-id",
      name: "Test Blueprint",
      metadata: {
        description: "Test description",
        category: "test",
      },
      getChildNodes: () => mockNodes,
      getExecutionFlow: () => mockEdges,
    } as Blueprint;

    mockNodes = [
      { id: "node-1", type: "input", position: { x: 0, y: 0 } },
      { id: "node-2", type: "output", position: { x: 100, y: 100 } },
    ];

    mockEdges = [{ id: "edge-1", source: "node-1", target: "node-2" }];

    // Setup default selector returns
    mockSelectBlueprintNodesAndEdges.mockReturnValue({
      nodes: mockNodes,
      edges: mockEdges,
    });

    // Setup default useStore returns
    mockUseStore
      .mockReturnValueOnce(mockBlueprint) // blueprint
      .mockReturnValueOnce(false) // isLoading
      .mockReturnValueOnce(null); // error
  });

  describe("basic functionality", () => {
    it("should return initial values when no ID provided", () => {
      mockUseStore
        .mockReturnValueOnce(undefined) // blueprint
        .mockReturnValueOnce(false) // isLoading
        .mockReturnValueOnce(null); // error

      mockSelectBlueprintNodesAndEdges.mockReturnValue({
        nodes: [],
        edges: [],
      });

      const { result } = renderHook(() => useBlueprint());

      expect(result.current.blueprint).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.initialNodes).toEqual([]);
      expect(result.current.initialEdges).toEqual([]);
      expect(typeof result.current.onSave).toBe("function");
    });

    it("should return blueprint data when ID provided", () => {
      const { result } = renderHook(() => useBlueprint("test-blueprint-id"));

      expect(result.current.blueprint).toBe(mockBlueprint);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.initialNodes).toEqual(mockNodes);
      expect(result.current.initialEdges).toEqual(mockEdges);
      expect(typeof result.current.onSave).toBe("function");
    });

    it("should call loadBlueprint when ID provided", () => {
      renderHook(() => useBlueprint("test-blueprint-id"));

      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledWith(
        "test-blueprint-id",
      );
      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledTimes(1);
    });

    it("should not call loadBlueprint when no ID provided", () => {
      renderHook(() => useBlueprint());

      expect(mockBlueprintStore.loadBlueprint).not.toHaveBeenCalled();
    });

    it("should not call loadBlueprint when ID is empty string", () => {
      renderHook(() => useBlueprint(""));

      expect(mockBlueprintStore.loadBlueprint).not.toHaveBeenCalled();
    });
  });

  describe("store integration", () => {
    it("should use correct selectors with store", () => {
      renderHook(() => useBlueprint("test-id"));

      expect(mockSelectBlueprintById).toHaveBeenCalledWith("test-id");
      expect(mockUseStore).toHaveBeenCalledWith(
        mockBlueprintStore,
        expect.any(Function),
      );
      expect(mockUseStore).toHaveBeenCalledWith(
        mockBlueprintStore,
        mockSelectIsLoading,
      );
      expect(mockUseStore).toHaveBeenCalledWith(
        mockBlueprintStore,
        mockSelectError,
      );
    });

    it("should call selectBlueprintNodesAndEdges with blueprint", () => {
      renderHook(() => useBlueprint("test-id"));

      expect(mockSelectBlueprintNodesAndEdges).toHaveBeenCalledWith(
        mockBlueprint,
      );
    });

    it("should handle undefined blueprint from selector", () => {
      mockUseStore
        .mockReturnValueOnce(undefined) // blueprint
        .mockReturnValueOnce(false) // isLoading
        .mockReturnValueOnce(null); // error

      mockSelectBlueprintNodesAndEdges.mockReturnValue({
        nodes: [],
        edges: [],
      });

      const { result } = renderHook(() => useBlueprint("non-existent-id"));

      expect(result.current.blueprint).toBeUndefined();
      expect(result.current.initialNodes).toEqual([]);
      expect(result.current.initialEdges).toEqual([]);
    });
  });

  describe("loading states", () => {
    it("should return loading state correctly", () => {
      mockUseStore
        .mockReturnValueOnce(undefined) // blueprint
        .mockReturnValueOnce(true) // isLoading
        .mockReturnValueOnce(null); // error

      const { result } = renderHook(() => useBlueprint("loading-id"));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.blueprint).toBeUndefined();
    });

    it("should handle loading state changes", () => {
      let isLoading = true;
      mockUseStore.mockImplementation((store, selector) => {
        if (selector === mockSelectIsLoading) return isLoading;
        if (selector === mockSelectError) return null;
        return mockBlueprint;
      });

      const { result, rerender } = renderHook(() => useBlueprint("test-id"));

      expect(result.current.isLoading).toBe(true);

      // Simulate loading completion
      isLoading = false;
      rerender();

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should return error state correctly", () => {
      const errorMessage = "Failed to load blueprint";

      mockUseStore
        .mockReturnValueOnce(undefined) // blueprint
        .mockReturnValueOnce(false) // isLoading
        .mockReturnValueOnce(errorMessage); // error

      const { result } = renderHook(() => useBlueprint("error-id"));

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.blueprint).toBeUndefined();
    });

    it("should handle error state changes", () => {
      let error: string | null = "Initial error";

      mockUseStore.mockImplementation((store, selector) => {
        if (selector === mockSelectError) return error;
        if (selector === mockSelectIsLoading) return false;
        return mockBlueprint;
      });

      const { result, rerender } = renderHook(() => useBlueprint("test-id"));

      expect(result.current.error).toBe("Initial error");

      // Simulate error clearing
      error = null;
      rerender();

      expect(result.current.error).toBeNull();
    });
  });

  describe("onSave callback", () => {
    it("should call saveBlueprint with correct parameters", () => {
      const { result } = renderHook(() => useBlueprint("test-id"));

      const flowData = {
        nodes: [{ id: "new-node" }],
        edges: [{ id: "new-edge" }],
        variables: { var1: "value1" },
      };

      act(() => {
        result.current.onSave(flowData);
      });

      expect(mockBlueprintStore.saveBlueprint).toHaveBeenCalledWith(
        "test-id",
        flowData,
      );
      expect(mockBlueprintStore.saveBlueprint).toHaveBeenCalledTimes(1);
    });

    it("should call saveBlueprint with undefined ID when no ID provided to hook", () => {
      const { result } = renderHook(() => useBlueprint());

      const flowData = { nodes: [], edges: [] };

      act(() => {
        result.current.onSave(flowData);
      });

      expect(mockBlueprintStore.saveBlueprint).toHaveBeenCalledWith(
        undefined,
        flowData,
      );
    });

    it("should preserve onSave callback reference when ID does not change", () => {
      const { result, rerender } = renderHook(() => useBlueprint("test-id"));

      const firstCallback = result.current.onSave;

      rerender();

      const secondCallback = result.current.onSave;

      expect(firstCallback).toBe(secondCallback);
    });

    it("should create new onSave callback when ID changes", () => {
      const { result, rerender } = renderHook(({ id }) => useBlueprint(id), {
        initialProps: { id: "test-id-1" },
      });

      const firstCallback = result.current.onSave;

      rerender({ id: "test-id-2" });

      const secondCallback = result.current.onSave;

      expect(firstCallback).not.toBe(secondCallback);
    });

    it("should handle complex flow data in onSave", () => {
      const { result } = renderHook(() => useBlueprint("complex-id"));

      const complexFlowData = {
        name: "Complex Blueprint",
        description: "A complex blueprint with many features",
        nodes: [
          { id: "node-1", type: "input", data: { label: "Input" } },
          { id: "node-2", type: "process", data: { operation: "transform" } },
          { id: "node-3", type: "output", data: { label: "Output" } },
        ],
        edges: [
          { id: "edge-1", source: "node-1", target: "node-2", type: "data" },
          { id: "edge-2", source: "node-2", target: "node-3", type: "data" },
        ],
        variables: {
          inputVar: "default input",
          processingMode: "batch",
          outputFormat: "json",
        },
        settings: {
          autoSave: true,
          validation: { enabled: true, strict: false },
          performance: { caching: true, parallel: false },
        },
      };

      act(() => {
        result.current.onSave(complexFlowData);
      });

      expect(mockBlueprintStore.saveBlueprint).toHaveBeenCalledWith(
        "complex-id",
        complexFlowData,
      );
    });
  });

  describe("useEffect behavior", () => {
    it("should load blueprint when ID changes", () => {
      const { rerender } = renderHook(({ id }) => useBlueprint(id), {
        initialProps: { id: "initial-id" },
      });

      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledWith(
        "initial-id",
      );

      mockBlueprintStore.loadBlueprint.mockClear();

      rerender({ id: "new-id" });

      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledWith("new-id");
    });

    it("should not reload blueprint when ID remains same", () => {
      const { rerender } = renderHook(() => useBlueprint("same-id"));

      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledTimes(1);

      mockBlueprintStore.loadBlueprint.mockClear();

      rerender();

      expect(mockBlueprintStore.loadBlueprint).not.toHaveBeenCalled();
    });

    it("should handle ID changing from defined to undefined", () => {
      const { rerender } = renderHook(({ id }) => useBlueprint(id), {
        initialProps: { id: "initial-id" },
      });

      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledWith(
        "initial-id",
      );

      mockBlueprintStore.loadBlueprint.mockClear();

      rerender({ id: undefined });

      expect(mockBlueprintStore.loadBlueprint).not.toHaveBeenCalled();
    });

    it("should handle ID changing from undefined to defined", () => {
      const { rerender } = renderHook(({ id }) => useBlueprint(id), {
        initialProps: { id: undefined },
      });

      expect(mockBlueprintStore.loadBlueprint).not.toHaveBeenCalled();

      rerender({ id: "new-id" });

      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledWith("new-id");
    });
  });

  describe("nodes and edges extraction", () => {
    it("should handle blueprint with nodes and edges", () => {
      const nodesAndEdges = {
        nodes: [{ id: "node-1" }, { id: "node-2" }],
        edges: [{ id: "edge-1" }],
      };

      mockSelectBlueprintNodesAndEdges.mockReturnValue(nodesAndEdges);

      const { result } = renderHook(() => useBlueprint("test-id"));

      expect(result.current.initialNodes).toEqual(nodesAndEdges.nodes);
      expect(result.current.initialEdges).toEqual(nodesAndEdges.edges);
    });

    it("should handle empty nodes and edges", () => {
      mockSelectBlueprintNodesAndEdges.mockReturnValue({
        nodes: [],
        edges: [],
      });

      const { result } = renderHook(() => useBlueprint("empty-id"));

      expect(result.current.initialNodes).toEqual([]);
      expect(result.current.initialEdges).toEqual([]);
    });

    it("should handle nodes and edges extraction error gracefully", () => {
      mockSelectBlueprintNodesAndEdges.mockImplementation(() => {
        throw new Error("Failed to extract nodes and edges");
      });

      expect(() => {
        renderHook(() => useBlueprint("error-id"));
      }).toThrow("Failed to extract nodes and edges");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete loading lifecycle", async () => {
      // Start with loading state
      let blueprint: Blueprint | undefined = undefined;
      let isLoading = true;
      let error: string | null = null;

      mockUseStore.mockImplementation((store, selector) => {
        if (selector === mockSelectIsLoading) return isLoading;
        if (selector === mockSelectError) return error;
        return blueprint;
      });

      const { result, rerender } = renderHook(() =>
        useBlueprint("lifecycle-id"),
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.blueprint).toBeUndefined();

      // Loading completes successfully
      blueprint = mockBlueprint;
      isLoading = false;
      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.blueprint).toBe(mockBlueprint);
      expect(result.current.error).toBeNull();
    });

    it("should handle error during loading", () => {
      let blueprint: Blueprint | undefined = undefined;
      let isLoading = false;
      let error: string | null = "Blueprint not found";

      mockUseStore.mockImplementation((store, selector) => {
        if (selector === mockSelectIsLoading) return isLoading;
        if (selector === mockSelectError) return error;
        return blueprint;
      });

      const { result } = renderHook(() => useBlueprint("error-id"));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.blueprint).toBeUndefined();
      expect(result.current.error).toBe("Blueprint not found");
    });

    it("should handle multiple hook instances with different IDs", () => {
      const { result: result1 } = renderHook(() => useBlueprint("id-1"));
      const { result: result2 } = renderHook(() => useBlueprint("id-2"));

      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledWith("id-1");
      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledWith("id-2");
      expect(mockBlueprintStore.loadBlueprint).toHaveBeenCalledTimes(2);

      // Each hook should have its own onSave callback
      expect(result1.current.onSave).not.toBe(result2.current.onSave);
    });
  });

  describe("type safety", () => {
    it("should maintain correct return type structure", () => {
      const { result } = renderHook(() => useBlueprint("test-id"));

      // Verify all expected properties exist with correct types
      expect(typeof result.current.blueprint).toBe("object");
      expect(typeof result.current.isLoading).toBe("boolean");
      expect(
        result.current.error === null ||
          typeof result.current.error === "string",
      ).toBe(true);
      expect(Array.isArray(result.current.initialNodes)).toBe(true);
      expect(Array.isArray(result.current.initialEdges)).toBe(true);
      expect(typeof result.current.onSave).toBe("function");
    });
  });
});
