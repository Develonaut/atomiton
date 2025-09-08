import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUndoRedo } from "./useUndoRedo";

// Mock the store module
vi.mock("../store", () => ({
  editorStore: {
    getState: vi.fn(() => ({
      canUndo: false,
      canRedo: false,
    })),
    subscribe: vi.fn(() => vi.fn()),
    undo: vi.fn(),
    redo: vi.fn(),
  },
}));

// Mock @atomiton/hooks
vi.mock("@atomiton/hooks", () => ({
  useDidMount: vi.fn(),
  useEventCallback: vi.fn((fn) => fn),
}));

describe("useUndoRedo", () => {
  it("should be a function", () => {
    expect(typeof useUndoRedo).toBe("function");
  });

  it("should return an object when called", () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });

  it("should have the required properties", () => {
    const { result } = renderHook(() => useUndoRedo());

    // Check that the properties exist
    expect(result.current).toHaveProperty("canUndo");
    expect(result.current).toHaveProperty("canRedo");
    expect(result.current).toHaveProperty("undo");
    expect(result.current).toHaveProperty("redo");
  });

  it("should initialize with boolean state values", () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(typeof result.current.canUndo).toBe("boolean");
    expect(typeof result.current.canRedo).toBe("boolean");
  });
});
