import { useEditorNode } from "#hooks/useEditorNode";
import { useEditorNodes } from "#hooks/useEditorNodes";
import { useSelectedNode } from "#hooks/useSelectedNode";
import { useSelectedNodes } from "#hooks/useSelectedNodes";
import type { EditorNode } from "#types/EditorNode";
import { act, renderHook } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import React, { useState } from "react";
import { describe, expect, it } from "vitest";

// Helper function to create a properly typed EditorNode for tests
function createTestEditorNode(
  overrides: Partial<EditorNode> & { id: string },
): EditorNode {
  return {
    id: overrides.id,
    type: overrides.type || "test",
    name: overrides.name || "Test Node",
    position: overrides.position || { x: 0, y: 0 },
    data: overrides.data || {},
    inputPorts: overrides.inputPorts || [],
    outputPorts: overrides.outputPorts || [],
    metadata: overrides.metadata || {
      id: overrides.id,
      name: overrides.name || "Test Node",
      type: "template" as const,
      version: "1.0.0",
      author: "test",
      description: "Test node",
      category: "utility" as const,
      icon: "zap" as const,
    },
    parameters: overrides.parameters || {
      defaults: {},
      fields: {},
    },
    // Required Node type properties
    execute: async () => ({ success: true }),
    getValidatedParams: () => ({}),
    ...overrides,
  } as EditorNode;
}

/**
 * Edge case analysis tests - specifically testing the issues found in stress tests
 */

