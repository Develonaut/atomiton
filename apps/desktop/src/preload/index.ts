import "#preload/preload.d";
import { contextBridge, ipcRenderer } from "electron";

console.log("[PRELOAD] Starting minimal channel bridge");
console.log("[PRELOAD] contextIsolated:", process.contextIsolated);

const createChannelBridge = () => {
  return {
    call: async (channel: string, command: string, args?: unknown) => {
      const fullMethod = `${channel}:call`;
      console.log("[PRELOAD:CALL]", fullMethod, command, args);
      return await ipcRenderer.invoke(fullMethod, command, args);
    },

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

      return () => {
        ipcRenderer.removeListener(fullEvent, handler);
      };
    },

    send: (channel: string, event: string, data?: unknown) => {
      const fullEvent = `${channel}:${event}`;
      console.log("[PRELOAD:SEND]", fullEvent, data);
      ipcRenderer.send(fullEvent, data);
    },
  };
};

const bridge = createChannelBridge();

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("atomiton", {
    __bridge__: bridge,
  });
} else {
  (globalThis as { atomiton?: { __bridge__: unknown } }).atomiton = {
    __bridge__: bridge,
  };
}

console.log(
  "[PRELOAD] Minimal channel bridge exposed at window.atomiton.__bridge__",
);
