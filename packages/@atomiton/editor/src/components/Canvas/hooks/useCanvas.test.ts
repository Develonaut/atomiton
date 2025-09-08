import { renderHook } from "@testing-library/react";
import type { Edge, Node } from "@xyflow/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCanvas } from "./useCanvas";

// Mock all hook dependencies
vi.mock("./useReactFlow", () => ({
  useReactFlow: vi.fn(),
}));

vi.mock("./useStoreSync", () => ({
  useStoreSync: vi.fn(),
}));

vi.mock("./useDragHandlers", () => ({
  useDragHandlers: vi.fn(),
}));

import { useReactFlow } from "./useReactFlow";
import { useStoreSync } from "./useStoreSync";
import { useDragHandlers } from "./useDragHandlers";

const mockUseReactFlow = vi.mocked(useReactFlow);
const mockUseStoreSync = vi.mocked(useStoreSync);
const mockUseDragHandlers = vi.mocked(useDragHandlers);

describe("useCanvas", () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockOnNodesChange = vi.fn();
  const mockOnEdgesChange = vi.fn();
  const mockOnConnect = vi.fn();
  const mockHandleDrop = vi.fn();
  const mockHandleDragOver = vi.fn();

  const testNodes: Node[] = [
    { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
    { id: "2", position: { x: 100, y: 100 }, data: { label: "Node 2" } },
  ];

  const testEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

  const mockReactFlowReturn = {
    nodes: testNodes,
    edges: testEdges,
    setNodes: mockSetNodes,
    setEdges: mockSetEdges,
    onNodesChange: mockOnNodesChange,
    onEdgesChange: mockOnEdgesChange,
    onConnect: mockOnConnect,
    onDrop: mockHandleDrop,
    onDragOver: mockHandleDragOver,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseReactFlow.mockReturnValue(mockReactFlowReturn);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default empty values", () => {
      renderHook(() => useCanvas({}));

      expect(mockUseReactFlow).toHaveBeenCalledWith({
        nodes: [],
        edges: [],
        onNodesChange: undefined,
        onEdgesChange: undefined,
        onConnect: undefined,
        onDrop: undefined,
        onDragOver: undefined,
      });
    });

    it("should initialize with provided nodes and edges", () => {
      const initialNodes: Node[] = [
        {
          id: "init1",
          position: { x: 10, y: 10 },
          data: { label: "Initial Node" },
        },
      ];
      const initialEdges: Edge[] = [
        { id: "einit", source: "init1", target: "init2" },
      ];

      renderHook(() =>
        useCanvas({
          nodes: initialNodes,
          edges: initialEdges,
        }),
      );

      expect(mockUseReactFlow).toHaveBeenCalledWith({
        nodes: initialNodes,
        edges: initialEdges,
        onNodesChange: undefined,
        onEdgesChange: undefined,
        onConnect: undefined,
      });
    });

    it("should pass all handlers to appropriate hooks", () => {
      const onNodesChange = vi.fn();
      const onEdgesChange = vi.fn();
      const onConnect = vi.fn();
      const onDrop = vi.fn();
      const onDragOver = vi.fn();

      renderHook(() =>
        useCanvas({
          onNodesChange,
          onEdgesChange,
          onConnect,
          onDrop,
          onDragOver,
        }),
      );

      expect(mockUseReactFlow).toHaveBeenCalledWith({
        nodes: [],
        edges: [],
        onNodesChange,
        onEdgesChange,
        onConnect,
        onDrop,
        onDragOver,
      });

      // Drag handlers are now handled internally by useReactFlow
    });
  });

  describe("Store Synchronization", () => {
    it("should handle store sync through useReactFlow", () => {
      const initialNodes: Node[] = [
        { id: "sync1", position: { x: 5, y: 5 }, data: { label: "Sync Node" } },
      ];
      const initialEdges: Edge[] = [
        { id: "esync", source: "sync1", target: "sync2" },
      ];

      renderHook(() =>
        useCanvas({
          nodes: initialNodes,
          edges: initialEdges,
        }),
      );

      // Store sync is now handled internally by useReactFlow
      expect(mockUseReactFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: initialNodes,
          edges: initialEdges,
        }),
      );
    });
  });

  describe("Hook Orchestration", () => {
    it("should use useReactFlow with correct parameters", () => {
      const { result } = renderHook(() => useCanvas({}));

      // Verify hooks are called
      expect(mockUseReactFlow).toHaveBeenCalled();

      // Verify the return value contains all expected properties
      expect(result.current).toEqual({
        reactFlowWrapper: expect.any(Object),
        reactFlow: {
          nodes: testNodes,
          edges: testEdges,
          setNodes: mockSetNodes,
          setEdges: mockSetEdges,
          onNodesChange: mockOnNodesChange,
          onEdgesChange: mockOnEdgesChange,
          onConnect: mockOnConnect,
          onDrop: mockHandleDrop,
          onDragOver: mockHandleDragOver,
        },
      });
    });
  });

  describe("Ref Management", () => {
    it("should create and return a reactFlowWrapper ref", () => {
      const { result } = renderHook(() => useCanvas({}));

      expect(result.current.reactFlowWrapper).toEqual({
        current: null,
      });
      expect(typeof result.current.reactFlowWrapper).toBe("object");
      expect(result.current.reactFlowWrapper.current).toBeNull();
    });

    it("should maintain the same ref across rerenders", () => {
      const { result, rerender } = renderHook(() => useCanvas({}));

      const firstRef = result.current.reactFlowWrapper;

      rerender();

      expect(result.current.reactFlowWrapper).toBe(firstRef);
    });
  });

  describe("Handler Composition", () => {
    it("should compose ReactFlow handlers correctly", () => {
      const { result } = renderHook(() => useCanvas({}));

      expect(result.current.reactFlow.onNodesChange).toBe(mockOnNodesChange);
      expect(result.current.reactFlow.onEdgesChange).toBe(mockOnEdgesChange);
      expect(result.current.reactFlow.onConnect).toBe(mockOnConnect);
    });

    it("should compose drag handlers correctly", () => {
      const { result } = renderHook(() => useCanvas({}));

      expect(result.current.reactFlow.onDrop).toBe(mockHandleDrop);
      expect(result.current.reactFlow.onDragOver).toBe(mockHandleDragOver);
    });

    it("should maintain handler references across rerenders with stable props", () => {
      const stableOnDrop = vi.fn();
      const stableOnDragOver = vi.fn();

      const { result, rerender } = renderHook((props) => useCanvas(props), {
        initialProps: {
          onDrop: stableOnDrop,
          onDragOver: stableOnDragOver,
        },
      });

      const firstReactFlow = result.current.reactFlow;

      rerender({
        onDrop: stableOnDrop,
        onDragOver: stableOnDragOver,
      });

      // Handler references should remain stable if underlying hooks are stable
      expect(result.current.reactFlow.onDrop).toBe(firstReactFlow.onDrop);
      expect(result.current.reactFlow.onDragOver).toBe(
        firstReactFlow.onDragOver,
      );
    });
  });

  describe("Integration with useReactFlow", () => {
    it("should pass through nodes and edges from useReactFlow", () => {
      const customNodes: Node[] = [
        { id: "custom", position: { x: 50, y: 50 }, data: { label: "Custom" } },
      ];
      const customEdges: Edge[] = [
        { id: "ecustom", source: "custom", target: "other" },
      ];

      mockUseReactFlow.mockReturnValue({
        ...mockReactFlowReturn,
        nodes: customNodes,
        edges: customEdges,
      });

      const { result } = renderHook(() => useCanvas({}));

      expect(result.current.reactFlow.nodes).toBe(customNodes);
      expect(result.current.reactFlow.edges).toBe(customEdges);
    });

    it("should handle when useReactFlow returns different handlers", () => {
      const customOnNodesChange = vi.fn();
      const customOnEdgesChange = vi.fn();
      const customOnConnect = vi.fn();

      mockUseReactFlow.mockReturnValue({
        ...mockReactFlowReturn,
        onNodesChange: customOnNodesChange,
        onEdgesChange: customOnEdgesChange,
        onConnect: customOnConnect,
      });

      const { result } = renderHook(() => useCanvas({}));

      expect(result.current.reactFlow.onNodesChange).toBe(customOnNodesChange);
      expect(result.current.reactFlow.onEdgesChange).toBe(customOnEdgesChange);
      expect(result.current.reactFlow.onConnect).toBe(customOnConnect);
    });
  });

  describe("Props Forwarding", () => {
    it("should forward all canvas props to appropriate hooks", () => {
      const props = {
        nodes: testNodes,
        edges: testEdges,
        onNodesChange: vi.fn(),
        onEdgesChange: vi.fn(),
        onConnect: vi.fn(),
        onDrop: vi.fn(),
        onDragOver: vi.fn(),
      };

      renderHook(() => useCanvas(props));

      // Verify all props are passed to useReactFlow
      expect(mockUseReactFlow).toHaveBeenCalledWith({
        nodes: props.nodes,
        edges: props.edges,
        onNodesChange: props.onNodesChange,
        onEdgesChange: props.onEdgesChange,
        onConnect: props.onConnect,
        onDrop: props.onDrop,
        onDragOver: props.onDragOver,
      });
    });

    it("should handle partial props correctly", () => {
      const partialProps = {
        nodes: testNodes,
        onDrop: vi.fn(),
      };

      renderHook(() => useCanvas(partialProps));

      expect(mockUseReactFlow).toHaveBeenCalledWith({
        nodes: testNodes,
        edges: [],
        onNodesChange: undefined,
        onEdgesChange: undefined,
        onConnect: undefined,
        onDrop: partialProps.onDrop,
        onDragOver: undefined,
      });

      // No longer need to test drag handlers separately
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty nodes and edges arrays", () => {
      const { result } = renderHook(() =>
        useCanvas({
          nodes: [],
          edges: [],
        }),
      );

      expect(mockUseReactFlow).toHaveBeenCalledWith({
        nodes: [],
        edges: [],
        onNodesChange: undefined,
        onEdgesChange: undefined,
        onConnect: undefined,
      });

      expect(result.current.reactFlow.nodes).toBe(testNodes);
      expect(result.current.reactFlow.edges).toBe(testEdges);
    });

    it("should handle undefined props gracefully", () => {
      const props = {
        nodes: undefined as unknown as Node[],
        edges: undefined as unknown as Edge[],
        onNodesChange: undefined,
        onEdgesChange: undefined,
        onConnect: undefined,
        onDrop: undefined,
        onDragOver: undefined,
      };

      renderHook(() => useCanvas(props));

      expect(mockUseReactFlow).toHaveBeenCalledWith({
        nodes: [],
        edges: [],
        onNodesChange: undefined,
        onEdgesChange: undefined,
        onConnect: undefined,
      });
    });

    it("should handle hook failures gracefully", () => {
      mockUseReactFlow.mockImplementation(() => {
        throw new Error("ReactFlow hook failed");
      });

      expect(() => {
        renderHook(() => useCanvas({}));
      }).toThrow("ReactFlow hook failed");
    });
  });

  describe("Performance", () => {
    it("should not cause unnecessary re-renders", () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        return useCanvas({});
      };

      const { rerender } = renderHook(TestComponent);

      expect(renderCount).toBe(1);

      // Rerender with same props shouldn't cause extra renders in child hooks
      rerender();

      expect(renderCount).toBe(2);
      expect(mockUseReactFlow).toHaveBeenCalledTimes(2);
    });

    it("should handle rapid prop changes efficiently", () => {
      const { rerender } = renderHook((props) => useCanvas(props), {
        initialProps: { nodes: [] },
      });

      // Rapidly change props
      for (let i = 0; i < 10; i++) {
        rerender({
          nodes: [{ id: `node-${i}`, position: { x: i, y: i }, data: {} }],
        });
      }

      expect(mockUseReactFlow).toHaveBeenCalledTimes(11); // Initial + 10 rerenders
    });
  });

  describe("Memory Management", () => {
    it("should not create memory leaks with many rerenders", () => {
      const { result, rerender, unmount } = renderHook(() => useCanvas({}));

      // Many rerenders to test for memory leaks
      for (let i = 0; i < 100; i++) {
        rerender();
      }

      const finalResult = result.current;
      expect(finalResult.reactFlowWrapper).toBeDefined();
      expect(finalResult.reactFlow.nodes).toBeDefined();
      expect(finalResult.reactFlow.edges).toBeDefined();

      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Type Safety", () => {
    it("should maintain proper TypeScript types", () => {
      const { result } = renderHook(() => useCanvas({}));

      // Test that result has correct structure and types
      expect(typeof result.current.reactFlowWrapper).toBe("object");
      expect(Array.isArray(result.current.reactFlow.nodes)).toBe(true);
      expect(Array.isArray(result.current.reactFlow.edges)).toBe(true);
      expect(typeof result.current.reactFlow).toBe("object");
      expect(typeof result.current.reactFlow.onNodesChange).toBe("function");
      expect(typeof result.current.reactFlow.onEdgesChange).toBe("function");
      expect(typeof result.current.reactFlow.onConnect).toBe("function");
      expect(typeof result.current.reactFlow.onDrop).toBe("function");
      expect(typeof result.current.reactFlow.onDragOver).toBe("function");
    });
  });
});
