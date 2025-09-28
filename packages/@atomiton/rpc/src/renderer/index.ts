import type { RPCRequest, RPCResponse } from "#shared/types";

/**
 * Client-side IPC wrapper for pure transport
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
   * Generic RPC call - pure transport
   */
  async rpc(method: string, params: any = {}): Promise<any> {
    if (!this.api) throw new Error("IPC not available");

    const request: RPCRequest = {
      id: crypto.randomUUID(),
      method,
      params,
    };

    const response: RPCResponse = await this.api.rpc(request);

    if (response.error) {
      throw new Error(
        `RPC Error ${response.error.code}: ${response.error.message}`,
      );
    }

    return response.result;
  }
}

// Export singleton instance
export const ipc = new IPCClient();

// Re-export pure transport types
export type { RPCRequest, RPCResponse, RPCError } from "../shared/types";
