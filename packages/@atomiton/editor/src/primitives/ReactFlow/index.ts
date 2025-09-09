/**
 * ReactFlow Primitives
 *
 * Pure UI primitives that wrap ReactFlow components with no business logic.
 * These can be easily swapped out or upgraded without affecting editor logic.
 */

export { ReactFlowProvider } from "./ReactFlowProvider";
export { ReactFlowCanvas } from "./ReactFlowCanvas";

// Re-export ReactFlow types for convenience
export type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowInstance,
  NodeTypes,
  Connection,
} from "@xyflow/react";
