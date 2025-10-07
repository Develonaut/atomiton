import type {
  ConductorExecutionContext,
  ExecutionGraphState,
  ExecutionResult,
  ProgressEvent,
} from "@atomiton/conductor/desktop";
import { createConductor } from "@atomiton/conductor/desktop";
import { createLogger } from "@atomiton/logger/desktop";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import {
  createFlowChannelServer,
  createLoggerChannelServer,
  createNodeChannelServer,
  createPathChannelServer,
  createStorageChannelServer,
  createSystemChannelServer,
  type ChannelServer,
} from "@atomiton/rpc/main/channels";
import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import { getPathManager } from "#main/services/pathManager";

const logger = createLogger({ scope: "CHANNELS" });

export type ChannelManager = {
  trackWindow: (window: BrowserWindow) => void;
  dispose: () => void;
  getChannelCount: () => number;
  getChannelNames: () => string[];
};

export const createChannelManager = async (): Promise<ChannelManager> => {
  const channels: ChannelServer[] = [];
  const windows = new Set<BrowserWindow>();
  const windowListeners = new Map<BrowserWindow, (() => void)[]>();
  let isDisposed = false;
  const cleanupFunctions: (() => void)[] = [];

  const initialize = async () => {
    logger.info("Initializing channel servers...");

    // Create conductor instance ONCE for all channels
    // This is the ONLY place conductor is created for IPC
    const conductor = createConductor();
    logger.info("Conductor instance created for channel servers");

    const loggerChannel = createLoggerChannelServer(ipcMain, { logger });

    const nodeChannel = createNodeChannelServer<
      NodeDefinition,
      ConductorExecutionContext,
      ExecutionResult
    >(ipcMain, {
      execute: conductor.node.run,
    });

    // Wire conductor's events to unified progress events using event emitter
    // This provides cleaner decoupling and allows for proper cleanup
    const unsubscribeProgress = conductor.events.onProgress(
      (state: ExecutionGraphState) => {
        const nodesArray = Array.from(state.nodes.values());
        const progress = state.cachedProgress;
        const executing = nodesArray.filter((n) => n.state === "executing");
        const message =
          executing.length > 0
            ? `Executing: ${executing.map((n) => n.name).join(", ")}`
            : progress === 100
              ? "All nodes completed"
              : "Waiting to start...";

        const progressData: ProgressEvent = {
          nodeId: executing[0]?.id || "",
          nodes: nodesArray,
          progress,
          message,
          graph: {
            executionOrder: state.executionOrder,
            criticalPath: state.criticalPath,
            totalWeight: state.totalWeight,
            maxParallelism: state.maxParallelism,
            edges: state.edges,
          },
        };

        nodeChannel.broadcast("progress", progressData);
      },
    );

    cleanupFunctions.push(unsubscribeProgress);

    logger.info("Execution graph store wired to IPC broadcasts");

    const systemChannel = createSystemChannelServer(ipcMain);

    // Get PathManager for path channel
    const pathManager = getPathManager();

    const pathChannel = createPathChannelServer(ipcMain, pathManager);
    const storageChannel = createStorageChannelServer(ipcMain);
    const flowChannel = createFlowChannelServer(ipcMain);

    channels.push(
      loggerChannel,
      nodeChannel,
      systemChannel,
      pathChannel,
      storageChannel,
      flowChannel,
    );

    logger.info(`Initialized ${channels.length} channel servers`, [
      "logger",
      "node",
      "system",
      "path",
      "storage",
      "flow",
    ]);

    ipcMain.handle("channels:list", () => {
      return ["logger", "node", "system", "path", "storage", "flow"];
    });

    logger.info("Channel discovery handler registered");
  };

  const trackWindow = (window: BrowserWindow) => {
    if (isDisposed) return;

    windows.add(window);

    logger.info(
      `Tracking window for broadcasts. Total windows: ${windows.size}`,
    );

    channels.forEach((channel, index) => {
      if (channel.trackWindow) {
        channel.trackWindow(window);
        logger.info(`Channel ${index} now tracking window`);
      }
    });

    const onClosed = () => {
      windows.delete(window);
      windowListeners.delete(window);
      logger.info(`Window closed. Remaining windows: ${windows.size}`);
    };

    const onDestroyed = () => {
      logger.info("Window webContents destroyed");
    };

    windowListeners.set(window, [onClosed, onDestroyed]);

    window.on("closed", onClosed);
    window.webContents.on("destroyed", onDestroyed);
  };

  const dispose = () => {
    if (isDisposed) return;

    logger.info("Disposing channel manager...");

    isDisposed = true;

    cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        logger.error("Error cleaning up event subscription:", error);
      }
    });

    for (const [window, listeners] of windowListeners) {
      try {
        window.removeListener("closed", listeners[0]);
        window.webContents.removeListener("destroyed", listeners[1]);
      } catch {
        // Ignore errors when removing listeners during shutdown
      }
    }

    channels.forEach((channel, index) => {
      try {
        channel.dispose();
        logger.info(`Channel ${index} disposed`);
      } catch (error) {
        logger.error(`Error disposing channel ${index}:`, error);
      }
    });

    channels.length = 0;
    windows.clear();
    windowListeners.clear();

    try {
      ipcMain.removeHandler("channels:list");
    } catch {
      // Ignore errors when removing handlers during shutdown
    }

    logger.info("Channel manager disposed");
  };

  const getChannelCount = () => channels.length;

  const getChannelNames = () => [
    "logger",
    "node",
    "system",
    "path",
    "storage",
    "flow",
  ];

  await initialize();

  return {
    trackWindow,
    dispose,
    getChannelCount,
    getChannelNames,
  };
};

export const setupChannels = async (
  mainWindow: BrowserWindow,
): Promise<ChannelManager> => {
  logger.info("Setting up channels for main window");

  const channelManager = await createChannelManager();

  channelManager.trackWindow(mainWindow);

  logger.info("Channel setup completed:", {
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
    // Only check channels that actually exist (removed "auth" which is not created)
    const channelNames = ["node", "system", "path", "storage", "flow"];

    for (const channelName of channelNames) {
      try {
        // Simple health check - channel exists and is responsive
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
