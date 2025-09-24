/**
 * Template Store
 *
 * Manages system-provided node templates (read-only)
 */

import {
  loadBuiltInTemplates,
  getAllTemplates,
  getTemplate,
} from "@atomiton/nodes/definitions";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { createStore } from "@atomiton/store";

// Types
export type TemplateState = {
  templates: NodeDefinition[];
  isLoading: boolean;
  error: string | null;
};

export type TemplateActions = {
  loadTemplates: () => Promise<void>;
  getTemplate: (id: string) => NodeDefinition | undefined;
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
  loadTemplates: async () => {
    templateStore.setState((state: TemplateState) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      // Load built-in templates from YAML files
      await loadBuiltInTemplates();

      // Get all loaded templates and deduplicate by ID
      const allTemplates = getAllTemplates();
      const uniqueTemplates = allTemplates.filter(
        (template, index, arr) =>
          arr.findIndex((t) => t.id === template.id) === index,
      );

      templateStore.setState((state: TemplateState) => {
        state.templates = uniqueTemplates;
        state.isLoading = false;
        state.error = null;
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load templates";

      templateStore.setState((state: TemplateState) => {
        state.isLoading = false;
        state.error = errorMessage;
      });
    }
  },

  getTemplate: (id: string) => {
    // Use the registry function directly for most up-to-date data
    return getTemplate(id);
  },
};
