/**
 * Blueprint Store Types
 *
 * Blueprints ARE composite nodes.
 * The store holds ICompositeNode instances directly.
 */

import type { ICompositeNode } from "@atomiton/nodes";
import type { StateCreator } from "zustand";
import { CrudActions } from "./modules/crud";

/**
 * A Blueprint is just a composite node
 * We store ICompositeNode instances directly in the store
 */
export type Blueprint = ICompositeNode;

/**
 * Blueprint state for the store
 * Just stores composite nodes with UI metadata
 */
export interface BlueprintState {
  blueprints: Blueprint[];
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean; // Track hydration status for proper initialization
  setState: (updater: (state: BlueprintState) => void) => void;
}

export type BlueprintStoreActions = {
  getState: () => BlueprintState;
  setState: (updater: (state: BlueprintState) => void) => void;
  subscribe: (listener: (state: BlueprintState) => void) => () => void;
} & CrudActions;
