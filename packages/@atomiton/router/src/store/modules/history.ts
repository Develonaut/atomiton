/**
 * Domain: Navigation History Management
 *
 * Purpose: Manages browser history and navigation state tracking
 *
 * Responsibilities:
 * - Back/forward navigation through browser history
 * - History state tracking and management
 * - Navigation constraints (can go back/forward)
 * - History index management for navigation controls
 */

import type { BaseStore, HistoryActions } from "../types";

export type { HistoryActions };

export const createHistoryModule = (store: BaseStore): HistoryActions => ({
  back: () => {
    const { router } = store.getState();
    if (!router) {
      console.error("Router not initialized");
      return;
    }

    // Let the browser and TanStack Router handle history navigation
    // They maintain their own history state that's more accurate
    router.history.go(-1);
  },

  forward: () => {
    const { router } = store.getState();
    if (!router) {
      console.error("Router not initialized");
      return;
    }

    // Let the browser and TanStack Router handle history navigation
    // They maintain their own history state that's more accurate
    router.history.go(1);
  },

  go: (delta: number) => {
    const { router } = store.getState();
    if (!router) {
      console.error("Router not initialized");
      return;
    }

    router.history.go(delta);
  },

  updateHistoryState: (updates) => {
    store.setState((state) => {
      Object.assign(state, updates);
    });
  },
});
