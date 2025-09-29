import "#preload/preload.d";
import { contextBridge, ipcRenderer } from "electron";

console.log("[PRELOAD] Starting minimal channel bridge");
console.log("[PRELOAD] contextIsolated:", process.contextIsolated);

// Minimal channel bridge - under 50 lines as specified
const createChannelBridge = () => {
  return {
    // Generic channel call method
    call: async (channel: string, command: string, args?: unknown) => {
      const fullMethod = `${channel}:${command}`;
      console.log("[PRELOAD:CALL]", fullMethod, args);
      return await ipcRenderer.invoke(fullMethod, args);
    },

    // Generic channel listen method
    listen: (
      channel: string,
      event: string,
      callback: (data: unknown) => void,
    ) => {
      const fullEvent = `${channel}:event:${event}`;
      console.log("[PRELOAD:LISTEN]", fullEvent);

      const handler = (_: Electron.IpcRendererEvent, data: unknown) => {
        callback(data);
      };

      ipcRenderer.on(fullEvent, handler);

      // Return unsubscribe function
      return () => {
        ipcRenderer.removeListener(fullEvent, handler);
      };
    },

    // Generic channel send method (fire and forget)
    send: (channel: string, event: string, data?: unknown) => {
      const fullEvent = `${channel}:${event}`;
      console.log("[PRELOAD:SEND]", fullEvent, data);
      ipcRenderer.send(fullEvent, data);
    },
  };
};

// Expose minimal bridge interface
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("atomitonBridge", createChannelBridge());
} else {
  (globalThis as any).atomitonBridge = createChannelBridge();
}

console.log("[PRELOAD] Minimal channel bridge completed");
