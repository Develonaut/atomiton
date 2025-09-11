import { beforeEach, describe, expect, it, vi } from "vitest";
import { editorStore } from "../index";

vi.mock("@atomiton/core", () => ({
  core: {
    store: {
      createStore: vi.fn((config) => {
        let state = { ...config.initialState };
        const subscribers: ((state: unknown, prevState: unknown) => void)[] =
          [];

        return {
          getState: () => state,
          setState: (updater: (state: unknown) => unknown) => {
            if (typeof updater === "function") {
              const prevState = { ...state };
              state = { ...state, ...updater(state) };
              subscribers.forEach((callback) => callback(state, prevState));
            } else {
              state = { ...state, ...updater };
            }
          },
          subscribe: (
            callback: (state: unknown, prevState: unknown) => void,
          ) => {
            subscribers.push(callback);
            return () => {
              const index = subscribers.indexOf(callback);
              if (index > -1) subscribers.splice(index, 1);
            };
          },
          dispatch: vi.fn(),
          _triggerSubscribers: () =>
            subscribers.forEach((fn) => fn(state, state)),
        };
      }),
      createAction: vi.fn((_store, actionFn) => {
        return (...args: unknown[]) => {
          const store = _store as {
            getState: () => unknown;
            setState: (updater: (state: unknown) => unknown) => void;
          };
          const state = store.getState();
          const result = actionFn(state, ...args);
          if (result !== undefined) {
            store.setState(() => result);
          }
          return result;
        };
      }),
    },
  },
}));

