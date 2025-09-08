import { core } from "@atomiton/core";
import type { Edge, Node } from "@xyflow/react";
import { createConnectionActions } from "./actions/connections";
import { createElementActions } from "./actions/elements";
import { createUIActions } from "./actions/ui";
import { createZoomActions } from "./actions/zoom";
import { createGetters } from "./getters";
import { createHistoryActions } from "./history";
import type { EditorState } from "./types";

const initialState: EditorState = {
  elements: [],
  connections: [],
  selectedElementId: null,
  isLoading: false,
  isDirty: false,
  isAnimationSettings: false,
  flowInstance: null,
  zoom: 100,
  history: {
    past: [],
    future: [],
  },
};

const store = core.store.createStore<EditorState>({
  initialState,
});

const elementActions = createElementActions(store);
const connectionActions = createConnectionActions(store);
const uiActions = createUIActions(store);
const zoomActions = createZoomActions(store);
const historyActions = createHistoryActions(store);
const getters = createGetters(store);

export const editorStore = {
  ...store,
  ...elementActions,
  ...connectionActions,
  ...uiActions,
  ...zoomActions,
  ...historyActions,
  ...getters,

  undo: core.store.createAction(store, historyActions.undo),
  redo: core.store.createAction(store, historyActions.redo),
  clearHistory: core.store.createAction(store, historyActions.clearHistory),

  // Compatibility layer
  addNode: (node: Node) => elementActions.addElement(node),
  updateNode: (id: string, updates: Partial<Node>) =>
    elementActions.updateElement(id, updates),
  deleteNode: (id: string) => elementActions.deleteElement(id),
  addEdge: (edge: Edge) => connectionActions.addConnection(edge),
  deleteEdge: (id: string) => connectionActions.deleteConnection(id),
  setNodes: (nodes: Node[]) => elementActions.setElements(nodes),
  setEdges: (edges: Edge[]) => connectionActions.setConnections(edges),
  selectNode: (id: string | null) => elementActions.selectElement(id),
  getNodes: () => getters.getElements(),
  getEdges: () => getters.getConnections(),

  // High-level actions
  addNodeWithConnection: (nodeType: string) => {
    const existingNodes = getters.getElements();

    // Calculate position based on existing nodes
    let position = { x: 100, y: 100 };
    if (existingNodes.length > 0) {
      // Find the rightmost node and position new node to the right
      const rightmostNode = existingNodes.reduce((prev, current) =>
        prev.position.x > current.position.x ? prev : current,
      );
      position = {
        x: rightmostNode.position.x + 200, // Add some spacing
        y: rightmostNode.position.y,
      };
    }

    const nodeId = `node-${Date.now()}`;
    const node = {
      id: nodeId,
      type: "default", // Use default type to render with our custom square node
      position,
      data: {
        label: nodeType,
        nodeType,
        icon: nodeType.replace(/-/g, "_"), // Convert kebab-case to snake_case for icon lookup
      },
    };

    // Add the node
    elementActions.addElement(node);

    // Auto-connect to the last node if there are existing nodes
    if (existingNodes.length > 0) {
      const lastNode = existingNodes[existingNodes.length - 1];
      const edge = {
        id: `edge-${lastNode.id}-${nodeId}`,
        source: lastNode.id,
        target: nodeId,
        type: "default",
      };
      connectionActions.addConnection(edge);
    }
  },
};

export type EditorStore = typeof editorStore;
export type { Connection, EditorState, Element } from "./types";
