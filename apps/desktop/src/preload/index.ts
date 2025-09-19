import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";
import "./preload.d";

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
}
