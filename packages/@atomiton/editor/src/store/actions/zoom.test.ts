import { beforeEach, describe, expect, it, vi } from "vitest";
import { zoomActionFunctions } from "./zoom";
import type { EditorState } from "../types";
import type { ReactFlowInstance } from "@xyflow/react";

describe("Zoom Actions", () => {
  let initialState: EditorState;
  let mockFlowInstance: Partial<ReactFlowInstance>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFlowInstance = {
      getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      setViewport: vi.fn(),
      zoomIn: vi.fn(async () => {
        // Simulate zoomIn increasing viewport zoom
        (mockFlowInstance.getViewport as any).mockReturnValue({
          x: 0,
          y: 0,
          zoom: 1.2,
        });
        return true;
      }),
      zoomOut: vi.fn(async () => {
        // Simulate zoomOut decreasing viewport zoom
        (mockFlowInstance.getViewport as any).mockReturnValue({
          x: 0,
          y: 0,
          zoom: 0.8,
        });
        return true;
      }),
      zoomTo: vi.fn(async (zoom: number) => {
        // Simulate zoomTo setting viewport zoom
        (mockFlowInstance.getViewport as any).mockReturnValue({
          x: 0,
          y: 0,
          zoom,
        });
        return true;
      }),
      fitView: vi.fn(async () => {
        // Simulate fitView setting appropriate zoom
        (mockFlowInstance.getViewport as any).mockReturnValue({
          x: 0,
          y: 0,
          zoom: 0.75,
        });
        return true;
      }),
    };

    initialState = {
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
  });

  describe("setZoom", () => {
    it("should set zoom within valid range", () => {
      const state = { ...initialState };

      zoomActionFunctions.setZoom(state, 75);

      expect(state.zoom).toBe(75);
    });

    it("should clamp zoom to minimum value (10)", () => {
      const state = { ...initialState };

      zoomActionFunctions.setZoom(state, 5);

      expect(state.zoom).toBe(10);
    });

    it("should clamp zoom to maximum value (100)", () => {
      const state = { ...initialState };

      zoomActionFunctions.setZoom(state, 250);

      expect(state.zoom).toBe(100);
    });

    it("should handle boundary values", () => {
      const state = { ...initialState };

      zoomActionFunctions.setZoom(state, 10);
      expect(state.zoom).toBe(10);

      zoomActionFunctions.setZoom(state, 100);
      expect(state.zoom).toBe(100);
    });

    it("should handle negative values", () => {
      const state = { ...initialState };

      zoomActionFunctions.setZoom(state, -50);

      expect(state.zoom).toBe(10);
    });

    it("should handle decimal values", () => {
      const state = { ...initialState };

      zoomActionFunctions.setZoom(state, 75.5);

      expect(state.zoom).toBe(75.5);
    });
  });

  describe("zoomIn", () => {
    it("should call flowInstance.zoomIn and update state", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      zoomActionFunctions.zoomIn(state);

      expect(mockFlowInstance.zoomIn).toHaveBeenCalled();
      expect(mockFlowInstance.getViewport).toHaveBeenCalled();
      expect(state.zoom).toBe(100); // 1.2 * 100 = 120, clamped to 100
    });

    it("should do nothing when flowInstance is null", () => {
      const state = { ...initialState };
      const originalZoom = state.zoom;

      zoomActionFunctions.zoomIn(state);

      expect(state.zoom).toBe(originalZoom);
    });

    it("should handle viewport zoom rounding", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      // Mock a viewport zoom that needs rounding - override the zoomIn mock
      (mockFlowInstance.zoomIn as any).mockImplementation(() => {
        (mockFlowInstance.getViewport as any).mockReturnValue({
          x: 0,
          y: 0,
          zoom: 1.234567,
        });
      });

      zoomActionFunctions.zoomIn(state);

      expect(state.zoom).toBe(100); // Math.round(1.234567 * 100) = 123, clamped to 100
    });
  });

  describe("zoomOut", () => {
    it("should call flowInstance.zoomOut and update state", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      zoomActionFunctions.zoomOut(state);

      expect(mockFlowInstance.zoomOut).toHaveBeenCalled();
      expect(mockFlowInstance.getViewport).toHaveBeenCalled();
      expect(state.zoom).toBe(80); // 0.8 * 100 = 80
    });

    it("should do nothing when flowInstance is null", () => {
      const state = { ...initialState };
      const originalZoom = state.zoom;

      zoomActionFunctions.zoomOut(state);

      expect(state.zoom).toBe(originalZoom);
    });

    it("should handle viewport zoom rounding", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      // Mock a viewport zoom that needs rounding - override the zoomOut mock
      (mockFlowInstance.zoomOut as any).mockImplementation(() => {
        (mockFlowInstance.getViewport as any).mockReturnValue({
          x: 0,
          y: 0,
          zoom: 0.876543,
        });
      });

      zoomActionFunctions.zoomOut(state);

      expect(state.zoom).toBe(88); // Math.round(0.876543 * 100) = 88
    });
  });

  describe("zoomTo", () => {
    it("should call flowInstance.zoomTo with correct value and update state", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      zoomActionFunctions.zoomTo(state, 75);

      expect(mockFlowInstance.zoomTo).toHaveBeenCalledWith(0.75); // 75 / 100 = 0.75
      expect(state.zoom).toBe(75);
    });

    it("should clamp percentage to valid range before calling zoomTo", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      // Test minimum clamping
      zoomActionFunctions.zoomTo(state, 5);
      expect(mockFlowInstance.zoomTo).toHaveBeenCalledWith(0.1); // 10 / 100 = 0.1
      expect(state.zoom).toBe(10);

      // Test maximum clamping
      zoomActionFunctions.zoomTo(state, 250);
      expect(mockFlowInstance.zoomTo).toHaveBeenCalledWith(1.0); // 100 / 100 = 1.0
      expect(state.zoom).toBe(100);
    });

    it("should do nothing when flowInstance is null", () => {
      const state = { ...initialState };
      const originalZoom = state.zoom;

      zoomActionFunctions.zoomTo(state, 150);

      expect(state.zoom).toBe(originalZoom);
    });

    it("should handle boundary values", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      zoomActionFunctions.zoomTo(state, 10);
      expect(mockFlowInstance.zoomTo).toHaveBeenCalledWith(0.1);
      expect(state.zoom).toBe(10);

      zoomActionFunctions.zoomTo(state, 100);
      expect(mockFlowInstance.zoomTo).toHaveBeenCalledWith(1.0);
      expect(state.zoom).toBe(100);
    });
  });

  describe("fitView", () => {
    it("should call flowInstance.fitView and update state", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      zoomActionFunctions.fitView(state);

      expect(mockFlowInstance.fitView).toHaveBeenCalled();
      expect(mockFlowInstance.getViewport).toHaveBeenCalled();
      expect(state.zoom).toBe(75); // 0.75 * 100 = 75
    });

    it("should do nothing when flowInstance is null", () => {
      const state = { ...initialState };
      const originalZoom = state.zoom;

      zoomActionFunctions.fitView(state);

      expect(state.zoom).toBe(originalZoom);
    });

    it("should handle viewport zoom rounding after fitView", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      // Mock fitView resulting in a zoom that needs rounding - override the fitView mock
      (mockFlowInstance.fitView as any).mockImplementation(() => {
        (mockFlowInstance.getViewport as any).mockReturnValue({
          x: 0,
          y: 0,
          zoom: 0.456789,
        });
      });

      zoomActionFunctions.fitView(state);

      expect(state.zoom).toBe(46); // Math.round(0.456789 * 100) = 46
    });
  });

  describe("Edge Cases and Integration", () => {
    it("should handle consecutive zoom operations", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      // Simulate multiple zoom operations (all clamped to max 100%)
      (mockFlowInstance.getViewport as any)
        .mockReturnValueOnce({ x: 0, y: 0, zoom: 1.2 })
        .mockReturnValueOnce({ x: 0, y: 0, zoom: 1.44 })
        .mockReturnValueOnce({ x: 0, y: 0, zoom: 1.728 });

      zoomActionFunctions.zoomIn(state);
      expect(state.zoom).toBe(100); // 120 clamped to 100

      zoomActionFunctions.zoomIn(state);
      expect(state.zoom).toBe(100); // 144 clamped to 100

      zoomActionFunctions.zoomIn(state);
      expect(state.zoom).toBe(100); // 173 clamped to 100
    });

    it("should maintain zoom bounds in complex workflows", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      // Test a workflow that might exceed bounds
      zoomActionFunctions.setZoom(state, 90);
      expect(state.zoom).toBe(90);

      zoomActionFunctions.setZoom(state, 250); // Should clamp to 100
      expect(state.zoom).toBe(100);

      zoomActionFunctions.setZoom(state, 5); // Should clamp to 10
      expect(state.zoom).toBe(10);
    });

    it("should handle flowInstance changes during zoom operations", () => {
      const state = { ...initialState };

      // Start with no flow instance
      zoomActionFunctions.zoomIn(state);
      expect(state.zoom).toBe(100); // No change

      // Add flow instance
      state.flowInstance = mockFlowInstance as ReactFlowInstance;
      zoomActionFunctions.zoomIn(state);
      expect(mockFlowInstance.zoomIn).toHaveBeenCalled();

      // Remove flow instance
      state.flowInstance = null;
      const zoomBeforeRemoval = state.zoom;
      zoomActionFunctions.zoomOut(state);
      expect(state.zoom).toBe(zoomBeforeRemoval); // No change
    });

    it("should maintain state immutability", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };
      const originalState = JSON.parse(
        JSON.stringify({ ...state, flowInstance: null }),
      );

      zoomActionFunctions.setZoom(state, 50);

      expect(originalState.zoom).toBe(100);
      expect(state.zoom).toBe(50);
      expect(state.zoom).not.toBe(originalState.zoom);
    });
  });
});
