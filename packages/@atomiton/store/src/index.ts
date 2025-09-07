/**
 * @atomiton/store - Pure state management infrastructure
 *
 * Provides low-level store creation utilities for building
 * domain-specific stores in other packages.
 *
 * Usage:
 *   import { core } from '@atomiton/core';
 *
 *   const myStore = core.store.createStore({
 *     initialState: { ... }
 *   });
 */

// ============================================================================
// Core Store Infrastructure
// ============================================================================

export {
  combineStores,
  createAction,
  createActions,
  createSelector,
  createSelectors,
  createStore,
  type StateUpdater,
  type Store,
  type StoreConfig,
} from "./base";
