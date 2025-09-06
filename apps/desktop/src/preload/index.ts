import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

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
  // @ts-expect-error - window augmentation for non-isolated context
  window.electron = electronAPI;
  // @ts-expect-error - window augmentation for non-isolated context
  window.api = api;
}
