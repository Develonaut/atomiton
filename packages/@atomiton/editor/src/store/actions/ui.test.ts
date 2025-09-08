import { beforeEach, describe, expect, it, vi } from "vitest";
import { uiActionFunctions } from "./ui";
import type { EditorState } from "../types";
import type { ReactFlowInstance } from "@xyflow/react";

describe("UI Actions", () => {
  let initialState: EditorState;
  let mockFlowInstance: Partial<ReactFlowInstance>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFlowInstance = {
      getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      setViewport: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      zoomTo: vi.fn(),
      fitView: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
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

  describe("setFlowInstance", () => {
    it("should set flow instance", () => {
      const state = { ...initialState };

      uiActionFunctions.setFlowInstance(
        state,
        mockFlowInstance as ReactFlowInstance,
      );

      expect(state.flowInstance).toBe(mockFlowInstance);
    });

    it("should clear flow instance when null", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      uiActionFunctions.setFlowInstance(state, null);

      expect(state.flowInstance).toBeNull();
    });

    it("should handle replacing existing flow instance", () => {
      const newMockInstance = {
        ...mockFlowInstance,
        id: "new-instance",
      } as ReactFlowInstance;

      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
      };

      uiActionFunctions.setFlowInstance(state, newMockInstance);

      expect(state.flowInstance).toBe(newMockInstance);
      expect(state.flowInstance).not.toBe(mockFlowInstance);
    });
  });

  describe("setLoading", () => {
    it("should set loading to true", () => {
      const state = { ...initialState };

      uiActionFunctions.setLoading(state, true);

      expect(state.isLoading).toBe(true);
    });

    it("should set loading to false", () => {
      const state = { ...initialState, isLoading: true };

      uiActionFunctions.setLoading(state, false);

      expect(state.isLoading).toBe(false);
    });

    it("should toggle loading state", () => {
      const state = { ...initialState };

      uiActionFunctions.setLoading(state, true);
      expect(state.isLoading).toBe(true);

      uiActionFunctions.setLoading(state, false);
      expect(state.isLoading).toBe(false);

      uiActionFunctions.setLoading(state, true);
      expect(state.isLoading).toBe(true);
    });
  });

  describe("setDirty", () => {
    it("should set dirty to true", () => {
      const state = { ...initialState };

      uiActionFunctions.setDirty(state, true);

      expect(state.isDirty).toBe(true);
    });

    it("should set dirty to false", () => {
      const state = { ...initialState, isDirty: true };

      uiActionFunctions.setDirty(state, false);

      expect(state.isDirty).toBe(false);
    });

    it("should handle dirty state changes", () => {
      const state = { ...initialState };

      uiActionFunctions.setDirty(state, true);
      expect(state.isDirty).toBe(true);

      uiActionFunctions.setDirty(state, false);
      expect(state.isDirty).toBe(false);
    });
  });

  describe("Animation Settings", () => {
    describe("openAnimationSettings", () => {
      it("should open animation settings", () => {
        const state = { ...initialState };

        uiActionFunctions.openAnimationSettings(state);

        expect(state.isAnimationSettings).toBe(true);
      });

      it("should handle already open state", () => {
        const state = { ...initialState, isAnimationSettings: true };

        uiActionFunctions.openAnimationSettings(state);

        expect(state.isAnimationSettings).toBe(true);
      });
    });

    describe("closeAnimationSettings", () => {
      it("should close animation settings", () => {
        const state = { ...initialState, isAnimationSettings: true };

        uiActionFunctions.closeAnimationSettings(state);

        expect(state.isAnimationSettings).toBe(false);
      });

      it("should handle already closed state", () => {
        const state = { ...initialState };

        uiActionFunctions.closeAnimationSettings(state);

        expect(state.isAnimationSettings).toBe(false);
      });
    });

    it("should toggle animation settings", () => {
      const state = { ...initialState };

      uiActionFunctions.openAnimationSettings(state);
      expect(state.isAnimationSettings).toBe(true);

      uiActionFunctions.closeAnimationSettings(state);
      expect(state.isAnimationSettings).toBe(false);

      uiActionFunctions.openAnimationSettings(state);
      expect(state.isAnimationSettings).toBe(true);
    });
  });

  describe("Complex Workflows", () => {
    it("should handle complete UI state initialization", () => {
      const state = { ...initialState };

      uiActionFunctions.setFlowInstance(
        state,
        mockFlowInstance as ReactFlowInstance,
      );
      uiActionFunctions.setLoading(state, true);
      uiActionFunctions.setDirty(state, false);
      uiActionFunctions.openAnimationSettings(state);

      expect(state.flowInstance).toBe(mockFlowInstance);
      expect(state.isLoading).toBe(true);
      expect(state.isDirty).toBe(false);
      expect(state.isAnimationSettings).toBe(true);
    });

    it("should handle UI state cleanup", () => {
      const state = {
        ...initialState,
        flowInstance: mockFlowInstance as ReactFlowInstance,
        isLoading: true,
        isDirty: true,
        isAnimationSettings: true,
      };

      uiActionFunctions.setFlowInstance(state, null);
      uiActionFunctions.setLoading(state, false);
      uiActionFunctions.setDirty(state, false);
      uiActionFunctions.closeAnimationSettings(state);

      expect(state.flowInstance).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isDirty).toBe(false);
      expect(state.isAnimationSettings).toBe(false);
    });

    it("should maintain state immutability", () => {
      const state = { ...initialState };
      const originalState = JSON.parse(JSON.stringify(state));

      uiActionFunctions.setLoading(state, true);
      uiActionFunctions.setDirty(state, true);
      uiActionFunctions.openAnimationSettings(state);

      expect(originalState.isLoading).toBe(false);
      expect(originalState.isDirty).toBe(false);
      expect(originalState.isAnimationSettings).toBe(false);
      expect(state.isLoading).toBe(true);
      expect(state.isDirty).toBe(true);
      expect(state.isAnimationSettings).toBe(true);
    });
  });
});
