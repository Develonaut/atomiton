import { createAppLifecycleManager } from "#main/app/lifecycle";
import { createConfigManager } from "#main/config";
import { createServiceRegistryManager } from "#main/registry/services";
import { createCSPManager } from "#main/security/csp";
import { createDevToolsManager } from "#main/window/devtools";
import { createWindowManager } from "#main/window/manager";
import {
  setupChannels,
  checkChannelHealth,
  type ChannelManager,
} from "#main/services/channels";
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

  // Channel manager will be initialized after window creation
  let channelManager: ChannelManager | null = null;

  const setupElectronOptimizations = (): void => {
    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });
  };

  const setupIPCHandlers = (): void => {
    ipcMain.on("ping", () => {
      // Ping handler for testing IPC communication
    });

    // Add channel health check handler
    ipcMain.handle("channels:health", async () => {
      return await checkChannelHealth();
    });

    // Add debugging handler for channel status
    ipcMain.handle("channels:status", () => {
      return {
        initialized: channelManager !== null,
        channelCount: channelManager?.getChannelCount() || 0,
        channels: channelManager?.getChannelNames() || [],
      };
    });
  };

  const start = async (): Promise<void> => {
    appLifecycleManager.initialize();

    // Setup cleanup on app quit
    app.on("before-quit", () => {
      console.log("App shutting down, disposing channels...");
      if (channelManager) {
        channelManager.dispose();
        channelManager = null;
      }
    });

    await appLifecycleManager.onReady(async () => {
      console.log("Electron app ready, initializing desktop application");

      const config = configManager.getConfig();

      await serviceRegistryManager.initializeServices();

      cspManager.setupContentSecurityPolicy(config.app.isDev);

      setupElectronOptimizations();
      setupIPCHandlers();

      const mainWindow = windowManager.createMainWindow(config.window);

      // Initialize channels after window creation
      console.log("Setting up functional channels...");
      channelManager = setupChannels(mainWindow);
      console.log("Functional channels initialized successfully");

      if (config.app.isDev) {
        await devToolsManager.setupReduxDevTools(mainWindow);
      }
    });
  };

  return {
    start,
  };
};
