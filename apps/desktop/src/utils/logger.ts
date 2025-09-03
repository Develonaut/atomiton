// Simple console wrapper for electron main process
// Full logging should be handled by core package

export interface Logger {
  debug: (category: string, message: string, ...args: unknown[]) => void;
  info: (category: string, message: string, ...args: unknown[]) => void;
  warn: (category: string, message: string, ...args: unknown[]) => void;
  error: (category: string, message: string, ...args: unknown[]) => void;
  close: () => void;
}

const isDevelopment = process.env.NODE_ENV !== "production";

class ConsoleLogger implements Logger {
  debug(category: string, message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      console.log(`[${category}] ${message}`, ...args);
    }
  }

  info(category: string, message: string, ...args: unknown[]): void {
    console.log(`[${category}] ${message}`, ...args);
  }

  warn(category: string, message: string, ...args: unknown[]): void {
    console.warn(`[${category}] ${message}`, ...args);
  }

  error(category: string, message: string, error?: unknown): void {
    console.error(`[${category}] ${message}`, error);
  }

  close(): void {
    // No-op for console logger
  }
}

const logger = new ConsoleLogger();

export function initializeLogger(): Logger {
  return logger;
}

export function getLogger(): Logger {
  return logger;
}
