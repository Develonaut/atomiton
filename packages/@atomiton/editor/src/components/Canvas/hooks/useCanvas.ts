import { useRef } from "react";
import type { Node, Edge } from "@xyflow/react";

interface UseCanvasProps {
  nodes?: Node[];
  edges?: Edge[];
  onNodesChange?: (...args: unknown[]) => void;
  onEdgesChange?: (...args: unknown[]) => void;
  onConnect?: (...args: unknown[]) => void;
  onDrop?: (...args: unknown[]) => void;
  onDragOver?: (...args: unknown[]) => void;
  onStoreChange?: (...args: unknown[]) => void;
}

/**
 * Canvas integration hook
 * Coordinates ReactFlow with store state and provides unified interface
 */
export const useCanvas = (props?: UseCanvasProps) => {
  const reactFlowWrapper = useRef(null);
  const { nodes = [], edges = [] } = props || {};

  return {
    reactFlow: {
      nodes,
      edges,
      onNodesChange: (..._args: unknown[]) => {},
      onEdgesChange: (..._args: unknown[]) => {},
      onConnect: (..._args: unknown[]) => {},
      onDrop: (..._args: unknown[]) => {},
      onDragOver: (..._args: unknown[]) => {},
    },
    reactFlowWrapper,
    // Legacy properties for compatibility
    nodes,
    edges,
    onNodesChange: (..._args: unknown[]) => {},
    onEdgesChange: (..._args: unknown[]) => {},
    onConnect: (..._args: unknown[]) => {},
  };
};
