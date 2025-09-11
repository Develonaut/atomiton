import { useEventCallback } from "@atomiton/hooks";
import type { ReactFlowInstance, Viewport, Node } from "@xyflow/react";
import { useCallback } from "react";
import { editorStore } from "../../../store";
import type { UseReactFlowReturn } from "./useReactFlow";

export interface CanvasHandlersOptions {
  reactFlow: UseReactFlowReturn;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  onInit?: (instance: ReactFlowInstance) => void;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onPaneClick?: (event: React.MouseEvent) => void;
  onMove?: (event: MouseEvent | TouchEvent | null, viewport: Viewport) => void;
}

/**
 * Custom hook that consolidates all Canvas event handlers
 * Separates concerns and makes handlers testable
 */
export function useCanvasHandlers({
  reactFlow,
  reactFlowWrapper,
  onInit,
  onDrop,
  onDragOver,
  onNodeClick,
  onPaneClick,
  onMove,
}: CanvasHandlersOptions) {
  /**
   * Handle React Flow initialization
   */
  const handleOnInit = useCallback(
    (instance: ReactFlowInstance) => {
      reactFlow.onInit(instance);
      onInit?.(instance);
    },
    [reactFlow, onInit],
  );

  /**
   * Handle drop events for adding nodes
   */
  const handleOnDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current?.getBoundingClientRect() || null;
      editorStore.handleDrop(event, bounds);
      onDrop?.(event);
    },
    [reactFlowWrapper, onDrop],
  );

  /**
   * Handle drag over events to enable dropping
   */
  const handleOnDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      onDragOver?.(event);
    },
    [onDragOver],
  );

  /**
   * Handle keyboard events (delete key for removing nodes)
   */
  const handleOnKeyDown = useEventCallback((event: React.KeyboardEvent) => {
    // Delete selected nodes on Delete or Backspace (but not with meta key)
    if (
      (event.key === "Delete" || event.key === "Backspace") &&
      !event.metaKey
    ) {
      editorStore.deleteSelectedNodes();
    }

    // Could add more keyboard shortcuts here
    // e.g., Ctrl+Z for undo, Ctrl+Y for redo, etc.
  });

  /**
   * Handle node click events for selection
   */
  const handleOnNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Update selection in store when a node is clicked
      editorStore.selectNode(node.id);
      onNodeClick?.(event, node);
    },
    [onNodeClick],
  );

  /**
   * Handle pane click events (clicking on empty canvas)
   */
  const handleOnPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Deselect nodes when clicking on empty canvas
      editorStore.selectNode(null);
      onPaneClick?.(event);
    },
    [onPaneClick],
  );

  /**
   * Handle viewport move/zoom events
   */
  const handleOnMove = useCallback(
    (event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      editorStore.handleViewportChange(viewport);
      onMove?.(event, viewport);
    },
    [onMove],
  );

  return {
    handleOnInit,
    handleOnDrop,
    handleOnDragOver,
    handleOnKeyDown,
    handleOnNodeClick,
    handleOnPaneClick,
    handleOnMove,
  };
}

export type UseCanvasHandlersReturn = ReturnType<typeof useCanvasHandlers>;
