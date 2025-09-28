// Type definitions - importing from proper packages
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type {
  ExecutionContext,
  ExecutionResult,
} from "@atomiton/conductor/browser";

// TODO: Replace with proper imports when TRPC router is properly exported
import type { AppRouter as TRPCRouter } from "../../../../packages/@atomiton/rpc/src/trpc/router";

export type AppRouter = TRPCRouter;

// Flow is just what users call a NodeDefinition with child nodes
export type Flow = NodeDefinition;
export type FlowNode = NodeDefinition;
export type NodeDefinition = NodeDefinition;

// Execution types come from conductor
export type ExecutionContext = ExecutionContext;
export type ExecutionResult = ExecutionResult;

// TODO: Define these types properly or import from correct location
export type Connection = {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

export type StorageItem = {
  id: string;
  name: string;
  type: string;
  data: unknown;
};
