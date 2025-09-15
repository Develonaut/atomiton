/**
 * Blueprint Store - Main Store Configuration
 *
 * Combines all blueprint modules into a single store API
 * Persistence is handled automatically by the store package
 */

import { store as storeAPI } from "@atomiton/store";
import { createCrudModule, type CrudActions } from "./modules/crud";
import type { BaseStore, Blueprint, BlueprintState } from "./types";

export * from "./selectors";
export type { Blueprint, BlueprintState };

// ============================================================================
// Initial State
// ============================================================================

const initialState: BlueprintState = {
  blueprints: [],
  isLoading: false,
  isDirty: false,
  error: null,
};

// ============================================================================
// Store Creation with Automatic Persistence
// ============================================================================

const store = storeAPI.createStore<BlueprintState>({
  initialState,
  name: "BlueprintStore",
  // Enable automatic persistence to localStorage
  persist: {
    key: "atomiton-blueprints",
    // Don't specify storage to use default localStorage adapter
  },
});

// ============================================================================
// Module Composition
// ============================================================================

type BlueprintStoreActions = BaseStore & CrudActions;

const crudModule = createCrudModule(store);

// ============================================================================
// Exported Store
// ============================================================================

export const blueprintStore: BlueprintStoreActions = {
  ...store,
  ...crudModule,
};

export type BlueprintStore = typeof blueprintStore;

// ============================================================================
// Initialize Store
// ============================================================================

// Register store globally for debugging
storeAPI.registerStore("blueprint", store);
