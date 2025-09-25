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

// Define the IPC API
const atomitonIPC = {
  // System
  ping: (): Promise<string> => ipcRenderer.invoke(IPC.PING),

  // Node execution
  executeNode: (request: any): Promise<any> =>
    ipcRenderer.invoke(IPC.EXECUTE_NODE, request),

  // Storage
  storageGet: (request: any): Promise<any> =>
    ipcRenderer.invoke(IPC.STORAGE_GET, request),

  storageSet: (request: any): Promise<any> =>
    ipcRenderer.invoke(IPC.STORAGE_SET, request),

  // Event listeners with cleanup
  onNodeProgress: (callback: (progress: any) => void) => {
    const listener = (_event: any, progress: any) => callback(progress);
    ipcRenderer.on(IPC.NODE_PROGRESS, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_PROGRESS, listener);
    };
  },

  onNodeComplete: (callback: (response: any) => void) => {
    const listener = (_event: any, response: any) => callback(response);
    ipcRenderer.on(IPC.NODE_COMPLETE, listener);
    return () => {
      ipcRenderer.removeListener(IPC.NODE_COMPLETE, listener);
    };
  },

  onNodeError: (callback: (response: any) => void) => {
    const listener = (_event: any, response: any) => callback(response);
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
  (window as any).atomitonIPC = atomitonIPC;
}

console.log("[PRELOAD] Preload script completed");
