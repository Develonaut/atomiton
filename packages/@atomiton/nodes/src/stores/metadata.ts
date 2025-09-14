/**
 * Node Metadata Store - Cache for node metadata
 *
 * This store is used by the registry as its caching layer.
 * The registry writes to this store, and UI components read from it.
 */

import { store } from "@atomiton/store";
import type { INodeMetadata } from "../base";

export interface NodeMetadataState {
  // Metadata indexed by node type
  metadata: Record<string, INodeMetadata>;

  // Categories with their nodes
  categories: Array<{
    name: string;
    displayName: string;
    items: INodeMetadata[];
  }>;

  // Track last update time
  lastUpdated: number | null;
}

// Create the store
export const nodeMetadataStore = store.createStore<NodeMetadataState>({
  name: "NodeMetadata",
  initialState: {
    metadata: {},
    categories: [],
    lastUpdated: null,
  },
  persist: {
    key: "atomiton-node-metadata",
    partialize: (state) => ({
      metadata: state.metadata,
      categories: state.categories,
      lastUpdated: state.lastUpdated,
    }),
    hydrate: (persisted: any) => ({
      metadata: persisted.metadata || {},
      categories: persisted.categories || [],
      lastUpdated: persisted.lastUpdated || null,
    }),
  },
});

// Actions for the registry to use
export const nodeMetadataActions = store.createActions(nodeMetadataStore, {
  setMetadata: (state: NodeMetadataState, ...args: unknown[]) => {
    const [nodeType, metadata] = args as [string, INodeMetadata];
    state.metadata[nodeType] = metadata;
    state.lastUpdated = Date.now();
  },

  setCategories: (state: NodeMetadataState, ...args: unknown[]) => {
    const [categories] = args as [NodeMetadataState["categories"]];
    state = state as NodeMetadataState;
    state.categories = categories;

    // Also update the metadata object
    state.metadata = {};
    for (const category of categories) {
      for (const item of category.items) {
        state.metadata[item.type] = item;
      }
    }

    state.lastUpdated = Date.now();
  },

  clear: (state) => {
    state.metadata = {};
    state.categories = [];
    state.lastUpdated = null;
  },
});

// Selectors for reading
export const nodeMetadataSelectors = store.createSelectors(nodeMetadataStore, {
  getMetadata: (state) => state.metadata,
  getCategories: (state) => state.categories,
  getNodeByType: (state) => (type: string) => state.metadata[type],
  hasData: (state) => Object.keys(state.metadata).length > 0,
  getLastUpdated: (state) => state.lastUpdated,
});
