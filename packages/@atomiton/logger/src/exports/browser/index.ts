import type {
  Logger,
  LoggerOptions,
  LogLevel,
  LogEntry,
} from "#exports/shared/types";

export const createLogger = (options: LoggerOptions = {}): Logger => {
  const { scope, transport } = options;

  const log = (level: LogLevel, message: string, ...meta: unknown[]) => {
    const entry: LogEntry = {
      level,
      scope,
      message,
      meta: meta.length > 0 ? meta : undefined,
      timestamp: new Date(),
    };

    // Try transport if provided
    if (transport?.send) {
      try {
        transport.send("log", entry);
      } catch (error) {
        // If transport fails, fall back to console
        console.warn(
          "[LOGGER:BROWSER] Transport error, falling back to console:",
          error,
        );
        // eslint-disable-next-line no-console -- Logger must access console dynamically based on log level
        const consoleMethod = console[level] || console.log;
        const prefix = scope ? `[${scope}]` : "";
        consoleMethod(prefix, message, ...meta);
      }
    } else {
      // No transport provided, use console
      // eslint-disable-next-line no-console -- Logger must access console dynamically based on log level
      const consoleMethod = console[level] || console.log;
      const prefix = scope ? `[${scope}]` : "";
      consoleMethod(prefix, message, ...meta);
    }
  };

  return {
    debug: (message: string, ...meta: unknown[]) =>
      log("debug", message, ...meta),
    info: (message: string, ...meta: unknown[]) =>
      log("info", message, ...meta),
    warn: (message: string, ...meta: unknown[]) =>
      log("warn", message, ...meta),
    error: (message: string, ...meta: unknown[]) =>
      log("error", message, ...meta),

    metric: (name: string, value: number, tags?: Record<string, string>) => {
      log("info", "[METRIC]", { name, value, tags });
    },

    analytics: (event: string, data?: Record<string, unknown>) => {
      log("info", "[ANALYTICS]", { event, data });
    },

    scope: (newScope: string) => {
      const fullScope = scope ? `${scope}:${newScope}` : newScope;
      return createLogger({ ...options, scope: fullScope });
    },
  };
};
