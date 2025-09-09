/**
 * Domain: History Management
 *
 * Purpose: Implements undo/redo functionality for the flow editor
 *
 * Responsibilities:
 * - Track flow state history with configurable limits (50 entries)
 * - Provide undo/redo operations that restore flow snapshots
 * - Manage history navigation and state validation
 * - Clear history when needed (e.g., after save operations)
 * - Maintain separate past/future stacks for bidirectional navigation
 */

import type { FlowSnapshot, BaseStore } from "../types";

export interface HistoryActions {
  pushToHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => FlowSnapshot | null;
  redo: () => FlowSnapshot | null;
  clearHistory: () => void;
}

export const createHistoryModule = (store: BaseStore): HistoryActions => ({
  pushToHistory: () => {
    const state = store.getState();
    const currentSnapshot = state.flowSnapshot;

    store.setState((state) => ({
      ...state,
      history: {
        past: [...state.history.past, currentSnapshot].slice(-50),
        future: [],
      },
    }));
  },

  canUndo: () => {
    return store.getState().history.past.length > 0;
  },

  canRedo: () => {
    return store.getState().history.future.length > 0;
  },

  undo: () => {
    const state = store.getState();
    const instance = state.flowInstance;

    if (!instance || state.history.past.length === 0) return null;

    const previousSnapshot = state.history.past[state.history.past.length - 1];
    const currentSnapshot = state.flowSnapshot;

    store.setState((state) => ({
      ...state,
      flowSnapshot: previousSnapshot,
      history: {
        past: state.history.past.slice(0, -1),
        future: [currentSnapshot, ...state.history.future],
      },
    }));

    // Apply to ReactFlow instance
    instance.setNodes(previousSnapshot.nodes);
    instance.setEdges(previousSnapshot.edges);
    if (previousSnapshot.viewport) {
      instance.setViewport(previousSnapshot.viewport);
    }

    return previousSnapshot;
  },

  redo: () => {
    const state = store.getState();
    const instance = state.flowInstance;

    if (!instance || state.history.future.length === 0) return null;

    const nextSnapshot = state.history.future[0];
    const currentSnapshot = state.flowSnapshot;

    store.setState((state) => ({
      ...state,
      flowSnapshot: nextSnapshot,
      history: {
        past: [...state.history.past, currentSnapshot],
        future: state.history.future.slice(1),
      },
    }));

    // Apply to ReactFlow instance
    instance.setNodes(nextSnapshot.nodes);
    instance.setEdges(nextSnapshot.edges);
    if (nextSnapshot.viewport) {
      instance.setViewport(nextSnapshot.viewport);
    }

    return nextSnapshot;
  },

  clearHistory: () => {
    store.setState((state) => ({
      ...state,
      history: {
        past: [],
        future: [],
      },
      isDirty: false,
    }));
  },
});
