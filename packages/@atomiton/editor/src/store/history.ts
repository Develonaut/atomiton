import type { EditorState, HistoryEntry } from "./types";
import { MAX_HISTORY_SIZE } from "./types";

export function pushHistory(state: EditorState) {
  const entry: HistoryEntry = {
    elements: [...state.elements],
    connections: [...state.connections],
    selectedElementId: state.selectedElementId,
  };
  state.history.past.push(entry);
  state.history.future = [];
  if (state.history.past.length > MAX_HISTORY_SIZE) {
    state.history.past.shift();
  }
}

export function createHistoryActions(store: any) {
  return {
    undo: (state: EditorState) => {
      if (state.history.past.length === 0) return;

      const currentEntry: HistoryEntry = {
        elements: [...state.elements],
        connections: [...state.connections],
        selectedElementId: state.selectedElementId,
      };

      const previousEntry = state.history.past.pop()!;
      state.history.future.push(currentEntry);

      state.elements = previousEntry.elements;
      state.connections = previousEntry.connections;
      state.selectedElementId = previousEntry.selectedElementId;
    },

    redo: (state: EditorState) => {
      if (state.history.future.length === 0) return;

      const currentEntry: HistoryEntry = {
        elements: [...state.elements],
        connections: [...state.connections],
        selectedElementId: state.selectedElementId,
      };

      const nextEntry = state.history.future.pop()!;
      state.history.past.push(currentEntry);

      state.elements = nextEntry.elements;
      state.connections = nextEntry.connections;
      state.selectedElementId = nextEntry.selectedElementId;
    },

    clearHistory: (state: EditorState) => {
      state.history.past = [];
      state.history.future = [];
    },
  };
}
