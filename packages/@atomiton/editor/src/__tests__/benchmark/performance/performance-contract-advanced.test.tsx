import { act, renderHook } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import React, { useEffect } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { useEditorNodes } from "../../../hooks/useEditorNodes";
import { useEditorViewport } from "../../../hooks/useEditorViewport";
import { useSelectedNodes } from "../../../hooks/useSelectedNodes";
import type { EditorNode } from "../../../types/EditorNode";

/**
 * Performance Contract Tests - Advanced Operations
 *
 * These tests ensure we maintain high performance standards for:
 * 1. Component re-render prevention
 * 2. Memory usage over time
 *
 * THESE TESTS MUST ALWAYS PASS - they represent our performance guarantees
 */

// Performance thresholds - DO NOT LOWER THESE
const PERFORMANCE_THRESHOLDS = {
  // Re-render prevention targets
  MIN_RERENDER_PREVENTION_PERCENT: 80, // Must prevent at least 80% of unnecessary re-renders

  // Memory thresholds
  MAX_MEMORY_GROWTH_PERCENT: 10, // Max 10% memory growth during stress test
  MAX_ARRAY_ALLOCATIONS_PER_UPDATE: 1, // Only 1 new array allocation per update
};

// Helper to measure memory usage
type PerformanceMemory = {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
};

type PerformanceWithMemory = Performance & {
  memory?: PerformanceMemory;
};

function measureMemoryUsage(): number {
  const perf = performance as PerformanceWithMemory;
  if ("memory" in perf && perf.memory) {
    return perf.memory.usedJSHeapSize;
  }
  return 0;
}

// Helper to count renders
class RenderCounter {
  private counts = new Map<string, number>();

  increment(id: string): number {
    const current = this.counts.get(id) || 0;
    const next = current + 1;
    this.counts.set(id, next);
    return next;
  }

  get(id: string): number {
    return this.counts.get(id) || 0;
  }

  reset(): void {
    this.counts.clear();
  }
}

const renderCounter = new RenderCounter();

// Test wrapper
function TestWrapper({ children }: { children: React.ReactNode }) {
  const initialNodes = [
    { id: "0", position: { x: 0, y: 0 }, data: { label: "Node 0" } },
    { id: "1", position: { x: 100, y: 0 }, data: { label: "Node 1" } },
    { id: "2", position: { x: 200, y: 0 }, data: { label: "Node 2" } },
  ];

  return (
    <ReactFlowProvider>
      <ReactFlow defaultNodes={initialNodes} fitView>
        {children}
      </ReactFlow>
    </ReactFlowProvider>
  );
}

