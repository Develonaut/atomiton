/**
 * useTemplates Hook
 *
 * Provides access to system templates
 */

import {
  templateActions,
  templateStore,
  type TemplateState,
} from "#store/templates";
import { useDidMount } from "@atomiton/hooks";

const selectTemplates = (state: TemplateState) => state.templates;
const selectIsLoading = (state: TemplateState) => state.isLoading;
const selectError = (state: TemplateState) => state.error;

export function useTemplates() {
  const templates = templateStore.useStore(selectTemplates);
  const isLoading = templateStore.useStore(selectIsLoading);
  const error = templateStore.useStore(selectError);

  // Auto-load templates on mount
  useDidMount(() => {
    templateActions.loadTemplates();
  });

  return {
    templates,
    isLoading,
    error,
    actions: templateActions,
  };
}
