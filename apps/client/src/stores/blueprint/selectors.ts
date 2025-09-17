import type { BlueprintState } from "./types";

/**
 * Blueprint Store Selectors
 * Only the selectors we actually use in the app
 */

export const selectBlueprintTemplates = (state: BlueprintState) =>
  state.templates;
export const selectBlueprints = (state: BlueprintState) => state.blueprints;
export const selectIsLoading = (state: BlueprintState) => state.isLoading;
export const selectError = (state: BlueprintState) => state.error;
