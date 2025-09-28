import "@/preload/preload.d";
import { contextBridge, ipcRenderer } from "electron";

console.log("[PRELOAD] Starting conductor preload script");
console.log("[PRELOAD] contextIsolated:", process.contextIsolated);

/**
 * IPC Channel definitions - must match what's in conductor package
 */
const CONDUCTOR_CHANNELS = {
  NODE_RUN: "conductor:node:run",
  SYSTEM_HEALTH: "conductor:system:health",
} as const;

/**
 * Create the atomitonRPC API for the renderer process
 */
const atomitonRPC = {
  node: {
    run: (payload: any) => {
      console.log("[PRELOAD:IPC] Node.run invoked", {
        nodeId: payload.node?.id,
        nodeType: payload.node?.type,
      });
      return ipcRenderer.invoke(CONDUCTOR_CHANNELS.NODE_RUN, payload);
    },
  },
  system: {
    health: () => {
      console.log("[PRELOAD:IPC] System.health invoked");
      return ipcRenderer.invoke(CONDUCTOR_CHANNELS.SYSTEM_HEALTH);
    },
  },
};

if (process.contextIsolated) {
  try {
    console.log("[PRELOAD] Exposing atomitonRPC API via contextBridge");
    contextBridge.exposeInMainWorld("atomitonRPC", atomitonRPC);
    console.log("[PRELOAD] atomitonRPC API exposed successfully");
  } catch (error) {
    console.error("[PRELOAD] Failed to expose atomitonRPC:", error);
  }
} else {
  console.log(
    "[PRELOAD] Context isolation disabled, setting atomitonRPC on window",
  );
  (window as any).atomitonRPC = atomitonRPC;
}

console.log("[PRELOAD] Conductor preload script completed");
