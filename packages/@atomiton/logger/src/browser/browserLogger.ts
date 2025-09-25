import type {
  LogContext,
  Logger,
  LoggerConfig,
  LogLevel,
} from "#shared/types.js";
import type { ILogObj, ILogObjMeta } from "tslog";
import { Logger as TSLogger } from "tslog";

const storeLog = (logObj: ILogObj & ILogObjMeta): void => {
  try {
    const logs = JSON.parse(localStorage.getItem("atomiton-logs") || "[]");
    logs.push(logObj);

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    localStorage.setItem("atomiton-logs", JSON.stringify(logs));
  } catch {
    // Silently fail - localStorage might be disabled
  }
};

export function createBrowserLogger(config: LoggerConfig = {}): Logger {
  const tsLogger = new TSLogger<ILogObj>({
    name: config.namespace || "atomiton",
    minLevel:
      config.level === "debug"
        ? 0
        : config.level === "info"
          ? 2
          : config.level === "warn"
            ? 3
            : 4,
    type: config.console !== false ? "pretty" : "hidden", // Show in console unless explicitly disabled
    hideLogPositionForProduction: true,
  });

  // Add localStorage transport for browser persistence
  tsLogger.attachTransport(storeLog);

  const log =
    (level: LogLevel) =>
    (message: string, context?: LogContext): void => {
      if (context) {
        tsLogger[level](message, context);
      } else {
        tsLogger[level](message);
      }
    };

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),

    child: (namespace: string): Logger => {
      const childNamespace = config.namespace
        ? `${config.namespace}:${namespace}`
        : namespace;

      return createBrowserLogger({
        level: config.level,
        namespace: childNamespace,
        colors: config.colors,
        console: config.console,
      });
    },

    setLevel: (level: LogLevel): void => {
      const minLevel =
        level === "debug" ? 0 : level === "info" ? 2 : level === "warn" ? 3 : 4;
      tsLogger.settings.minLevel = minLevel;
    },
  };
}
