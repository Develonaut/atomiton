import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLink } from "../useLink";

// Mock the router
const mockNavigate = vi.fn();
const mockPreloadRoute = vi.fn(() => Promise.resolve());
const mockRouter = {
  navigate: mockNavigate,
  preloadRoute: mockPreloadRoute,
};

vi.mock("../../index", () => ({
  useRouter: () => mockRouter,
}));

// Mock useHover
vi.mock("@atomiton/hooks", () => {
  const actualHooks = vi.importActual("@atomiton/hooks");
  return {
    ...actualHooks,
    useHover: vi.fn((config) => ({
      handleMouseEnter: () => {
        if (!config?.disabled) {
          config?.onEnter?.();
        }
      },
      handleMouseLeave: () => {
        if (!config?.disabled) {
          config?.onLeave?.();
        }
      },
    })),
  };
});

describe("useLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return button props with navigation handlers", () => {
    const { result } = renderHook(() => useLink({ to: "/dashboard" }));

    expect(result.current).toHaveProperty("onClick");
    expect(result.current).toHaveProperty("onMouseEnter");
    expect(result.current).toHaveProperty("onMouseLeave");
    expect(result.current).toHaveProperty("disabled");
    expect(result.current.disabled).toBe(false);
  });

  it("should navigate on click", async () => {
    const { result } = renderHook(() => useLink({ to: "/dashboard" }));

    const mockEvent = {
      defaultPrevented: false,
    } as React.MouseEvent;

    await act(async () => {
      await result.current.onClick(mockEvent);
    });

    expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("should preload route on hover", () => {
    const { result } = renderHook(() =>
      useLink({ to: "/dashboard" }, { preloadDelay: 100 }),
    );

    act(() => {
      result.current.onMouseEnter();
    });

    expect(mockPreloadRoute).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("should call custom onClick before navigation", async () => {
    const customOnClick = vi.fn();
    const { result } = renderHook(() =>
      useLink({ to: "/dashboard" }, { onClick: customOnClick }),
    );

    const mockEvent = {
      defaultPrevented: false,
    } as React.MouseEvent;

    await act(async () => {
      await result.current.onClick(mockEvent);
    });

    expect(customOnClick).toHaveBeenCalledWith(mockEvent);
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("should not navigate if event is prevented", async () => {
    const customOnClick = vi.fn((e: React.MouseEvent) => {
      e.preventDefault();
    });

    const { result } = renderHook(() =>
      useLink({ to: "/dashboard" }, { onClick: customOnClick }),
    );

    const mockEvent = {
      defaultPrevented: false,
      preventDefault: () => {
        mockEvent.defaultPrevented = true;
      },
    } as unknown as React.MouseEvent;

    await act(async () => {
      await result.current.onClick(mockEvent);
    });

    expect(customOnClick).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should not navigate or preload when disabled", async () => {
    const { result } = renderHook(() =>
      useLink({ to: "/dashboard" }, { disabled: true }),
    );

    const mockEvent = {} as React.MouseEvent;

    await act(async () => {
      await result.current.onClick(mockEvent);
    });

    act(() => {
      result.current.onMouseEnter();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockPreloadRoute).not.toHaveBeenCalled();
    expect(result.current.disabled).toBe(true);
  });

  it("should handle navigation with params", async () => {
    const { result } = renderHook(() =>
      useLink({
        to: "/posts/$postId",
        params: { postId: "123" },
      }),
    );

    const mockEvent = {
      defaultPrevented: false,
    } as React.MouseEvent;

    await act(async () => {
      await result.current.onClick(mockEvent);
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/posts/$postId",
      params: { postId: "123" },
    });
  });

  it("should handle async onClick handlers", async () => {
    const asyncOnClick = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const { result } = renderHook(() =>
      useLink({ to: "/dashboard" }, { onClick: asyncOnClick }),
    );

    const mockEvent = {
      defaultPrevented: false,
    } as React.MouseEvent;

    await act(async () => {
      await result.current.onClick(mockEvent);
    });

    expect(asyncOnClick).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("should handle preload errors gracefully", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    mockPreloadRoute.mockRejectedValueOnce(new Error("Preload failed"));

    const { result } = renderHook(() => useLink({ to: "/dashboard" }));

    act(() => {
      result.current.onMouseEnter();
    });

    // Wait for the promise to resolve
    setTimeout(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to preload route"),
      );
      consoleWarnSpy.mockRestore();
    }, 0);
  });
});
