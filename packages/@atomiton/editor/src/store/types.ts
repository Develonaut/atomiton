import type { Edge, Node, ReactFlowInstance, Viewport } from "@xyflow/react";

// Core flow data structure for persistence
export interface FlowSnapshot {
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
}

// Legacy types for backward compatibility with existing test files
export type Connection = Edge;

export interface HistoryEntry {
  nodes: Node[];
  connections: Connection[];
  selectedNodeId: string | null;
}

// Main editor state interface
export interface EditorState {
  // UI State
  selectedNodeId: string | null;
  isLoading: boolean;
  isDirty: boolean;
  zoom: number;

  // Flow instance reference
  flowInstance: ReactFlowInstance | null;

  // Flow state snapshot for persistence
  flowSnapshot: FlowSnapshot;

  // History for undo/redo
  history: {
    past: FlowSnapshot[];
    future: FlowSnapshot[];
  };
}

// Type for the base store methods
export type BaseStore = {
  getState: () => EditorState;
  setState: (updater: (state: EditorState) => EditorState) => void;
  subscribe: (
    callback: (state: EditorState, prevState: EditorState) => void,
  ) => () => void;
};

export const MAX_HISTORY_SIZE = 50;
