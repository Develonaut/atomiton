import { renderHook, act } from "@testing-library/react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useStore as useStoreOriginal,
} from "@xyflow/react";
import React, { useRef, useEffect } from "react";
import { describe, expect, it, beforeEach } from "vitest";
import { useEditorStore } from "../../../hooks/useEditorStore";
import { useEditorNodes } from "../../../hooks/useEditorNodes";
import { useSelectedNodes } from "../../../hooks/useSelectedNodes";
import type { EditorNode } from "../../../types/EditorNode";

/**
 * Test to measure the actual re-render prevention benefits of shallow comparison
 */

// Track render counts
const renderCounts = new Map<string, number>();

// Component that uses the store WITHOUT shallow comparison
function ComponentWithoutShallow({ id }: { id: string }) {
  const renderCount = useRef(0);
  renderCount.current++;

  // Direct useStore without shallow comparison
  const nodes = useStoreOriginal((state) => {
    return Array.from(state.nodeLookup.values()).map(
      (nodeInternal) => nodeInternal.internals.userNode as EditorNode,
    );
  });

  useEffect(() => {
    renderCounts.set(`without-${id}`, renderCount.current);
  });

  return <div data-testid={`without-${id}`}>{nodes.length} nodes</div>;
}

// Component that uses our optimized useEditorStore WITH shallow comparison
function ComponentWithShallow({ id }: { id: string }) {
  const renderCount = useRef(0);
  renderCount.current++;

  // Using our wrapper with shallow comparison
  const nodes = useEditorStore((state) => {
    return Array.from(state.nodeLookup.values()).map(
      (nodeInternal) => nodeInternal.internals.userNode as EditorNode,
    );
  });

  useEffect(() => {
    renderCounts.set(`with-${id}`, renderCount.current);
  });

  return <div data-testid={`with-${id}`}>{nodes.length} nodes</div>;
}

// Component using our hook
function ComponentWithHook({ id }: { id: string }) {
  const renderCount = useRef(0);
  renderCount.current++;

  const { nodes } = useEditorNodes();

  useEffect(() => {
    renderCounts.set(`hook-${id}`, renderCount.current);
  });

  return <div data-testid={`hook-${id}`}>{nodes.length} nodes</div>;
}

// Test wrapper
function TestWrapper({ children }: { children: React.ReactNode }) {
  const initialNodes: EditorNode[] = [
    {
      id: "1",
      type: "default",
      name: "Node 1",
      category: "test",
      position: { x: 0, y: 0 },
      data: {},
    },
    {
      id: "2",
      type: "default",
      name: "Node 2",
      category: "test",
      position: { x: 100, y: 100 },
      data: {},
    },
  ];

  return (
    <ReactFlowProvider>
      <ReactFlow nodes={initialNodes} edges={[]} fitView>
        {children}
      </ReactFlow>
    </ReactFlowProvider>
  );
}

