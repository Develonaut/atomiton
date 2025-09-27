import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  SimpleNodeData,
} from "#shared/types";

/**
 * Client-side IPC wrapper
 * Provides a clean API for the renderer process to communicate with main
 */
class IPCClient {
  private get api() {
    if (typeof window !== "undefined" && window.atomitonIPC) {
      return window.atomitonIPC;
    }
    return null;
  }

  /**
   * Check if IPC is available (running in Electron)
   */
  isAvailable(): boolean {
    return this.api !== null;
  }

  /**
   * Test IPC connection
   */
  async ping(): Promise<string> {
    if (!this.api)
      throw new Error("IPC not available - not running in Electron");
    return await this.api.ping();
  }

  /**
   * Execute a node
   */
  async executeNode(nodeData: SimpleNodeData): Promise<NodeExecuteResponse> {
    if (!this.api) throw new Error("IPC not available");

    const request: NodeExecuteRequest = {
      id: crypto.randomUUID(),
      version: "1",
      payload: {
        nodeData,
      },
    };

    return await this.api.executeNode(request);
  }

  /**
   * Storage operations
   */
  async storageGet(key: string): Promise<unknown> {
    if (!this.api) throw new Error("IPC not available");
    const response = await this.api.storageGet({ key });
    if (!response.success) throw new Error(response.error);
    return response.value;
  }

  async storageSet(key: string, value: unknown): Promise<void> {
    if (!this.api) throw new Error("IPC not available");
    const response = await this.api.storageSet({ key, value });
    if (!response.success) throw new Error(response.error);
  }

  /**
   * Event subscriptions
   */
  onProgress(callback: (progress: NodeProgress) => void): () => void {
    if (!this.api) return () => {};
    return this.api.onNodeProgress(callback);
  }

  onComplete(callback: (response: NodeExecuteResponse) => void): () => void {
    if (!this.api) return () => {};
    return this.api.onNodeComplete(callback);
  }

  onError(callback: (response: NodeExecuteResponse) => void): () => void {
    if (!this.api) return () => {};
    return this.api.onNodeError(callback);
  }
}

// Export singleton instance
export const ipc = new IPCClient();

// Re-export types
export type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";
