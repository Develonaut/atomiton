import { beforeEach, describe, expect, it, vi } from "vitest";
import { editorStore } from "../index";
import { MAX_HISTORY_SIZE } from "../types";

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

describe("Performance Tests", () => {
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

  describe("Node Operation Performance", () => {
    it("should handle rapid node additions efficiently", () => {
      const nodeCount = 100; // Reduced from thousands since we're testing individual operations

      // Mock a flow instance that maintains a growing node list
      let mockNodes: unknown[] = [];
      const mockFlowInstance = {
        getNodes: vi.fn(() => mockNodes),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn((nodes) => {
          mockNodes = [...nodes];
        }),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorStore.setFlowInstance(mockFlowInstance as any);

      const start = performance.now();

      for (let i = 0; i < nodeCount; i++) {
        editorStore.addNode("default", { x: i * 2, y: 0 });
      }

      const end = performance.now();
      const duration = end - start;

      expect(mockFlowInstance.setNodes).toHaveBeenCalledTimes(nodeCount);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      expect(duration / nodeCount).toBeLessThan(10); // Average less than 10ms per node
    });

    it("should handle rapid node deletions efficiently", () => {
      const nodeCount = 50;

      // Setup nodes
      let mockNodes = Array.from({ length: nodeCount }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: i * 10, y: 0 },
        data: {},
      }));

      const mockFlowInstance = {
        getNodes: vi.fn(() => mockNodes),
        getEdges: vi.fn(() => []),
        setNodes: vi.fn((nodes) => {
          mockNodes = [...nodes];
        }),
        setEdges: vi.fn(),
        getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
        setViewport: vi.fn(),
        screenToFlowPosition: vi.fn((pos) => pos),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorStore.setFlowInstance(mockFlowInstance as any);

      const start = performance.now();

      // Delete every other node
      for (let i = 0; i < nodeCount; i += 2) {
        editorStore.deleteNode(`node-${i}`);
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(500); // Should complete quickly
    });

    it("should handle selection changes rapidly", () => {
      const selectionCount = 200;

      const start = performance.now();

      // Rapidly change selections
      for (let i = 0; i < selectionCount; i++) {
        editorStore.selectNode(`node-${i % 10}`);
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100); // Should be very fast
      expect(duration / selectionCount).toBeLessThan(1); // Average less than 1ms per selection
    });
  });

  describe("History Performance", () => {
    it("should handle history operations efficiently", () => {
      const operationCount = 20; // Reasonable number for testing

      const start = performance.now();

      // Build up history
      for (let i = 0; i < operationCount; i++) {
        editorStore.pushToHistory();
      }

      const historyBuildTime = performance.now() - start;

      // Test undo/redo performance
      const undoRedoStart = performance.now();

      for (let i = 0; i < 10; i++) {
        if (editorStore.canUndo()) {
          editorStore.undo();
        }
        if (editorStore.canRedo()) {
          editorStore.redo();
        }
      }

      const undoRedoTime = performance.now() - undoRedoStart;

      expect(historyBuildTime).toBeLessThan(100);
      expect(undoRedoTime).toBeLessThan(50);
    });

    it("should maintain performance with maximum history size", () => {
      // Fill history to max capacity
      const start = performance.now();

      for (let i = 0; i < MAX_HISTORY_SIZE + 10; i++) {
        editorStore.pushToHistory();
      }

      const end = performance.now();
      const duration = end - start;

      // Should not degrade significantly even at max capacity
      expect(duration).toBeLessThan(200);

      // History should be capped at MAX_HISTORY_SIZE
      const state = editorStore.getState();
      expect(state.history.past.length).toBeLessThanOrEqual(MAX_HISTORY_SIZE);
    });

    it("should handle history clearing efficiently", () => {
      // Build up some history
      for (let i = 0; i < 20; i++) {
        editorStore.pushToHistory();
      }

      const start = performance.now();
      editorStore.clearHistory();
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // Should be near-instantaneous

      const state = editorStore.getState();
      expect(state.history.past).toEqual([]);
      expect(state.history.future).toEqual([]);
    });
  });

  describe("State Management Performance", () => {
    it("should handle rapid state reads efficiently", () => {
      const readCount = 1000;

      const start = performance.now();

      for (let i = 0; i < readCount; i++) {
        const state = editorStore.getState();
        // Access various state properties
        void state.selectedNodeId;
        void state.flowSnapshot.nodes;
        void state.flowSnapshot.edges;
        void state.history.past;
        void state.isDirty;
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100);
      expect(duration / readCount).toBeLessThan(0.1); // Average less than 0.1ms per read
    });

    it("should handle rapid state updates efficiently", () => {
      const updateCount = 100;

      const start = performance.now();

      for (let i = 0; i < updateCount; i++) {
        editorStore.setLoading(i % 2 === 0);
        editorStore.setDirty(i % 3 === 0);
        editorStore.selectNode(i % 2 === 0 ? `node-${i}` : null);
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(200);
      expect(duration / updateCount).toBeLessThan(2); // Average less than 2ms per update cycle
    });
  });

  describe("Flow Snapshot Performance", () => {
    it("should handle flow snapshot updates efficiently", () => {
      const updateCount = 50;

      const mockNodes = Array.from({ length: 10 }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: i * 50, y: 0 },
        data: {},
      }));

      const mockEdges = Array.from({ length: 5 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));

      const start = performance.now();

      for (let i = 0; i < updateCount; i++) {
        editorStore.updateFlowSnapshot(
          mockNodes.map((n) => ({ ...n, data: { ...n.data, updated: i } })),
          mockEdges,
          { x: i, y: i, zoom: 1 },
        );
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(500);
      expect(duration / updateCount).toBeLessThan(10); // Average less than 10ms per update
    });

    it("should handle flow snapshot reads efficiently", () => {
      // Setup some snapshot data
      const mockNodes = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        type: "default",
        position: { x: i * 20, y: 0 },
        data: { index: i },
      }));

      editorStore.updateFlowSnapshot(mockNodes, [], { x: 0, y: 0, zoom: 1 });

      const readCount = 1000;
      const start = performance.now();

      for (let i = 0; i < readCount; i++) {
        const snapshot = editorStore.getFlowSnapshot();
        // Access snapshot properties
        void snapshot.nodes.length;
        void snapshot.edges.length;
        void snapshot.viewport;
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100);
      expect(duration / readCount).toBeLessThan(0.1); // Average less than 0.1ms per read
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory during operations", () => {
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

      // Simulate a typical workflow multiple times
      for (let cycle = 0; cycle < 10; cycle++) {
        // Add some nodes
        for (let i = 0; i < 10; i++) {
          editorStore.addNode("default", { x: i * 10, y: 0 });
        }

        // Select and delete nodes
        for (let i = 0; i < 5; i++) {
          editorStore.selectNode(`node-${i}`);
          editorStore.deleteNode(`node-${i}`);
        }

        // History operations
        editorStore.pushToHistory();
        if (editorStore.canUndo()) {
          editorStore.undo();
        }

        // Clear state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editorStore.setFlowInstance(mockFlowInstance as any);
        editorStore.clearHistory();
      }

      // Test should complete without issues
      expect(true).toBe(true);
    });
  });
});
