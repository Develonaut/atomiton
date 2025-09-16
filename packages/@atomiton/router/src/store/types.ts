/**
 * Router Store Types
 *
 * Defines all types for the router store state and actions
 */

import type { AnyRoute, Router } from "@tanstack/react-router";
import type { NavigationOptions } from "../types";

// ============================================================================
// State Types
// ============================================================================

/**
 * Core navigation state
 */
export type NavigationState = {
  currentPath: string;
  previousPath: string | null;
  params: Record<string, unknown>;
  search: Record<string, unknown>;
  hash: string;
  isNavigating: boolean;
  router: Router<AnyRoute, never> | null;
};

/**
 * Navigation history state
 */
export type HistoryState = {
  history: string[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
};

/**
 * Router store state combining all modules
 */
export type RouterStoreState = NavigationState & HistoryState;

// ============================================================================
// Base Store Interface
// ============================================================================

export type BaseStore = {
  getState(): RouterStoreState;
  setState(
    partial:
      | RouterStoreState
      | Partial<RouterStoreState>
      | ((state: RouterStoreState) => RouterStoreState | void),
    replace?: boolean,
  ): void;
  subscribe(
    listener: (state: RouterStoreState, prevState: RouterStoreState) => void,
  ): () => void;
};

// ============================================================================
// Action Types
// ============================================================================

/**
 * Core navigation actions
 */
export type NavigationActions = {
  setRouter: (router: Router<AnyRoute, never>) => void;
  navigate: (path: string, options?: NavigationOptions) => void;
  replace: (path: string, options?: NavigationOptions) => void;
  updateNavigationState: (updates: Partial<NavigationState>) => void;
};

/**
 * History management actions
 */
export type HistoryActions = {
  back: () => void;
  forward: () => void;
  go: (delta: number) => void;
  updateHistoryState: (updates: Partial<HistoryState>) => void;
};

/**
 * Complete router store interface
 */
export type RouterStore = BaseStore & NavigationActions & HistoryActions;
