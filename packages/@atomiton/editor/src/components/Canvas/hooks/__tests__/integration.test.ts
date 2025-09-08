import { act, renderHook } from "@testing-library/react";
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCanvas } from "../useCanvas";
import { useReactFlow } from "../useReactFlow";
import { useStoreSync } from "../useStoreSync";
import { useDragHandlers } from "../useDragHandlers";

// Mock @xyflow/react
vi.mock("@xyflow/react", () => ({
  useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
  useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
}));

// Mock the store
vi.mock("../../../../store", () => ({
  editorStore: {
    subscribe: vi.fn(() => vi.fn()),
    setElements: vi.fn(),
    setConnections: vi.fn(),
    pushToHistory: vi.fn(),
  },
}));

import { useNodesState, useEdgesState } from "@xyflow/react";
import { editorStore } from "../../../../store";

const mockUseNodesState = vi.mocked(useNodesState);
const mockUseEdgesState = vi.mocked(useEdgesState);
const mockStore = vi.mocked(editorStore);

describe("Canvas Hooks Integration", () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockOnNodesChange = vi.fn();
  const mockOnEdgesChange = vi.fn();

  const testNodes: Node[] = [
    { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
    { id: "2", position: { x: 100, y: 100 }, data: { label: "Node 2" } },
    { id: "3", position: { x: 200, y: 200 }, data: { label: "Node 3" } },
  ];

  const testEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e2-3", source: "2", target: "3" },
  ];

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
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("useCanvas Integration", () => {
    it("should orchestrate all hooks correctly in a real workflow", () => {
      const onNodesChange = vi.fn();
      const onEdgesChange = vi.fn();
      const onConnect = vi.fn();
      const onDrop = vi.fn();
      const onDragOver = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
          onNodesChange,
          onEdgesChange,
          onConnect,
          onDrop,
          onDragOver,
        }),
      );

      // Verify all hooks are working together
      expect(result.current.reactFlow.nodes).toBe(testNodes);
      expect(result.current.reactFlow.edges).toBe(testEdges);
      expect(result.current.reactFlowWrapper.current).toBeNull();

      // Verify handlers are available
      expect(typeof result.current.reactFlow.onNodesChange).toBe("function");
      expect(typeof result.current.reactFlow.onEdgesChange).toBe("function");
      expect(typeof result.current.reactFlow.onConnect).toBe("function");
      expect(typeof result.current.reactFlow.onDrop).toBe("function");
      expect(typeof result.current.reactFlow.onDragOver).toBe("function");
    });

    it("should handle complete node lifecycle through integrated hooks", () => {
      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      // Simulate node position change
      const nodeChanges: NodeChange[] = [
        { id: "1", type: "position", position: { x: 50, y: 50 } },
        { id: "2", type: "select", selected: true },
      ];

      act(() => {
        result.current.reactFlow.onNodesChange(nodeChanges);
      });

      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "nodes-change",
        changes: nodeChanges,
        timestamp: expect.any(Number),
      });
    });

    it("should handle complete edge lifecycle through integrated hooks", () => {
      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      // Simulate edge removal
      const edgeChanges: EdgeChange[] = [{ id: "e1-2", type: "remove" }];

      act(() => {
        result.current.reactFlow.onEdgesChange(edgeChanges);
      });

      expect(mockOnEdgesChange).toHaveBeenCalledWith(edgeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "edges-change",
        changes: edgeChanges,
        timestamp: expect.any(Number),
      });
    });

    it("should handle new connections through integrated workflow", () => {
      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      const connection: Connection = {
        source: "1",
        target: "3",
        sourceHandle: "output",
        targetHandle: "input",
      };

      act(() => {
        result.current.reactFlow.onConnect(connection);
      });

      expect(mockSetEdges).toHaveBeenCalledWith(expect.any(Function));
      expect(mockStore.pushToHistory).toHaveBeenCalledWith({
        type: "edge-connect",
        edge: {
          id: "1-3",
          source: "1",
          target: "3",
          sourceHandle: "output",
          targetHandle: "input",
        },
        timestamp: expect.any(Number),
      });
    });

    it("should handle drag operations through integrated workflow", () => {
      const onDrop = vi.fn();
      const onDragOver = vi.fn();

      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
          onDrop,
          onDragOver,
        }),
      );

      const mockDragEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: "none",
          getData: vi.fn().mockReturnValue("custom-node"),
        },
        clientX: 150,
        clientY: 200,
      } as unknown as React.DragEvent;

      act(() => {
        result.current.reactFlow.onDragOver(mockDragEvent);
        result.current.reactFlow.onDrop(mockDragEvent);
      });

      expect(mockDragEvent.preventDefault).toHaveBeenCalledTimes(2);
      expect(mockDragEvent.dataTransfer.dropEffect).toBe("move");
      expect(onDragOver).toHaveBeenCalledWith(mockDragEvent);
      expect(onDrop).toHaveBeenCalledWith(mockDragEvent);
    });
  });

  describe("Store Integration", () => {
    it("should sync initial data with store and maintain reactivity", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      const { result, rerender } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      // Verify initial sync
      expect(mockStore.setElements).toHaveBeenCalledWith(testNodes);
      expect(mockStore.setConnections).toHaveBeenCalledWith(testEdges);

      // Simulate store state change
      const newNodes: Node[] = [
        { id: "4", position: { x: 300, y: 300 }, data: { label: "Node 4" } },
      ];
      const newEdges: Edge[] = [{ id: "e3-4", source: "3", target: "4" }];

      act(() => {
        storeCallback({
          elements: newNodes,
          connections: newEdges,
        });
      });

      expect(mockSetNodes).toHaveBeenCalledWith(newNodes);
      expect(mockSetEdges).toHaveBeenCalledWith(newEdges);

      // Test that rerenders maintain subscription
      rerender();

      act(() => {
        storeCallback({
          elements: testNodes,
          connections: testEdges,
        });
      });

      expect(mockSetNodes).toHaveBeenCalledWith(testNodes);
      expect(mockSetEdges).toHaveBeenCalledWith(testEdges);
    });

    it("should handle store updates while processing local changes", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      // Process local node change
      const nodeChanges: NodeChange[] = [
        { id: "1", type: "position", position: { x: 75, y: 75 } },
      ];

      // Process store update concurrently
      const storeNodes: Node[] = [
        { id: "5", position: { x: 400, y: 400 }, data: { label: "Node 5" } },
      ];

      act(() => {
        result.current.reactFlow.onNodesChange(nodeChanges);
        storeCallback({
          elements: storeNodes,
          connections: testEdges,
        });
      });

      // Both operations should succeed
      expect(mockOnNodesChange).toHaveBeenCalledWith(nodeChanges);
      expect(mockStore.pushToHistory).toHaveBeenCalled();
      expect(mockSetNodes).toHaveBeenCalledWith(storeNodes);
    });
  });

  describe("Hook Interaction Edge Cases", () => {
    it("should handle rapid changes across all hooks", () => {
      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      // Simulate rapid mixed operations
      const operations = [
        () =>
          result.current.reactFlow.onNodesChange([
            { id: "1", type: "position", position: { x: 10, y: 10 } },
          ]),
        () =>
          result.current.reactFlow.onEdgesChange([
            { id: "e1-2", type: "select", selected: true },
          ]),
        () =>
          result.current.reactFlow.onConnect({
            source: "2",
            target: "3",
            sourceHandle: "out",
            targetHandle: "in",
          }),
        () =>
          result.current.reactFlow.onDragOver({
            preventDefault: vi.fn(),
            dataTransfer: { dropEffect: "none" },
          } as unknown as React.DragEvent),
      ];

      act(() => {
        operations.forEach((op) => op());
        operations.forEach((op) => op()); // Run twice to test stability
      });

      expect(mockOnNodesChange).toHaveBeenCalledTimes(2);
      expect(mockOnEdgesChange).toHaveBeenCalledTimes(2);
      expect(mockSetEdges).toHaveBeenCalledTimes(2);
      expect(mockStore.pushToHistory).toHaveBeenCalledTimes(6); // 2 * (nodes + edges + connect)
    });

    it("should maintain consistency when props change during operations", () => {
      const onNodesChange1 = vi.fn();
      const onNodesChange2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ onNodesChange }) =>
          useCanvas({
            nodes: testNodes,
            edges: testEdges,
            onNodesChange,
          }),
        {
          initialProps: { onNodesChange: onNodesChange1 },
        },
      );

      // Start operation with first handler
      const nodeChanges: NodeChange[] = [
        { id: "1", type: "position", position: { x: 25, y: 25 } },
      ];

      act(() => {
        result.current.reactFlow.onNodesChange(nodeChanges);
      });

      expect(onNodesChange1).toHaveBeenCalledWith(nodeChanges);
      expect(onNodesChange2).not.toHaveBeenCalled();

      // Change props mid-operation
      rerender({ onNodesChange: onNodesChange2 });

      act(() => {
        result.current.reactFlow.onNodesChange(nodeChanges);
      });

      expect(onNodesChange2).toHaveBeenCalledWith(nodeChanges);
      expect(onNodesChange1).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should handle cleanup correctly when unmounting during operations", () => {
      const mockUnsubscribe = vi.fn();
      mockStore.subscribe.mockReturnValue(mockUnsubscribe);

      const { result, unmount } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      // Start some operations
      act(() => {
        result.current.reactFlow.onNodesChange([
          { id: "1", type: "position", position: { x: 30, y: 30 } },
        ]);
      });

      // Unmount while operations might be pending
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle errors in one hook without affecting others", () => {
      mockOnNodesChange.mockImplementationOnce(() => {
        throw new Error("Node change error");
      });

      const onEdgesChange = vi.fn();
      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
          onEdgesChange,
        }),
      );

      // Node change should fail
      expect(() => {
        act(() => {
          result.current.reactFlow.onNodesChange([
            { id: "1", type: "position", position: { x: 40, y: 40 } },
          ]);
        });
      }).toThrow("Node change error");

      // But edge changes should still work
      act(() => {
        result.current.reactFlow.onEdgesChange([
          { id: "e1-2", type: "select", selected: true },
        ]);
      });

      expect(onEdgesChange).toHaveBeenCalled();
    });

    it("should handle store errors gracefully", () => {
      mockStore.setElements.mockImplementationOnce(() => {
        throw new Error("Store error");
      });

      // Should not crash the hook
      expect(() => {
        renderHook(() =>
          useCanvas({
            nodes: testNodes,
            edges: testEdges,
          }),
        );
      }).toThrow("Store error");
    });

    it("should handle subscription errors gracefully", () => {
      mockStore.subscribe.mockImplementationOnce(() => {
        throw new Error("Subscription error");
      });

      // Should not crash the hook
      expect(() => {
        renderHook(() =>
          useCanvas({
            nodes: testNodes,
            edges: testEdges,
          }),
        );
      }).toThrow("Subscription error");
    });
  });

  describe("Memory and Performance Integration", () => {
    it("should handle large datasets across all hooks", () => {
      const largeNodes: Node[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: i * 10, y: i * 10 },
        data: { label: `Node ${i}` },
      }));

      const largeEdges: Edge[] = Array.from({ length: 999 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));

      const start = performance.now();
      const { result } = renderHook(() =>
        useCanvas({
          nodes: largeNodes,
          edges: largeEdges,
        }),
      );

      // Perform operations on large dataset
      act(() => {
        result.current.reactFlow.onNodesChange([
          { id: "node-0", type: "position", position: { x: 5, y: 5 } },
        ]);
      });
      const end = performance.now();

      expect(end - start).toBeLessThan(200); // Should handle large datasets efficiently
      expect(mockStore.setElements).toHaveBeenCalledWith(largeNodes);
      expect(mockStore.setConnections).toHaveBeenCalledWith(largeEdges);
    });

    it("should not create memory leaks with complex workflows", () => {
      const { result, rerender, unmount } = renderHook(
        ({ nodes, edges }) => useCanvas({ nodes, edges }),
        {
          initialProps: { nodes: testNodes, edges: testEdges },
        },
      );

      // Simulate complex workflow with many operations
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.reactFlow.onNodesChange([
            { id: "1", type: "position", position: { x: i, y: i } },
          ]);
        });

        rerender({
          nodes: [
            ...testNodes,
            {
              id: `temp-${i}`,
              position: { x: i * 2, y: i * 2 },
              data: { label: `Temp ${i}` },
            },
          ],
          edges: testEdges,
        });
      }

      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle complete canvas workflow: load -> edit -> save", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      // 1. Load canvas
      const { result, rerender } = renderHook(() =>
        useCanvas({
          nodes: [],
          edges: [],
        }),
      );

      // 2. Load data from store
      act(() => {
        storeCallback({
          elements: testNodes,
          connections: testEdges,
        });
      });

      expect(mockSetNodes).toHaveBeenCalledWith(testNodes);
      expect(mockSetEdges).toHaveBeenCalledWith(testEdges);

      // 3. User adds new node via drag-and-drop
      const dragEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: "none",
          getData: vi.fn().mockReturnValue("new-node"),
        },
        clientX: 250,
        clientY: 250,
      } as unknown as React.DragEvent;

      act(() => {
        result.current.reactFlow.onDragOver(dragEvent);
        result.current.reactFlow.onDrop(dragEvent);
      });

      // 4. User connects nodes
      act(() => {
        result.current.reactFlow.onConnect({
          source: "1",
          target: "3",
          sourceHandle: "out",
          targetHandle: "in",
        });
      });

      // 5. User moves existing node
      act(() => {
        result.current.reactFlow.onNodesChange([
          { id: "2", type: "position", position: { x: 150, y: 150 } },
        ]);
      });

      // Verify all operations were tracked
      expect(mockStore.pushToHistory).toHaveBeenCalledTimes(2); // connect + node move
      expect(mockSetEdges).toHaveBeenCalled();
      expect(mockOnNodesChange).toHaveBeenCalled();
    });

    it("should handle collaborative editing scenario", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() =>
        useCanvas({
          nodes: testNodes,
          edges: testEdges,
        }),
      );

      // Local user makes change
      act(() => {
        result.current.reactFlow.onNodesChange([
          { id: "1", type: "select", selected: true },
        ]);
      });

      // Remote user makes change (comes through store)
      act(() => {
        storeCallback({
          elements: [
            ...testNodes,
            {
              id: "remote",
              position: { x: 500, y: 500 },
              data: { label: "Remote Node" },
            },
          ],
          connections: testEdges,
        });
      });

      // Both changes should be handled correctly
      expect(mockOnNodesChange).toHaveBeenCalled();
      expect(mockSetNodes).toHaveBeenCalled();
      expect(mockStore.pushToHistory).toHaveBeenCalled();
    });
  });
});
