import { describe, it, expect, beforeEach } from "vitest";
import { createViewportModule, type ViewportActions } from "./viewport";
import type { BaseStore, EditorState } from "../types";

describe("ViewportModule", () => {
  let viewportActions: ViewportActions;
  let mockStore: BaseStore;
  let currentState: EditorState;

  beforeEach(() => {
    // Initialize the current state
    currentState = {
      selectedNodeId: null,
      isLoading: false,
      isDirty: false,
      zoom: 100,
      flowInstance: {
        zoomIn: () => {},
        zoomOut: () => {},
        zoomTo: (_level: number) => {},
        fitView: () => {},
      } as EditorState["flowInstance"],
      flowSnapshot: {
        nodes: [],
        edges: [],
      },
      history: {
        past: [],
        future: [],
      },
    };

    // Create a properly typed mock store that implements BaseStore
    mockStore = {
      getState: () => currentState,
      setState: (updater: (state: EditorState) => EditorState | void) => {
        const result = updater(currentState);
        if (result !== undefined) {
          currentState = result;
        }
      },
      subscribe: (
        _callback: (state: EditorState, prevState: EditorState) => void,
      ) => {
        // Return a no-op unsubscribe function for testing
        return () => {};
      },
    };

    viewportActions = createViewportModule(mockStore);
  });

  describe("handleViewportChange", () => {
    it("should update zoom with decimal precision", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.234 });
      expect(currentState.zoom).toBe(123.4);
    });

    it("should clamp zoom to minimum 10%", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 0.05 });
      expect(currentState.zoom).toBe(10);
    });

    it("should clamp zoom to maximum 200%", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 3.0 });
      expect(currentState.zoom).toBe(200);
    });

    it("should not update if change is less than 0.1%", () => {
      currentState.zoom = 100;
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.0005 });
      expect(currentState.zoom).toBe(100);
    });

    it("should update for minor changes >= 0.1%", () => {
      currentState.zoom = 100;
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.002 });
      expect(currentState.zoom).toBe(100.2);
    });

    it("should handle zoom from mouse wheel with precision", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 0.9 });
      expect(currentState.zoom).toBe(90);

      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 0.95 });
      expect(currentState.zoom).toBe(95);

      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.05 });
      expect(currentState.zoom).toBe(105);
    });
  });

  describe("setZoom", () => {
    it("should set zoom directly", () => {
      viewportActions.setZoom(150);
      expect(currentState.zoom).toBe(150);
    });
  });
});
