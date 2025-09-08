import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGetters } from "./getters";
import type { EditorState } from "./types";

describe("Store Getters", () => {
  let mockStore: any;
  let getters: ReturnType<typeof createGetters>;
  let mockState: EditorState;

  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      elements: [
        {
          id: "node-1",
          type: "default",
          position: { x: 0, y: 0 },
          data: { label: "Node 1" },
        },
        {
          id: "node-2",
          type: "default",
          position: { x: 100, y: 0 },
          data: { label: "Node 2" },
        },
      ],
      connections: [{ id: "edge-1", source: "node-1", target: "node-2" }],
      selectedElementId: "node-1",
      isLoading: false,
      isDirty: true,
      isAnimationSettings: false,
      flowInstance: null,
      zoom: 150,
      history: {
        past: [{ elements: [], connections: [], selectedElementId: null }],
        future: [
          {
            elements: [
              {
                id: "node-3",
                type: "default",
                position: { x: 200, y: 0 },
                data: {},
              },
            ],
            connections: [],
            selectedElementId: null,
          },
        ],
      },
    };

    mockStore = {
      getState: vi.fn(() => mockState),
    };

    getters = createGetters(mockStore);
  });

  describe("getElements", () => {
    it("should return all elements", () => {
      const result = getters.getElements();

      expect(result).toEqual(mockState.elements);
      expect(mockStore.getState).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no elements", () => {
      mockState.elements = [];

      const result = getters.getElements();

      expect(result).toEqual([]);
    });

    it("should return fresh state on each call", () => {
      const result1 = getters.getElements();

      mockState.elements = [
        { id: "new-node", type: "default", position: { x: 0, y: 0 }, data: {} },
      ];

      const result2 = getters.getElements();

      expect(result1).not.toEqual(result2);
      expect(result2).toEqual([
        { id: "new-node", type: "default", position: { x: 0, y: 0 }, data: {} },
      ]);
    });
  });

  describe("getConnections", () => {
    it("should return all connections", () => {
      const result = getters.getConnections();

      expect(result).toEqual(mockState.connections);
      expect(mockStore.getState).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no connections", () => {
      mockState.connections = [];

      const result = getters.getConnections();

      expect(result).toEqual([]);
    });
  });

  describe("getSelectedElementId", () => {
    it("should return selected element id", () => {
      const result = getters.getSelectedElementId();

      expect(result).toBe("node-1");
    });

    it("should return null when nothing selected", () => {
      mockState.selectedElementId = null;

      const result = getters.getSelectedElementId();

      expect(result).toBeNull();
    });
  });

  describe("getSelectedElement", () => {
    it("should return selected element", () => {
      const result = getters.getSelectedElement();

      expect(result).toEqual({
        id: "node-1",
        type: "default",
        position: { x: 0, y: 0 },
        data: { label: "Node 1" },
      });
    });

    it("should return undefined when selection not found", () => {
      mockState.selectedElementId = "non-existent";

      const result = getters.getSelectedElement();

      expect(result).toBeUndefined();
    });

    it("should return undefined when nothing selected", () => {
      mockState.selectedElementId = null;

      const result = getters.getSelectedElement();

      expect(result).toBeUndefined();
    });

    it("should find element among many", () => {
      mockState.elements = [
        {
          id: "node-1",
          type: "default",
          position: { x: 0, y: 0 },
          data: { label: "Node 1" },
        },
        {
          id: "node-2",
          type: "default",
          position: { x: 100, y: 0 },
          data: { label: "Node 2" },
        },
        {
          id: "node-3",
          type: "default",
          position: { x: 200, y: 0 },
          data: { label: "Node 3" },
        },
      ];
      mockState.selectedElementId = "node-2";

      const result = getters.getSelectedElement();

      expect(result?.id).toBe("node-2");
      expect(result?.data.label).toBe("Node 2");
    });
  });

  describe("isLoading", () => {
    it("should return loading state", () => {
      mockState.isLoading = true;

      const result = getters.isLoading();

      expect(result).toBe(true);
    });

    it("should return false when not loading", () => {
      mockState.isLoading = false;

      const result = getters.isLoading();

      expect(result).toBe(false);
    });
  });

  describe("isDirty", () => {
    it("should return dirty state", () => {
      mockState.isDirty = true;

      const result = getters.isDirty();

      expect(result).toBe(true);
    });

    it("should return false when clean", () => {
      mockState.isDirty = false;

      const result = getters.isDirty();

      expect(result).toBe(false);
    });
  });

  describe("getFlowInstance", () => {
    it("should return flow instance", () => {
      const mockFlowInstance = {
        getNodes: vi.fn(),
        getEdges: vi.fn(),
        setViewport: vi.fn(),
      };
      mockState.flowInstance = mockFlowInstance as any;

      const result = getters.getFlowInstance();

      expect(result).toBe(mockFlowInstance);
    });

    it("should return null when no instance", () => {
      mockState.flowInstance = null;

      const result = getters.getFlowInstance();

      expect(result).toBeNull();
    });
  });

  describe("canUndo", () => {
    it("should return true when history exists", () => {
      mockState.history.past = [
        { elements: [], connections: [], selectedElementId: null },
      ];

      const result = getters.canUndo();

      expect(result).toBe(true);
    });

    it("should return false when no history", () => {
      mockState.history.past = [];

      const result = getters.canUndo();

      expect(result).toBe(false);
    });

    it("should return true for multiple history entries", () => {
      mockState.history.past = [
        { elements: [], connections: [], selectedElementId: null },
        {
          elements: [
            {
              id: "node-1",
              type: "default",
              position: { x: 0, y: 0 },
              data: {},
            },
          ],
          connections: [],
          selectedElementId: null,
        },
      ];

      const result = getters.canUndo();

      expect(result).toBe(true);
    });
  });

  describe("canRedo", () => {
    it("should return true when future exists", () => {
      mockState.history.future = [
        {
          elements: [
            {
              id: "node-3",
              type: "default",
              position: { x: 200, y: 0 },
              data: {},
            },
          ],
          connections: [],
          selectedElementId: null,
        },
      ];

      const result = getters.canRedo();

      expect(result).toBe(true);
    });

    it("should return false when no future", () => {
      mockState.history.future = [];

      const result = getters.canRedo();

      expect(result).toBe(false);
    });

    it("should return true for multiple future entries", () => {
      mockState.history.future = [
        {
          elements: [
            {
              id: "node-1",
              type: "default",
              position: { x: 0, y: 0 },
              data: {},
            },
          ],
          connections: [],
          selectedElementId: null,
        },
        {
          elements: [
            {
              id: "node-2",
              type: "default",
              position: { x: 100, y: 0 },
              data: {},
            },
          ],
          connections: [],
          selectedElementId: null,
        },
      ];

      const result = getters.canRedo();

      expect(result).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should work with complex state", () => {
      const complexState: EditorState = {
        elements: Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          type: "default",
          position: { x: i * 10, y: i * 10 },
          data: { label: `Node ${i}`, value: i },
        })),
        connections: Array.from({ length: 50 }, (_, i) => ({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`,
        })),
        selectedElementId: "node-50",
        isLoading: false,
        isDirty: true,
        isAnimationSettings: true,
        flowInstance: null,
        zoom: 75,
        history: {
          past: new Array(25).fill(null).map(() => ({
            elements: [],
            connections: [],
            selectedElementId: null,
          })),
          future: new Array(10).fill(null).map(() => ({
            elements: [],
            connections: [],
            selectedElementId: null,
          })),
        },
      };

      mockState = complexState;

      expect(getters.getElements()).toHaveLength(100);
      expect(getters.getConnections()).toHaveLength(50);
      expect(getters.getSelectedElement()?.id).toBe("node-50");
      expect(getters.canUndo()).toBe(true);
      expect(getters.canRedo()).toBe(true);
      expect(getters.isDirty()).toBe(true);
    });

    it("should handle state changes correctly", () => {
      let callCount = 0;
      mockStore.getState = vi.fn(() => {
        callCount++;
        return callCount === 1
          ? { ...mockState, selectedElementId: "node-1" }
          : { ...mockState, selectedElementId: "node-2" };
      });

      const result1 = getters.getSelectedElementId();
      const result2 = getters.getSelectedElementId();

      expect(result1).toBe("node-1");
      expect(result2).toBe("node-2");
      expect(mockStore.getState).toHaveBeenCalledTimes(2);
    });

    it("should maintain performance with large datasets", () => {
      const largeElements = Array.from({ length: 1000 }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: i, y: i },
        data: { label: `Node ${i}` },
      }));

      mockState.elements = largeElements;
      mockState.selectedElementId = "node-999";

      const start = performance.now();
      const result = getters.getSelectedElement();
      const end = performance.now();

      expect(result?.id).toBe("node-999");
      expect(end - start).toBeLessThan(10); // Should be very fast
    });
  });

  describe("Edge Cases", () => {
    it("should handle null/undefined state gracefully", () => {
      mockStore.getState = vi.fn(() => ({
        elements: null as any,
        connections: undefined as any,
        selectedElementId: null,
        isLoading: false,
        isDirty: false,
        isAnimationSettings: false,
        flowInstance: null,
        zoom: 100,
        history: { past: [], future: [] },
      }));

      expect(() => getters.getElements()).not.toThrow();
      expect(() => getters.getConnections()).not.toThrow();
    });

    it("should handle empty history gracefully", () => {
      mockState.history = {
        past: [],
        future: [],
      };

      expect(getters.canUndo()).toBe(false);
      expect(getters.canRedo()).toBe(false);
    });

    it("should handle element search with duplicate ids", () => {
      mockState.elements = [
        {
          id: "duplicate",
          type: "default",
          position: { x: 0, y: 0 },
          data: { label: "First" },
        },
        {
          id: "duplicate",
          type: "default",
          position: { x: 100, y: 0 },
          data: { label: "Second" },
        },
      ];
      mockState.selectedElementId = "duplicate";

      const result = getters.getSelectedElement();

      expect(result?.data.label).toBe("First"); // Should return first match
    });
  });
});
