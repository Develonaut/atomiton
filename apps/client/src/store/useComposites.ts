/**
 * useComposites Hook
 *
 * Provides access to user-created composites
 */

import {
  compositeActions,
  compositeStore,
  type CompositeState,
} from "#store/composites";

const selectComposites = (state: CompositeState) => state.composites;
const selectIsLoading = (state: CompositeState) => state.isLoading;
const selectError = (state: CompositeState) => state.error;

export function useComposites() {
  const composites = compositeStore.useStore(selectComposites);
  const isLoading = compositeStore.useStore(selectIsLoading);
  const error = compositeStore.useStore(selectError);

  return {
    composites,
    isLoading,
    error,
    actions: compositeActions,
  };
}
