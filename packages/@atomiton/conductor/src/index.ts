/**
 * @atomiton/conductor
 *
 * Blueprint and node execution orchestrator for Atomiton
 */

// Re-export storage functionality from @atomiton/storage
export {
  FilesystemStorage,
  BlueprintSerializer,
  SerializationError,
  StorageError,
  type IStorageEngine,
  type IBlueprintSerializer,
  type BlueprintDefinition,
  type StorageItem,
} from "@atomiton/storage";

// Execution engine types (to be implemented)
export type IExecutionEngine = {
  execute(blueprintId: string, input?: unknown): Promise<ExecutionResult>;
  pause(executionId: string): Promise<void>;
  resume(executionId: string): Promise<void>;
  cancel(executionId: string): Promise<void>;
};

export type ExecutionResult = {
  success: boolean;
  outputs?: Record<string, unknown>;
  error?: string;
  metrics?: {
    executionTime: number;
    memoryUsed?: number;
  };
};

// TODO: Implement core orchestration classes
// export { ExecutionEngine } from './engine/ExecutionEngine';
// export { BlueprintRunner } from './execution/BlueprintRunner';
// export { NodeExecutor } from './execution/NodeExecutor';
// export { ConductorIPC } from './ipc/ConductorIPC';
