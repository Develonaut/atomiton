/**
 * Blueprint Store
 *
 * Clean, modular store following Bento Box principles
 */

import { createStore } from "@atomiton/store";
import { createCrudModule, type CrudActions } from "./modules/crud";
import {
  createTemplateModule,
  type TemplateActions,
} from "./modules/templates";
import type { BlueprintState } from "./types";

const initialState: BlueprintState = {
  templates: [],
  blueprints: [],
  isLoading: false,
  error: null,
};

// Create the base store
export const blueprintStore = createStore<BlueprintState>(() => initialState, {
  name: "blueprint",
  persist: {
    partialize: (state) => ({
      blueprints: state.blueprints,
    }),
  },
});

// Create module instances
const templateModule = createTemplateModule(blueprintStore);
const crudModule = createCrudModule(blueprintStore);

// Export combined actions interface
export type BlueprintStoreActions = CrudActions & TemplateActions;

// Export actions object combining all modules
export const blueprintActions: BlueprintStoreActions = {
  ...templateModule,
  ...crudModule,
};
