import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  blueprintStore,
  blueprintActions,
  type BlueprintData,
} from "../stores/blueprintStore";

export function useBlueprintStore() {
  const state = useSyncExternalStore(
    blueprintStore.subscribe,
    blueprintStore.getState,
    blueprintStore.getState,
  );

  const userBlueprints = useMemo(
    () => Array.from(state.blueprints.values()),
    [state.blueprints],
  );

  const predefinedBlueprints = useMemo(
    () => Array.from(state.predefinedBlueprints.values()),
    [state.predefinedBlueprints],
  );

  const communityBlueprints = useMemo(
    () => Array.from(state.communityBlueprints.values()),
    [state.communityBlueprints],
  );

  const allBlueprints = useMemo(
    () => [...userBlueprints, ...predefinedBlueprints, ...communityBlueprints],
    [userBlueprints, predefinedBlueprints, communityBlueprints],
  );

  const currentBlueprint = useMemo(
    () =>
      state.currentBlueprintId
        ? blueprintActions.getBlueprint(state.currentBlueprintId)
        : null,
    [state.currentBlueprintId],
  );

  const createBlueprint = useCallback(
    (
      name: string,
      nodes: BlueprintData["nodes"] = [],
      edges: BlueprintData["edges"] = [],
      description?: string,
    ): string => {
      const id = `blueprint-${Date.now()}`;
      const now = new Date().toISOString();

      const blueprint: BlueprintData = {
        id,
        name,
        description,
        version: 1,
        createdAt: now,
        updatedAt: now,
        nodes,
        edges,
      };

      blueprintActions.addBlueprint(blueprint);
      return id;
    },
    [],
  );

  const saveBlueprint = useCallback(
    (
      id: string,
      nodes: BlueprintData["nodes"],
      edges: BlueprintData["edges"],
      viewport?: BlueprintData["viewport"],
    ) => {
      const existing = blueprintActions.getBlueprint(id);
      if (!existing) {
        throw new Error(`Blueprint ${id} not found`);
      }

      blueprintActions.updateBlueprint(id, {
        nodes,
        edges,
        viewport,
        version: existing.version + 1,
      });
    },
    [],
  );

  const loadBlueprint = useCallback((id: string): BlueprintData | undefined => {
    const blueprint = blueprintActions.getBlueprint(id);
    if (blueprint) {
      blueprintActions.setCurrentBlueprint(id);
    }
    return blueprint;
  }, []);

  const deleteBlueprint = useCallback((id: string) => {
    blueprintActions.deleteBlueprint(id);
  }, []);

  const duplicateBlueprint = useCallback(
    (id: string, newName?: string): string | null => {
      return blueprintActions.duplicateBlueprint(id, newName);
    },
    [],
  );

  const renameBlueprint = useCallback((id: string, newName: string) => {
    blueprintActions.updateBlueprint(id, { name: newName });
  }, []);

  return {
    // State
    userBlueprints,
    predefinedBlueprints,
    communityBlueprints,
    allBlueprints,
    currentBlueprint,
    currentBlueprintId: state.currentBlueprintId,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    createBlueprint,
    saveBlueprint,
    loadBlueprint,
    deleteBlueprint,
    duplicateBlueprint,
    renameBlueprint,
    setCurrentBlueprint: blueprintActions.setCurrentBlueprint,
    clearUserBlueprints: blueprintActions.clearUserBlueprints,
    loadPredefinedBlueprints: blueprintActions.loadPredefinedBlueprints,
  };
}

export type UseBlueprintStoreReturn = ReturnType<typeof useBlueprintStore>;
