import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useHover } from "../useHover";

describe("useHover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call onEnter immediately when no delay is provided", () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result } = renderHook(() => useHover({ onEnter, onLeave }));

    act(() => {
      result.current.handleMouseEnter();
    });

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("should call onEnter after delay when delay is provided", () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result } = renderHook(() =>
      useHover({ onEnter, onLeave, delay: 100 }),
    );

    act(() => {
      result.current.handleMouseEnter();
    });

    expect(onEnter).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("should cancel delayed onEnter when mouse leaves before delay", () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result } = renderHook(() =>
      useHover({ onEnter, onLeave, delay: 100 }),
    );

    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      result.current.handleMouseLeave();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onEnter).not.toHaveBeenCalled();
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("should not trigger multiple onEnter calls when hovering multiple times", () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result } = renderHook(() =>
      useHover({ onEnter, onLeave, delay: 100 }),
    );

    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Try to enter again while timer is running
    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("should not call any handlers when disabled", () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result } = renderHook(() =>
      useHover({ onEnter, onLeave, disabled: true }),
    );

    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      result.current.handleMouseLeave();
    });

    expect(onEnter).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("should call onLeave immediately when no delay", () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result } = renderHook(() => useHover({ onEnter, onLeave }));

    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      result.current.handleMouseLeave();
    });

    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("should handle missing config gracefully", () => {
    const { result } = renderHook(() => useHover());

    expect(() => {
      act(() => {
        result.current.handleMouseEnter();
        result.current.handleMouseLeave();
      });
    }).not.toThrow();
  });

  it("should handle config changes properly", () => {
    const onEnter1 = vi.fn();
    const onEnter2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ onEnter }) => useHover({ onEnter, delay: 100 }),
      { initialProps: { onEnter: onEnter1 } },
    );

    // Start with first handler
    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onEnter1).toHaveBeenCalledTimes(1);
    expect(onEnter2).not.toHaveBeenCalled();

    // Clear mocks
    onEnter1.mockClear();

    // Change handler and trigger again
    rerender({ onEnter: onEnter2 });

    act(() => {
      result.current.handleMouseEnter();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should call the new handler
    expect(onEnter1).not.toHaveBeenCalled();
    expect(onEnter2).toHaveBeenCalledTimes(1);
  });
});