function TestWrapper({ children }: { children: React.ReactNode }) {
  const [nodes] = useState<EditorNode[]>([]);
  const [edges] = useState([]);

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

describe.skip("Edge Case Analysis - ReactFlow Store Integration (requires full ReactFlow instance)", () => {
  describe("ReactFlow Integration Issues", () => {
    it("should properly initialize empty state", () => {
      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      // This should work - empty array
      expect(result.current.nodes).toEqual([]);
      expect(Array.isArray(result.current.nodes)).toBe(true);
    });

    it("should properly set nodes using setNodes", () => {
      const testNode = createTestEditorNode({
        id: "test-1",
        type: "test",
        name: "Test Node",
        position: { x: 100, y: 100 },
      });

      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.setNodes([testNode]);
      });

      console.log("Nodes after setNodes:", result.current.nodes);
      console.log("Nodes length:", result.current.nodes.length);
      console.log("First node:", result.current.nodes[0]);

      // This is failing in stress tests - let's see why
      expect(result.current.nodes).toHaveLength(1);
      expect(result.current.nodes[0].id).toBe("test-1");
    });

    it("should handle node retrieval with useEditorNode", () => {
      const testNode = createTestEditorNode({
        id: "test-lookup",
        type: "test",
        name: "Test Lookup Node",
        position: { x: 200, y: 200 },
      });

      const { result: nodesResult } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      const { result: nodeResult } = renderHook(
        () => useEditorNode("test-lookup"),
        {
          wrapper: TestWrapper,
        },
      );

      act(() => {
        nodesResult.current.setNodes([testNode]);
      });

      console.log("Individual node lookup:", nodeResult.current.node);
      console.log("Node exists:", !!nodeResult.current.node);

      // This is failing in stress tests
      expect(nodeResult.current.node).toBeDefined();
      expect(nodeResult.current.node?.id).toBe("test-lookup");
    });

    it("should handle selection state properly", () => {
      const testNodes: EditorNode[] = [
        createTestEditorNode({
          id: "select-1",
          type: "test",
          name: "Node 1",
          position: { x: 100, y: 100 },
          selected: false,
        }),
        createTestEditorNode({
          id: "select-2",
          type: "test",
          name: "Node 2",
          position: { x: 200, y: 200 },
          selected: true,
        }),
      ];

      const { result } = renderHook(
        () => ({
          nodes: useEditorNodes(),
          selectedNode: useSelectedNode(),
          selectedNodes: useSelectedNodes(),
        }),
        {
          wrapper: TestWrapper,
        },
      );

      act(() => {
        result.current.nodes.setNodes(testNodes);
      });

      console.log("Selected node:", result.current.selectedNode);
      console.log("Selected nodes:", result.current.selectedNodes);
      console.log(
        "Selected nodes length:",
        result.current.selectedNodes.length,
      );

      // These are failing in stress tests
      expect(result.current.selectedNode).toBeDefined();
      expect(result.current.selectedNode?.id).toBe("select-2");
      expect(result.current.selectedNodes).toHaveLength(1);
    });
  });

  describe("Store Integration Analysis", () => {
    it("should verify useStore selector behavior", () => {
      const { result } = renderHook(
        () => {
          const nodes = useEditorNodes();

          // Let's examine what the store contains
          console.log("Current nodes from hook:", nodes.nodes);

          return nodes;
        },
        {
          wrapper: TestWrapper,
        },
      );

      const testNode = createTestEditorNode({
        id: "store-test",
        type: "test",
        name: "Store Test",
        position: { x: 300, y: 300 },
      });

      act(() => {
        result.current.setNodes([testNode]);
      });

      console.log("After setting nodes:", result.current.nodes);

      // Check if the issue is with our store selector
      expect(result.current.nodes).toBeDefined();
      expect(Array.isArray(result.current.nodes)).toBe(true);
    });
  });

  describe("Type Compatibility Analysis", () => {
    it("should verify EditorNode compatibility with ReactFlow Node", () => {
      const editorNode = createTestEditorNode({
        id: "type-test",
        type: "test",
        name: "Type Test",
        position: { x: 400, y: 400 },
        data: { test: "data" },
        // ReactFlow specific properties
        selected: false,
        draggable: true,
        selectable: true,
        connectable: true,
      });

      // Verify all required properties are present
      expect(editorNode.id).toBeDefined();
      expect(editorNode.type).toBeDefined();
      expect(editorNode.position).toBeDefined();
      expect(editorNode.data).toBeDefined();
      expect(typeof editorNode.position.x).toBe("number");
      expect(typeof editorNode.position.y).toBe("number");
    });
  });

  describe("Performance Characteristics", () => {
    it("should measure basic operations timing", () => {
      const startTime = performance.now();

      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      const setupTime = performance.now() - startTime;
      console.log("Hook setup time:", setupTime, "ms");

      const nodes: EditorNode[] = Array.from({ length: 10 }, (_, i) =>
        createTestEditorNode({
          id: `perf-${i}`,
          type: "test",
          name: `Node ${i}`,
          position: { x: i * 100, y: 100 },
        }),
      );

      const nodeCreationTime = performance.now() - startTime;
      console.log("Node creation time:", nodeCreationTime - setupTime, "ms");

      act(() => {
        const setStartTime = performance.now();
        result.current.setNodes(nodes);
        const setEndTime = performance.now();
        console.log("setNodes time:", setEndTime - setStartTime, "ms");
      });

      const totalTime = performance.now() - startTime;
      console.log("Total test time:", totalTime, "ms");

      expect(result.current.nodes).toHaveLength(10);
    });
  });

  describe("Error Boundary Scenarios", () => {
    it("should handle invalid node data gracefully", () => {
      const { result } = renderHook(() => useEditorNodes(), {
        wrapper: TestWrapper,
      });

      // Test with malformed node
      const invalidNode = {
        id: "invalid",
        type: "test",
        // Missing required properties
      } as EditorNode;

      expect(() => {
        act(() => {
          result.current.setNodes([invalidNode]);
        });
      }).not.toThrow();
    });

    it("should handle undefined/null node data", () => {
      const { result } = renderHook(() => useEditorNode("nonexistent"), {
        wrapper: TestWrapper,
      });

      // Should handle missing node gracefully
      expect(result.current.node).toBeUndefined();
      expect(result.current.isSelected).toBe(false);
    });
  });
});
