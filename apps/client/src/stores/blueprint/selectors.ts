import type { Blueprint, BlueprintState } from "./types";

/**
 * Blueprint Store Selectors
 * Only the selectors we actually use in the app
 */

// Get only templates (stable reference)
export const selectTemplates = (state: BlueprintState) => state.templates;

// Get only user blueprints (stable reference)
export const selectUserBlueprints = (state: BlueprintState) =>
  state.userBlueprints;

// Get all blueprints - NOTE: Creates new array, use with caution
export const selectAllBlueprints = (state: BlueprintState): Blueprint[] => {
  // Combine both arrays
  return [...state.templates, ...state.userBlueprints];
};

export const selectIsLoading = (state: BlueprintState) => state.isLoading;
export const selectError = (state: BlueprintState) => state.error;

// Find blueprint by ID (check both templates and user blueprints)
export const selectBlueprintById =
  (id: string | undefined) =>
  (state: BlueprintState): Blueprint | undefined => {
    if (!id) return undefined;
    // Check templates first
    const template = state.templates.find((bp) => bp.id === id);
    if (template) return template;
    // Then check user blueprints
    return state.userBlueprints.find((bp) => bp.id === id);
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
