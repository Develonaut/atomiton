// Type definitions - importing from proper packages
import type {
  ConductorExecutionContext as ExecutionContext,
  ExecutionResult,
} from "@atomiton/conductor/browser";
import type { NodeDefinition, NodeEdge } from "@atomiton/nodes/definitions";

// Re-export for convenience
export type { ExecutionContext, ExecutionResult, NodeDefinition };

// Flow is just what users call a NodeDefinition with child nodes
export type Flow = NodeDefinition;
export type FlowNode = NodeDefinition;

// TODO: Define these types properly or import from correct location
export type Connection = NodeEdge;

export type StorageItem = {
  id: string;
  name: string;
  type: string;
  data: unknown;
};
