import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAnimationSettings } from "./useAnimationSettings";

// Mock the store module
vi.mock("../store", () => ({
  editorStore: {
    getState: vi.fn(() => ({ isAnimationSettings: false })),
    subscribe: vi.fn(() => vi.fn()),
    openAnimationSettings: vi.fn(),
    closeAnimationSettings: vi.fn(),
  },
}));

// Mock @atomiton/hooks
vi.mock("@atomiton/hooks", () => ({
  useDidMount: vi.fn(),
  useEventCallback: vi.fn((fn) => fn),
}));

describe("useAnimationSettings", () => {
  it("should be a function", () => {
    expect(typeof useAnimationSettings).toBe("function");
  });

  it("should return an object when called", () => {
    const { result } = renderHook(() => useAnimationSettings());
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });

  it("should have the required properties", () => {
    const { result } = renderHook(() => useAnimationSettings());

    // Check that the properties exist
    expect(result.current).toHaveProperty("isAnimationSettings");
    expect(result.current).toHaveProperty("openAnimationSettings");
    expect(result.current).toHaveProperty("closeAnimationSettings");
  });
});
