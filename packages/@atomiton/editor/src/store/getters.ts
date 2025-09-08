import type { EditorState } from "./types";

export function createGetters(store: any) {
  return {
    getElements: () => store.getState().elements,
    getSortedElements: () => {
      const elements = store.getState().elements;
      return [...elements].sort((a, b) => {
        // First sort by y position (top to bottom)
        if (a.position?.y !== b.position?.y) {
          return (a.position?.y || 0) - (b.position?.y || 0);
        }
        // Then by x position (left to right)
        if (a.position?.x !== b.position?.x) {
          return (a.position?.x || 0) - (b.position?.x || 0);
        }
        // Fallback to ID comparison
        return a.id.localeCompare(b.id);
      });
    },
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