describe("Edge Cases and Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store to clean state
    const initialState = {
      selectedNodeId: null,
      isLoading: false,
      isDirty: false,
      zoom: 100,
      flowInstance: {
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      },
      flowSnapshot: {
        nodes: [],
        edges: [],
      },
      history: { past: [], future: [] },
    };

    const mockStore = editorStore as unknown as {
      setState: (updater: (state: unknown) => unknown) => void;
    };
    if (mockStore.setState) {
      mockStore.setState(() => initialState);
    }
  });

  describe("Invalid Operations", () => {
    it("should handle operations on non-existent nodes gracefully", () => {
      const nonExistentIds = ["does-not-exist", "never-created", "", " "];

      nonExistentIds.forEach((id) => {
        expect(() => editorStore.selectNode(id)).not.toThrow();
        expect(() => editorStore.deleteNode(id)).not.toThrow();

        // Selection state is set regardless, but no node will be found
        if (id.trim()) {
          editorStore.selectNode(id);
          const state = editorStore.getState();
          expect(state.selectedNodeId).toBe(id);
          const selectedNode = state.flowSnapshot.nodes.find(
            (n) => n.id === state.selectedNodeId,
          );
          expect(selectedNode).toBeUndefined();
        }
      });
    });

    it("should handle null/undefined parameters gracefully", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => editorStore.selectNode(null as any)).not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => editorStore.selectNode(undefined as any)).not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => editorStore.deleteNode(null as any)).not.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => editorStore.deleteNode(undefined as any)).not.toThrow();
    });

    it("should handle missing flow instance", () => {
      // Set flow instance to null
      editorStore.setFlowInstance(null);

      expect(() =>
        editorStore.addNode("default", { x: 0, y: 0 }),
      ).not.toThrow();
      expect(() => editorStore.deleteNode("any-id")).not.toThrow();
      expect(() => editorStore.deleteSelectedNodes()).not.toThrow();
      expect(() =>
        editorStore.handleConnect({ source: "a", target: "b" }),
      ).not.toThrow();

      // State should remain unchanged when flow instance is null
      const state = editorStore.getState();
      expect(state.flowSnapshot.nodes).toEqual([]);
      expect(state.flowSnapshot.edges).toEqual([]);
    });
  });

  describe("Boundary Conditions", () => {
    it("should handle extreme position values", () => {
      const extremePositions = [
        { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
        { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER },
        { x: Infinity, y: -Infinity },
        { x: NaN, y: NaN },
        { x: 0, y: -0 },
      ];

      // Mock flow instance to track calls
      const mockFlowInstance = {
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorStore.setFlowInstance(mockFlowInstance as any);

      extremePositions.forEach((position) => {
        expect(() => editorStore.addNode("default", position)).not.toThrow();
      });

      // Should have been called for each position
      expect(mockFlowInstance.setNodes).toHaveBeenCalledTimes(
        extremePositions.length,
      );
    });

    it("should handle rapid operations", () => {
      const mockFlowInstance = {
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorStore.setFlowInstance(mockFlowInstance as any);

      // Rapid operations should not throw
      for (let i = 0; i < 100; i++) {
        expect(() =>
          editorStore.addNode("default", { x: i, y: 0 }),
        ).not.toThrow();
        expect(() => editorStore.selectNode(`node-${i}`)).not.toThrow();
      }
    });
  });

  describe("History Edge Cases", () => {
    it("should handle undo/redo without flow instance", () => {
      editorStore.setFlowInstance(null);

      expect(() => editorStore.pushToHistory()).not.toThrow();
      expect(editorStore.canUndo()).toBe(false);
      expect(editorStore.canRedo()).toBe(false);

      const undoResult = editorStore.undo();
      expect(undoResult).toBeNull();

      const redoResult = editorStore.redo();
      expect(redoResult).toBeNull();
    });

    it("should handle empty history operations", () => {
      expect(editorStore.canUndo()).toBe(false);
      expect(editorStore.canRedo()).toBe(false);

      const undoResult = editorStore.undo();
      expect(undoResult).toBeNull();

      const redoResult = editorStore.redo();
      expect(redoResult).toBeNull();
    });

    it("should handle history clearing", () => {
      // Push some history
      editorStore.pushToHistory();
      editorStore.pushToHistory();

      // Clear history
      editorStore.clearHistory();

      expect(editorStore.canUndo()).toBe(false);
      expect(editorStore.canRedo()).toBe(false);

      const state = editorStore.getState();
      expect(state.history.past).toEqual([]);
      expect(state.history.future).toEqual([]);
      expect(state.isDirty).toBe(false);
    });
  });

  describe("Connection Edge Cases", () => {
    it("should handle invalid connection parameters", () => {
      const mockFlowInstance = {
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorStore.setFlowInstance(mockFlowInstance as any);

      const invalidConnections = [
        { source: null, target: "b" },
        { source: "a", target: null },
        { source: "", target: "b" },
        { source: "a", target: "" },
        {},
      ];

      invalidConnections.forEach((connection) => {
        expect(() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          editorStore.handleConnect(connection as any),
        ).not.toThrow();
      });
    });

    it("should handle drag and drop without bounds", () => {
      const mockFlowInstance = {
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorStore.setFlowInstance(mockFlowInstance as any);

      const mockEvent = {
        dataTransfer: {
          getData: vi.fn(() => "default"),
        },
        clientX: 100,
        clientY: 100,
        preventDefault: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // Should handle gracefully when bounds is null
      expect(() => editorStore.handleDrop(mockEvent, null)).not.toThrow();
    });
  });

  describe("State Consistency", () => {
    it("should maintain state consistency after multiple operations", () => {
      const mockFlowInstance = {
        getNodes: vi.fn(() => [
          { id: "node-1", type: "default", position: { x: 0, y: 0 }, data: {} },
        ]),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn(),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorStore.setFlowInstance(mockFlowInstance as any);

      // Add node
      editorStore.addNode("default", { x: 0, y: 0 });

      // Select node
      editorStore.selectNode("node-1");

      // Delete node
      editorStore.deleteNode("node-1");

      const state = editorStore.getState();
      expect(state.selectedNodeId).toBeNull(); // Should clear selection when deleting selected node
    });

    it("should handle loading state transitions", () => {
      expect(() => editorStore.setLoading(true)).not.toThrow();
      expect(editorStore.getState().isLoading).toBe(true);

      expect(() => editorStore.setLoading(false)).not.toThrow();
      expect(editorStore.getState().isLoading).toBe(false);
    });

    it("should handle dirty state transitions", () => {
      expect(() => editorStore.setDirty(true)).not.toThrow();
      expect(editorStore.getState().isDirty).toBe(true);

      expect(() => editorStore.setDirty(false)).not.toThrow();
      expect(editorStore.getState().isDirty).toBe(false);
    });
  });
});
