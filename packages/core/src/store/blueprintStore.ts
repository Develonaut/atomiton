/**
 * Blueprint Store - State management for Blueprint system
 * Manages blueprint data, selection, and search/filter state
 */

import { storeClient } from "../clients/StoreClient";
import type { ZustandStore, StateUpdater } from "../clients/StoreClient";

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  created: Date;
  modified: Date;
  tags: string[];
  nodes: unknown[]; // Node definitions
  connections: unknown[]; // Connection definitions
  metadata: Record<string, unknown>;
}

export interface BlueprintState {
  // All blueprints indexed by ID
  blueprints: Map<string, Blueprint>;

  // Currently selected blueprint ID
  selectedBlueprintId: string | null;

  // Search and filter state
  searchQuery: string;
  filterTags: string[];
  sortBy: "name" | "created" | "modified" | "author";
  sortDirection: "asc" | "desc";

  // UI state
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialBlueprintState: BlueprintState = {
  blueprints: new Map(),
  selectedBlueprintId: null,
  searchQuery: "",
  filterTags: [],
  sortBy: "modified",
  sortDirection: "desc",
  isLoading: false,
  error: null,
};

/**
 * Blueprint Store wrapper class
 */
export class BlueprintStore {
  private zustandStore: ZustandStore<BlueprintState>;
  public actions: BlueprintActions;

  constructor(zustandStore: ZustandStore<BlueprintState>) {
    this.zustandStore = zustandStore;
    this.actions = new BlueprintActions(this);
  }

  /**
   * Get current state
   */
  getState(): BlueprintState {
    return this.zustandStore.getState();
  }

  /**
   * Update state
   */
  setState(updater: StateUpdater<BlueprintState>): void {
    this.zustandStore.setState(updater);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: BlueprintState) => void): () => void {
    return this.zustandStore.subscribe(callback);
  }
}

/**
 * Create the blueprint store
 */
export function createBlueprintStore(): BlueprintStore {
  const zustandStore = storeClient.createZustandStore<BlueprintState>({
    initialState: initialBlueprintState,
    persist: true,
    persistKey: "blueprints",
    persistDebounce: 2000,

    // Only persist blueprint data, not UI state
    persistFilter: (state) => ({
      blueprints: state.blueprints,
      selectedBlueprintId: state.selectedBlueprintId,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
    }),

    // Transform persisted data back to proper types
    hydrateTransform: (persisted) => ({
      ...initialBlueprintState,
      ...persisted,
      blueprints: new Map(
        (persisted as { blueprints?: [string, Blueprint][] }).blueprints || [],
      ),
    }),
  });

  return new BlueprintStore(zustandStore);
}

/**
 * Blueprint store actions
 */
export class BlueprintActions {
  private store: BlueprintStore;

  constructor(store: BlueprintStore) {
    this.store = store;
  }

  /**
   * Add a new blueprint
   */
  addBlueprint(blueprint: Blueprint): void {
    this.store.setState((state) => {
      const newBlueprints = new Map(state.blueprints);
      newBlueprints.set(blueprint.id, blueprint);
      return {
        ...state,
        blueprints: newBlueprints,
      };
    });
  }

  /**
   * Update an existing blueprint
   */
  updateBlueprint(id: string, updates: Partial<Blueprint>): void {
    this.store.setState((state) => {
      const blueprint = state.blueprints.get(id);
      if (!blueprint) {
        return state;
      }

      const newBlueprints = new Map(state.blueprints);
      newBlueprints.set(id, {
        ...blueprint,
        ...updates,
        modified: new Date(),
      });

      return {
        ...state,
        blueprints: newBlueprints,
      };
    });
  }

  /**
   * Delete a blueprint
   */
  deleteBlueprint(id: string): void {
    this.store.setState((state) => {
      const newBlueprints = new Map(state.blueprints);
      newBlueprints.delete(id);

      return {
        ...state,
        blueprints: newBlueprints,
        selectedBlueprintId:
          state.selectedBlueprintId === id ? null : state.selectedBlueprintId,
      };
    });
  }

  /**
   * Select a blueprint
   */
  selectBlueprint(id: string | null): void {
    this.store.setState((state) => ({
      ...state,
      selectedBlueprintId: id,
    }));
  }

  /**
   * Update search query
   */
  setSearchQuery(query: string): void {
    this.store.setState((state) => ({
      ...state,
      searchQuery: query,
    }));
  }

  /**
   * Update filter tags
   */
  setFilterTags(tags: string[]): void {
    this.store.setState((state) => ({
      ...state,
      filterTags: tags,
    }));
  }

  /**
   * Update sort settings
   */
  setSortSettings(
    sortBy: BlueprintState["sortBy"],
    sortDirection: BlueprintState["sortDirection"],
  ): void {
    this.store.setState((state) => ({
      ...state,
      sortBy,
      sortDirection,
    }));
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.store.setState((state) => ({
      ...state,
      isLoading,
    }));
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this.store.setState((state) => ({
      ...state,
      error,
    }));
  }

  /**
   * Clear all blueprints
   */
  clearAll(): void {
    this.store.setState(() => initialBlueprintState);
  }
}

/**
 * Blueprint store selectors
 */
export class BlueprintSelectors {
  /**
   * Get all blueprints as array
   */
  static getAllBlueprints(state: BlueprintState): Blueprint[] {
    return Array.from(state.blueprints.values());
  }

  /**
   * Get selected blueprint
   */
  static getSelectedBlueprint(state: BlueprintState): Blueprint | null {
    return state.selectedBlueprintId
      ? state.blueprints.get(state.selectedBlueprintId) || null
      : null;
  }

  /**
   * Get filtered and sorted blueprints
   */
  static getFilteredBlueprints(state: BlueprintState): Blueprint[] {
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
  }

  /**
   * Get all unique tags
   */
  static getAllTags(state: BlueprintState): string[] {
    const tags = new Set<string>();
    state.blueprints.forEach((bp) => {
      bp.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }
}
