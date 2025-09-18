/**
 * Template Store
 *
 * Manages system-provided composite templates (read-only)
 */

import {
  compositeTemplates,
  type CompositeDefinition,
} from "@atomiton/nodes/browser";
import { createStore } from "@atomiton/store";

// Types
export type TemplateState = {
  templates: CompositeDefinition[];
  isLoading: boolean;
  error: string | null;
};

export type TemplateActions = {
  loadTemplates: () => void;
  getTemplate: (id: string) => CompositeDefinition | undefined;
};

// Initial state
const initialState: TemplateState = {
  templates: [],
  isLoading: false,
  error: null,
};

// Store
export const templateStore = createStore<TemplateState>(() => initialState, {
  name: "Templates",
  persist: {
    key: "templates",
  },
});

// Actions
export const templateActions: TemplateActions = {
  loadTemplates: () => {
    templateStore.setState((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      // Load templates from @atomiton/nodes package
      const allTemplates = compositeTemplates;

      templateStore.setState((state) => {
        state.templates = allTemplates;
        state.isLoading = false;
        state.error = null;
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load templates";

      templateStore.setState((state) => {
        state.isLoading = false;
        state.error = errorMessage;
      });
    }
  },

  getTemplate: (id: string) => {
    const state = templateStore.getState();
    return state.templates.find((template) => template.id === id);
  },
};
