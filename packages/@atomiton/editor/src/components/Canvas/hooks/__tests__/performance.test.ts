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

describe("Canvas Hooks Performance", () => {
  const PERFORMANCE_THRESHOLD = {
    SMALL: 50, // < 50ms for small operations
    MEDIUM: 100, // < 100ms for medium operations
    LARGE: 200, // < 200ms for large operations
    XLARGE: 500, // < 500ms for very large operations
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseNodesState.mockReturnValue([[], vi.fn(), vi.fn()]);

    mockUseEdgesState.mockReturnValue([[], vi.fn(), vi.fn()]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Hook Initialization Performance", () => {
    it("should initialize useCanvas quickly with empty data", () => {
      const start = performance.now();

      renderHook(() => useCanvas({}));

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.SMALL);
    });

    it("should initialize useCanvas quickly with small datasets", () => {
      const smallNodes: Node[] = Array.from({ length: 10 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: i * 50, y: i * 50 },
        data: { label: `Node ${i}` },
      }));

      const smallEdges: Edge[] = Array.from({ length: 9 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));

      const start = performance.now();

      renderHook(() =>
        useCanvas({
          nodes: smallNodes,
          edges: smallEdges,
        }),
      );

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.SMALL);
    });

    it("should initialize useCanvas efficiently with medium datasets", () => {
      const mediumNodes: Node[] = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
        data: { label: `Node ${i}` },
      }));

      const mediumEdges: Edge[] = Array.from({ length: 150 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i % 100}`,
        target: `node-${(i + 1) % 100}`,
      }));

      const start = performance.now();

      renderHook(() =>
        useCanvas({
          nodes: mediumNodes,
          edges: mediumEdges,
        }),
      );

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.MEDIUM);
    });

    it("should initialize useCanvas acceptably with large datasets", () => {
      const largeNodes: Node[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: (i % 50) * 100, y: Math.floor(i / 50) * 100 },
        data: { label: `Node ${i}` },
      }));

      const largeEdges: Edge[] = Array.from({ length: 2000 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i % 1000}`,
        target: `node-${(i + 1) % 1000}`,
      }));

      const start = performance.now();

      renderHook(() =>
        useCanvas({
          nodes: largeNodes,
          edges: largeEdges,
        }),
      );

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.LARGE);
    });
  });

  describe("Handler Performance", () => {
    it("should handle single node changes quickly", () => {
      const { result } = renderHook(() =>
        useCanvas({
          nodes: [{ id: "1", position: { x: 0, y: 0 }, data: {} }],
          edges: [],
        }),
      );

      const nodeChanges: NodeChange[] = [
        { id: "1", type: "position", position: { x: 100, y: 100 } },
      ];

      const start = performance.now();

      act(() => {
        result.current.reactFlow.onNodesChange(nodeChanges);
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.SMALL);
    });

    it("should handle batch node changes efficiently", () => {
      const batchNodes: Node[] = Array.from({ length: 50 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: i * 20, y: i * 20 },
        data: { label: `Node ${i}` },
      }));

      const { result } = renderHook(() =>
        useCanvas({
          nodes: batchNodes,
          edges: [],
        }),
      );

      const batchChanges: NodeChange[] = batchNodes.map((node, i) => ({
        id: node.id,
        type: "position" as const,
        position: { x: i * 30, y: i * 30 },
      }));

      const start = performance.now();

      act(() => {
        result.current.reactFlow.onNodesChange(batchChanges);
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.MEDIUM);
    });

    it("should handle large node change batches acceptably", () => {
      const manyNodes: Node[] = Array.from({ length: 500 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: i * 10, y: i * 10 },
        data: { label: `Node ${i}` },
      }));

      const { result } = renderHook(() =>
        useCanvas({
          nodes: manyNodes,
          edges: [],
        }),
      );

      const manyChanges: NodeChange[] = manyNodes.map((node, i) => ({
        id: node.id,
        type: "position" as const,
        position: { x: i * 15, y: i * 15 },
      }));

      const start = performance.now();

      act(() => {
        result.current.reactFlow.onNodesChange(manyChanges);
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.LARGE);
    });

    it("should handle edge changes efficiently", () => {
      const manyEdges: Edge[] = Array.from({ length: 100 }, (_, i) => ({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
      }));

      const { result } = renderHook(() =>
        useCanvas({
          nodes: [],
          edges: manyEdges,
        }),
      );

      const edgeChanges: EdgeChange[] = manyEdges.map((edge) => ({
        id: edge.id,
        type: "select" as const,
        selected: true,
      }));

      const start = performance.now();

      act(() => {
        result.current.reactFlow.onEdgesChange(edgeChanges);
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.MEDIUM);
    });

    it("should handle connection creation efficiently", () => {
      const { result } = renderHook(() => useCanvas({}));

      const connections: Connection[] = Array.from({ length: 50 }, (_, i) => ({
        source: `node-${i}`,
        target: `node-${i + 1}`,
        sourceHandle: "out",
        targetHandle: "in",
      }));

      const start = performance.now();

      act(() => {
        connections.forEach((connection) => {
          result.current.reactFlow.onConnect(connection);
        });
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.MEDIUM);
    });

    it("should handle rapid drag operations efficiently", () => {
      const onDragOver = vi.fn();
      const { result } = renderHook(() =>
        useCanvas({
          onDragOver,
        }),
      );

      const dragEvents = Array.from({ length: 100 }, (_, i) => ({
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: "none" },
        clientX: i * 2,
        clientY: i * 2,
      })) as React.DragEvent[];

      const start = performance.now();

      act(() => {
        dragEvents.forEach((event) => {
          result.current.reactFlow.onDragOver(event);
        });
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.MEDIUM);
    });
  });

  describe("Rerender Performance", () => {
    it("should handle frequent rerenders efficiently", () => {
      const { rerender } = renderHook(
        ({ nodes, edges }) => useCanvas({ nodes, edges }),
        {
          initialProps: {
            nodes: [] as Node[],
            edges: [] as Edge[],
          },
        },
      );

      const start = performance.now();

      // Simulate 100 rapid rerenders
      for (let i = 0; i < 100; i++) {
        rerender({
          nodes: [
            {
              id: `node-${i}`,
              position: { x: i, y: i },
              data: { label: `Node ${i}` },
            },
          ],
          edges: [],
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.LARGE);
    });

    it("should maintain performance with prop changes", () => {
      let currentHandler = vi.fn();

      const { result, rerender } = renderHook(
        ({ onNodesChange }) => useCanvas({ onNodesChange }),
        {
          initialProps: { onNodesChange: currentHandler },
        },
      );

      const start = performance.now();

      // Change handlers frequently
      for (let i = 0; i < 50; i++) {
        currentHandler = vi.fn();
        rerender({ onNodesChange: currentHandler });

        // Use the handler
        act(() => {
          result.current.reactFlow.onNodesChange([
            { id: "test", type: "position", position: { x: i, y: i } },
          ]);
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.LARGE);
    });
  });

  describe("Memory Performance", () => {
    it("should not accumulate memory with repeated operations", () => {
      const { result } = renderHook(() => useCanvas({}));

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        act(() => {
          result.current.reactFlow.onNodesChange([
            { id: `node-${i}`, type: "position", position: { x: i, y: i } },
          ]);
        });

        act(() => {
          result.current.reactFlow.onConnect({
            source: `node-${i}`,
            target: `node-${i + 1}`,
            sourceHandle: "out",
            targetHandle: "in",
          });
        });
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory growth should be reasonable (less than 10MB)
      if (initialMemory && finalMemory) {
        expect(finalMemory - initialMemory).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it("should clean up efficiently on unmount", () => {
      const mockUnsubscribe = vi.fn();
      mockStore.subscribe.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() =>
        useCanvas({
          nodes: Array.from({ length: 1000 }, (_, i) => ({
            id: `node-${i}`,
            position: { x: i, y: i },
            data: { label: `Node ${i}` },
          })),
          edges: Array.from({ length: 1000 }, (_, i) => ({
            id: `edge-${i}`,
            source: `node-${i}`,
            target: `node-${(i + 1) % 1000}`,
          })),
        }),
      );

      const start = performance.now();
      unmount();
      const end = performance.now();

      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.SMALL);
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe("Store Performance", () => {
    it("should handle store updates efficiently", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      renderHook(() => useCanvas({}));

      const largeState = {
        elements: Array.from({ length: 500 }, (_, i) => ({
          id: `node-${i}`,
          position: { x: i * 10, y: i * 10 },
          data: { label: `Node ${i}` },
        })),
        connections: Array.from({ length: 500 }, (_, i) => ({
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${(i + 1) % 500}`,
        })),
      };

      const start = performance.now();

      act(() => {
        storeCallback(largeState);
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.MEDIUM);
    });

    it("should handle rapid store updates efficiently", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      renderHook(() => useCanvas({}));

      const start = performance.now();

      // Simulate rapid store updates (collaborative editing scenario)
      for (let i = 0; i < 100; i++) {
        act(() => {
          storeCallback({
            elements: [
              {
                id: `node-${i}`,
                position: { x: i * 5, y: i * 5 },
                data: { label: `Node ${i}` },
              },
            ],
            connections: [],
          });
        });
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.LARGE);
    });
  });

  describe("Concurrent Operations Performance", () => {
    it("should handle concurrent operations efficiently", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() =>
        useCanvas({
          nodes: [{ id: "1", position: { x: 0, y: 0 }, data: {} }],
          edges: [],
        }),
      );

      const start = performance.now();

      // Simulate concurrent operations: local changes + store updates
      act(() => {
        for (let i = 0; i < 50; i++) {
          // Local operation
          result.current.reactFlow.onNodesChange([
            { id: "1", type: "position", position: { x: i, y: i } },
          ]);

          // Store update
          storeCallback({
            elements: [{ id: "2", position: { x: i * 2, y: i * 2 }, data: {} }],
            connections: [],
          });

          // Drag operation
          result.current.reactFlow.onDragOver({
            preventDefault: vi.fn(),
            dataTransfer: { dropEffect: "none" },
            clientX: i * 3,
            clientY: i * 3,
          } as React.DragEvent);
        }
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.LARGE);
    });
  });

  describe("Real-World Performance Scenarios", () => {
    it("should handle complex workflow performance", () => {
      let storeCallback: (state: any) => void = () => {};
      mockStore.subscribe.mockImplementation((callback) => {
        storeCallback = callback;
        return vi.fn();
      });

      const initialNodes: Node[] = Array.from({ length: 100 }, (_, i) => ({
        id: `node-${i}`,
        position: { x: i * 10, y: i * 10 },
        data: { label: `Node ${i}` },
      }));

      const { result, rerender } = renderHook(() =>
        useCanvas({
          nodes: initialNodes,
          edges: [],
        }),
      );

      const start = performance.now();

      // Simulate complex workflow
      act(() => {
        // 1. Multiple node movements (user interaction)
        for (let i = 0; i < 20; i++) {
          result.current.reactFlow.onNodesChange([
            {
              id: `node-${i}`,
              type: "position",
              position: { x: i * 15, y: i * 15 },
            },
          ]);
        }

        // 2. Add connections
        for (let i = 0; i < 10; i++) {
          result.current.reactFlow.onConnect({
            source: `node-${i}`,
            target: `node-${i + 1}`,
            sourceHandle: "out",
            targetHandle: "in",
          });
        }

        // 3. Store updates (collaborative changes)
        for (let i = 0; i < 10; i++) {
          storeCallback({
            elements: [
              ...initialNodes,
              {
                id: `remote-${i}`,
                position: { x: i * 20, y: i * 20 },
                data: { label: `Remote ${i}` },
              },
            ],
            connections: [],
          });
        }

        // 4. Drag operations
        for (let i = 0; i < 20; i++) {
          result.current.reactFlow.onDragOver({
            preventDefault: vi.fn(),
            dataTransfer: { dropEffect: "none" },
            clientX: i * 5,
            clientY: i * 5,
          } as React.DragEvent);
        }
      });

      // 5. Prop changes
      rerender();

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.XLARGE);
    });

    it("should maintain performance under stress conditions", () => {
      const stressNodes: Node[] = Array.from({ length: 2000 }, (_, i) => ({
        id: `stress-node-${i}`,
        position: { x: (i % 100) * 20, y: Math.floor(i / 100) * 20 },
        data: { label: `Stress Node ${i}` },
      }));

      const stressEdges: Edge[] = Array.from({ length: 3000 }, (_, i) => ({
        id: `stress-edge-${i}`,
        source: `stress-node-${i % 2000}`,
        target: `stress-node-${(i + 1) % 2000}`,
      }));

      const start = performance.now();

      const { result } = renderHook(() =>
        useCanvas({
          nodes: stressNodes,
          edges: stressEdges,
        }),
      );

      // Perform stress operations
      act(() => {
        result.current.reactFlow.onNodesChange(
          Array.from({ length: 100 }, (_, i) => ({
            id: `stress-node-${i}`,
            type: "position" as const,
            position: { x: i * 25, y: i * 25 },
          })),
        );
      });

      const end = performance.now();
      expect(end - start).toBeLessThan(PERFORMANCE_THRESHOLD.XLARGE);
    });
  });

  describe("Performance Benchmarks", () => {
    const benchmarks = {
      "small canvas (10 nodes)": () => {
        const nodes = Array.from({ length: 10 }, (_, i) => ({
          id: `node-${i}`,
          position: { x: i * 50, y: i * 50 },
          data: { label: `Node ${i}` },
        }));
        return renderHook(() => useCanvas({ nodes, edges: [] }));
      },
      "medium canvas (100 nodes)": () => {
        const nodes = Array.from({ length: 100 }, (_, i) => ({
          id: `node-${i}`,
          position: { x: (i % 10) * 50, y: Math.floor(i / 10) * 50 },
          data: { label: `Node ${i}` },
        }));
        return renderHook(() => useCanvas({ nodes, edges: [] }));
      },
      "large canvas (1000 nodes)": () => {
        const nodes = Array.from({ length: 1000 }, (_, i) => ({
          id: `node-${i}`,
          position: { x: (i % 50) * 20, y: Math.floor(i / 50) * 20 },
          data: { label: `Node ${i}` },
        }));
        return renderHook(() => useCanvas({ nodes, edges: [] }));
      },
    };

    Object.entries(benchmarks).forEach(([name, benchmark]) => {
      it(`should meet performance benchmark for ${name}`, () => {
        const start = performance.now();
        const { result } = benchmark();
        const initEnd = performance.now();

        act(() => {
          result.current.reactFlow.onNodesChange([
            { id: "node-0", type: "position", position: { x: 5, y: 5 } },
          ]);
        });

        const operationEnd = performance.now();

        const initTime = initEnd - start;
        const operationTime = operationEnd - initEnd;

        console.log(
          `${name} - Init: ${initTime.toFixed(2)}ms, Operation: ${operationTime.toFixed(2)}ms`,
        );

        // Benchmarks should complete within reasonable time limits
        expect(initTime).toBeLessThan(
          name.includes("large")
            ? PERFORMANCE_THRESHOLD.LARGE
            : PERFORMANCE_THRESHOLD.MEDIUM,
        );
        expect(operationTime).toBeLessThan(PERFORMANCE_THRESHOLD.SMALL);
      });
    });
  });
});
