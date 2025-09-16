import { type Blueprint } from "..";
import { selectIsLoading, selectUserBlueprints } from "../selectors";
import { useBlueprintStore } from "./useBlueprintStore";

type UseUserBlueprintsReturn = {
  blueprints: Blueprint[];
  isLoading: boolean;
};

/**
 * Hook for accessing user-created blueprints from the store
 *
 * @returns Object containing user blueprints and loading state
 *
 * @example
 * const { blueprints, isLoading } = useUserBlueprints();
 */
export function useUserBlueprints(): UseUserBlueprintsReturn {
  const blueprints = useBlueprintStore(selectUserBlueprints);
  const isLoading = useBlueprintStore(selectIsLoading);

  return {
    blueprints,
    isLoading,
  };
}
