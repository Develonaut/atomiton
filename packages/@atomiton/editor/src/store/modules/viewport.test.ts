import { describe, it, expect, beforeEach } from "vitest";
import { createViewportModule, type ViewportActions } from "./viewport";

describe("ViewportModule", () => {
  let viewportActions: ViewportActions;
  let mockStore: {
    getState: () => {
      zoom: number;
      flowInstance: {
        zoomIn: () => void;
        zoomOut: () => void;
        zoomTo: (_level: number) => void;
        fitView: () => void;
      };
    };
    setState: (fn: (state: { zoom: number }) => void) => void;
    state: { zoom: number };
  };

  beforeEach(() => {
    mockStore = {
      getState: () => ({
        zoom: 100,
        flowInstance: {
          zoomIn: () => {},
          zoomOut: () => {},
          zoomTo: (_level: number) => {},
          fitView: () => {},
        },
      }),
      setState: (fn: (state: { zoom: number }) => void) => {
        const currentState = mockStore.getState();
        const newState = { ...currentState };
        fn(newState);
        mockStore.state = newState;
      },
      state: { zoom: 100 },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    viewportActions = createViewportModule(mockStore as any);
  });

  describe("handleViewportChange", () => {
    it("should update zoom with decimal precision", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.234 });
      expect(mockStore.state.zoom).toBe(123.4);
    });

    it("should clamp zoom to minimum 10%", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 0.05 });
      expect(mockStore.state.zoom).toBe(10);
    });

    it("should clamp zoom to maximum 200%", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 3.0 });
      expect(mockStore.state.zoom).toBe(200);
    });

    it("should not update if change is less than 0.1%", () => {
      mockStore.state = { zoom: 100 };
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.0005 });
      expect(mockStore.state.zoom).toBe(100);
    });

    it("should update for minor changes >= 0.1%", () => {
      mockStore.state = { zoom: 100 };
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.002 });
      expect(mockStore.state.zoom).toBe(100.2);
    });

    it("should handle zoom from mouse wheel with precision", () => {
      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 0.9 });
      expect(mockStore.state.zoom).toBe(90);

      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 0.95 });
      expect(mockStore.state.zoom).toBe(95);

      viewportActions.handleViewportChange({ x: 0, y: 0, zoom: 1.05 });
      expect(mockStore.state.zoom).toBe(105);
    });
  });

  describe("setZoom", () => {
    it("should set zoom directly", () => {
      viewportActions.setZoom(150);
      expect(mockStore.state.zoom).toBe(150);
    });
  });
});
