import { core } from "@atomiton/core";
import type { ReactFlowInstance } from "@xyflow/react";
import type { EditorState } from "../types";

// Pure action functions for testing
export const uiActionFunctions = {
  setFlowInstance: (state: EditorState, instance: ReactFlowInstance | null) => {
    state.flowInstance = instance;
  },

  setLoading: (state: EditorState, isLoading: boolean) => {
    state.isLoading = isLoading;
  },

  setDirty: (state: EditorState, isDirty: boolean) => {
    state.isDirty = isDirty;
  },

  openAnimationSettings: (state: EditorState) => {
    state.isAnimationSettings = true;
  },

  closeAnimationSettings: (state: EditorState) => {
    state.isAnimationSettings = false;
  },
};

// Store-bound actions
export function createUIActions(store: any) {
  return {
    setFlowInstance: core.store.createAction(
      store,
      uiActionFunctions.setFlowInstance,
    ),
    setLoading: core.store.createAction(store, uiActionFunctions.setLoading),
    setDirty: core.store.createAction(store, uiActionFunctions.setDirty),
    openAnimationSettings: core.store.createAction(
      store,
      uiActionFunctions.openAnimationSettings,
    ),
    closeAnimationSettings: core.store.createAction(
      store,
      uiActionFunctions.closeAnimationSettings,
    ),
  };
}
