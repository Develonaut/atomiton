// Type definitions for the preload API

export type NodeExecutionPayload = {
  node?: {
    id?: string;
    type?: string;
  };
};

export type SystemHealthResponse = {
  status: string;
  timestamp: number;
};

export type NodeAPI = {
  run: (payload: NodeExecutionPayload) => Promise<unknown>;
};

export type SystemAPI = {
  health: () => Promise<SystemHealthResponse>;
};

export type AtomitonRPC = {
  node: NodeAPI;
  system: SystemAPI;
};
