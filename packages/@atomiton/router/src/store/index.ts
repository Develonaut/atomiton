/**
 * Router Store - Modular State Management
 *
 * Follows the same pattern as @atomiton/editor store with separate modules
 * for different concerns (navigation, history, state management)
 */

import { createStore } from "@atomiton/store";
import { createHistoryModule, type HistoryActions } from "./modules/history";
import {
  createNavigationModule,
  type NavigationActions,
} from "./modules/navigation";
import { createInitialState } from "./modules/state";
import type { BaseStore, RouterStore, RouterStoreState } from "./types";

// Export types for consumers
export type { RouterStore, RouterStoreState };

/**
 * Creates a navigation store instance with all modules composed together
 * This is an internal function used by createRouter - not exported publicly
 */
export const createNavigationStore = (enableDevtools = false): RouterStore => {
  // Create the base store
  const store = createStore<RouterStoreState>(() => createInitialState(), {
    name: enableDevtools ? "router" : undefined,
  });

  // Create action modules
  const navigationModule = createNavigationModule(store as BaseStore);
  const historyModule = createHistoryModule(store as BaseStore);

  // Compose the complete store interface
  const navigationStore: RouterStore = {
    ...store,
    ...navigationModule,
    ...historyModule,
  };

  return navigationStore;
};
