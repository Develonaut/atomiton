// Node execution types
export interface NodeExecuteRequest {
  id: string;
  nodeId: string;
  inputs: Record<string, unknown>;
  options?: {
    timeout?: number;
  };
}

export interface NodeExecuteResponse {
  id: string;
  success: boolean;
  outputs?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

export interface NodeProgress {
  id: string;
  nodeId: string;
  progress: number;
  message?: string;
}

// Storage types
export interface StorageRequest {
  key: string;
  value?: unknown;
}

export interface StorageResponse {
  success: boolean;
  value?: unknown;
  error?: string;
}

// Re-export from index
export * from "./channels";
