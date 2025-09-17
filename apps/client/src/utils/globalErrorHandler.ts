type ErrorHistoryEntry = {
  type: "error" | "unhandledRejection";
  error: Error | string | unknown;
  timestamp: Date;
  source?: string;
};

const errorHistory: ErrorHistoryEntry[] = [];

const MAX_ERROR_HISTORY = 20;

function addToErrorHistory(
  type: "error" | "unhandledRejection",
  error: Error | string | unknown,
  source?: string,
) {
  errorHistory.push({
    type,
    error,
    timestamp: new Date(),
    source,
  });

  // Keep only last MAX_ERROR_HISTORY errors
  if (errorHistory.length > MAX_ERROR_HISTORY) {
    errorHistory.shift();
  }

  if (import.meta.env.DEV) {
    const extWindow = window as Window & {
      __errorHistory?: ErrorHistoryEntry[];
    };
    extWindow.__errorHistory = errorHistory;
  }
}

// Global error handler
export function setupGlobalErrorHandlers() {
  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    // eslint-disable-next-line no-console -- Critical error logging for production debugging
    console.group("🔥 Uncaught Error");
    console.error("Error:", event.error);
    console.error("Message:", event.message);
    console.error("Source:", event.filename);
    console.error("Line:", event.lineno, "Column:", event.colno);
    console.error("Stack:", event.error?.stack);
    // eslint-disable-next-line no-console -- End of error group
    console.groupEnd();

    addToErrorHistory("error", event.error || event.message, event.filename);

    // Don't prevent default if we want the error to bubble to ErrorBoundary
    // But log it so we don't lose it
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- Development-only error tracking notification
      console.warn("💾 Error added to window.__errorHistory");
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    // eslint-disable-next-line no-console -- Critical promise rejection logging for production debugging
    console.group("🔥 Unhandled Promise Rejection");
    console.error("Reason:", event.reason);
    if (event.reason instanceof Error) {
      console.error("Stack:", event.reason.stack);
    }
    // eslint-disable-next-line no-console -- End of rejection group
    console.groupEnd();

    addToErrorHistory("unhandledRejection", event.reason, "Promise");

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- Development-only rejection tracking notification
      console.warn("💾 Rejection added to window.__errorHistory");
    }
  });

  if (import.meta.env.DEV) {
    const extWindow = window as Window & {
      showErrorHistory?: () => ErrorHistoryEntry[];
      clearErrorHistory?: () => void;
      __errorHistory?: ErrorHistoryEntry[];
      __lastError?: { error: Error; errorInfo?: unknown; timestamp: Date };
    };

    extWindow.showErrorHistory = () => {
      // eslint-disable-next-line no-console -- Development tool for error history visualization
      console.table(
        errorHistory.map((e) => ({
          type: e.type,
          message: e.error instanceof Error ? e.error.message : String(e.error),
          timestamp: e.timestamp.toISOString(),
          source: e.source,
        })),
      );
      return errorHistory;
    };

    extWindow.clearErrorHistory = () => {
      errorHistory.length = 0;
      delete extWindow.__errorHistory;
      delete extWindow.__lastError;
      // eslint-disable-next-line no-console -- Development tool feedback
      console.log("✅ Error history cleared");
    };
  }
}

// Export for manual error logging
export function logError(error: Error, context?: string) {
  // eslint-disable-next-line no-console -- Manual error logging for debugging
  console.group(`🚨 Manual Error Log${context ? ` (${context})` : ""}`);
  console.error("Error:", error);
  console.error("Stack:", error.stack);
  // eslint-disable-next-line no-console -- End of error group
  console.groupEnd();

  addToErrorHistory("error", error, context);
}
