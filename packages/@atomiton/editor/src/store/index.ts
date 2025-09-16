import { createStore } from "@atomiton/store";
import type React from "react";
import { createFlowModule, type FlowActions } from "./modules/flow";
import { createHistoryModule, type HistoryActions } from "./modules/history";
import { createNodeModule, type NodeActions } from "./modules/nodes";
import { createUIModule, type UIActions } from "./modules/ui";
import { createViewportModule, type ViewportActions } from "./modules/viewport";
import type { BaseStore, EditorState, FlowSnapshot } from "./types";

export const onDragStart = (nodeType: string) => (event: React.DragEvent) => {
  event.dataTransfer?.setData("application/atomiton-node", nodeType);
};

export type { BaseStore, EditorState, FlowSnapshot };

const initialState: EditorState = {
  selectedNodeId: null,
  isLoading: false,
  isDirty: false,
  zoom: 100,
  flowInstance: null,
  flowSnapshot: {
    nodes: [],
    edges: [],
  },
  history: {
    past: [],
    future: [],
  },
};

const store = createStore<EditorState>(() => initialState, {
  name: "editor",
});

type EditorStoreActions = {} & BaseStore &
  FlowActions &
  NodeActions &
  HistoryActions &
  UIActions &
  ViewportActions & {
    reset: () => void;
  };

const flowModule = createFlowModule(store);
const historyModule = createHistoryModule(store);
const uiModule = createUIModule(store);
const viewportModule = createViewportModule(store);
const nodeModule = createNodeModule(
  store,
  flowModule.debouncedUpdateFlowSnapshot,
);

export const editorStore: EditorStoreActions = {
  ...store,
  ...flowModule,
  ...nodeModule,
  ...historyModule,
  ...uiModule,
  ...viewportModule,

  // Reset the store to initial state
  reset: () => {
    store.setState(() => ({
      selectedNodeId: null,
      isLoading: false,
      isDirty: false,
      zoom: 100,
      flowInstance: null,
      flowSnapshot: {
        nodes: [],
        edges: [],
      },
      history: {
        past: [],
        future: [],
      },
    }));
  },
};

export type EditorStore = typeof editorStore;
