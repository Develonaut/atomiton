/**
 * @vitest-environment jsdom
 */
import { useDidMount } from "#useDidMount";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("useDidMount", () => {
  it("should run callback exactly once on mount", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);

    rerender();
    expect(callback).toHaveBeenCalledTimes(1);

    rerender();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle callback without cleanup function", () => {
    const callback = vi.fn(() => {
      return undefined;
    });
    const { unmount } = renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);

    expect(() => unmount()).not.toThrow();
  });

  it("should handle callback returning void (no return)", () => {
    const callback = vi.fn(() => {
      // No return statement
    });
    const { unmount } = renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);

    expect(() => unmount()).not.toThrow();
  });

  it("should call cleanup function on unmount when returned", () => {
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    const { unmount } = renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(0);

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("should not call cleanup function when callback returns void", () => {
    const callback = vi.fn(() => {
      // Returns void/undefined implicitly
    });
    const { unmount } = renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);

    expect(() => unmount()).not.toThrow();
  });

  it("should handle multiple mount/unmount cycles independently", () => {
    const cleanup1 = vi.fn();
    const callback1 = vi.fn(() => cleanup1);

    const { unmount: unmount1 } = renderHook(() => useDidMount(callback1));

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(cleanup1).toHaveBeenCalledTimes(0);

    unmount1();

    expect(cleanup1).toHaveBeenCalledTimes(1);

    const cleanup2 = vi.fn();
    const callback2 = vi.fn(() => cleanup2);

    const { unmount: unmount2 } = renderHook(() => useDidMount(callback2));

    expect(callback2).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(0);

    unmount2();

    expect(cleanup2).toHaveBeenCalledTimes(1);
    expect(cleanup1).toHaveBeenCalledTimes(1);
  });

  it("should handle callback that throws an error", () => {
    const error = new Error("Mount error");
    const callback = vi.fn(() => {
      throw error;
    });

    expect(() => {
      renderHook(() => useDidMount(callback));
    }).toThrow(error);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle cleanup function that throws an error", () => {
    const cleanupError = new Error("Cleanup error");
    const cleanup = vi.fn(() => {
      throw cleanupError;
    });
    const callback = vi.fn(() => cleanup);

    const { unmount } = renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);

    expect(() => unmount()).toThrow(cleanupError);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("should work with callback that calls async functions internally", () => {
    const asyncOperation = vi.fn(async () => "async-result");
    const callback = vi.fn(() => {
      asyncOperation();
      return vi.fn();
    });

    renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(asyncOperation).toHaveBeenCalledTimes(1);
  });

  it("should preserve callback execution context", () => {
    const contextValue = "test-context";
    let capturedContext: string | undefined;

    const callback = vi.fn(function (this: { value: string }) {
      capturedContext = this?.value;
    });

    const boundCallback = callback.bind({ value: contextValue });

    renderHook(() => useDidMount(boundCallback));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(capturedContext).toBe(contextValue);
  });

  it("should handle cleanup function returning a value", () => {
    const cleanupReturnValue = "cleanup-result";
    const cleanup = vi.fn(() => cleanupReturnValue);
    const callback = vi.fn(() => cleanup);

    const { unmount } = renderHook(() => useDidMount(callback));

    expect(callback).toHaveBeenCalledTimes(1);

    expect(() => unmount()).not.toThrow();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
