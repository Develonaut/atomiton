import { createAppLifecycleManager } from "#main/app/lifecycle";
import { createConfigManager } from "#main/config";
import { createServiceRegistryManager } from "#main/registry/services";
import { createCSPManager } from "#main/security/csp";
import { createDevToolsManager } from "#main/window/devtools";
import { createWindowManager } from "#main/window/manager";
import { optimizer } from "@electron-toolkit/utils";
import { app, ipcMain } from "electron";

export type DesktopAppBootstrap = {
  start(): Promise<void>;
};

export const createDesktopAppBootstrap = (): DesktopAppBootstrap => {
  console.log("Desktop application starting up");

  const configManager = createConfigManager();
  const config = configManager.getConfig();

  const appLifecycleManager = createAppLifecycleManager(config.app);
  const serviceRegistryManager = createServiceRegistryManager();
  const windowManager = createWindowManager();
  const cspManager = createCSPManager();
  const devToolsManager = createDevToolsManager();

  const setupElectronOptimizations = (): void => {
    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });
  };

  const setupIPCHandlers = (): void => {
    ipcMain.on("ping", () => {
      // Ping handler for testing IPC communication
    });
  };

  const start = async (): Promise<void> => {
    appLifecycleManager.initialize();

    await appLifecycleManager.onReady(async () => {
      console.log("Electron app ready, initializing desktop application");

      const config = configManager.getConfig();

      await serviceRegistryManager.initializeServices();

      cspManager.setupContentSecurityPolicy(config.app.isDev);

      setupElectronOptimizations();
      setupIPCHandlers();

      const mainWindow = windowManager.createMainWindow(config.window);

      if (config.app.isDev) {
        await devToolsManager.setupReduxDevTools(mainWindow);
      }
    });
  };

  return {
    start,
  };
};
