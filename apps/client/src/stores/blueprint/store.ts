import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createCrudModule } from "./modules/crud";
import type { BlueprintState, BlueprintStoreActions } from "./types";

export const store = create<BlueprintState>()(
  devtools(
    persist(
      immer((set) => ({
        blueprints: [],
        isLoading: false,
        error: null,
        isHydrated: false,
        // Add setState method for the crud module
        setState: set,
      })),
      {
        name: "atomiton-blueprints",
        // Only persist user data, not templates or loading state
        partialize: (state) => ({
          blueprints: state.blueprints.filter((bp) => !(bp as any).isTemplate),
        }),
        // Handle rehydration
        onRehydrateStorage: () => {
          console.log("hydration starts");

          return (state: BlueprintState | undefined, error: Error | null) => {
            if (error) {
              console.log("an error happened during hydration", error);
            } else {
              console.log("hydration finished");
              // Initialize templates on successful rehydration
              if (state) {
                state.isHydrated = true;
                // Import initializeTemplates and call it
                import("./utils/initializeTemplates").then(
                  ({ initializeTemplates }) => {
                    initializeTemplates();
                  },
                );
              }
            }
          };
        },
      },
    ),
    { name: "BlueprintStore" },
  ),
);

const crudModule = createCrudModule(store);

// ============================================================================
// Exported Store
// ============================================================================

export const blueprintStore = {
  ...store,
  ...crudModule,
} as BlueprintStoreActions;

export type BlueprintStore = typeof blueprintStore;
