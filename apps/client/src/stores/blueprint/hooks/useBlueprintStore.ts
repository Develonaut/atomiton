/**
 * useBlueprintStore Hook
 *
 * Central hook for accessing the blueprint store with proper typing.
 * This eliminates the need to import useStore and blueprintStore separately
 * in every hook/component that needs blueprint state.
 */

import { useStore } from "@atomiton/store";
import { blueprintStore } from "..";
import type { BlueprintState } from "../types";

/**
 * Hook to access the blueprint store with a selector
 *
 * @param selector - Function to select specific data from the blueprint state
 * @returns The selected data from the blueprint store
 *
 * @example
 * // Select all blueprints
 * const blueprints = useBlueprintStore(state => state.blueprints);
 *
 * @example
 * // Select multiple values
 * const { blueprints, isLoading } = useBlueprintStore(state => ({
 *   blueprints: state.blueprints,
 *   isLoading: state.isLoading
 * }));
 */
export function useBlueprintStore<T>(
  selector: (state: BlueprintState) => T,
): T {
  return useStore(blueprintStore, selector);
}
