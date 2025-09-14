import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEventCallback } from "../useEventCallback";

describe("useEventCallback", () => {
  it("should return a stable function reference across re-renders", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: callback },
    });

    const firstReference = result.current;
    rerender({ fn: callback });
    const secondReference = result.current;

    expect(firstReference).toBe(secondReference);
  });

  it("should call the latest function implementation", () => {
    const firstCallback = vi.fn(() => "first");
    const secondCallback = vi.fn(() => "second");

    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: firstCallback },
    });

    const stableCallback = result.current;
    expect(stableCallback()).toBe("first");
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(0);

    rerender({ fn: secondCallback });
    expect(stableCallback()).toBe("second");
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("should preserve function parameters and return types", () => {
    const callback = vi.fn((a: string, b: number) => `${a}-${b}`);
    const { result } = renderHook(() =>
      useEventCallback(callback as (...args: unknown[]) => unknown),
    );

    const stableCallback = result.current;
    const returnValue = stableCallback("test", 42);

    expect(returnValue).toBe("test-42");
    expect(callback).toHaveBeenCalledWith("test", 42);
  });

  it("should handle functions with no parameters", () => {
    const callback = vi.fn(() => "result");
    const { result } = renderHook(() => useEventCallback(callback));

    const stableCallback = result.current;
    const returnValue = stableCallback();

    expect(returnValue).toBe("result");
    expect(callback).toHaveBeenCalledWith();
  });

  it("should handle functions with multiple parameters", () => {
    const callback = vi.fn((a: number, b: string, c: boolean) => ({ a, b, c }));
    const { result } = renderHook(() =>
      useEventCallback(callback as (...args: unknown[]) => unknown),
    );

    const stableCallback = result.current;
    const returnValue = stableCallback(1, "test", true);

    expect(returnValue).toEqual({ a: 1, b: "test", c: true });
    expect(callback).toHaveBeenCalledWith(1, "test", true);
  });

  it("should handle functions that throw errors", () => {
    const error = new Error("Test error");
    const callback = vi.fn(() => {
      throw error;
    });
    const { result } = renderHook(() => useEventCallback(callback));

    const stableCallback = result.current;

    expect(() => stableCallback()).toThrow(error);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should work with async functions", async () => {
    const callback = vi.fn(async (value: string) => {
      return `async-${value}`;
    });
    const { result } = renderHook(() =>
      useEventCallback(callback as (...args: unknown[]) => unknown),
    );

    const stableCallback = result.current;
    const promise = stableCallback("test");

    expect(promise).toBeInstanceOf(Promise);
    const resolvedValue = await promise;
    expect(resolvedValue).toBe("async-test");
    expect(callback).toHaveBeenCalledWith("test");
  });

  it("should maintain reference equality when function changes back and forth", () => {
    const callbackA = vi.fn(() => "A");
    const callbackB = vi.fn(() => "B");

    const { result, rerender } = renderHook(({ fn }) => useEventCallback(fn), {
      initialProps: { fn: callbackA },
    });

    const stableCallback = result.current;

    rerender({ fn: callbackB });
    expect(result.current).toBe(stableCallback);

    rerender({ fn: callbackA });
    expect(result.current).toBe(stableCallback);

    expect(stableCallback()).toBe("A");
    expect(callbackA).toHaveBeenCalledTimes(1);
  });
});
