// Browser-safe IPC client wrapper
// This module provides IPC functionality when running in Electron
// and a mock implementation when running in browser

export type NodeProgress = {
  id: string;
  nodeId: string;
  progress: number;
  message: string;
};

export type NodeExecuteResponse = {
  id: string;
  success: boolean;
  outputs?: any;
  error?: string;
};

class IPCClient {
  private ipcAPI: any = null;

  constructor() {
    // Check if we're in Electron environment
    if (typeof window !== "undefined" && (window as any).atomitonIPC) {
      this.ipcAPI = (window as any).atomitonIPC;
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

  async executeNode(nodeId: string, inputs: any): Promise<NodeExecuteResponse> {
    if (!this.ipcAPI) {
      throw new Error("IPC not available - not running in Electron");
    }
    const request = {
      id: `node-${Date.now()}`,
      nodeId,
      inputs,
    };
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
