/**
 * Session Store - Functional state management for session
 */

import { createStore, createActions } from "../../base";
import type { Store } from "../../base";
import type { SessionState } from "./types";

export * from "./types";

// Initial state
const initialState: SessionState = {
  dragItem: null,
  selection: null,
  clipboard: null,
  undoStack: [],
  redoStack: [],
  hoveredNodeId: null,
  focusedElementId: null,
  contextMenu: null,
  commandPalette: {
    visible: false,
    searchQuery: "",
  },
  shortcuts: new Map(),
  activeKeys: new Set(),
  mousePosition: { x: 0, y: 0 },
  scrollPosition: { x: 0, y: 0 },
  zoomLevel: 1,
  canUndo: false,
  canRedo: false,
  isDirty: false,
  lastSaved: null,
};

// Actions
const actions = {
  setDragItem: (state: SessionState, item: SessionState["dragItem"]) => {
    state.dragItem = item;
  },
  clearDragItem: (state: SessionState) => {
    state.dragItem = null;
  },
};

// Store type
export type SessionStore = Store<SessionState> & {
  actions: ReturnType<typeof createActions<SessionState, typeof actions>>;
};

// Create store
export function createSessionStore(): SessionStore {
  const store = createStore<SessionState>({ initialState });

  return {
    ...store,
    actions: createActions(store, actions),
  };
}
