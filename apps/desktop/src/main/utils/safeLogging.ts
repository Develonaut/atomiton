/**
 * Safe logging utility for desktop app
 * Prevents EIO errors during app shutdown by handling stream write failures gracefully
 */

type LogLevel = "debug" | "info" | "warn" | "error";

// Module-level state
let isShuttingDown = false;

/**
 * Mark the application as shutting down
 * This prevents any new logging attempts that could cause EIO errors
 */
export const markShuttingDown = (): void => {
  isShuttingDown = true;
};

/**
 * Reset the shutdown state (useful for testing)
 */
export const resetSafeLogging = (): void => {
  isShuttingDown = false;
};

/**
 * Get current shutdown state
 */
export const getShuttingDownState = (): boolean => {
  return isShuttingDown;
};

/**
 * Generic safe console call
 */
const safeConsoleCall = (
  method: LogLevel | "log",
  ...args: readonly unknown[]
): void => {
  if (isShuttingDown) {
    // Silently ignore logging during shutdown to prevent EIO errors
    return;
  }

  try {
    // Use the appropriate console method
    if (method === "log") {
      console.log(...args);
    } else {
      console[method](...args);
    }
  } catch {
    // Silently ignore logging errors during shutdown
    // This prevents EIO errors when streams are closed
  }
};

/**
 * Safe console.log wrapper
 */
export const safeLog = (...args: readonly unknown[]): void => {
  safeConsoleCall("log", ...args);
};

/**
 * Safe console.info wrapper
 */
export const safeInfo = (...args: readonly unknown[]): void => {
  safeConsoleCall("info", ...args);
};

/**
 * Safe console.warn wrapper
 */
export const safeWarn = (...args: readonly unknown[]): void => {
  safeConsoleCall("warn", ...args);
};

/**
 * Safe console.error wrapper
 */
export const safeError = (...args: readonly unknown[]): void => {
  safeConsoleCall("error", ...args);
};

/**
 * Safe console.debug wrapper
 */
export const safeDebug = (...args: readonly unknown[]): void => {
  safeConsoleCall("debug", ...args);
};
