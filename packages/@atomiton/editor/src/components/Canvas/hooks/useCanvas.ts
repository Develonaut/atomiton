import { useRef } from "react";
import type { CanvasProps } from "../Canvas.types";
import { useReactFlow } from "./useReactFlow";
import type { ReactFlowAdapter } from "./useReactFlow";

export interface UseCanvasOptions
  extends Pick<
    CanvasProps,
    | "nodes"
    | "edges"
    | "onNodesChange"
    | "onEdgesChange"
    | "onConnect"
    | "onDrop"
    | "onDragOver"
  > {}

export interface UseCanvasReturn {
  reactFlowWrapper: React.RefObject<HTMLDivElement | null>;
  reactFlow: ReactFlowAdapter;
}

/**
 * Optional high-level orchestrator hook for Canvas functionality
 *
 * This hook is a convenience wrapper around useReactFlow for cases where
 * you need additional functionality beyond the basic ReactFlow adapter.
 *
 * Most components should use useReactFlow directly. Use this when:
 * - You need to compose multiple Canvas-related hooks
 * - You're building complex canvas interactions
 * - You need additional state management on top of ReactFlow
 */
export function useCanvas({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
}: UseCanvasOptions): UseCanvasReturn {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Use the complete ReactFlow adapter that includes everything
  const reactFlow = useReactFlow({
    nodes: initialNodes,
    edges: initialEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
  });

  return {
    reactFlowWrapper,
    reactFlow,
  };
}
