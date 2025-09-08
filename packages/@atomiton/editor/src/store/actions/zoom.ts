import { core } from "@atomiton/core";
import type { EditorState } from "../types";

// Pure action functions for testing
export const zoomActionFunctions = {
  setZoom: (state: EditorState, zoom: number) => {
    state.zoom = Math.max(10, Math.min(100, zoom));
  },

  zoomIn: (state: EditorState) => {
    const flowInstance = state.flowInstance;
    if (flowInstance) {
      flowInstance.zoomIn();
      const viewport = flowInstance.getViewport();
      state.zoom = Math.max(10, Math.min(100, Math.round(viewport.zoom * 100)));
    }
  },

  zoomOut: (state: EditorState) => {
    const flowInstance = state.flowInstance;
    if (flowInstance) {
      flowInstance.zoomOut();
      const viewport = flowInstance.getViewport();
      state.zoom = Math.max(10, Math.min(100, Math.round(viewport.zoom * 100)));
    }
  },

  zoomTo: (state: EditorState, percentage: number) => {
    const flowInstance = state.flowInstance;
    if (flowInstance) {
      const zoom = Math.max(10, Math.min(100, percentage));
      flowInstance.zoomTo(zoom / 100);
      state.zoom = zoom;
    }
  },

  fitView: (state: EditorState) => {
    const flowInstance = state.flowInstance;
    if (flowInstance) {
      flowInstance.fitView();
      const viewport = flowInstance.getViewport();
      state.zoom = Math.max(10, Math.min(100, Math.round(viewport.zoom * 100)));
    }
  },
};

// Store-bound actions
export function createZoomActions(store: any) {
  return {
    setZoom: core.store.createAction(store, zoomActionFunctions.setZoom),
    zoomIn: core.store.createAction(store, zoomActionFunctions.zoomIn),
    zoomOut: core.store.createAction(store, zoomActionFunctions.zoomOut),
    zoomTo: core.store.createAction(store, zoomActionFunctions.zoomTo),
    fitView: core.store.createAction(store, zoomActionFunctions.fitView),
  };
}
