import type { ChannelServer } from "#main/channels/createChannelServer";
import type { IpcMain } from "electron";

// Inline LogEntry type to avoid circular dependency with @atomiton/logger
type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  scope?: string;
  message: string;
  meta?: unknown[];
  timestamp?: Date;
};

export type LoggerChannelOptions = {
  logger: {
    debug(message: string, ...meta: unknown[]): void;
    info(message: string, ...meta: unknown[]): void;
    warn(message: string, ...meta: unknown[]): void;
    error(message: string, ...meta: unknown[]): void;
    scope(scope: string): {
      debug(message: string, ...meta: unknown[]): void;
      info(message: string, ...meta: unknown[]): void;
      warn(message: string, ...meta: unknown[]): void;
      error(message: string, ...meta: unknown[]): void;
    };
  };
};

/**
 * Creates a logger channel server that receives log entries from renderer processes
 * and forwards them to the main process logger.
 */
export const createLoggerChannelServer = (
  ipc: IpcMain,
  options: LoggerChannelOptions,
): ChannelServer => {
  const { logger } = options;
  const channelName = "logger";

  const setup = () => {
    // Handle log entries from renderer processes
    ipc.on(`${channelName}:log`, (event, entry: LogEntry) => {
      const { level, scope, message, meta = [] } = entry;

      // Use scoped logger if scope provided
      const scopedLogger = scope ? logger.scope(scope) : logger;

      // Log with appropriate level
      scopedLogger[level](message, ...meta);
    });

    console.log("[RPC] Logger channel server initialized");
  };

  const dispose = () => {
    ipc.removeAllListeners(`${channelName}:log`);
    console.log("[RPC] Logger channel server disposed");
  };

  // Initialize on creation
  setup();

  return {
    handle: () => {
      // Logger channel doesn't use handle/call pattern
      // It uses send/on pattern for fire-and-forget logging
    },
    broadcast: () => {
      // Logger channel doesn't broadcast
    },
    dispose,
  };
};
