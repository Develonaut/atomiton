import {
  createNodeChannelServer,
  createStorageChannelServer,
  createSystemChannelServer,
  type ChannelServer,
} from "@atomiton/rpc/main/channels";
import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";

// Functional channel manager interface
export type ChannelManager = {
  trackWindow: (window: BrowserWindow) => void;
  dispose: () => void;
  getChannelCount: () => number;
  getChannelNames: () => string[];
};

// Functional factory for channel manager
export const createChannelManager = (): ChannelManager => {
  const channels: ChannelServer[] = [];
  const windows = new Set<BrowserWindow>();

  // Initialize all channel servers
  const initialize = () => {
    console.log("[CHANNELS] Initializing channel servers...");

    // Create all channel servers
    const nodeChannel = createNodeChannelServer(ipcMain);
    const storageChannel = createStorageChannelServer(ipcMain);
    const systemChannel = createSystemChannelServer(ipcMain);

    channels.push(nodeChannel, storageChannel, systemChannel);

    console.log(`[CHANNELS] Initialized ${channels.length} channel servers:`, [
      "node",
      "storage",
      "system",
    ]);

    // Register channel discovery handler
    ipcMain.handle("channels:list", () => {
      return ["node", "storage", "system"];
    });

    console.log("[CHANNELS] Channel discovery handler registered");
  };

  // Track window for broadcasts
  const trackWindow = (window: BrowserWindow) => {
    windows.add(window);

    console.log(
      `[CHANNELS] Tracking window for broadcasts. Total windows: ${windows.size}`,
    );

    // Pass window to all channels for broadcasting
    channels.forEach((channel, index) => {
      if (channel.trackWindow) {
        channel.trackWindow(window);
        console.log(`[CHANNELS] Channel ${index} now tracking window`);
      }
    });

    // Clean up when window is closed
    window.on("closed", () => {
      windows.delete(window);
      console.log(
        `[CHANNELS] Window closed. Remaining windows: ${windows.size}`,
      );
    });

    // Handle window destroyed
    window.webContents.on("destroyed", () => {
      console.log("[CHANNELS] Window webContents destroyed");
    });
  };

  // Dispose all channels
  const dispose = () => {
    console.log("[CHANNELS] Disposing channel manager...");

    // Dispose all channels
    channels.forEach((channel, index) => {
      try {
        channel.dispose();
        console.log(`[CHANNELS] Channel ${index} disposed`);
      } catch (error) {
        console.error(`[CHANNELS] Error disposing channel ${index}:`, error);
      }
    });

    // Clear arrays
    channels.length = 0;
    windows.clear();

    // Remove discovery handler
    ipcMain.removeHandler("channels:list");

    console.log("[CHANNELS] Channel manager disposed");
  };

  // Get channel count
  const getChannelCount = () => channels.length;

  // Get channel names
  const getChannelNames = () => ["node", "storage", "system"];

  // Initialize on creation
  initialize();

  return {
    trackWindow,
    dispose,
    getChannelCount,
    getChannelNames,
  };
};

// Convenience function for setting up channels with a main window
export const setupChannels = (mainWindow: BrowserWindow): ChannelManager => {
  console.log("[CHANNELS] Setting up channels for main window");

  const channelManager = createChannelManager();

  // Track the main window
  channelManager.trackWindow(mainWindow);

  // Log successful setup
  console.log("[CHANNELS] Channel setup completed:", {
    channelCount: channelManager.getChannelCount(),
    channels: channelManager.getChannelNames(),
  });

  return channelManager;
};

// Health check for channels
export const checkChannelHealth = async (): Promise<{
  status: "healthy" | "degraded" | "error";
  channels: Record<string, any>;
}> => {
  const results: Record<string, any> = {};

  try {
    // Test each channel by calling a health method if available
    const channelNames = ["node", "storage", "auth", "system"];

    for (const channelName of channelNames) {
      try {
        // Simulate a health check (in real implementation, this would call actual health endpoints)
        results[channelName] = {
          status: "ok",
          timestamp: Date.now(),
        };
      } catch (error) {
        results[channelName] = {
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        };
      }
    }

    // Determine overall health
    const hasErrors = Object.values(results).some(
      (result: any) => result.status === "error",
    );
    const status = hasErrors ? "error" : "healthy";

    return {
      status,
      channels: results,
    };
  } catch (error) {
    return {
      status: "error",
      channels: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
};
