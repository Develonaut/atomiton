import { useEditorNodes } from "#hooks/useEditorNodes";
import { useEditorViewport } from "#hooks/useEditorViewport";
import { act, renderHook } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider, useReactFlow } from "@xyflow/react";
import React, { useEffect, useRef } from "react";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Performance Contract Tests - Basic Operations
 *
 * These tests ensure we maintain high performance standards for:
 * 1. Rapid state updates (e.g., dragging nodes)
 * 2. Hook execution performance
 *
 * THESE TESTS MUST ALWAYS PASS - they represent our performance guarantees
 */

// Performance thresholds - DO NOT LOWER THESE
const PERFORMANCE_THRESHOLDS = {
  // Maximum re-renders allowed during rapid updates
  MAX_RERENDERS_DURING_DRAG: 2,
  MAX_RERENDERS_DURING_PAN: 1,
  MAX_RERENDERS_DURING_ZOOM: 1,

  // Time thresholds
  MAX_HOOK_EXECUTION_TIME_MS: 1, // Hooks must execute in under 1ms
  MAX_UPDATE_BATCH_TIME_MS: 16, // Stay under 60fps threshold (16.67ms)
};

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
  return (
    <ReactFlowProvider>
      <ReactFlow fitView>{children}</ReactFlow>
    </ReactFlowProvider>
  );
}

describe("Performance Contract Tests - Basic Operations", () => {
  beforeEach(() => {
    renderCounter.reset();
  });

  describe("1. Rapid State Updates", () => {
    it("should handle rapid node dragging without excessive re-renders", () => {
      function DragTestComponent() {
        const renderCount = useRef(0);
        const { nodes } = useEditorNodes();

        useEffect(() => {
          renderCount.current++;
          renderCounter.increment("drag-test");
        });

        return <div>{nodes.length} nodes</div>;
      }

      const { result } = renderHook(
        () => {
          const { setNodes } = useReactFlow();
          return { setNodes };
        },
        {
          wrapper: ({ children }) => (
            <TestWrapper>
              <DragTestComponent />
              {children}
            </TestWrapper>
          ),
        }
      );

      const initialRenders = renderCounter.get("drag-test");

      // Simulate dragging a node (60 updates, like 1 second at 60fps)
      const dragUpdates = 60;
      for (let i = 0; i < dragUpdates; i++) {
        act(() => {
          result.current.setNodes((nodes) =>
            nodes.map((n) =>
              n.id === "node-0" ? { ...n, position: { x: i * 2, y: i * 2 } } : n
            )
          );
        });
      }

      const totalRenders = renderCounter.get("drag-test") - initialRenders;
      const rendersPerUpdate = totalRenders / dragUpdates;

      // Contract: Must not exceed threshold
      expect(rendersPerUpdate).toBeLessThanOrEqual(
        PERFORMANCE_THRESHOLDS.MAX_RERENDERS_DURING_DRAG
      );
    });

    it("should handle rapid viewport panning without re-rendering node components", () => {
      function PanTestComponent() {
        const { nodes } = useEditorNodes();

        useEffect(() => {
          renderCounter.increment("pan-test");
        });

        return <div>{nodes.length} nodes</div>;
      }

      const { result } = renderHook(
        () => {
          const { setViewport } = useReactFlow();
          return { setViewport };
        },
        {
          wrapper: ({ children }) => (
            <TestWrapper>
              <PanTestComponent />
              {children}
            </TestWrapper>
          ),
        }
      );

      const initialRenders = renderCounter.get("pan-test");

      // Simulate panning (30 updates)
      for (let i = 0; i < 30; i++) {
        act(() => {
          result.current.setViewport({ x: i * 10, y: i * 10, zoom: 1 });
        });
      }

      const totalRenders = renderCounter.get("pan-test") - initialRenders;

      // Contract: Panning should NOT cause node list re-renders
      expect(totalRenders).toBeLessThanOrEqual(
        PERFORMANCE_THRESHOLDS.MAX_RERENDERS_DURING_PAN
      );
    });

    it("should handle rapid zoom changes efficiently", () => {
      function ZoomTestComponent() {
        const { zoom } = useEditorViewport();

        useEffect(() => {
          renderCounter.increment("zoom-test");
        });

        return <div>Zoom: {zoom}</div>;
      }

      const { result } = renderHook(
        () => {
          const { zoomTo } = useReactFlow();
          return { zoomTo };
        },
        {
          wrapper: ({ children }) => (
            <TestWrapper>
              <ZoomTestComponent />
              {children}
            </TestWrapper>
          ),
        }
      );

      const initialRenders = renderCounter.get("zoom-test");

      // Simulate smooth zoom (20 steps)
      for (let i = 1; i <= 20; i++) {
        act(() => {
          result.current.zoomTo(0.5 + i * 0.05);
        });
      }

      const totalRenders = renderCounter.get("zoom-test") - initialRenders;

      // Contract: Zoom changes should be efficient
      expect(totalRenders).toBeLessThanOrEqual(
        20 * PERFORMANCE_THRESHOLDS.MAX_RERENDERS_DURING_ZOOM
      );
    });
  });

  describe("2. Hook Execution Performance", () => {
    it("should execute hooks in under 1ms", () => {
      const { result } = renderHook(
        () => {
          const start = performance.now();
          const { nodes } = useEditorNodes();
          const { zoom } = useEditorViewport();
          const executionTime = performance.now() - start;

          return { nodes, zoom, executionTime };
        },
        {
          wrapper: TestWrapper,
        }
      );

      // Contract: Hook execution must be fast
      expect(result.current.executionTime).toBeLessThanOrEqual(
        PERFORMANCE_THRESHOLDS.MAX_HOOK_EXECUTION_TIME_MS
      );
    });

    it("should handle batch updates within 16ms (60fps)", () => {
      const { result } = renderHook(
        () => {
          const { setNodes } = useReactFlow();
          return { setNodes };
        },
        {
          wrapper: TestWrapper,
        }
      );

      const start = performance.now();

      // Perform a batch update
      act(() => {
        result.current.setNodes((nodes) =>
          nodes.map((n, idx) => ({
            ...n,
            selected: idx < 50,
            position: {
              x: n.position.x + 10,
              y: n.position.y + 10,
            },
          }))
        );
      });

      const batchTime = performance.now() - start;

      // Contract: Batch updates must stay under 60fps threshold
      expect(batchTime).toBeLessThanOrEqual(
        PERFORMANCE_THRESHOLDS.MAX_UPDATE_BATCH_TIME_MS
      );
    });
  });
});

// Export thresholds for documentation
export { PERFORMANCE_THRESHOLDS };
