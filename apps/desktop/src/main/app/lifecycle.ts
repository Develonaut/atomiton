import { app, BrowserWindow } from "electron";
import { electronApp } from "@electron-toolkit/utils";

export type AppConfig = {
  name: string;
  userModelId: string;
  isDev: boolean;
};

export type AppLifecycleManager = {
  initialize: () => void;
  onReady: (callback: () => void | Promise<void>) => Promise<void>;
};

export function createAppLifecycleManager(
  config: AppConfig,
): AppLifecycleManager {
  let createWindowCallback: (() => void | Promise<void>) | undefined;

  const ensureSingleInstance = (): void => {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
      return;
    }

    app.on("second-instance", () => {
      const windows = BrowserWindow.getAllWindows();
      const mainWindow = windows[0];

      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });
  };

  const configureApp = (): void => {
    app.setName(config.name);
  };

  const setupEventHandlers = (): void => {
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindowCallback?.();
      }
    });
  };

  const initialize = (): void => {
    ensureSingleInstance();
    configureApp();
    setupEventHandlers();
  };

  const onReady = async (
    callback: () => void | Promise<void>,
  ): Promise<void> => {
    createWindowCallback = callback;

    await app.whenReady();
    electronApp.setAppUserModelId(config.userModelId);
    await callback();
  };

  return {
    initialize,
    onReady,
  };
}
