import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useZoom } from "./useZoom";

// Mock the store module
vi.mock("../store", () => ({
  editorStore: {
    getState: vi.fn(() => ({ zoom: 100 })),
    subscribe: vi.fn(() => vi.fn()),
    getFlowInstance: vi.fn(() => null),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomTo: vi.fn(),
    fitView: vi.fn(),
    setZoom: vi.fn(),
  },
}));

// Mock @atomiton/hooks
vi.mock("@atomiton/hooks", () => ({
  useEventCallback: vi.fn((fn) => fn),
}));

describe("useZoom", () => {
  it("should be a function", () => {
    expect(typeof useZoom).toBe("function");
  });

  it("should return an object when called", () => {
    const { result } = renderHook(() => useZoom());
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });

  it("should have the required properties", () => {
    const { result } = renderHook(() => useZoom());

    // Check that the properties exist
    expect(result.current).toHaveProperty("zoom");
    expect(result.current).toHaveProperty("zoomIn");
    expect(result.current).toHaveProperty("zoomOut");
    expect(result.current).toHaveProperty("zoomTo");
    expect(result.current).toHaveProperty("fitView");
  });

  it("should initialize with zoom value from store", () => {
    const { result } = renderHook(() => useZoom());
    expect(typeof result.current.zoom).toBe("number");
  });
});
