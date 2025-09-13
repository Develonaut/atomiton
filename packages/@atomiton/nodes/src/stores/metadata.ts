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
  metadata: Map<string, INodeMetadata>;

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
  name: "nodeMetadata",
  initialState: {
    metadata: new Map(),
    categories: [],
    lastUpdated: null,
  },
  persist: {
    key: "atomiton-node-metadata",
    partialize: (state) => ({
      metadata: Array.from(state.metadata.entries()),
      categories: state.categories,
      lastUpdated: state.lastUpdated,
    }),
    hydrate: (persisted: any) => ({
      metadata: new Map(persisted.metadata || []),
      categories: persisted.categories || [],
      lastUpdated: persisted.lastUpdated || null,
    }),
  },
});

// Actions for the registry to use
export const nodeMetadataActions = store.createActions(nodeMetadataStore, {
  setMetadata: (state, nodeType: string, metadata: INodeMetadata) => {
    state.metadata.set(nodeType, metadata);
    state.lastUpdated = Date.now();
  },

  setCategories: (state, categories: NodeMetadataState["categories"]) => {
    state.categories = categories;

    // Also update the metadata map
    state.metadata.clear();
    for (const category of categories) {
      for (const item of category.items) {
        state.metadata.set(item.type, item);
      }
    }

    state.lastUpdated = Date.now();
  },

  clear: (state) => {
    state.metadata.clear();
    state.categories = [];
    state.lastUpdated = null;
  },
});

// Selectors for reading
export const nodeMetadataSelectors = store.createSelectors(nodeMetadataStore, {
  getMetadata: (state) => state.metadata,
  getCategories: (state) => state.categories,
  getNodeByType: (state) => (type: string) => state.metadata.get(type),
  hasData: (state) => state.metadata.size > 0,
  getLastUpdated: (state) => state.lastUpdated,
});
