/**
 * Blueprint Store - Functional state management for blueprints
 */

import { createStore, createActions, createSelectors } from "../../base";
import type { Store } from "../../base";
import type { Blueprint, BlueprintState } from "./types";

export * from "./types";

// ============================================================================
// Initial State
// ============================================================================

const initialState: BlueprintState = {
  blueprints: new Map(),
  selectedBlueprintId: null,
  searchQuery: "",
  filterTags: [],
  sortBy: "modified",
  sortDirection: "desc",
  isLoading: false,
  error: null,
};

// ============================================================================
// Actions - Pure functions that update state
// ============================================================================

const actions = {
  addBlueprint: (state: BlueprintState, blueprint: Blueprint) => {
    state.blueprints.set(blueprint.id, blueprint);
  },

  updateBlueprint: (
    state: BlueprintState,
    id: string,
    updates: Partial<Blueprint>,
  ) => {
    const blueprint = state.blueprints.get(id);
    if (blueprint) {
      state.blueprints.set(id, {
        ...blueprint,
        ...updates,
        modified: new Date(),
      });
    }
  },

  deleteBlueprint: (state: BlueprintState, id: string) => {
    state.blueprints.delete(id);
    if (state.selectedBlueprintId === id) {
      state.selectedBlueprintId = null;
    }
  },

  selectBlueprint: (state: BlueprintState, id: string | null) => {
    state.selectedBlueprintId = id;
  },

  setSearchQuery: (state: BlueprintState, query: string) => {
    state.searchQuery = query;
  },

  setFilterTags: (state: BlueprintState, tags: string[]) => {
    state.filterTags = tags;
  },

  setSortSettings: (
    state: BlueprintState,
    sortBy: BlueprintState["sortBy"],
    sortDirection: BlueprintState["sortDirection"],
  ) => {
    state.sortBy = sortBy;
    state.sortDirection = sortDirection;
  },

  setLoading: (state: BlueprintState, isLoading: boolean) => {
    state.isLoading = isLoading;
  },

  setError: (state: BlueprintState, error: string | null) => {
    state.error = error;
  },

  clearAll: (state: BlueprintState) => {
    Object.assign(state, initialState);
  },
};

// ============================================================================
// Selectors - Pure functions that derive data from state
// ============================================================================

const selectors = {
  getAllBlueprints: (state: BlueprintState): Blueprint[] => {
    return Array.from(state.blueprints.values());
  },

  getSelectedBlueprint: (state: BlueprintState): Blueprint | null => {
    return state.selectedBlueprintId
      ? state.blueprints.get(state.selectedBlueprintId) || null
      : null;
  },

  getFilteredBlueprints: (state: BlueprintState): Blueprint[] => {
    let blueprints = Array.from(state.blueprints.values());

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      blueprints = blueprints.filter(
        (bp) =>
          bp.name.toLowerCase().includes(query) ||
          bp.description.toLowerCase().includes(query) ||
          bp.author.toLowerCase().includes(query) ||
          bp.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply tag filter
    if (state.filterTags.length > 0) {
      blueprints = blueprints.filter((bp) =>
        state.filterTags.every((tag) => bp.tags.includes(tag)),
      );
    }

    // Apply sorting
    blueprints.sort((a, b) => {
      let comparison = 0;

      switch (state.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "created":
          comparison = a.created.getTime() - b.created.getTime();
          break;
        case "modified":
          comparison = a.modified.getTime() - b.modified.getTime();
          break;
        case "author":
          comparison = a.author.localeCompare(b.author);
          break;
      }

      return state.sortDirection === "asc" ? comparison : -comparison;
    });

    return blueprints;
  },

  getAllTags: (state: BlueprintState): string[] => {
    const tags = new Set<string>();
    state.blueprints.forEach((bp) => {
      bp.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  },

  getBlueprintById:
    (state: BlueprintState) =>
    (id: string): Blueprint | undefined => {
      return state.blueprints.get(id);
    },

  getBlueprintCount: (state: BlueprintState): number => {
    return state.blueprints.size;
  },
};

// ============================================================================
// Store Creation
// ============================================================================

export type BlueprintStore = Store<BlueprintState> & {
  actions: ReturnType<typeof createActions<BlueprintState, typeof actions>>;
  selectors: ReturnType<
    typeof createSelectors<BlueprintState, typeof selectors>
  >;
};

/**
 * Creates a blueprint store with actions and selectors
 */
export function createBlueprintStore(): BlueprintStore {
  const store = createStore<BlueprintState>({
    initialState,
    persist: {
      key: "blueprints",
      partialize: (state) => ({
        blueprints: state.blueprints,
        selectedBlueprintId: state.selectedBlueprintId,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
      }),
      hydrate: (persisted: unknown) => {
        const persistedData =
          persisted && typeof persisted === "object"
            ? (persisted as Record<string, unknown>)
            : {};
        return {
          ...initialState,
          ...persistedData,
          blueprints: new Map(
            Array.isArray(persistedData.blueprints)
              ? (persistedData.blueprints as [string, Blueprint][])
              : [],
          ),
        };
      },
    },
  });

  return {
    ...store,
    actions: createActions(store, actions),
    selectors: createSelectors(store, selectors),
  };
}
