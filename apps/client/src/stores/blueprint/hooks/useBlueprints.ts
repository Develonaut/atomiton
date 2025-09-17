/**
 * useBlueprints Hook
 *
 * Single, clean hook for all blueprint needs
 */

import { useDidMount } from "@atomiton/hooks";
import { useMemo } from "react";
import { blueprintActions } from "../store";
import type { BlueprintState } from "../types";
import useBlueprintsSelector from "./useBlueprintsSelector";

const selectBlueprintTemplates = (state: BlueprintState) => state.templates;
const selectBlueprints = (state: BlueprintState) => state.blueprints;
const selectIsLoading = (state: BlueprintState) => state.isLoading;
const selectError = (state: BlueprintState) => state.error;

export function useBlueprints() {
  const templates = useBlueprintsSelector(selectBlueprintTemplates);
  const blueprints = useBlueprintsSelector(selectBlueprints);
  const isLoading = useBlueprintsSelector(selectIsLoading);
  const error = useBlueprintsSelector(selectError);

  useDidMount(() => {
    blueprintActions.loadTemplates();
  });

  const handlers = useMemo(
    () => ({
      create: blueprintActions.create,
      update: blueprintActions.update,
      remove: blueprintActions.remove,
      findById: blueprintActions.findById,
    }),
    [],
  );

  return {
    templates,
    blueprints,
    isLoading,
    error,
    actions: handlers,
  };
}
