import * as os from "os";

import type { IpcMain, BrowserWindow, OpenDialogOptions } from "electron";
import { dialog, shell } from "electron";

export function setupIpcHandlers(ipcMain: IpcMain, mainWindow: BrowserWindow) {
  // File and directory dialogs - core desktop functionality
  ipcMain.handle(
    "dialog:openFile",
    async (event, options: OpenDialogOptions) => {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"],
        ...options,
      });
      return result.canceled ? null : result.filePaths[0];
    },
  );

  ipcMain.handle(
    "dialog:openDirectory",
    async (event, options: OpenDialogOptions) => {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
        ...options,
      });
      return result.canceled ? null : result.filePaths[0];
    },
  );

  // System information - core desktop functionality
  ipcMain.handle("system:info", async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpus: os.cpus().length,
    };
  });

  // Shell operations - core desktop functionality
  ipcMain.handle("shell:openExternal", async (event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle("shell:showItemInFolder", async (event, filePath: string) => {
    return shell.showItemInFolder(filePath);
  });
}
