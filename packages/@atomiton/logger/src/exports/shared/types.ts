export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  level: LogLevel;
  scope?: string;
  message: string;
  meta?: unknown[];
  timestamp?: Date;
};

export type Logger = {
  // Standard logging
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;

  // Specialized logging
  metric(name: string, value: number, tags?: Record<string, string>): void;
  analytics(event: string, data?: Record<string, unknown>): void;

  // Scoped logger
  scope(scope: string): Logger;
};

/**
 * Minimal transport interface for browser logger
 * This allows logger to be dependency-free - consumers provide their own transport
 */
export type LoggerTransport = {
  send(event: string, data: unknown): void;
};

export type LoggerOptions = {
  scope?: string;
  filePath?: string;
  maxSize?: number;
  transport?: LoggerTransport;
};
