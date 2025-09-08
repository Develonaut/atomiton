import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEdges } from "./useEdges";

// Mock the store module
vi.mock("../store", () => ({
  editorStore: {
    addConnection: vi.fn(),
    updateConnection: vi.fn(),
    deleteConnection: vi.fn(),
    setConnections: vi.fn(),
    getConnections: vi.fn(() => []),
  },
}));

// Mock @atomiton/hooks
vi.mock("@atomiton/hooks", () => ({
  useEventCallback: vi.fn((fn) => fn),
}));

describe("useEdges", () => {
  it("should be a function", () => {
    expect(typeof useEdges).toBe("function");
  });

  it("should return an object when called", () => {
    const { result } = renderHook(() => useEdges());
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });

  it("should have the required properties", () => {
    const { result } = renderHook(() => useEdges());

    // Check that the properties exist
    expect(result.current).toHaveProperty("addEdge");
    expect(result.current).toHaveProperty("deleteEdge");
    expect(result.current).toHaveProperty("setEdges");
    expect(result.current).toHaveProperty("getEdges");
  });
});
