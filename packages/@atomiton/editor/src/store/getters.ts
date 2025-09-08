import type { EditorState } from "./types";

export function createGetters(store: any) {
  return {
    getElements: () => store.getState().elements,
    getConnections: () => store.getState().connections,
    getSelectedElementId: () => store.getState().selectedElementId,
    getSelectedElement: () => {
      const state: EditorState = store.getState();
      return state.elements.find(
        (element) => element.id === state.selectedElementId,
      );
    },
    isLoading: () => store.getState().isLoading,
    isDirty: () => store.getState().isDirty,
    getFlowInstance: () => store.getState().flowInstance,
    canUndo: () => store.getState().history.past.length > 0,
    canRedo: () => store.getState().history.future.length > 0,
  };
}
