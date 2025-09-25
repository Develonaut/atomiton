import { ensureLogDirectory, getDefaultLogPath } from "#shared/paths.js";
import type {
  LogContext,
  Logger,
  LoggerConfig,
  LogLevel,
} from "#shared/types.js";
import { appendFileSync } from "node:fs";
import type { ILogObj, ILogObjMeta } from "tslog";
import { Logger as TSLogger } from "tslog";

const getLogPath = (configPath?: string): string => {
  return configPath || process.env.ATOMITON_LOG_PATH || getDefaultLogPath();
};

export function createDesktopLogger(config: LoggerConfig = {}): Logger {
  const logFilePath = getLogPath(config.outputPath);

  ensureLogDirectory(logFilePath);

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
    type: "hidden", // No console output, file only
    hideLogPositionForProduction: true,
  });

  // ANSI color codes
  const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
  };

  // Custom file transport with color-coded formatted output
  const fileTransport = (logObj: ILogObj & ILogObjMeta) => {
    const { _meta, ...messageData } = logObj;
    const timestamp = new Date(_meta.date)
      .toISOString()
      .replace("T", " ")
      .replace("Z", "");
    const level = _meta.logLevelName.padEnd(5);
    const name = _meta.name || "atomiton";

    // Color coding based on log level
    let levelColor = colors.reset;
    switch (_meta.logLevelName) {
      case "DEBUG":
        levelColor = colors.gray;
        break;
      case "INFO":
        levelColor = colors.cyan;
        break;
      case "WARN":
        levelColor = colors.yellow;
        break;
      case "ERROR":
        levelColor = colors.red;
        break;
    }

    // Format the message
    const message =
      Object.keys(messageData).length > 0
        ? Object.values(messageData)
            .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
            .join(" ")
        : "";

    const formattedLog = `${colors.dim}${timestamp}${colors.reset}  ${levelColor}${colors.bright}${level}${colors.reset}  ${colors.green}[${name}]${colors.reset}  ${message}\n`;
    appendFileSync(logFilePath, formattedLog);
  };

  tsLogger.attachTransport(fileTransport);

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

      return createDesktopLogger({
        level: config.level,
        namespace: childNamespace,
        outputPath: logFilePath,
        colors: config.colors,
        format: config.format,
      });
    },

    setLevel: (level: LogLevel): void => {
      const minLevel =
        level === "debug" ? 0 : level === "info" ? 2 : level === "warn" ? 3 : 4;
      tsLogger.settings.minLevel = minLevel;
    },
  };
}
