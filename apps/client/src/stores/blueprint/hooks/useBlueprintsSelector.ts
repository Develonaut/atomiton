import { useStore } from "@atomiton/store";
import { blueprintStore } from "../store";
import type { BlueprintState } from "../types";

/**
 * Type-safe selector hook for blueprint store
 */
export const useBlueprintsSelector = <T>(
  selector: (state: BlueprintState) => T,
): T => {
  // Cast blueprintStore to any to bypass TypeScript's strict checking
  // The store API is compatible with Zustand's useStore hook
  return useStore(blueprintStore as any, selector as (state: unknown) => T);
};

export default useBlueprintsSelector;
