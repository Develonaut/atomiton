import { generateId } from "@atomiton/utils";

// Browser-safe IPC client wrapper
// This module provides IPC functionality when running in Electron
// and a mock implementation when running in browser

export type NodeProgress = {
  id: string;
  nodeId: string;
  progress: number;
  message: string;
};

type SimpleNodeData = {
  id: string;
  type: string;
  config: Record<string, unknown>;
};

type NodeExecuteRequestPayload = {
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
  outputs?: unknown;
  error?: string;
};

type AtomitonIPC = {
  ping: () => Promise<string>;
  executeNode: (request: NodeExecuteRequest) => Promise<NodeExecuteResponse>;
  onNodeProgress: (callback: (progress: NodeProgress) => void) => () => void;
  onNodeComplete: (
    callback: (response: NodeExecuteResponse) => void,
  ) => () => void;
  onNodeError: (
    callback: (response: NodeExecuteResponse) => void,
  ) => () => void;
};

class IPCClient {
  private ipcAPI: AtomitonIPC | null = null;

  constructor() {
    // Check if we're in Electron environment
    if (
      typeof window !== "undefined" &&
      (window as Window & { atomitonIPC?: AtomitonIPC }).atomitonIPC
    ) {
      this.ipcAPI = (
        window as Window & { atomitonIPC?: AtomitonIPC }
      ).atomitonIPC!;
    }
  }

  isAvailable(): boolean {
    return this.ipcAPI !== null;
  }

  async ping(): Promise<string> {
    if (!this.ipcAPI) {
      throw new Error("IPC not available - not running in Electron");
    }
    return this.ipcAPI.ping();
  }

  createExecuteFlowRequest(
    payload: NodeExecuteRequestPayload,
  ): NodeExecuteRequest {
    return {
      id: generateId("request"),
      version: "1",
      payload,
    };
  }

  async executeNode(nodeData: SimpleNodeData): Promise<NodeExecuteResponse> {
    if (!this.ipcAPI) {
      throw new Error("IPC not available - not running in Electron");
    }
    const request = this.createExecuteFlowRequest({ nodeData });
    return this.ipcAPI.executeNode(request);
  }

  onProgress(callback: (progress: NodeProgress) => void): () => void {
    if (!this.ipcAPI) {
      // Return a no-op unsubscribe function
      return () => {};
    }
    return this.ipcAPI.onNodeProgress(callback);
  }

  onComplete(callback: (response: NodeExecuteResponse) => void): () => void {
    if (!this.ipcAPI) {
      return () => {};
    }
    return this.ipcAPI.onNodeComplete(callback);
  }

  onError(callback: (response: NodeExecuteResponse) => void): () => void {
    if (!this.ipcAPI) {
      return () => {};
    }
    return this.ipcAPI.onNodeError(callback);
  }
}

// Export a singleton instance
export const ipc = new IPCClient();
