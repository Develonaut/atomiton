import { act, renderHook } from "@testing-library/react";
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowInstance,
} from "@xyflow/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useReactFlow } from "./useReactFlow";

// Mock @xyflow/react
vi.mock("@xyflow/react", () => ({
  useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
}));

// Mock the store with correct interface
vi.mock("../../../store", () => ({
  editorStore: {
    // Flow module actions
    setFlowInstance: vi.fn(),
    getFlowInstance: vi.fn(),
    updateFlowSnapshot: vi.fn(),
    debouncedUpdateFlowSnapshot: vi.fn(),
    getFlowSnapshot: vi.fn(),
    getInitialFlowState: vi.fn((defaultNodes = [], defaultEdges = []) => ({
      nodes: defaultNodes,
      edges: defaultEdges,
      viewport: undefined,
    })),
    // Node module actions
    addNode: vi.fn(),
    deleteNode: vi.fn(),
    deleteSelectedNodes: vi.fn(),
    handleConnect: vi.fn(),
    handleDrop: vi.fn(),
    // Base store methods
    getState: vi.fn(),
    setState: vi.fn(),
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

    // Reset store mocks with correct interface
    mockStore.getInitialFlowState = vi.fn(
      (defaultNodes = [], defaultEdges = []) => ({
        nodes: defaultNodes.length > 0 ? defaultNodes : testNodes,
        edges: defaultEdges.length > 0 ? defaultEdges : testEdges,
        viewport: undefined,
      }),
    );
    mockStore.debouncedUpdateFlowSnapshot = vi.fn();
    mockStore.setFlowInstance = vi.fn();
    mockStore.handleConnect = vi.fn();
    mockStore.addNode = vi.fn();
    mockStore.deleteSelectedNodes = vi.fn();
    mockStore.handleDrop = vi.fn();
    mockStore.subscribe = vi.fn().mockReturnValue(mockUnsubscribe);
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
          defaultNodes: initialNodes,
          defaultEdges: initialEdges,
        }),
      );

      expect(mockStore.getInitialFlowState).toHaveBeenCalledWith(
        initialNodes,
        initialEdges,
      );
    });

    it("should initialize with empty arrays when no nodes/edges provided", () => {
      renderHook(() => useReactFlow());

      expect(mockStore.getInitialFlowState).toHaveBeenCalledWith([], []);
    });

    it("should return correct adapter interface", () => {
      const { result } = renderHook(() => useReactFlow());

      expect(result.current).toEqual({
        nodes: testNodes,
        edges: testEdges,
        setNodes: mockSetNodes,
        setEdges: mockSetEdges,
        onNodesChange: expect.any(Function),
        onEdgesChange: expect.any(Function),
        onConnect: expect.any(Function),
        onInit: expect.any(Function),
        addNode: mockStore.addNode,
        deleteSelectedNodes: mockStore.deleteSelectedNodes,
        handleDrop: mockStore.handleDrop,
      });
    });
  });

  describe("Node Changes Handling", () => {
    it("should handle node changes and update flow snapshot", () => {
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
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalled();
      expect(externalHandler).toHaveBeenCalledWith(nodeChanges);
    });

    it("should handle node changes without external handler", () => {
      const { result } = renderHook(() => useReactFlow());

      const nodeChanges: NodeChange[] = [{ id: "1", type: "remove" }];

      act(() => {
        result.current.onNodesChange(nodeChanges);
      });

      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalled();
    });

    it("should not throw when debouncedUpdateFlowSnapshot is unavailable", () => {
      mockStore.debouncedUpdateFlowSnapshot =
        undefined as unknown as typeof mockStore.debouncedUpdateFlowSnapshot;
      const { result } = renderHook(() => useReactFlow());

      const nodeChanges: NodeChange[] = [
        { id: "1", type: "select", selected: true },
      ];

      expect(() => {
        act(() => {
          result.current.onNodesChange(nodeChanges);
        });
      }).not.toThrow();

      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
    });

    it("should handle multiple node changes at once", () => {
      const { result } = renderHook(() => useReactFlow());

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
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Changes Handling", () => {
    it("should handle edge changes and update flow snapshot", () => {
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
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalled();
      expect(externalHandler).toHaveBeenCalledWith(edgeChanges);
    });

    it("should handle edge changes without external handler", () => {
      const { result } = renderHook(() => useReactFlow());

      const edgeChanges: EdgeChange[] = [
        { id: "e1-2", type: "select", selected: true },
      ];

      act(() => {
        result.current.onEdgesChange(edgeChanges);
      });

      expect(mockOnEdgesChange).toHaveBeenCalledWith(edgeChanges);
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalled();
    });

    it("should not throw when store methods are unavailable", () => {
      mockStore.debouncedUpdateFlowSnapshot =
        undefined as unknown as typeof mockStore.debouncedUpdateFlowSnapshot;
      const { result } = renderHook(() => useReactFlow());

      const edgeChanges: EdgeChange[] = [{ id: "e1-2", type: "remove" }];

      expect(() => {
        act(() => {
          result.current.onEdgesChange(edgeChanges);
        });
      }).not.toThrow();

      expect(mockOnEdgesChange).toHaveBeenCalledWith(edgeChanges);
    });
  });

  describe("Connection Handling", () => {
    it("should handle new connections", () => {
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

      expect(mockStore.handleConnect).toHaveBeenCalledWith(connection);
      expect(externalHandler).toHaveBeenCalledWith(connection);
    });

    it("should handle connections without handles", () => {
      const { result } = renderHook(() => useReactFlow());

      const connection: Connection = {
        source: "node1",
        target: "node2",
        sourceHandle: null,
        targetHandle: null,
      };

      act(() => {
        result.current.onConnect(connection);
      });

      expect(mockStore.handleConnect).toHaveBeenCalledWith(connection);
    });

    it("should handle invalid connections gracefully", () => {
      const { result } = renderHook(() => useReactFlow());

      const invalidConnection: Connection = {
        source: null as unknown as string,
        target: "2",
        sourceHandle: null,
        targetHandle: null,
      };

      expect(() => {
        act(() => {
          result.current.onConnect(invalidConnection);
        });
      }).not.toThrow();

      expect(mockStore.handleConnect).toHaveBeenCalledWith(invalidConnection);
    });
  });

  describe("Init Handling", () => {
    it("should set flow instance on init", () => {
      const { result } = renderHook(() => useReactFlow());

      const mockInstance = {
        setViewport: vi.fn(),
        getNodes: vi.fn(),
        getEdges: vi.fn(),
      } as unknown as ReactFlowInstance;

      act(() => {
        result.current.onInit(mockInstance);
      });

      expect(mockStore.setFlowInstance).toHaveBeenCalledWith(mockInstance);
    });

    it("should restore viewport if available", () => {
      mockStore.getInitialFlowState.mockReturnValue({
        nodes: testNodes,
        edges: testEdges,
        viewport: { x: 100, y: 200, zoom: 1.5 },
      });

      const { result } = renderHook(() => useReactFlow());

      const mockInstance = {
        setViewport: vi.fn(),
        getNodes: vi.fn(),
        getEdges: vi.fn(),
      } as unknown as ReactFlowInstance;

      act(() => {
        result.current.onInit(mockInstance);
      });

      expect(mockInstance.setViewport).toHaveBeenCalledWith({
        x: 100,
        y: 200,
        zoom: 1.5,
      });
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
      const { result } = renderHook(() => useReactFlow());

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
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalledTimes(2);
    });

    it("should handle empty change arrays", () => {
      const { result } = renderHook(() => useReactFlow());

      act(() => {
        result.current.onNodesChange([]);
        result.current.onEdgesChange([]);
      });

      expect(mockOnNodesChange).toHaveBeenCalledWith([]);
      expect(mockOnEdgesChange).toHaveBeenCalledWith([]);
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalledTimes(2);
    });

    it("should handle concurrent connections", () => {
      const { result } = renderHook(() => useReactFlow());

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

      expect(mockStore.handleConnect).toHaveBeenCalledTimes(2);
    });
  });

  describe("Store Actions", () => {
    it("should expose addNode action", () => {
      const { result } = renderHook(() => useReactFlow());

      expect(result.current.addNode).toBe(mockStore.addNode);
    });

    it("should expose deleteSelectedNodes action", () => {
      const { result } = renderHook(() => useReactFlow());

      expect(result.current.deleteSelectedNodes).toBe(
        mockStore.deleteSelectedNodes,
      );
    });

    it("should expose handleDrop action", () => {
      const { result } = renderHook(() => useReactFlow());

      expect(result.current.handleDrop).toBe(mockStore.handleDrop);
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of node changes efficiently", () => {
      const { result } = renderHook(() => useReactFlow());

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
      expect(mockStore.debouncedUpdateFlowSnapshot).toHaveBeenCalledTimes(1);
    });

    it("should handle large numbers of edge changes efficiently", () => {
      const { result } = renderHook(() => useReactFlow());

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
      const { result, rerender } = renderHook(() => useReactFlow());

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
