import "@/preload/preload.d";
import { exposeIPC } from "@atomiton/ipc/preload";
import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";

// Expose electron API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
}

// Expose Atomiton IPC
exposeIPC();
