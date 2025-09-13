/**
 * Node Store - Centralized state management for all node-related data
 *
 * This store acts as the caching layer for the nodes package.
 * The registry writes to this store, and consumers read from it.
 *
 * Follows the same modular pattern as @atomiton/editor store.
 */

import { store as storeAPI } from "@atomiton/store";
import { createMetadataModule, type MetadataActions } from "./modules/metadata";
import { createConfigModule, type ConfigActions } from "./modules/config";
import type { BaseStore, NodeStoreState } from "./types";

export type { NodeStoreState } from "./types";

/**
 * Initial state for the node store
 */
const initialState: NodeStoreState = {
  metadata: new Map(),
  configs: new Map(),
  logic: new Map(),
  nodes: new Map(),
  categories: [],
  lastUpdated: {
    metadata: null,
    configs: null,
    logic: null,
    nodes: null,
  },
  loading: {
    metadata: false,
    configs: false,
    logic: false,
    nodes: false,
  },
  errors: {
    metadata: null,
    configs: null,
    logic: null,
    nodes: null,
  },
};

/**
 * Create the base store with persistence
 */
const store = storeAPI.createStore<NodeStoreState>({
  name: "NodeStore",
  initialState,
  persist: {
    key: "atomiton-nodes",
    // Only persist the actual data, not loading/error states
    partialize: (state) => ({
      metadata: Array.from(state.metadata.entries()),
      configs: Array.from(state.configs.entries()),
      categories: state.categories,
      lastUpdated: state.lastUpdated,
    }),
    hydrate: (persisted: any) => ({
      metadata: new Map(persisted.metadata || []),
      configs: new Map(persisted.configs || []),
      logic: new Map(),
      nodes: new Map(),
      categories: persisted.categories || [],
      lastUpdated: persisted.lastUpdated || {
        metadata: null,
        configs: null,
        logic: null,
        nodes: null,
      },
      loading: {
        metadata: false,
        configs: false,
        logic: false,
        nodes: false,
      },
      errors: {
        metadata: null,
        configs: null,
        logic: null,
        nodes: null,
      },
    }),
  },
});

/**
 * Combined store actions type
 */
type NodeStoreActions = BaseStore & MetadataActions & ConfigActions;

/**
 * Create the modules
 */
const metadataModule = createMetadataModule(store);
const configModule = createConfigModule(store);

/**
 * Export the combined store with all actions
 */
export const nodeStore: NodeStoreActions = {
  ...store,
  ...metadataModule,
  ...configModule,
};

/**
 * Export specific actions for backward compatibility
 */
export const nodeActions = {
  // Metadata actions
  setMetadata: metadataModule.setMetadata,
  setAllMetadata: metadataModule.setAllMetadata,
  setCategories: metadataModule.setCategories,
  clearMetadata: metadataModule.clearMetadata,
  setLoading: (domain: "metadata" | "configs", loading: boolean) => {
    if (domain === "metadata") {
      metadataModule.setMetadataLoading(loading);
    } else {
      configModule.setConfigLoading(loading);
    }
  },
  setError: (domain: "metadata" | "configs", error: Error | null) => {
    if (domain === "metadata") {
      metadataModule.setMetadataError(error);
    } else {
      configModule.setConfigError(error);
    }
  },

  // Config actions
  setConfig: configModule.setConfig,
  setAllConfigs: configModule.setAllConfigs,
  clearConfigs: configModule.clearConfigs,

  // Clear all
  clearAll: () => {
    metadataModule.clearMetadata();
    configModule.clearConfigs();
  },
};

/**
 * Export selectors for backward compatibility
 */
export const nodeSelectors = {
  // Metadata selectors
  getMetadata: metadataModule.getMetadata,
  getMetadataByType: metadataModule.getMetadataByType,
  getCategories: metadataModule.getCategories,
  hasMetadata: metadataModule.hasMetadata,

  // Config selectors
  getConfigs: configModule.getConfigs,
  getConfigByType: configModule.getConfigByType,
  hasConfigs: configModule.hasConfigs,

  // State checking
  isMetadataStale: (maxAge: number = 5 * 60 * 1000) => {
    const state = store.getState();
    if (!state.lastUpdated.metadata) return true;
    return Date.now() - state.lastUpdated.metadata > maxAge;
  },
};
