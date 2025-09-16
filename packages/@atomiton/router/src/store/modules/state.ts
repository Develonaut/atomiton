/**
 * Domain: General State Management
 *
 * Purpose: Handles general router state initialization and utilities
 *
 * Responsibilities:
 * - Initial state definition for the router store
 * - State reset and initialization utilities
 * - Common state helper functions
 */

import type { RouterStoreState } from "../types";

/**
 * Initial state for the router store
 */
export const createInitialState = (): RouterStoreState => ({
  // Navigation state
  currentPath: "/",
  previousPath: null,
  params: {},
  search: {},
  hash: "",
  isNavigating: false,
  router: null,

  // History state
  history: ["/"],
  historyIndex: 0,
  canGoBack: false,
  canGoForward: false,
});

/**
 * Reset state to initial values
 */
export const resetState = (): RouterStoreState => createInitialState();
