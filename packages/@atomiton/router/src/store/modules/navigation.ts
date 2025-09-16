/**
 * Domain: Navigation Management
 *
 * Purpose: Handles core navigation operations and router integration
 *
 * Responsibilities:
 * - Router instance management and initialization
 * - Navigation to different routes with options
 * - Replace navigation for route replacement
 * - Navigation state tracking and updates
 * - Router event subscription and state synchronization
 */

import type { AnyRoute, Router } from "@tanstack/react-router";
import type { NavigationOptions } from "../../types";
import type { BaseStore, NavigationActions } from "../types";

export type { NavigationActions };

export const createNavigationModule = (
  store: BaseStore,
): NavigationActions => ({
  setRouter: (router: Router<AnyRoute, never>) => {
    store.setState((state) => {
      state.router = router;
    });

    // Subscribe to router changes to keep state in sync
    router.subscribe("onResolved", () => {
      const routerState = router.state;
      const currentRoute = routerState.location;
      const currentState = store.getState();

      store.setState((state) => {
        // Update navigation state
        state.previousPath =
          currentState.currentPath !== currentRoute.pathname
            ? currentState.currentPath
            : state.previousPath;
        state.currentPath = currentRoute.pathname;
        state.params =
          ((routerState as unknown as Record<string, unknown>).params as Record<
            string,
            unknown
          >) || {};
        state.search = currentRoute.search || {};
        state.hash = currentRoute.hash || "";
        state.isNavigating = false;

        // Update history state
        const newHistory = [...state.history];
        if (newHistory[newHistory.length - 1] !== currentRoute.pathname) {
          newHistory.push(currentRoute.pathname);
          // Keep last 50 entries to prevent memory issues
          if (newHistory.length > 50) {
            newHistory.shift();
          }
        }
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
        state.canGoBack = state.historyIndex > 0;
        state.canGoForward = false; // Always false after navigation
      });
    });
  },

  navigate: (path: string, options?: NavigationOptions) => {
    const { router } = store.getState();
    if (!router) {
      console.error("Router not initialized");
      return;
    }

    if (!path || typeof path !== "string") {
      console.error("Invalid path provided to navigate:", path);
      return;
    }

    store.setState((state) => {
      state.isNavigating = true;
    });

    try {
      // Build navigation options with proper typing
      router.navigate({
        to: path,
        search: options?.search,
        hash: options?.hash,
        replace: options?.replace,
        // Note: TanStack Router expects state in a specific format
        // We pass it as-is but it may not persist as expected
        ...(options?.state && { state: options.state }),
      } as Parameters<typeof router.navigate>[0]);
    } catch (error) {
      console.error("Navigation failed:", error);
      store.setState((state) => {
        state.isNavigating = false;
      });
      throw error;
    }
  },

  replace: (path: string, options?: NavigationOptions) => {
    const { router } = store.getState();
    if (!router) {
      console.error("Router not initialized");
      return;
    }

    if (!path || typeof path !== "string") {
      console.error("Invalid path provided to replace:", path);
      return;
    }

    store.setState((state) => {
      state.isNavigating = true;
    });

    try {
      // Build navigation options with proper typing
      router.navigate({
        to: path,
        search: options?.search,
        hash: options?.hash,
        replace: true,
        // Note: TanStack Router expects state in a specific format
        // We pass it as-is but it may not persist as expected
        ...(options?.state && { state: options.state }),
      } as Parameters<typeof router.navigate>[0]);
    } catch (error) {
      console.error("Replace navigation failed:", error);
      store.setState((state) => {
        state.isNavigating = false;
      });
      throw error;
    }
  },

  updateNavigationState: (updates) => {
    store.setState((state) => {
      Object.assign(state, updates);
    });
  },
});
