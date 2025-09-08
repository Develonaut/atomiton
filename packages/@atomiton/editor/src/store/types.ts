import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

export type Element = Node;
export type Connection = Edge;

export interface HistoryEntry {
  elements: Element[];
  connections: Connection[];
  selectedElementId: string | null;
}

export interface EditorState {
  elements: Element[];
  connections: Connection[];
  selectedElementId: string | null;
  isLoading: boolean;
  isDirty: boolean;
  isAnimationSettings: boolean;
  flowInstance: ReactFlowInstance | null;
  zoom: number;
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
}

export const MAX_HISTORY_SIZE = 50;
