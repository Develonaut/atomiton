import { core } from "@atomiton/core";
import type { EditorState, Element } from "../types";
import { pushHistory } from "../history";

// Pure action functions for testing
export const elementActionFunctions = {
  addElement: (state: EditorState, element: Element) => {
    pushHistory(state);
    state.elements.push(element);
    state.isDirty = true;
  },

  updateElement: (
    state: EditorState,
    id: string,
    updates: Partial<Element>,
  ) => {
    pushHistory(state);
    const elementIndex = state.elements.findIndex((e) => e.id === id);
    if (elementIndex !== -1) {
      state.elements[elementIndex] = {
        ...state.elements[elementIndex],
        ...updates,
      };
      state.isDirty = true;
    }
  },

  deleteElement: (state: EditorState, id: string) => {
    pushHistory(state);
    state.elements = state.elements.filter((element) => element.id !== id);
    state.connections = state.connections.filter(
      (connection) => connection.source !== id && connection.target !== id,
    );
    if (state.selectedElementId === id) {
      state.selectedElementId = null;
    }
    state.isDirty = true;
  },

  setElements: (state: EditorState, elements: Element[]) => {
    const hasChanged =
      JSON.stringify(state.elements) !== JSON.stringify(elements);
    if (hasChanged) {
      pushHistory(state);
    }
    state.elements = elements;
    state.isDirty = true;
  },

  selectElement: (state: EditorState, id: string | null) => {
    state.selectedElementId = id;
  },

  clearSelection: (state: EditorState) => {
    state.selectedElementId = null;
  },
};

// Store-bound actions
export function createElementActions(store: any) {
  return {
    addElement: core.store.createAction(
      store,
      elementActionFunctions.addElement,
    ),
    updateElement: core.store.createAction(
      store,
      elementActionFunctions.updateElement,
    ),
    deleteElement: core.store.createAction(
      store,
      elementActionFunctions.deleteElement,
    ),
    setElements: core.store.createAction(
      store,
      elementActionFunctions.setElements,
    ),
    selectElement: core.store.createAction(
      store,
      elementActionFunctions.selectElement,
    ),
    clearSelection: core.store.createAction(
      store,
      elementActionFunctions.clearSelection,
    ),
  };
}