describe("Re-render Prevention Tests", () => {
  beforeEach(() => {
    renderCounts.clear();
  });

  it("should prevent re-renders with shallow comparison when nodes don't change", () => {
    const { result } = renderHook(
      () => {
        const { setViewport } = useReactFlow();
        return { setViewport };
      },
      {
        wrapper: ({ children }) => (
          <TestWrapper>
            <ComponentWithoutShallow id="test1" />
            <ComponentWithShallow id="test1" />
            <ComponentWithHook id="test1" />
            {children}
          </TestWrapper>
        ),
      },
    );

    // Initial render
    expect(renderCounts.get("without-test1")).toBe(1);
    expect(renderCounts.get("with-test1")).toBe(1);
    expect(renderCounts.get("hook-test1")).toBe(1);

    // Trigger viewport change (shouldn't affect nodes)
    act(() => {
      result.current.setViewport({ x: 10, y: 10, zoom: 1 });
    });

    // Without shallow: re-renders because array reference changes
    expect(renderCounts.get("without-test1")).toBeGreaterThan(1);

    // With shallow: should NOT re-render because nodes array content is the same
    expect(renderCounts.get("with-test1")).toBe(1);
    expect(renderCounts.get("hook-test1")).toBe(1);
  });

  it("should measure re-renders when updating node positions", () => {
    const { result } = renderHook(
      () => {
        const { setNodes } = useReactFlow();
        return { setNodes };
      },
      {
        wrapper: ({ children }) => (
          <TestWrapper>
            <ComponentWithoutShallow id="test2" />
            <ComponentWithShallow id="test2" />
            <ComponentWithHook id="test2" />
            {children}
          </TestWrapper>
        ),
      },
    );

    const initialWithoutRenders = renderCounts.get("without-test2") || 0;
    const initialWithRenders = renderCounts.get("with-test2") || 0;
    const initialHookRenders = renderCounts.get("hook-test2") || 0;

    // Update a node position (this SHOULD cause re-renders)
    act(() => {
      result.current.setNodes((nodes) =>
        nodes.map((n) =>
          n.id === "1" ? { ...n, position: { x: 50, y: 50 } } : n,
        ),
      );
    });

    // All should re-render because nodes actually changed
    expect(renderCounts.get("without-test2")).toBeGreaterThan(
      initialWithoutRenders,
    );
    expect(renderCounts.get("with-test2")).toBeGreaterThan(initialWithRenders);
    expect(renderCounts.get("hook-test2")).toBeGreaterThan(initialHookRenders);
  });

  it("should prevent re-renders for selection-only components", () => {
    function SelectionComponent({ id }: { id: string }) {
      const renderCount = useRef(0);
      renderCount.current++;

      const selectedNodes = useSelectedNodes();

      useEffect(() => {
        renderCounts.set(`selection-${id}`, renderCount.current);
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
            <SelectionComponent id="test3" />
            {children}
          </TestWrapper>
        ),
      },
    );

    const initialRenders = renderCounts.get("selection-test3") || 0;

    // Update node position (not selection)
    act(() => {
      result.current.setNodes((nodes) =>
        nodes.map((n) =>
          n.id === "1" ? { ...n, position: { x: 75, y: 75 } } : n,
        ),
      );
    });

    // Should NOT re-render because selection didn't change
    expect(renderCounts.get("selection-test3")).toBe(initialRenders);

    // Now change selection
    act(() => {
      result.current.setNodes((nodes) =>
        nodes.map((n) => (n.id === "1" ? { ...n, selected: true } : n)),
      );
    });

    // Should re-render because selection changed
    expect(renderCounts.get("selection-test3")).toBeGreaterThan(initialRenders);
  });

  it("should measure cumulative re-render savings over many updates", () => {
    const { result } = renderHook(
      () => {
        const { setViewport, setNodes } = useReactFlow();
        return { setViewport, setNodes };
      },
      {
        wrapper: ({ children }) => (
          <TestWrapper>
            <ComponentWithoutShallow id="stress" />
            <ComponentWithShallow id="stress" />
            {children}
          </TestWrapper>
        ),
      },
    );

    // Simulate rapid viewport changes (like panning)
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.setViewport({ x: i * 10, y: i * 10, zoom: 1 });
      });
    }

    const withoutShallowRenders = renderCounts.get("without-stress") || 0;
    const withShallowRenders = renderCounts.get("with-stress") || 0;

    // With shallow should have significantly fewer renders
    expect(withShallowRenders).toBeLessThan(withoutShallowRenders);

    // Calculate the improvement
    const renderSavings = withoutShallowRenders - withShallowRenders;
    const percentImprovement = (renderSavings / withoutShallowRenders) * 100;

    console.log(`
      Re-render Prevention Results:
      - Without shallow: ${withoutShallowRenders} renders
      - With shallow: ${withShallowRenders} renders
      - Renders prevented: ${renderSavings}
      - Improvement: ${percentImprovement.toFixed(1)}%
    `);

    // We should see at least 50% reduction in re-renders
    expect(percentImprovement).toBeGreaterThan(50);
  });
});
