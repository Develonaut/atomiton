import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCanvasHandlers } from "../useCanvasHandlers";
import { editorStore } from "../../../../store";
import type { UseReactFlowReturn } from "../useReactFlow";

// Test file to verify pre-commit hooks run tests

// Mock the editor store
vi.mock("../../../../store", () => ({
  editorStore: {
    handleDrop: vi.fn(),
    deleteSelectedNodes: vi.fn(),
    selectNode: vi.fn(),
  },
}));

describe("useCanvasHandlers", () => {
  let mockReactFlow: UseReactFlowReturn;
  let mockReactFlowWrapper: React.RefObject<HTMLDivElement>;
  let mockCallbacks: {
    onInit: ReturnType<typeof vi.fn>;
    onDrop: ReturnType<typeof vi.fn>;
    onDragOver: ReturnType<typeof vi.fn>;
    onNodeClick: ReturnType<typeof vi.fn>;
    onPaneClick: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock ReactFlow object
    mockReactFlow = {
      nodes: [],
      edges: [],
      setNodes: vi.fn(),
      setEdges: vi.fn(),
      onNodesChange: vi.fn(),
      onEdgesChange: vi.fn(),
      onConnect: vi.fn(),
      onInit: vi.fn(),
      addNode: vi.fn(),
      deleteSelectedNodes: vi.fn(),
      handleDrop: vi.fn(),
    };

    // Create mock ref
    mockReactFlowWrapper = {
      current: {
        getBoundingClientRect: vi.fn().mockReturnValue({
          left: 0,
          top: 0,
          width: 1000,
          height: 800,
        }),
      } as unknown as HTMLDivElement,
    };

    // Create mock callbacks
    mockCallbacks = {
      onInit: vi.fn(),
      onDrop: vi.fn(),
      onDragOver: vi.fn(),
      onNodeClick: vi.fn(),
      onPaneClick: vi.fn(),
    };
  });

  describe("handleOnInit", () => {
    it("should call reactFlow.onInit and custom onInit callback", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
          ...mockCallbacks,
        }),
      );

      const mockInstance = { id: "test-instance" } as any;

      act(() => {
        result.current.handleOnInit(mockInstance);
      });

      expect(mockReactFlow.onInit).toHaveBeenCalledWith(mockInstance);
      expect(mockCallbacks.onInit).toHaveBeenCalledWith(mockInstance);
    });

    it("should work without custom onInit callback", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
        }),
      );

      const mockInstance = { id: "test-instance" } as any;

      act(() => {
        result.current.handleOnInit(mockInstance);
      });

      expect(mockReactFlow.onInit).toHaveBeenCalledWith(mockInstance);
    });
  });

  describe("handleOnDrop", () => {
    it("should prevent default, handle drop in store, and call custom callback", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
          ...mockCallbacks,
        }),
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn().mockReturnValue("test-node-type"),
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleOnDrop(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(editorStore.handleDrop).toHaveBeenCalledWith(
        mockEvent,
        mockReactFlowWrapper.current?.getBoundingClientRect(),
      );
      expect(mockCallbacks.onDrop).toHaveBeenCalledWith(mockEvent);
    });

    it("should handle drop when wrapper ref is null", () => {
      const nullWrapper = { current: null };
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: nullWrapper,
          ...mockCallbacks,
        }),
      );

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleOnDrop(mockEvent);
      });

      expect(editorStore.handleDrop).toHaveBeenCalledWith(mockEvent, null);
    });
  });

  describe("handleOnDragOver", () => {
    it("should prevent default and set drop effect", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
          ...mockCallbacks,
        }),
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: "",
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleOnDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.dataTransfer.dropEffect).toBe("move");
      expect(mockCallbacks.onDragOver).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe("handleOnKeyDown", () => {
    it("should delete selected nodes on Delete key", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
        }),
      );

      const mockEvent = {
        key: "Delete",
        metaKey: false,
      } as React.KeyboardEvent;

      act(() => {
        result.current.handleOnKeyDown(mockEvent);
      });

      expect(editorStore.deleteSelectedNodes).toHaveBeenCalled();
    });

    it("should delete selected nodes on Backspace key", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
        }),
      );

      const mockEvent = {
        key: "Backspace",
        metaKey: false,
      } as React.KeyboardEvent;

      act(() => {
        result.current.handleOnKeyDown(mockEvent);
      });

      expect(editorStore.deleteSelectedNodes).toHaveBeenCalled();
    });

    it("should not delete nodes when metaKey is pressed", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
        }),
      );

      const mockEvent = {
        key: "Delete",
        metaKey: true,
      } as React.KeyboardEvent;

      act(() => {
        result.current.handleOnKeyDown(mockEvent);
      });

      expect(editorStore.deleteSelectedNodes).not.toHaveBeenCalled();
    });

    it("should not react to other keys", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
        }),
      );

      const mockEvent = {
        key: "Enter",
        metaKey: false,
      } as React.KeyboardEvent;

      act(() => {
        result.current.handleOnKeyDown(mockEvent);
      });

      expect(editorStore.deleteSelectedNodes).not.toHaveBeenCalled();
    });
  });

  describe("handleOnNodeClick", () => {
    it("should select node in store and call custom callback", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
          ...mockCallbacks,
        }),
      );

      const mockEvent = {} as React.MouseEvent;
      const mockNode = { id: "node-123", type: "test-node" };

      act(() => {
        result.current.handleOnNodeClick(mockEvent, mockNode);
      });

      expect(editorStore.selectNode).toHaveBeenCalledWith("node-123");
      expect(mockCallbacks.onNodeClick).toHaveBeenCalledWith(
        mockEvent,
        mockNode,
      );
    });

    it("should work without custom onNodeClick callback", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
        }),
      );

      const mockEvent = {} as React.MouseEvent;
      const mockNode = { id: "node-456", type: "test-node" };

      act(() => {
        result.current.handleOnNodeClick(mockEvent, mockNode);
      });

      expect(editorStore.selectNode).toHaveBeenCalledWith("node-456");
    });
  });

  describe("handleOnPaneClick", () => {
    it("should deselect nodes and call custom callback", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
          ...mockCallbacks,
        }),
      );

      const mockEvent = {} as React.MouseEvent;

      act(() => {
        result.current.handleOnPaneClick(mockEvent);
      });

      expect(editorStore.selectNode).toHaveBeenCalledWith(null);
      expect(mockCallbacks.onPaneClick).toHaveBeenCalledWith(mockEvent);
    });

    it("should work without custom onPaneClick callback", () => {
      const { result } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
        }),
      );

      const mockEvent = {} as React.MouseEvent;

      act(() => {
        result.current.handleOnPaneClick(mockEvent);
      });

      expect(editorStore.selectNode).toHaveBeenCalledWith(null);
    });
  });

  describe("hook stability", () => {
    it("should maintain stable references when props don't change", () => {
      const { result, rerender } = renderHook(() =>
        useCanvasHandlers({
          reactFlow: mockReactFlow,
          reactFlowWrapper: mockReactFlowWrapper,
          ...mockCallbacks,
        }),
      );

      const initialHandlers = { ...result.current };

      rerender();

      expect(result.current.handleOnInit).toBe(initialHandlers.handleOnInit);
      expect(result.current.handleOnDrop).toBe(initialHandlers.handleOnDrop);
      expect(result.current.handleOnDragOver).toBe(
        initialHandlers.handleOnDragOver,
      );
      expect(result.current.handleOnKeyDown).toBe(
        initialHandlers.handleOnKeyDown,
      );
      expect(result.current.handleOnNodeClick).toBe(
        initialHandlers.handleOnNodeClick,
      );
      expect(result.current.handleOnPaneClick).toBe(
        initialHandlers.handleOnPaneClick,
      );
    });

    it("should update handlers when callbacks change", () => {
      const { result, rerender } = renderHook(
        ({ onNodeClick }) =>
          useCanvasHandlers({
            reactFlow: mockReactFlow,
            reactFlowWrapper: mockReactFlowWrapper,
            onNodeClick,
          }),
        {
          initialProps: {
            onNodeClick: mockCallbacks.onNodeClick,
          },
        },
      );

      const initialHandler = result.current.handleOnNodeClick;

      const newCallback = vi.fn();
      rerender({ onNodeClick: newCallback });

      expect(result.current.handleOnNodeClick).not.toBe(initialHandler);
    });
  });
});
