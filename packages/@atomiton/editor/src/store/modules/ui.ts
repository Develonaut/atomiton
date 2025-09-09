/**
 * Domain: UI State Management
 *
 * Purpose: Manages global UI state and user interaction states
 *
 * Responsibilities:
 * - Track selected elements and focus management
 * - Manage loading states for async operations
 * - Handle dirty state tracking for unsaved changes
 * - Provide clean UI state transitions and updates
 */

import type { BaseStore } from "../types";

export interface UIActions {
  selectElement: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setDirty: (isDirty: boolean) => void;
}

export const createUIModule = (store: BaseStore): UIActions => ({
  selectElement: (id: string | null) => {
    store.setState((state) => ({
      ...state,
      selectedElementId: id,
    }));
  },

  setLoading: (isLoading: boolean) => {
    store.setState((state) => ({
      ...state,
      isLoading,
    }));
  },

  setDirty: (isDirty: boolean) => {
    store.setState((state) => ({
      ...state,
      isDirty,
    }));
  },
});
