import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import "./preload.d";

const api = {
  // Add any custom API methods here
};

// Extended electron API with conductor IPC support
const extendedElectronAPI = {
  ...electronAPI,
  ipcRenderer: {
    send: (channel: string, data: unknown) => {
      const validChannels = ["conductor:execute"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel: string, func: (...args: unknown[]) => void) => {
      const validChannels = ["conductor:result", "conductor:error"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel: string) => {
      const validChannels = ["conductor:result", "conductor:error"];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    },
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", extendedElectronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = extendedElectronAPI;
  window.api = api;
}
