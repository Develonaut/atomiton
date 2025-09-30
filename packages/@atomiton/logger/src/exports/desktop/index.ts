import { app } from "electron";
import log from "electron-log";
import * as path from "node:path";
import type { Logger, LoggerOptions, LogLevel } from "#exports/shared/types";

export const createLogger = (options: LoggerOptions = {}): Logger => {
  const { scope, filePath, maxSize = 5 * 1024 * 1024 } = options;

  // Configure file transport
  log.transports.file.resolvePathFn = () => {
    if (filePath) return filePath;
    return path.join(app.getPath("userData"), "logs", "atomiton.log");
  };

  log.transports.file.maxSize = maxSize;

  // Create scoped logger if needed
  const scopedLog = scope ? log.scope(scope) : log;

  const createLogMethod = (level: LogLevel) => {
    return (message: string, ...meta: unknown[]) => {
      scopedLog[level](message, ...meta);
    };
  };

  return {
    debug: createLogMethod("debug"),
    info: createLogMethod("info"),
    warn: createLogMethod("warn"),
    error: createLogMethod("error"),

    metric: (name: string, value: number, tags?: Record<string, string>) => {
      scopedLog.info("[METRIC]", { name, value, tags, timestamp: new Date() });
    },

    analytics: (event: string, data?: Record<string, unknown>) => {
      scopedLog.info("[ANALYTICS]", { event, data, timestamp: new Date() });
    },

    scope: (newScope: string) => {
      const fullScope = scope ? `${scope}:${newScope}` : newScope;
      return createLogger({ ...options, scope: fullScope });
    },
  };
};

// Export electron-log for advanced use cases
export { default as electronLog } from "electron-log";
