import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNodes } from "./useNodes";

// Mock the store module
vi.mock("../store", () => ({
  editorStore: {
    addElement: vi.fn(),
    updateElement: vi.fn(),
    deleteElement: vi.fn(),
    setElements: vi.fn(),
    getElements: vi.fn(() => []),
  },
}));

// Mock @atomiton/hooks
vi.mock("@atomiton/hooks", () => ({
  useEventCallback: vi.fn((fn) => fn),
}));

describe("useNodes", () => {
  it("should be a function", () => {
    expect(typeof useNodes).toBe("function");
  });

  it("should return an object when called", () => {
    const { result } = renderHook(() => useNodes());
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });

  it("should have the required properties", () => {
    const { result } = renderHook(() => useNodes());

    // Check that the properties exist
    expect(result.current).toHaveProperty("addNode");
    expect(result.current).toHaveProperty("updateNode");
    expect(result.current).toHaveProperty("deleteNode");
    expect(result.current).toHaveProperty("setNodes");
    expect(result.current).toHaveProperty("selectNode");
    expect(result.current).toHaveProperty("getNodes");
  });
});
