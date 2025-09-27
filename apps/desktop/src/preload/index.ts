import "@/preload/preload.d";
import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

console.log("[PRELOAD] Starting preload script");
console.log("[PRELOAD] contextIsolated:", process.contextIsolated);

// IPC Channel constants (inline from @atomiton/ipc)
const IPC = {
  EXECUTE_NODE: "node:execute",
  NODE_PROGRESS: "node:progress",
  NODE_COMPLETE: "node:complete",
  NODE_ERROR: "node:error",
  STORAGE_GET: "storage:get",
  STORAGE_SET: "storage:set",
  STORAGE_DELETE: "storage:delete",
  PING: "system:ping",
} as const;

// Type definitions for IPC
type SimpleNodeData = {
  id: string;
  type: string;
  config: Record<string, unknown>;
};

type NodeExecuteRequestPayload = {
  nodeData: SimpleNodeData;
};

type NodeExecuteRequest = {
  id: string;
  version: string;
  payload: NodeExecuteRequestPayload;
};

type IPCRequest = Record<string, unknown>;
type IPCResponse = unknown;
type IPCProgress = Record<string, unknown>;
type IPCError = {
  message: string;
  code?: string;
  [key: string]: unknown;
};

// Define the IPC API
const atomitonIPC = {
  // System
  ping: (): Promise<string> => ipcRenderer.invoke(IPC.PING),

  // Node execution
  executeNode: (request: NodeExecuteRequest): Promise<IPCResponse> =>
    ipcRenderer.invoke(IPC.EXECUTE_NODE, request),

  // Storage
  storageGet: (request: IPCRequest): Promise<IPCResponse> =>
    ipcRenderer.invoke(IPC.STORAGE_GET, request),

  storageSet: (request: IPCRequest): Promise<IPCResponse> =>
    ipcRenderer.invoke(IPC.STORAGE_SET, request),

  // Event listeners with cleanup
  onNodeProgress: (callback: (progress: IPCProgress) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      progress: IPCProgress,
    ) => callback(progress);
    ipcRenderer.on(IPC.NODE_PROGRESS, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_PROGRESS, listener);
    };
  },

  onNodeComplete: (callback: (response: IPCResponse) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      response: IPCResponse,
    ) => callback(response);
    ipcRenderer.on(IPC.NODE_COMPLETE, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_COMPLETE, listener);
    };
  },

  onNodeError: (callback: (response: IPCError) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, response: IPCError) =>
      callback(response);
    ipcRenderer.on(IPC.NODE_ERROR, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_ERROR, listener);
    };
  },
};

// Expose electron API
if (process.contextIsolated) {
  try {
    console.log("[PRELOAD] Exposing electron API via contextBridge");
    contextBridge.exposeInMainWorld("electron", electronAPI);
    console.log("[PRELOAD] Electron API exposed successfully");

    // Expose Atomiton IPC
    console.log("[PRELOAD] Exposing atomiton IPC API via contextBridge");
    contextBridge.exposeInMainWorld("atomitonIPC", atomitonIPC);
    console.log("[PRELOAD] Atomiton IPC API exposed successfully");
  } catch (error) {
    console.error("[PRELOAD] Failed to expose APIs:", error);
  }
} else {
  console.log(
    "[PRELOAD] Context isolation disabled, setting APIs directly on window",
  );
  window.electron = electronAPI;
  (
    window as unknown as Window & { atomitonIPC: typeof atomitonIPC }
  ).atomitonIPC = atomitonIPC;
}

console.log("[PRELOAD] Preload script completed");
