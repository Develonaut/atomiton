/**
 * Domain: Template Management
 *
 * Purpose: Manages loading and providing access to blueprint templates from @atomiton/nodes
 *
 * Responsibilities:
 * - Load templates from @atomiton/nodes package
 * - Use CompositeDefinition data directly (no unnecessary conversion)
 * - Handle loading states and errors
 * - Provide template lookup utilities
 */

import { getAllTemplates } from "@atomiton/nodes/browser";
import type { Blueprint, BlueprintState } from "../types";

export type TemplateActions = {
  loadTemplates: () => void;
  getTemplateById: (id: string) => Blueprint | undefined;
};

export function createTemplateModule(store: {
  getState: () => BlueprintState;
  setState: (updater: (state: BlueprintState) => void) => void;
}): TemplateActions {
  return {
    loadTemplates: () => {
      const currentState = store.getState();

      // Skip if already loaded or currently loading
      if (currentState.templates.length > 0 || currentState.isLoading) {
        return;
      }

      store.setState((state) => {
        state.isLoading = true;
      });

      try {
        // Load templates from @atomiton/nodes
        const compositeTemplates = getAllTemplates();

        const templates: Blueprint[] = compositeTemplates.map((template) => {
          // Use the CompositeDefinition directly - it already has all the data we need
          const definition = template.definition;
          return {
            ...definition, // This gives us all CompositeDefinition fields: id, name, description, category, type, version, nodes, edges, variables, settings, metadata
            // The metadata.source: "system" flag is already set in the YAML files
          };
        });

        store.setState((state) => {
          state.templates = templates;
          state.isLoading = false;
          state.error = null;
        });
      } catch (error) {
        store.setState((state) => {
          state.error =
            error instanceof Error ? error.message : "Failed to load templates";
          state.isLoading = false;
        });
      }
    },

    getTemplateById: (id: string) => {
      const state = store.getState();
      return state.templates.find((template) => template.id === id);
    },
  };
}
