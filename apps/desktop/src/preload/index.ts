import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import "./preload.d";

const api = {
  // Add any custom API methods here
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
