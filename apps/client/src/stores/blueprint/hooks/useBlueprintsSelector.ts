import { useStore } from "@atomiton/store";
import { blueprintStore } from "../store";
import type { BlueprintState } from "../types";

/**
 * Type-safe selector hook for blueprint store
 */
export const useBlueprintsSelector = <T>(
  selector: (state: BlueprintState) => T,
): T => {
  // useStore from Zustand is re-exported by @atomiton/store and expects
  // the store to have Zustand's internal API shape. Since blueprintStore
  // is created via createStore which returns Store<T>, we need to cast.
  return useStore(
    // TODO: Fix typing in blueprintStore to avoid this cast.
    blueprintStore as unknown as Parameters<typeof useStore>[0],
    selector as (state: unknown) => T,
  );
};

export default useBlueprintsSelector;
