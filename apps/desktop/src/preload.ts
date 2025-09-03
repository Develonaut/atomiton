import { contextBridge, ipcRenderer } from "electron";
import type { OpenDialogOptions } from "electron";

// Expose only essential desktop APIs to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // File system dialogs - core desktop functionality
  dialog: {
    openFile: (options?: OpenDialogOptions) =>
      ipcRenderer.invoke("dialog:openFile", options),
    openDirectory: (options?: OpenDialogOptions) =>
      ipcRenderer.invoke("dialog:openDirectory", options),
  },

  // System information
  system: {
    getInfo: () => ipcRenderer.invoke("system:info"),
  },

  // Shell operations
  shell: {
    openExternal: (url: string) =>
      ipcRenderer.invoke("shell:openExternal", url),
    showItemInFolder: (path: string) =>
      ipcRenderer.invoke("shell:showItemInFolder", path),
  },
});
