import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCanvas } from "./useCanvas";

// Mock the store module
vi.mock("../store", () => ({
  editorStore: {
    setFlowInstance: vi.fn(),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
  },
}));

// Mock @atomiton/hooks
vi.mock("@atomiton/hooks", () => ({
  useEventCallback: vi.fn((fn) => fn),
}));

describe("useCanvas", () => {
  it("should be a function", () => {
    expect(typeof useCanvas).toBe("function");
  });

  it("should return an object when called", () => {
    const { result } = renderHook(() => useCanvas());
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });

  it("should have the required properties", () => {
    const { result } = renderHook(() => useCanvas());

    // Check that the properties exist
    expect(result.current).toHaveProperty("onCanvasInit");
    expect(result.current).toHaveProperty("defaultNodes");
    expect(result.current).toHaveProperty("defaultEdges");
  });

  it("should return proper data types", () => {
    const { result } = renderHook(() => useCanvas());

    expect(typeof result.current.onCanvasInit).toBe("function");
    expect(Array.isArray(result.current.defaultNodes)).toBe(true);
    expect(Array.isArray(result.current.defaultEdges)).toBe(true);
  });
});
