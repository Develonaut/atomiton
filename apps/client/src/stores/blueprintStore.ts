import { createStore } from "@atomiton/store";
import type { Store } from "@atomiton/store";

export interface BlueprintData {
  id: string;
  name: string;
  description?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  nodes: unknown[];
  edges: unknown[];
  viewport?: unknown;
  metadata?: {
    tags?: string[];
    category?: string;
    author?: string;
    isPredefined?: boolean;
    isCommunity?: boolean;
  };
}

export interface BlueprintState {
  blueprints: Map<string, BlueprintData>;
  predefinedBlueprints: Map<string, BlueprintData>;
  communityBlueprints: Map<string, BlueprintData>;
  currentBlueprintId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BlueprintState = {
  blueprints: new Map(),
  predefinedBlueprints: new Map(),
  communityBlueprints: new Map(),
  currentBlueprintId: null,
  isLoading: false,
  error: null,
};

export const blueprintStore: Store<BlueprintState> = createStore(
  () => initialState,
  {
    name: "BlueprintStore",
    persist: {
      key: "user-blueprints",
    },
  },
);

export const blueprintActions = {
  addBlueprint: (blueprint: BlueprintData) => {
    blueprintStore.setState((state) => {
      if (blueprint.metadata?.isPredefined) {
        state.predefinedBlueprints.set(blueprint.id, blueprint);
      } else if (blueprint.metadata?.isCommunity) {
        state.communityBlueprints.set(blueprint.id, blueprint);
      } else {
        state.blueprints.set(blueprint.id, blueprint);
      }
      state.currentBlueprintId = blueprint.id;
    });
  },

  updateBlueprint: (id: string, updates: Partial<BlueprintData>) => {
    blueprintStore.setState((state) => {
      const existing = state.blueprints.get(id);
      if (existing) {
        const updated: BlueprintData = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: updates.version ?? existing.version,
        };
        state.blueprints.set(id, updated);
      }
    });
  },

  deleteBlueprint: (id: string) => {
    blueprintStore.setState((state) => {
      state.blueprints.delete(id);
      if (state.currentBlueprintId === id) {
        state.currentBlueprintId = null;
      }
    });
  },

  getBlueprint: (id: string): BlueprintData | undefined => {
    const state = blueprintStore.getState();
    return (
      state.blueprints.get(id) ||
      state.predefinedBlueprints.get(id) ||
      state.communityBlueprints.get(id)
    );
  },

  getAllBlueprints: (): BlueprintData[] => {
    const state = blueprintStore.getState();
    return [
      ...Array.from(state.blueprints.values()),
      ...Array.from(state.predefinedBlueprints.values()),
      ...Array.from(state.communityBlueprints.values()),
    ];
  },

  getUserBlueprints: (): BlueprintData[] => {
    return Array.from(blueprintStore.getState().blueprints.values());
  },

  getPredefinedBlueprints: (): BlueprintData[] => {
    return Array.from(blueprintStore.getState().predefinedBlueprints.values());
  },

  getCommunityBlueprints: (): BlueprintData[] => {
    return Array.from(blueprintStore.getState().communityBlueprints.values());
  },

  setCurrentBlueprint: (id: string | null) => {
    blueprintStore.setState((state) => {
      state.currentBlueprintId = id;
    });
  },

  duplicateBlueprint: (id: string, newName?: string): string | null => {
    const original = blueprintActions.getBlueprint(id);
    if (!original) return null;

    const duplicateId = `blueprint-${Date.now()}`;
    const duplicate: BlueprintData = {
      ...original,
      id: duplicateId,
      name: newName || `${original.name} (Copy)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        ...original.metadata,
        isPredefined: false,
        isCommunity: false,
      },
    };

    blueprintActions.addBlueprint(duplicate);
    return duplicateId;
  },

  incrementVersion: (id: string) => {
    blueprintStore.setState((state) => {
      const blueprint = state.blueprints.get(id);
      if (blueprint) {
        blueprint.version += 1;
        blueprint.updatedAt = new Date().toISOString();
      }
    });
  },

  clearUserBlueprints: () => {
    blueprintStore.setState((state) => {
      state.blueprints.clear();
      state.currentBlueprintId = null;
      state.error = null;
    });
  },

  setError: (error: string | null) => {
    blueprintStore.setState((state) => {
      state.error = error;
    });
  },

  setLoading: (isLoading: boolean) => {
    blueprintStore.setState((state) => {
      state.isLoading = isLoading;
    });
  },

  loadPredefinedBlueprints: async () => {
    // In the future, this could load from a server or bundled assets
    // For now, you can hardcode some predefined blueprints
    const predefined: BlueprintData[] = [
      // Add predefined blueprints here
    ];

    blueprintStore.setState((state) => {
      state.predefinedBlueprints.clear();
      predefined.forEach((bp) => {
        state.predefinedBlueprints.set(bp.id, bp);
      });
    });
  },
};

export type BlueprintStore = typeof blueprintStore;
export type BlueprintActions = typeof blueprintActions;
