import { safeLog } from "#main/utils/safeLogging";
import type {
  ConductorExecutionContext,
  ExecutionResult,
} from "@atomiton/conductor/desktop";
import { createConductor } from "@atomiton/conductor/desktop";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
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
  const windowListeners = new Map<BrowserWindow, (() => void)[]>();
  let isDisposed = false;

  // Initialize all channel servers
  const initialize = () => {
    safeLog("[CHANNELS] Initializing channel servers...");

    // Create conductor instance ONCE for all channels
    // This is the ONLY place conductor is created for IPC
    const conductor = createConductor();
    safeLog("[CHANNELS] Conductor instance created for channel servers");

    // Create node channel with direct method references and type parameters
    const nodeChannel = createNodeChannelServer<
      NodeDefinition,
      ConductorExecutionContext,
      ExecutionResult
    >(ipcMain, {
      execute: conductor.node.run,
    });

    const systemChannel = createSystemChannelServer(ipcMain);

    const storageChannel = createStorageChannelServer(ipcMain);

    channels.push(nodeChannel, systemChannel, storageChannel);

    safeLog(`[CHANNELS] Initialized ${channels.length} channel servers:`, [
      "node",
      "system",
      "storage",
    ]);

    // Register channel discovery handler
    ipcMain.handle("channels:list", () => {
      return ["node", "storage", "system"];
    });

    safeLog("[CHANNELS] Channel discovery handler registered");
  };

  // Track window for broadcasts
  const trackWindow = (window: BrowserWindow) => {
    if (isDisposed) return;

    windows.add(window);

    safeLog(
      `[CHANNELS] Tracking window for broadcasts. Total windows: ${windows.size}`,
    );

    // Pass window to all channels for broadcasting
    channels.forEach((channel, index) => {
      if (channel.trackWindow) {
        channel.trackWindow(window);
        safeLog(`[CHANNELS] Channel ${index} now tracking window`);
      }
    });

    // Create event handlers that can be removed later
    const onClosed = () => {
      windows.delete(window);
      windowListeners.delete(window);
      safeLog(`[CHANNELS] Window closed. Remaining windows: ${windows.size}`);
    };

    const onDestroyed = () => {
      safeLog("[CHANNELS] Window webContents destroyed");
    };

    // Store listener references for cleanup
    windowListeners.set(window, [onClosed, onDestroyed]);

    // Add event listeners
    window.on("closed", onClosed);
    window.webContents.on("destroyed", onDestroyed);
  };

  // Dispose all channels
  const dispose = () => {
    if (isDisposed) return;

    console.log("[CHANNELS] Disposing channel manager...");

    // Mark as disposed first to prevent further logging
    isDisposed = true;

    // Remove all window event listeners
    for (const [window, listeners] of windowListeners) {
      try {
        window.removeListener("closed", listeners[0]);
        window.webContents.removeListener("destroyed", listeners[1]);
      } catch {
        // Ignore errors when removing listeners during shutdown
      }
    }

    // Dispose all channels
    channels.forEach((channel, index) => {
      try {
        channel.dispose();
        console.log(`[CHANNELS] Channel ${index} disposed`);
      } catch (error) {
        console.error(`[CHANNELS] Error disposing channel ${index}:`, error);
      }
    });

    // Clear arrays and maps
    channels.length = 0;
    windows.clear();
    windowListeners.clear();

    // Remove discovery handler
    try {
      ipcMain.removeHandler("channels:list");
    } catch {
      // Ignore errors when removing handlers during shutdown
    }

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
  channels: Record<string, unknown>;
}> => {
  const results: Record<string, unknown> = {};

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
      (result: unknown) => (result as { status: string }).status === "error",
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
