import { IPC } from "#shared/channels";
import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "#shared/types";
import { contextBridge, ipcRenderer } from "electron";

// Define the IPC API
const ipcAPI = {
  // System
  ping: (): Promise<string> => ipcRenderer.invoke(IPC.PING),

  // Node execution
  executeNode: (request: NodeExecuteRequest): Promise<NodeExecuteResponse> =>
    ipcRenderer.invoke(IPC.EXECUTE_NODE, request),

  // Storage
  storageGet: (request: StorageRequest): Promise<StorageResponse> =>
    ipcRenderer.invoke(IPC.STORAGE_GET, request),

  storageSet: (request: StorageRequest): Promise<StorageResponse> =>
    ipcRenderer.invoke(IPC.STORAGE_SET, request),

  // Event listeners with cleanup
  onNodeProgress: (callback: (progress: NodeProgress) => void) => {
    const listener = (_event: any, progress: NodeProgress) =>
      callback(progress);
    ipcRenderer.on(IPC.NODE_PROGRESS, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_PROGRESS, listener);
    };
  },

  onNodeComplete: (callback: (response: NodeExecuteResponse) => void) => {
    const listener = (_event: any, response: NodeExecuteResponse) =>
      callback(response);
    ipcRenderer.on(IPC.NODE_COMPLETE, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_COMPLETE, listener);
    };
  },

  onNodeError: (callback: (response: NodeExecuteResponse) => void) => {
    const listener = (_event: any, response: NodeExecuteResponse) =>
      callback(response);
    ipcRenderer.on(IPC.NODE_ERROR, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_ERROR, listener);
    };
  },
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
