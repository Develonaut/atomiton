import type { Blueprint } from "..";
import { selectTemplates, selectIsLoading } from "../selectors";
import { useBlueprintStore } from "./useBlueprintStore";

interface UseTemplateBlueprintsReturn {
  templates: Blueprint[];
  isLoading: boolean;
}

/**
 * Hook for accessing template blueprints from the store
 *
 * @returns Object containing template blueprints and loading state
 *
 * @example
 * const { templates, isLoading } = useTemplateBlueprints();
 */
export function useTemplateBlueprints(): UseTemplateBlueprintsReturn {
  const templates = useBlueprintStore(selectTemplates);
  const isLoading = useBlueprintStore(selectIsLoading);

  // Ensure templates is always an array
  const safeTemplates = Array.isArray(templates) ? templates : [];

  return {
    templates: safeTemplates,
    isLoading: isLoading ?? false,
  };
}
