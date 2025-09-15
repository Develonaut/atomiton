import type { Blueprint, BlueprintState } from "./types";

/**
 * Blueprint Store Selectors
 * Only the selectors we actually use in the app
 */

export const selectBlueprints = (state: BlueprintState) => state.blueprints;
export const selectIsLoading = (state: BlueprintState) => state.isLoading;
export const selectError = (state: BlueprintState) => state.error;
export const selectBlueprintById =
  (id: string | undefined) =>
  (state: BlueprintState): Blueprint | undefined => {
    if (!id) return undefined;
    return state.blueprints.find((bp) => bp.id === id);
  };

// Selector for getting nodes and edges from a blueprint
export const selectBlueprintNodesAndEdges = (
  blueprint: Blueprint | undefined,
) => {
  if (!blueprint) {
    return { nodes: [], edges: [] };
  }
  return {
    nodes: blueprint.getChildNodes ? blueprint.getChildNodes() : [],
    edges: blueprint.getExecutionFlow ? blueprint.getExecutionFlow() : [],
  };
};

// Selector for getting only template blueprints
export const selectTemplates = (blueprints: Blueprint[]): Blueprint[] => {
  return blueprints.filter((bp) => (bp as any).isTemplate === true);
};

// Selector for getting only user blueprints (non-templates)
export const selectUserBlueprints = (blueprints: Blueprint[]): Blueprint[] => {
  return blueprints.filter((bp) => (bp as any).isTemplate !== true);
};
