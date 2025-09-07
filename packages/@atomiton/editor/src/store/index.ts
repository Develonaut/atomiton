import { core } from "@atomiton/core";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

// Generic editor concepts - the editor just knows about "elements" and "connections"
// It doesn't care what they represent in the domain
interface EditorState {
  elements: Element[]; // Generic moveable/configurable items
  connections: Connection[]; // Links between elements
  selectedElementId: string | null;
  isLoading: boolean;
  isDirty: boolean;
  flowInstance: ReactFlowInstance | null;
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
}

// For now, we alias to ReactFlow types but this abstraction
// allows us to swap out the underlying implementation
type Element = Node; // Could be any draggable/configurable item
type Connection = Edge; // Could be any link between items

interface HistoryEntry {
  elements: Element[];
  connections: Connection[];
  selectedElementId: string | null;
}

const MAX_HISTORY_SIZE = 50;

const initialState: EditorState = {
  elements: [],
  connections: [],
  selectedElementId: null,
  isLoading: false,
  isDirty: false,
  flowInstance: null,
  history: {
    past: [],
    future: [],
  },
};

function pushHistory(state: EditorState) {
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

const store = core.store.createStore<EditorState>({
  initialState,
});

export const editorStore = {
  ...store,

  // Element operations (generic items that can be positioned and configured)
  addElement: core.store.createAction(store, (state, element: Element) => {
    pushHistory(state);
    state.elements.push(element);
    state.isDirty = true;
  }),

  updateElement: core.store.createAction(
    store,
    (state, id: string, updates: Partial<Element>) => {
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
  ),

  deleteElement: core.store.createAction(store, (state, id: string) => {
    pushHistory(state);
    state.elements = state.elements.filter((element) => element.id !== id);
    state.connections = state.connections.filter(
      (connection) => connection.source !== id && connection.target !== id,
    );
    if (state.selectedElementId === id) {
      state.selectedElementId = null;
    }
    state.isDirty = true;
  }),

  // Connection operations (links between elements)
  addConnection: core.store.createAction(
    store,
    (state, connection: Connection) => {
      pushHistory(state);
      state.connections.push(connection);
      state.isDirty = true;
    },
  ),

  deleteConnection: core.store.createAction(store, (state, id: string) => {
    pushHistory(state);
    state.connections = state.connections.filter(
      (connection) => connection.id !== id,
    );
    state.isDirty = true;
  }),

  // Bulk operations
  setElements: core.store.createAction(store, (state, elements: Element[]) => {
    state.elements = elements;
    state.isDirty = true;
  }),

  setConnections: core.store.createAction(
    store,
    (state, connections: Connection[]) => {
      state.connections = connections;
      state.isDirty = true;
    },
  ),

  // Selection
  selectElement: core.store.createAction(store, (state, id: string | null) => {
    state.selectedElementId = id;
  }),

  clearSelection: core.store.createAction(store, (state) => {
    state.selectedElementId = null;
  }),

  // History
  undo: core.store.createAction(store, (state) => {
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
  }),

  redo: core.store.createAction(store, (state) => {
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
  }),

  // Clear history
  clearHistory: core.store.createAction(store, (state) => {
    state.history.past = [];
    state.history.future = [];
  }),

  // UI State
  setFlowInstance: core.store.createAction(
    store,
    (state, instance: ReactFlowInstance | null) => {
      state.flowInstance = instance;
    },
  ),

  setLoading: core.store.createAction(store, (state, isLoading: boolean) => {
    state.isLoading = isLoading;
  }),

  setDirty: core.store.createAction(store, (state, isDirty: boolean) => {
    state.isDirty = isDirty;
  }),

  // Getters
  getElements: () => store.getState().elements,
  getConnections: () => store.getState().connections,
  getSelectedElementId: () => store.getState().selectedElementId,
  getSelectedElement: () => {
    const state = store.getState();
    return state.elements.find(
      (element) => element.id === state.selectedElementId,
    );
  },
  isLoading: () => store.getState().isLoading,
  isDirty: () => store.getState().isDirty,
  getFlowInstance: () => store.getState().flowInstance,
  canUndo: () => store.getState().history.past.length > 0,
  canRedo: () => store.getState().history.future.length > 0,

  // Compatibility layer - maps generic terms to domain terms
  // This allows consuming code to gradually migrate
  addNode: (node: Node) => editorStore.addElement(node),
  updateNode: (id: string, updates: Partial<Node>) =>
    editorStore.updateElement(id, updates),
  deleteNode: (id: string) => editorStore.deleteElement(id),
  addEdge: (edge: Edge) => editorStore.addConnection(edge),
  deleteEdge: (id: string) => editorStore.deleteConnection(id),
  setNodes: (nodes: Node[]) => editorStore.setElements(nodes),
  setEdges: (edges: Edge[]) => editorStore.setConnections(edges),
  selectNode: (id: string | null) => editorStore.selectElement(id),
  getNodes: () => editorStore.getElements(),
  getEdges: () => editorStore.getConnections(),
};

export type EditorStore = typeof editorStore;
export type { Connection, EditorState, Element };
