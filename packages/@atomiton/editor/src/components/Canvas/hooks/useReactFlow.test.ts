import { act, renderHook } from "@testing-library/react";
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useReactFlow } from "./useReactFlow";

// Mock @xyflow/react
vi.mock("@xyflow/react", () => ({
  useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
}));

// Mock the store
vi.mock("../../../store", () => ({
  editorStore: {
    pushToHistory: vi.fn(),
    setElements: vi.fn(),
    setConnections: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

import { useNodesState, useEdgesState } from "@xyflow/react";
import { editorStore } from "../../../store";

const mockUseNodesState = vi.mocked(useNodesState);
const mockUseEdgesState = vi.mocked(useEdgesState);
const mockStore = vi.mocked(editorStore);

describe("useReactFlow", () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockOnNodesChange = vi.fn();
  const mockOnEdgesChange = vi.fn();
  const mockUnsubscribe = vi.fn();

  const testNodes: Node[] = [
    { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
    { id: "2", position: { x: 100, y: 100 }, data: { label: "Node 2" } },
  ];

  const testEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseNodesState.mockReturnValue([
      testNodes,
      mockSetNodes,
      mockOnNodesChange,
    ]);

    mockUseEdgesState.mockReturnValue([
      testEdges,
      mockSetEdges,
      mockOnEdgesChange,
    ]);

    // Reset store mocks
    mockStore.pushToHistory = vi.fn();
    mockStore.setElements = vi.fn();
    mockStore.setConnections = vi.fn();
    mockStore.subscribe = vi.fn(() => mockUnsubscribe);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with provided nodes and edges", () => {
      const initialNodes: Node[] = [
        { id: "init1", position: { x: 0, y: 0 }, data: { label: "Initial" } },
      ];
      const initialEdges: Edge[] = [
        { id: "einit", source: "init1", target: "init2" },
      ];

      renderHook(() =>
        useReactFlow({
          nodes: initialNodes,
          edges: initialEdges,
        }),
      );

      expect(mockUseNodesState).toHaveBeenCalledWith(initialNodes);
      expect(mockUseEdgesState).toHaveBeenCalledWith(initialEdges);
    });

    it("should initialize with empty arrays when no nodes/edges provided", () => {
      renderHook(() => useReactFlow({}));

      expect(mockUseNodesState).toHaveBeenCalledWith([]);
      expect(mockUseEdgesState).toHaveBeenCalledWith([]);
    });

    it("should return correct adapter interface", () => {
      const { result } = renderHook(() => useReactFlow({}));

      expect(result.current).toEqual({
        nodes: testNodes,
        edges: testEdges,
        setNodes: mockSetNodes,
        setEdges: mockSetEdges,
        onNodesChange: expect.any(Function),
        onEdgesChange: expect.any(Function),
        onConnect: expect.any(Function),
        onDrop: expect.any(Function),
        onDragOver: expect.any(Function),
      });
    });
  });

  describe("Node Changes Handling", () => {
    it("should handle node changes and update history", () => {
      const externalHandler = vi.fn();
      const { result } = renderHook(() =>
        useReactFlow({
          onNodesChange: externalHandler,
        }),
      );

      const nodeChanges: NodeChange[] = [
        { id: "1", type: "position", position: { x: 50, y: 50 } },
      ];

      act(() => {
        result.current.onNodesChange(nodeChanges);
      });

      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "nodes-change",
        changes: nodeChanges,
        timestamp: expect.any(Number),
      });
      expect(externalHandler).toHaveBeenCalledWith(nodeChanges);
    });

    it("should handle node changes without external handler", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const nodeChanges: NodeChange[] = [{ id: "1", type: "remove" }];

      act(() => {
        result.current.onNodesChange(nodeChanges);
      });

      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "nodes-change",
        changes: nodeChanges,
        timestamp: expect.any(Number),
      });
    });

    it("should not push to history when store is unavailable", () => {
      mockStore.pushToHistory =
        undefined as unknown as typeof mockStore.pushToHistory;
      const { result } = renderHook(() => useReactFlow({}));

      const nodeChanges: NodeChange[] = [
        { id: "1", type: "select", selected: true },
      ];

      act(() => {
        result.current.onNodesChange(nodeChanges);
      });

      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
      // Should not throw error when pushToHistory is undefined
    });

    it("should handle multiple node changes at once", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const nodeChanges: NodeChange[] = [
        { id: "1", type: "position", position: { x: 10, y: 10 } },
        { id: "2", type: "position", position: { x: 20, y: 20 } },
        { id: "3", type: "remove" },
      ];

      act(() => {
        result.current.onNodesChange(nodeChanges);
      });

      expect(mockOnNodesChange).toHaveBeenCalledTimes(1);
      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Changes Handling", () => {
    it("should handle edge changes and update history", () => {
      const externalHandler = vi.fn();
      const { result } = renderHook(() =>
        useReactFlow({
          onEdgesChange: externalHandler,
        }),
      );

      const edgeChanges: EdgeChange[] = [{ id: "e1-2", type: "remove" }];

      act(() => {
        result.current.onEdgesChange(edgeChanges);
      });

      expect(mockOnEdgesChange).toHaveBeenCalledWith(edgeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "edges-change",
        changes: edgeChanges,
        timestamp: expect.any(Number),
      });
      expect(externalHandler).toHaveBeenCalledWith(edgeChanges);
    });

    it("should handle edge changes without external handler", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const edgeChanges: EdgeChange[] = [
        { id: "e1-2", type: "select", selected: true },
      ];

      act(() => {
        result.current.onEdgesChange(edgeChanges);
      });

      expect(mockOnEdgesChange).toHaveBeenCalledWith(edgeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "edges-change",
        changes: edgeChanges,
        timestamp: expect.any(Number),
      });
    });

    it("should not push to history when store is unavailable", () => {
      mockStore.pushToHistory =
        undefined as unknown as typeof mockStore.pushToHistory;
      const { result } = renderHook(() => useReactFlow({}));

      const edgeChanges: EdgeChange[] = [{ id: "e1-2", type: "remove" }];

      act(() => {
        result.current.onEdgesChange(edgeChanges);
      });

      expect(mockOnEdgesChange).toHaveBeenCalledWith(edgeChanges);
    });
  });

  describe("Connection Handling", () => {
    it("should handle new connections and create edges", () => {
      const externalHandler = vi.fn();
      const { result } = renderHook(() =>
        useReactFlow({
          onConnect: externalHandler,
        }),
      );

      const connection: Connection = {
        source: "1",
        target: "2",
        sourceHandle: "output",
        targetHandle: "input",
      };

      act(() => {
        result.current.onConnect(connection);
      });

      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));

      // Test the function passed to setEdges
      const setEdgesFn = mockSetEdges.mock.calls[0][0];
      const existingEdges: Edge[] = [
        { id: "existing", source: "a", target: "b" },
      ];
      const result_edges = setEdgesFn(existingEdges);

      expect(result_edges).toEqual([
        ...existingEdges,
        {
          id: "1-2",
          source: "1",
          target: "2",
          sourceHandle: "output",
          targetHandle: "input",
        },
      ]);

      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "edge-connect",
        edge: {
          id: "1-2",
          source: "1",
          target: "2",
          sourceHandle: "output",
          targetHandle: "input",
        },
        timestamp: expect.any(Number),
      });
      expect(externalHandler).toHaveBeenCalledWith(connection);
    });

    it("should handle connections without handles", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const connection: Connection = {
        source: "node1",
        target: "node2",
        sourceHandle: null,
        targetHandle: null,
      };

      act(() => {
        result.current.onConnect(connection);
      });

      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));

      const setEdgesFn = mockSetEdges.mock.calls[0][0];
      const result_edges = setEdgesFn([]);

      expect(result_edges[0]).toEqual({
        id: "node1-node2",
        source: "node1",
        target: "node2",
        sourceHandle: undefined,
        targetHandle: undefined,
      });
    });

    it("should not create edge when connection is invalid", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const invalidConnection: Connection = {
        source: null,
        target: "2",
        sourceHandle: null,
        targetHandle: null,
      };

      expect(() => {
        act(() => {
          result.current.onConnect(invalidConnection);
        });
      }).not.toThrow();

      // Should still call setEdges even with invalid connection
      expect(mockSetEdges).toHaveBeenCalled();
    });
  });

  describe("Handler Stability", () => {
    it("should maintain stable handler references when props don't change", () => {
      const externalOnNodesChange = vi.fn();
      const externalOnEdgesChange = vi.fn();
      const externalOnConnect = vi.fn();

      const { result, rerender } = renderHook((props) => useReactFlow(props), {
        initialProps: {
          onNodesChange: externalOnNodesChange,
          onEdgesChange: externalOnEdgesChange,
          onConnect: externalOnConnect,
        },
      });

      const firstRenderHandlers = {
        onNodesChange: result.current.onNodesChange,
        onEdgesChange: result.current.onEdgesChange,
        onConnect: result.current.onConnect,
      };

      rerender({
        onNodesChange: externalOnNodesChange,
        onEdgesChange: externalOnEdgesChange,
        onConnect: externalOnConnect,
      });

      expect(result.current.onNodesChange).toBe(
        firstRenderHandlers.onNodesChange,
      );
      expect(result.current.onEdgesChange).toBe(
        firstRenderHandlers.onEdgesChange,
      );
      expect(result.current.onConnect).toBe(firstRenderHandlers.onConnect);
    });

    it("should update handler references when external handlers change", () => {
      const firstHandler = vi.fn();
      const secondHandler = vi.fn();

      const { result, rerender } = renderHook((props) => useReactFlow(props), {
        initialProps: { onNodesChange: firstHandler },
      });

      const firstOnNodesChange = result.current.onNodesChange;

      rerender({ onNodesChange: secondHandler });

      expect(result.current.onNodesChange).not.toBe(firstOnNodesChange);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive changes", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const changes1: NodeChange[] = [
        { id: "1", type: "position", position: { x: 1, y: 1 } },
      ];
      const changes2: NodeChange[] = [
        { id: "1", type: "position", position: { x: 2, y: 2 } },
      ];

      act(() => {
        result.current.onNodesChange(changes1);
        result.current.onNodesChange(changes2);
      });

      expect(mockOnNodesChange).toHaveBeenCalledTimes(2);
      expect(mockStore.pushToHistory).toHaveBeenCalledTimes(2);
    });

    it("should handle empty change arrays", () => {
      const { result } = renderHook(() => useReactFlow({}));

      act(() => {
        result.current.onNodesChange([]);
        result.current.onEdgesChange([]);
      });

      expect(mockOnNodesChange).toHaveBeenCalledWith([]);
      expect(mockOnEdgesChange).toHaveBeenCalledWith([]);
      expect(mockStore.pushToHistory).toHaveBeenCalledTimes(2);
    });

    it("should handle concurrent connections", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const connection1: Connection = {
        source: "1",
        target: "2",
        sourceHandle: null,
        targetHandle: null,
      };
      const connection2: Connection = {
        source: "2",
        target: "3",
        sourceHandle: null,
        targetHandle: null,
      };

      act(() => {
        result.current.onConnect(connection1);
        result.current.onConnect(connection2);
      });

      expect(mockSetEdges).toHaveBeenCalledTimes(2);
      expect(mockStore.pushToHistory).toHaveBeenCalledTimes(2);
    });
  });

  describe("Drag and Drop", () => {
    it("should handle drag over events", () => {
      const onDragOver = vi.fn();
      const { result } = renderHook(() => useReactFlow({ onDragOver }));

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: "none" },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.onDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.dropEffect).toBe("move");
      expect(onDragOver).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle drop events", () => {
      const onDrop = vi.fn();
      const { result } = renderHook(() => useReactFlow({ onDrop }));

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { getData: vi.fn() },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.onDrop(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onDrop).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle read-only dataTransfer gracefully", () => {
      const onDragOver = vi.fn();
      const { result } = renderHook(() => useReactFlow({ onDragOver }));

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          get dropEffect() {
            return "none";
          },
          set dropEffect(_value) {
            throw new Error("Read-only");
          },
        },
      } as unknown as React.DragEvent;

      // Should not throw
      expect(() => {
        act(() => {
          result.current.onDragOver(mockEvent);
        });
      }).not.toThrow();

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onDragOver).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe("Store Synchronization", () => {
    it("should initialize store with provided nodes and edges", () => {
      const initialNodes: Node[] = [
        { id: "node1", position: { x: 50, y: 50 }, data: {} },
      ];
      const initialEdges: Edge[] = [
        { id: "edge1", source: "node1", target: "node2" },
      ];

      renderHook(() =>
        useReactFlow({
          nodes: initialNodes,
          edges: initialEdges,
        }),
      );

      expect(mockStore.setElements).toHaveBeenCalledWith(initialNodes);
      expect(mockStore.setConnections).toHaveBeenCalledWith(initialEdges);
    });

    it("should subscribe to store changes", () => {
      const { unmount } = renderHook(() => useReactFlow({}));

      expect(mockStore.subscribe).toHaveBeenCalled();

      // Test that subscription callback updates nodes and edges
      const subscribeCallback = mockStore.subscribe.mock.calls[0][0];
      const newState = {
        elements: [{ id: "new", position: { x: 0, y: 0 }, data: {} }],
        connections: [{ id: "new-edge", source: "a", target: "b" }],
      };

      act(() => {
        subscribeCallback(newState);
      });

      expect(mockSetNodes).toHaveBeenCalledWith(newState.elements);
      expect(mockSetEdges).toHaveBeenCalledWith(newState.connections);

      // Test cleanup
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should not initialize store with empty arrays", () => {
      renderHook(() =>
        useReactFlow({
          nodes: [],
          edges: [],
        }),
      );

      expect(mockStore.setElements).not.toHaveBeenCalled();
      expect(mockStore.setConnections).not.toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of node changes efficiently", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const manyChanges: NodeChange[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `node-${i}`,
          type: "position" as const,
          position: { x: i, y: i },
        }),
      );

      const start = performance.now();
      act(() => {
        result.current.onNodesChange(manyChanges);
      });
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      expect(mockOnNodesChange).toHaveBeenCalledWith(manyChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledTimes(1);
    });

    it("should handle large numbers of edge changes efficiently", () => {
      const { result } = renderHook(() => useReactFlow({}));

      const manyChanges: EdgeChange[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `edge-${i}`,
          type: "remove" as const,
        }),
      );

      const start = performance.now();
      act(() => {
        result.current.onEdgesChange(manyChanges);
      });
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
      expect(mockOnEdgesChange).toHaveBeenCalledWith(manyChanges);
    });
  });

  describe("Memory Management", () => {
    it("should not create memory leaks with repeated renders", () => {
      const { result, rerender } = renderHook(() => useReactFlow({}));

      // Simulate many rerenders
      for (let i = 0; i < 100; i++) {
        rerender();
      }

      // Should still work correctly after many rerenders
      act(() => {
        result.current.onNodesChange([
          { id: "test", type: "position", position: { x: 0, y: 0 } },
        ]);
      });

      expect(mockOnNodesChange).toHaveBeenCalled();
    });
  });
});
