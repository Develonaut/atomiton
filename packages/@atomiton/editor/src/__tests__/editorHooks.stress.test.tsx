import type { EditorEdge } from "#hooks/useEditorEdges";
import { useEditorEdges } from "#hooks/useEditorEdges";
import { useEditorNode } from "#hooks/useEditorNode";
import { useEditorNodes } from "#hooks/useEditorNodes";
import { useSelectedNode } from "#hooks/useSelectedNode";
import { useSelectedNodes } from "#hooks/useSelectedNodes";
import type { EditorNode } from "#types/EditorNode";
import { act, renderHook } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import React from "react";
import { describe, expect, it } from "vitest";

/**
 * Stress tests for editor hooks with large datasets.
 * These tests ensure the editor remains responsive with many nodes and edges.
 */

// Helper to create a large graph
function createLargeGraph(nodeCount: number, connectionDensity: number = 0.1) {
  const nodes: EditorNode[] = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node-${i}`,
    type: i % 3 === 0 ? "code" : i % 3 === 1 ? "transform" : "default",
    name: `Node ${i}`,
    category: "test",
    position: {
      x: (i % 20) * 150,
      y: Math.floor(i / 20) * 150,
    },
    data: {
      label: `Node ${i}`,
      value: Math.random() * 100,
      metadata: {
        created: Date.now(),
        modified: Date.now(),
        tags: [`tag-${i % 5}`, `category-${i % 10}`],
      },
    },
    selected: false,
    inputPorts: [],
    outputPorts: [],
  }));

  const edges: EditorEdge[] = [];
  const maxEdges = Math.floor(nodeCount * connectionDensity);

  for (let i = 0; i < maxEdges; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    const target = Math.floor(Math.random() * nodeCount);
    if (source !== target) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${source}`,
        target: `node-${target}`,
        type: "default",
      });
    }
  }

  return { nodes, edges };
}

// Wrapper component for testing
function TestWrapper({ children }: { children: React.ReactNode }) {
  const [nodes] = React.useState<EditorNode[]>([]);
  const [edges] = React.useState<EditorEdge[]>([]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        defaultNodes={[]}
        defaultEdges={[]}
        fitView
      >
        {children}
      </ReactFlow>
    </ReactFlowProvider>
  );
}

