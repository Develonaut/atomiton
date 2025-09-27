// Node execution types
export type SimpleNodeData = {
  id: string;
  type: string;
  config: Record<string, unknown>;
};

export type NodeExecuteRequestPayload = {
  nodeData: SimpleNodeData;
};

export type NodeExecuteRequest = {
  id: string;
  version: string;
  payload: NodeExecuteRequestPayload;
};

export type NodeExecuteResponse = {
  id: string;
  success: boolean;
  outputs?: Record<string, unknown>;
  error?: string;
  duration?: number;
};

export type NodeProgress = {
  id: string;
  nodeId: string;
  progress: number;
  message?: string;
};

// Storage types
export type StorageRequest = {
  key: string;
  value?: unknown;
};

export type StorageResponse = {
  success: boolean;
  value?: unknown;
  error?: string;
};

// Re-export from index
export * from "#shared/channels";
