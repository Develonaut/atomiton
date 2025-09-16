import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNavigationStore } from "../store";
import type { Router } from "@tanstack/react-router";

describe("Router History Navigation", () => {
  let store: ReturnType<typeof createNavigationStore>;
  let mockRouter: Partial<Router<any, never>>;
  let historyGoSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a mock router with history methods
    historyGoSpy = vi.fn();
    mockRouter = {
      history: {
        go: historyGoSpy,
        back: vi.fn(() => historyGoSpy(-1)),
        forward: vi.fn(() => historyGoSpy(1)),
      } as any,
      state: {
        location: {
          pathname: "/",
          search: {},
          hash: "",
        },
      } as any,
      subscribe: vi.fn(),
    };

    // Create store instance
    store = createNavigationStore(false);

    // Initialize with mock router
    store.setRouter(mockRouter as Router<any, never>);
  });

  describe("back()", () => {
    it("should call router.history.go(-1) without checking canGoBack", () => {
      // The store might have canGoBack as false, but we should still attempt navigation
      store.setState((state) => {
        state.canGoBack = false; // Explicitly set to false
        state.historyIndex = 0;
        state.history = ["/"];
      });

      // Call back()
      store.back();

      // Should have called history.go(-1) regardless of canGoBack state
      expect(historyGoSpy).toHaveBeenCalledWith(-1);
      expect(historyGoSpy).toHaveBeenCalledTimes(1);
    });

    it("should work when there is history to go back to", () => {
      // Simulate having history
      store.setState((state) => {
        state.canGoBack = true;
        state.historyIndex = 2;
        state.history = ["/", "/about", "/contact"];
      });

      store.back();

      expect(historyGoSpy).toHaveBeenCalledWith(-1);
    });

    it("should not throw error when router is not initialized", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Create new store without router
      const newStore = createNavigationStore(false);

      // Should not throw
      expect(() => newStore.back()).not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith("Router not initialized");

      errorSpy.mockRestore();
    });
  });

  describe("forward()", () => {
    it("should call router.history.go(1) without checking canGoForward", () => {
      // Set canGoForward to false but we should still attempt navigation
      store.setState((state) => {
        state.canGoForward = false;
        state.historyIndex = 1;
        state.history = ["/", "/about"];
      });

      store.forward();

      expect(historyGoSpy).toHaveBeenCalledWith(1);
      expect(historyGoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("go()", () => {
    it("should call router.history.go with the specified delta", () => {
      store.go(-2);
      expect(historyGoSpy).toHaveBeenCalledWith(-2);

      store.go(3);
      expect(historyGoSpy).toHaveBeenCalledWith(3);

      expect(historyGoSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle go(0) to reload current route", () => {
      store.go(0);
      expect(historyGoSpy).toHaveBeenCalledWith(0);
    });
  });

  describe("Browser back button behavior", () => {
    it("should allow browser back navigation even when internal state says canGoBack is false", () => {
      // This tests the real-world scenario where browser has history
      // but our internal state tracking is out of sync

      // Simulate state where our tracking thinks we can't go back
      store.setState((state) => {
        state.history = ["/", "/explore", "/explore/details"];
        state.historyIndex = 0; // Wrong index
        state.canGoBack = false; // Wrong state
        state.currentPath = "/explore/details";
      });

      // User clicks browser back or calls navigate.back()
      store.back();

      // Should still attempt to go back via browser history
      expect(historyGoSpy).toHaveBeenCalledWith(-1);
      // Browser will handle the actual navigation
    });
  });
});
