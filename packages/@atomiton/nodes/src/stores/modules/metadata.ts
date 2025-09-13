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
  setAllMetadata: (metadata: Map<string, INodeMetadata>) => void;
  setCategories: (
    categories: Array<{
      name: string;
      displayName: string;
      items: INodeMetadata[];
    }>,
  ) => void;
  getMetadata: () => Map<string, INodeMetadata>;
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
      state.metadata.set(nodeType, metadata);
      state.lastUpdated.metadata = Date.now();
    });
  },

  setAllMetadata: (metadata: Map<string, INodeMetadata>) => {
    store.setState((state) => {
      state.metadata = metadata;
      state.lastUpdated.metadata = Date.now();
    });
  },

  setCategories: (categories) => {
    store.setState((state) => {
      state.categories = categories;
      // Also update metadata map from categories
      state.metadata.clear();
      for (const category of categories) {
        for (const item of category.items) {
          state.metadata.set(item.type, item);
        }
      }
      state.lastUpdated.metadata = Date.now();
    });
  },

  getMetadata: () => {
    return store.getState().metadata;
  },

  getMetadataByType: (type: string) => {
    return store.getState().metadata.get(type);
  },

  getCategories: () => {
    return store.getState().categories;
  },

  hasMetadata: () => {
    return store.getState().metadata.size > 0;
  },

  clearMetadata: () => {
    store.setState((state) => {
      state.metadata.clear();
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
