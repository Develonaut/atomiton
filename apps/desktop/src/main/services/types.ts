import type { NodeDefinition } from "@atomiton/nodes/definitions";

export type ServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

export type ExecutionContext = Record<string, unknown>;

export type ExecutionResult = {
  id: string;
  success: boolean;
  outputs?: unknown;
  error?: string;
  duration?: number;
};

export type ProgressEvent = {
  executionId: string;
  progress: number;
  message: string;
};

export type StorageResult = {
  success: boolean;
  path?: string;
};

export type INodeService = {
  list(): Promise<ServiceResult<NodeDefinition[]>>;
  getChildren(parentId: string): Promise<ServiceResult<NodeDefinition[]>>;
  getByVersion(
    type: string,
    version: string,
  ): Promise<ServiceResult<NodeDefinition | undefined>>;
};

export type IExecutionService = {
  execute(
    executable: NodeDefinition,
    context?: ExecutionContext,
  ): Promise<ServiceResult<ExecutionResult>>;
  onProgress(callback: (event: ProgressEvent) => void): () => void;
};

export type IStorageService = {
  save(node: NodeDefinition): Promise<ServiceResult<StorageResult>>;
  load(id: string): Promise<ServiceResult<NodeDefinition>>;
  list(): Promise<ServiceResult<string[]>>;
};
