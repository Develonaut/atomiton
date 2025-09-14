/**
 * Domain: Node Metadata
 *
 * Purpose: Manages node metadata caching and retrieval
 *
 * Responsibilities:
 * - Cache node metadata for quick access
 * - Organize nodes by categories
 * - Track metadata loading states
 * - Provide metadata access methods
 */

import type { INodeMetadata } from "../../base";
import type { BaseStore } from "../types";

export type MetadataActions = {
  setMetadata: (nodeType: string, metadata: INodeMetadata) => void;
  setAllMetadata: (metadata: Record<string, INodeMetadata>) => void;
  setCategories: (
    categories: Array<{
      name: string;
      displayName: string;
      items: INodeMetadata[];
    }>,
  ) => void;
  getMetadata: () => Record<string, INodeMetadata>;
  getMetadataByType: (type: string) => INodeMetadata | undefined;
  getCategories: () => Array<{
    name: string;
    displayName: string;
    items: INodeMetadata[];
  }>;
  hasMetadata: () => boolean;
  clearMetadata: () => void;
  setMetadataLoading: (loading: boolean) => void;
  setMetadataError: (error: Error | null) => void;
};

export const createMetadataModule = (store: BaseStore): MetadataActions => ({
  setMetadata: (nodeType: string, metadata: INodeMetadata) => {
    store.setState((state) => {
      state.metadata[nodeType] = metadata;
      state.lastUpdated.metadata = Date.now();
    });
  },

  setAllMetadata: (metadata: Record<string, INodeMetadata>) => {
    store.setState((state) => {
      state.metadata = metadata;
      state.lastUpdated.metadata = Date.now();
    });
  },

  setCategories: (categories) => {
    store.setState((state) => {
      state.categories = categories;
      // Also update metadata object from categories
      state.metadata = {};
      for (const category of categories) {
        for (const item of category.items) {
          state.metadata[item.type] = item;
        }
      }
      state.lastUpdated.metadata = Date.now();
    });
  },

  getMetadata: () => {
    return store.getState().metadata;
  },

  getMetadataByType: (type: string) => {
    return store.getState().metadata[type];
  },

  getCategories: () => {
    return store.getState().categories;
  },

  hasMetadata: () => {
    return Object.keys(store.getState().metadata).length > 0;
  },

  clearMetadata: () => {
    store.setState((state) => {
      state.metadata = {};
      state.categories = [];
      state.lastUpdated.metadata = null;
    });
  },

  setMetadataLoading: (loading: boolean) => {
    store.setState((state) => {
      state.loading.metadata = loading;
    });
  },

  setMetadataError: (error: Error | null) => {
    store.setState((state) => {
      state.errors.metadata = error;
    });
  },
});