describe.skip("Editor Stress Tests - ReactFlow Store Integration (requires full ReactFlow instance)", () => {
  describe("Large dataset handling", () => {
    it("should handle 1000 nodes efficiently", async () => {
      const { nodes } = createLargeGraph(1000);
      const startTime = performance.now();

      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setNodes(nodes);
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(100); // Should load in under 100ms
      expect(result.current.nodes).toHaveLength(1000);
    });

    it("should handle 5000 nodes without crashing", async () => {
      const { nodes } = createLargeGraph(5000);
      const startTime = performance.now();

      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setNodes(nodes);
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(500); // Should load in under 500ms
      expect(result.current.nodes).toHaveLength(5000);
    });
  });

  describe("Selection performance", () => {
    it("should select/deselect nodes quickly with 1000 nodes", async () => {
      const { nodes } = createLargeGraph(1000);

      const { result } = renderHook(
        () => ({
          nodes: useEditorNodes(),
          selected: useSelectedNode(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      act(() => {
        result.current.nodes.setNodes(nodes);
      });

      // Measure selection time
      const startTime = performance.now();

      act(() => {
        result.current.nodes.setNodes((prev) =>
          prev.map((n, i) => ({ ...n, selected: i === 500 }))
        );
      });

      const selectionTime = performance.now() - startTime;
      expect(selectionTime).toBeLessThan(50); // Should complete in under 50ms
    });

    it("should handle multiple selections efficiently", async () => {
      const { nodes } = createLargeGraph(1000);

      const { result } = renderHook(
        () => ({
          nodes: useEditorNodes(),
          selectedNodes: useSelectedNodes(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      act(() => {
        result.current.nodes.setNodes(nodes);
      });

      // Select 10% of nodes
      const startTime = performance.now();

      act(() => {
        result.current.nodes.setNodes((prev) =>
          prev.map((n, i) => ({ ...n, selected: i % 10 === 0 }))
        );
      });

      const selectionTime = performance.now() - startTime;
      expect(selectionTime).toBeLessThan(50);
      expect(result.current.selectedNodes).toHaveLength(100);
    });
  });

  describe("Individual node lookup performance", () => {
    it("should lookup individual nodes quickly in large graphs", async () => {
      const { nodes } = createLargeGraph(5000);

      const { result: nodesResult } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      act(() => {
        nodesResult.current.setNodes(nodes);
      });

      // Test multiple lookups
      const lookupTimes: number[] = [];
      const nodeIds = [500, 1500, 2500, 3500, 4500].map((i) => `node-${i}`);

      for (const nodeId of nodeIds) {
        const startTime = performance.now();

        const { result } = renderHook(() => useEditorNode(nodeId), {
          wrapper: TestWrapper,
        });

        const lookupTime = performance.now() - startTime;
        lookupTimes.push(lookupTime);

        expect(result.current.node).toBeDefined();
        expect(result.current.node?.id).toBe(nodeId);
      }

      const avgLookupTime =
        lookupTimes.reduce((a, b) => a + b, 0) / lookupTimes.length;
      expect(avgLookupTime).toBeLessThan(5); // Average lookup should be under 5ms
    });
  });

  describe("Batch operations", () => {
    it("should handle batch position updates efficiently", async () => {
      const { nodes } = createLargeGraph(1000);

      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setNodes(nodes);
      });

      const startTime = performance.now();

      // Move all nodes by 100 pixels
      act(() => {
        result.current.setNodes((prev) =>
          prev.map((n) => ({
            ...n,
            position: {
              x: n.position.x + 100,
              y: n.position.y + 100,
            },
          }))
        );
      });

      const updateTime = performance.now() - startTime;
      expect(updateTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle rapid consecutive updates", async () => {
      const { nodes } = createLargeGraph(500);

      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setNodes(nodes);
      });

      const updateCount = 10;
      const startTime = performance.now();

      // Perform multiple rapid updates
      for (let i = 0; i < updateCount; i++) {
        act(() => {
          result.current.setNodes((prev) =>
            prev.map((n) => ({
              ...n,
              data: { ...n.data, updateCount: i },
            }))
          );
        });
      }

      const totalTime = performance.now() - startTime;
      const avgUpdateTime = totalTime / updateCount;

      expect(avgUpdateTime).toBeLessThan(20); // Each update should average under 20ms
    });
  });

  describe("Memory efficiency", () => {
    it("should not leak memory with repeated node updates", async () => {
      const { nodes } = createLargeGraph(1000);

      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      // Track initial memory if available
      const initialMemory = (
        performance as { memory?: { usedJSHeapSize: number } }
      ).memory?.usedJSHeapSize;

      // Perform many updates
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setNodes(
            nodes.map((n) => ({ ...n, selected: i % 2 === 0 }))
          );
        });
      }

      // Check final memory if available
      const finalMemory = (
        performance as { memory?: { usedJSHeapSize: number } }
      ).memory?.usedJSHeapSize;

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercentage = (memoryIncrease / initialMemory) * 100;

        // Memory increase should be reasonable (less than 50%)
        expect(memoryIncreasePercentage).toBeLessThan(50);
      }
    });
  });

  describe("Edge case handling", () => {
    it("should handle empty graphs", () => {
      const { result } = renderHook(
        () => ({
          nodes: useEditorNodes(),
          edges: useEditorEdges(),
          selected: useSelectedNode(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      expect(result.current.nodes.nodes).toHaveLength(0);
      expect(result.current.edges.edges).toHaveLength(0);
      expect(result.current.selected).toBeNull();
    });

    it("should handle graphs with only nodes (no edges)", () => {
      const { nodes } = createLargeGraph(1000, 0); // No edges

      const { result } = renderHook(
        () => ({
          nodes: useEditorNodes(),
          edges: useEditorEdges(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      act(() => {
        result.current.nodes.setNodes(nodes);
      });

      expect(result.current.nodes.nodes).toHaveLength(1000);
      expect(result.current.edges.edges).toHaveLength(0);
    });

    it("should handle highly connected graphs", () => {
      const { nodes, edges } = createLargeGraph(100, 5); // Very high connection density

      const { result } = renderHook(
        () => ({
          nodes: useEditorNodes(),
          edges: useEditorEdges(),
        }),
        {
          wrapper: TestWrapper,
        }
      );

      act(() => {
        result.current.nodes.setNodes(nodes);
        result.current.edges.setEdges(edges);
      });

      expect(result.current.nodes.nodes).toHaveLength(100);
      expect(result.current.edges.edges.length).toBeGreaterThan(100);
    });
  });
});

/**
 * Performance expectations:
 * - 1000 nodes: All operations < 100ms
 * - 5000 nodes: Initial load < 500ms, operations < 200ms
 * - 10000 nodes: Initial load < 1s, operations < 500ms
 * - Individual lookups: Always < 5ms regardless of graph size
 */
