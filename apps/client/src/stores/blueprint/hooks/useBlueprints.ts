import type { Blueprint } from "..";
import {
  selectBlueprints,
  selectIsLoading,
  selectTemplates,
  selectUserBlueprints,
} from "../selectors";
import { useBlueprintStore } from "./useBlueprintStore";

type BlueprintType = "template" | "user" | undefined;

interface UseBlueprintsReturn {
  blueprints: Blueprint[]; // The filtered blueprints based on type
  isLoading: boolean;
}

/**
 * Hook for accessing blueprints from the store
 *
 * @param type - Optional type to filter blueprints:
 *   - undefined: Returns all blueprints (default)
 *   - 'template': Returns only template blueprints
 *   - 'user': Returns only user-created blueprints
 *
 * @returns Object containing blueprints and loading state
 *
 * @example
 * // Get all blueprints (default)
 * const { blueprints } = useBlueprints();
 *
 * @example
 * // Get only templates
 * const { blueprints } = useBlueprints('template');
 *
 * @example
 * // Get only user blueprints
 * const { blueprints } = useBlueprints('user');
 */
export function useBlueprints(type?: BlueprintType): UseBlueprintsReturn {
  const allBlueprints = useBlueprintStore(selectBlueprints);
  const isLoading = useBlueprintStore(selectIsLoading);

  // Determine which blueprints to return based on type
  let blueprints: Blueprint[];

  switch (type) {
    case "template":
      blueprints = selectTemplates(allBlueprints);
      break;
    case "user":
      blueprints = selectUserBlueprints(allBlueprints);
      break;
    default:
      blueprints = allBlueprints;
      break;
  }

  return {
    blueprints,
    isLoading,
  };
}
