/**
 * Composite Store
 *
 * Manages user-created composite definitions (full CRUD operations)
 */

import { createNode, type CompositeDefinition } from "@atomiton/nodes/browser";
import { createStore } from "@atomiton/store";

// Types
export type CompositeState = {
  composites: CompositeDefinition[];
  isLoading: boolean;
  error: string | null;
};

export type CompositeActions = {
  create: (composite: Partial<CompositeDefinition>) => string;
  update: (id: string, updates: Partial<CompositeDefinition>) => void;
  remove: (id: string) => void;
  findById: (id: string) => CompositeDefinition | undefined;
};

// Initial state
const initialState: CompositeState = {
  composites: [],
  isLoading: false,
  error: null,
};

// Store
export const compositeStore = createStore<CompositeState>(() => initialState, {
  name: "Composites",
  persist: {
    key: "composites",
  },
});

// Actions
export const compositeActions: CompositeActions = {
  create: (composite: Partial<CompositeDefinition>) => {
    // Use createNode to properly format the composite with all defaults
    const newComposite = createNode({
      type: "composite",
      name: composite.name || "Untitled Composite",
      // Pass all available fields - createNode will handle defaults
      id: composite.id,
      description: composite.description,
      category: composite.category,
      version: composite.version,
      nodes: composite.nodes,
      edges: composite.edges,
      variables: composite.variables,
      settings: composite.settings,
      metadata: {
        ...composite.metadata,
        source: "user", // Override source to user for user-created composites
      },
    });

    compositeStore.setState((state: CompositeState) => {
      state.composites.push(newComposite);
      state.error = null;
    });

    return newComposite.id;
  },

  update: (id: string, updates: Partial<CompositeDefinition>) => {
    compositeStore.setState((state: CompositeState) => {
      const index = state.composites.findIndex(
        (comp: CompositeDefinition) => comp.id === id,
      );
      if (index === -1) {
        state.error = `Composite ${id} not found`;
        return;
      }

      state.composites[index] = {
        ...state.composites[index],
        ...updates,
        id, // Ensure ID can't be changed
        metadata: {
          ...state.composites[index].metadata,
          ...updates.metadata,
          modified: new Date().toISOString(),
        },
      };
      state.error = null;
    });
  },

  remove: (id: string) => {
    compositeStore.setState((state: CompositeState) => {
      const index = state.composites.findIndex(
        (comp: CompositeDefinition) => comp.id === id,
      );
      if (index === -1) {
        state.error = `Composite ${id} not found`;
        return;
      }

      state.composites.splice(index, 1);
      state.error = null;
    });
  },

  findById: (id: string) => {
    const state = compositeStore.getState();
    return state.composites.find((comp: CompositeDefinition) => comp.id === id);
  },
};
