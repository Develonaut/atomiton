import { IPC } from "#shared/channels";
import type { RPCRequest, RPCResponse } from "#shared/types";
import { contextBridge, ipcRenderer } from "electron";

// Define the IPC API for pure transport
const ipcAPI = {
  // System
  ping: (): Promise<string> => ipcRenderer.invoke(IPC.PING),

  // Generic RPC call
  rpc: (request: RPCRequest): Promise<RPCResponse> =>
    ipcRenderer.invoke("rpc", request),
};

// Expose the API
export function exposeIPC() {
  if (process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld("atomitonIPC", ipcAPI);
      console.log("[IPC] API exposed to renderer");
    } catch (error) {
      console.error("[IPC] Failed to expose API:", error);
    }
  } else {
    (window as any).atomitonIPC = ipcAPI;
  }
}

// Type for global augmentation
export type AtomitonIPC = typeof ipcAPI;

// Global type augmentation
declare global {
  interface Window {
    atomitonIPC: AtomitonIPC;
  }
}
