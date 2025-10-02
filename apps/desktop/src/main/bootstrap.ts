import { createAppLifecycleManager } from "#main/app/lifecycle";
import { createConfigManager } from "#main/config";
import { createServiceRegistryManager } from "#main/registry/services";
import { createCSPManager } from "#main/security/csp";
import {
  checkChannelHealth,
  setupChannels,
  type ChannelManager,
} from "#main/services/channels";
import { createDevToolsManager } from "#main/window/devtools";
import { createWindowManager } from "#main/window/manager";
import { createLogger } from "@atomiton/logger/desktop";
import { optimizer } from "@electron-toolkit/utils";
import { app, ipcMain } from "electron";

const logger = createLogger({ scope: "BOOTSTRAP" });

export type DesktopAppBootstrap = {
  start(): Promise<void>;
};

export const createDesktopAppBootstrap = (): DesktopAppBootstrap => {
  logger.info("Desktop application starting up");

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
    // Channel health check handler
    ipcMain.handle("channels:health", async () => {
      return await checkChannelHealth();
    });

    // Debugging handler for channel status
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
      logger.info("App shutting down, disposing channels and services...");

      // Dispose service registry first (includes conductor reset)
      serviceRegistryManager.dispose();

      // Then dispose channel manager
      if (channelManager) {
        channelManager.dispose();
        channelManager = null;
      }
    });

    await appLifecycleManager.onReady(async () => {
      logger.info("Electron app ready, initializing desktop application");

      const config = configManager.getConfig();

      await serviceRegistryManager.initializeServices();

      cspManager.setupContentSecurityPolicy(config.app.isDev);

      setupElectronOptimizations();
      setupIPCHandlers();

      const mainWindow = windowManager.createMainWindow(config.window);

      // Initialize channels after window creation
      logger.info("Setting up functional channels...");
      channelManager = setupChannels(mainWindow);
      logger.info("Functional channels initialized successfully");

      if (config.app.isDev) {
        await devToolsManager.setupReduxDevTools(mainWindow);
      }
    });
  };

  return {
    start,
  };
};
