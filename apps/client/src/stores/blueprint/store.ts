import { createStore } from "@atomiton/store";
import { createCrudModule } from "./modules/crud";
import type { BlueprintState, BlueprintStoreActions } from "./types";
import { initializeTemplates } from "./utils/initializeTemplates";

const initialState: BlueprintState = {
  templates: initializeTemplates(),
  userBlueprints: [],
  isLoading: false,
  error: null,
};

const store = createStore<BlueprintState>(() => initialState, {
  name: "blueprint",
  persist: {
    partialize: (state) => ({
      userBlueprints: state.userBlueprints,
    }),
  },
});

const crudModule = createCrudModule(store);

// ============================================================================
// Exported Store
// ============================================================================

export const blueprintStore: BlueprintStoreActions = {
  ...store,
  ...crudModule,
};

export type BlueprintStore = typeof blueprintStore;
