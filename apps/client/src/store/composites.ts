/**
 * User-Created Nodes Store
 *
 * Manages user-created nodes with children (full CRUD operations)
 */

import {
  createNodeDefinition,
  type NodeDefinition,
} from "@atomiton/nodes/definitions";
import { createStore } from "@atomiton/store";

// Types
export type CompositeState = {
  composites: NodeDefinition[];
  isLoading: boolean;
  error: string | null;
};

export type CompositeActions = {
  create: (composite: Partial<NodeDefinition>) => string;
  update: (id: string, updates: Partial<NodeDefinition>) => void;
  remove: (id: string) => void;
  findById: (id: string) => NodeDefinition | undefined;
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
  create: (nodeDefinition: Partial<NodeDefinition>) => {
    // Use createNode to properly format the node with all defaults
    const newComposite = createNodeDefinition({
      ...nodeDefinition,
      type: "composite",
      name: nodeDefinition.name || "Untitled Node",
      position: nodeDefinition.position || { x: 0, y: 0 },
      children: nodeDefinition.children || [],
      edges: nodeDefinition.edges || [],
      metadata: {
        ...nodeDefinition.metadata,
        source: "user", // Override source to user for user-created nodes
      },
    });

    compositeStore.setState((state: CompositeState) => {
      state.composites.push(newComposite);
      state.error = null;
    });

    return newComposite.id;
  },

  update: (id: string, updates: Partial<NodeDefinition>) => {
    compositeStore.setState((state: CompositeState) => {
      const index = state.composites.findIndex(
        (comp: NodeDefinition) => comp.id === id,
      );
      if (index === -1) {
        state.error = `Node ${id} not found`;
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
        (comp: NodeDefinition) => comp.id === id,
      );
      if (index === -1) {
        state.error = `Node ${id} not found`;
        return;
      }

      state.composites.splice(index, 1);
      state.error = null;
    });
  },

  findById: (id: string) => {
    const state = compositeStore.getState();
    return state.composites.find((comp: NodeDefinition) => comp.id === id);
  },
};
