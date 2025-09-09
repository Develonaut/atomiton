/**
 * Domain: Viewport Operations
 *
 * Purpose: Manages zoom levels and viewport transformations for the flow editor
 *
 * Responsibilities:
 * - Control zoom levels and viewport positioning
 * - Provide zoom in/out and fit-to-view operations
 * - Handle viewport change events from ReactFlow
 * - Maintain zoom state synchronization between UI and flow instance
 * - Enforce zoom limits and smooth zoom transitions
 */

import type { BaseStore } from "../types";

export interface ViewportActions {
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number) => void;
  fitView: () => void;
  handleViewportChange: (viewport: {
    x: number;
    y: number;
    zoom: number;
  }) => void;
}

export const createViewportModule = (store: BaseStore): ViewportActions => ({
  setZoom: (zoom: number) => {
    store.setState((state) => ({
      ...state,
      zoom,
    }));
  },

  zoomIn: () => {
    const instance = store.getState().flowInstance;
    if (instance) {
      instance.zoomIn();
    }
  },

  zoomOut: () => {
    const instance = store.getState().flowInstance;
    if (instance) {
      instance.zoomOut();
    }
  },

  zoomTo: (level: number) => {
    const instance = store.getState().flowInstance;
    if (instance) {
      instance.zoomTo(level);
    }
  },

  fitView: () => {
    const instance = store.getState().flowInstance;
    if (instance) {
      instance.fitView();
    }
  },

  handleViewportChange: (viewport: { x: number; y: number; zoom: number }) => {
    const newZoom = Math.max(
      10,
      Math.min(100, Math.round(viewport.zoom * 100)),
    );
    store.setState((state) => ({
      ...state,
      zoom: newZoom,
    }));
  },
});
