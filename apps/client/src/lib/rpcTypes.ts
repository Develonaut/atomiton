// Type definitions from RPC package
// This is a workaround for TypeScript resolution issues
import type { AppRouter as TRPCRouter } from "../../../../packages/@atomiton/rpc/src/trpc/router";
import type {
  Flow as FlowType,
  StorageItem as StorageItemType,
  ExecutionContext as ExecutionContextType,
  ExecutionResult as ExecutionResultType,
  Connection as ConnectionType,
  FlowNode as FlowNodeType,
  NodeDefinition as NodeDefinitionType
} from "../../../../packages/@atomiton/rpc/src/schemas";

export type AppRouter = TRPCRouter;
export type Flow = FlowType;
export type StorageItem = StorageItemType;
export type ExecutionContext = ExecutionContextType;
export type ExecutionResult = ExecutionResultType;
export type Connection = ConnectionType;
export type FlowNode = FlowNodeType;
export type NodeDefinition = NodeDefinitionType;
