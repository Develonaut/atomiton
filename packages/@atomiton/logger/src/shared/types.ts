export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  [key: string]: unknown;
};

export type Logger = {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;

  child(namespace: string): Logger;
  setLevel(level: LogLevel): void;
};

export type LoggerConfig = {
  level?: LogLevel;
  namespace?: string;
  outputPath?: string;
  colors?: boolean;
  format?: "compact" | "detailed" | "json";
  console?: boolean; // Enable/disable console output (desktop only)
};