describe("Performance Contract Tests - Advanced Operations", () => {
  beforeEach(() => {
    renderCounter.reset();
  });

  describe("1. Component Re-render Prevention", () => {
    it("should prevent at least 80% of unnecessary re-renders", () => {
      let nodesRenders = 0;
      let selectionRenders = 0;
      let viewportRenders = 0;

      function NodesComponent() {
        const { nodes } = useEditorNodes();
        useEffect(() => {
          nodesRenders++;
        });
        return <div>{nodes.length}</div>;
      }

      function SelectionComponent() {
        const selectedNodes = useSelectedNodes();
        useEffect(() => {
          selectionRenders++;
        });
        return <div>{selectedNodes.length} selected</div>;
      }

      function ViewportComponent() {
        const { zoom } = useEditorViewport();
        useEffect(() => {
          viewportRenders++;
        });
        return <div>Zoom: {zoom}</div>;
      }

      const { result } = renderHook(
        () => {
          const { setViewport, setNodes, setEdges } = useReactFlow();
          return { setViewport, setNodes, setEdges };
        },
        {
          wrapper: ({ children }) => (
            <TestWrapper>
              <NodesComponent />
              <SelectionComponent />
              <ViewportComponent />
              {children}
            </TestWrapper>
          ),
        },
      );

      // Reset counters after initial render
      nodesRenders = 0;
      selectionRenders = 0;
      viewportRenders = 0;

      // Perform 10 viewport changes (shouldn't affect nodes/selection)
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setViewport({ x: i * 5, y: i * 5, zoom: 1 + i * 0.1 });
        });
      }

      // Perform 5 edge updates (shouldn't affect nodes/selection)
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.setEdges([]);
        });
      }

      // Calculate prevention rate
      const totalPotentialRenders = 15 * 3; // 15 updates * 3 components
      const actualRenders = nodesRenders + selectionRenders + viewportRenders;
      const preventionRate =
        ((totalPotentialRenders - actualRenders) / totalPotentialRenders) * 100;

      // Contract: Must prevent at least 80% of unnecessary re-renders
      expect(preventionRate).toBeGreaterThanOrEqual(
        PERFORMANCE_THRESHOLDS.MIN_RERENDER_PREVENTION_PERCENT,
      );
    });

    it("should only re-render selection components when selection actually changes", () => {
      function SelectionOnlyComponent() {
        const selectedNodes = useSelectedNodes();

        useEffect(() => {
          renderCounter.increment("selection-only");
        });

        return <div>{selectedNodes.length} selected</div>;
      }

      const { result } = renderHook(
        () => {
          const { setNodes } = useReactFlow();
          return { setNodes };
        },
        {
          wrapper: ({ children }) => (
            <TestWrapper>
              <SelectionOnlyComponent />
              {children}
            </TestWrapper>
          ),
        },
      );

      const initialRenders = renderCounter.get("selection-only");

      // Update positions (10 times) - should NOT cause re-renders
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setNodes((nodes) =>
            nodes.map((n) =>
              n.id === "0" ? { ...n, position: { x: i * 10, y: i * 10 } } : n,
            ),
          );
        });
      }

      // Contract: No re-renders for non-selection changes
      expect(renderCounter.get("selection-only")).toBe(initialRenders);

      // Now change selection
      act(() => {
        result.current.setNodes((nodes) =>
          nodes.map((n) => (n.id === "0" ? { ...n, selected: true } : n)),
        );
      });

      // Contract: Should re-render for selection change
      expect(renderCounter.get("selection-only")).toBe(initialRenders + 1);
    });
  });

  describe("2. Memory Usage", () => {
    it("should not leak memory during rapid updates", () => {
      const { result } = renderHook(
        () => {
          const { nodes, setNodes } = useEditorNodes();
          return { nodes, setNodes };
        },
        {
          wrapper: TestWrapper,
        },
      );

      // Force garbage collection if available
      if (global.gc) global.gc();

      const initialMemory = measureMemoryUsage();

      // Perform 100 rapid updates
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setNodes((nodes) =>
            nodes.map((n) => ({
              ...n,
              data: { ...n.data, counter: i },
            })),
          );
        });
      }

      // Force garbage collection if available
      if (global.gc) global.gc();

      const finalMemory = measureMemoryUsage();

      // Only check if memory API is available
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth =
          ((finalMemory - initialMemory) / initialMemory) * 100;

        // Contract: Memory growth should be minimal
        expect(memoryGrowth).toBeLessThanOrEqual(
          PERFORMANCE_THRESHOLDS.MAX_MEMORY_GROWTH_PERCENT,
        );
      }
    });

    it("should reuse arrays when content hasn't changed (shallow comparison)", () => {
      let previousNodesRef: EditorNode[] | null = null;
      let arrayAllocationCount = 0;

      function ArrayReuseComponent() {
        const { nodes } = useEditorNodes();

        if (previousNodesRef && previousNodesRef !== nodes) {
          arrayAllocationCount++;
        }
        previousNodesRef = nodes;

        return <div>{nodes.length}</div>;
      }

      const { result } = renderHook(
        () => {
          const { setViewport } = useReactFlow();
          return { setViewport };
        },
        {
          wrapper: ({ children }) => (
            <TestWrapper>
              <ArrayReuseComponent />
              {children}
            </TestWrapper>
          ),
        },
      );

      // Reset after initial render
      arrayAllocationCount = 0;

      // Perform 10 viewport changes (shouldn't create new arrays)
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setViewport({ x: i * 10, y: i * 10, zoom: 1 });
        });
      }

      // Contract: Should reuse the same array reference
      expect(arrayAllocationCount).toBe(0);
    });
  });
});

// Export thresholds for documentation
export { PERFORMANCE_THRESHOLDS };
