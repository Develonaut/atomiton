import type { ErrorInfo } from "react";

export type ErrorReport = {
  timestamp: string;
  userAgent: string;
  url: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: {
    componentStack: string;
  };
  context?: {
    userId?: string;
    sessionId?: string;
    buildVersion?: string;
    environment?: string;
  };
};

/**
 * Centralized error reporting utility
 * Handles logging, external reporting, and user notification
 */
export class ErrorReporter {
  private static instance: ErrorReporter;
  private context: ErrorReport["context"] = {};

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  /**
   * Set additional context for error reports
   */
  setContext(context: Partial<ErrorReport["context"]>) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Handle errors caught by ErrorBoundary
   */
  async handleError(error: Error, errorInfo: ErrorInfo): Promise<void> {
    const report = this.createErrorReport(error, errorInfo);

    // Log to console (always)
    this.logToConsole(report);

    // Send to external service (in production)
    if (process.env.NODE_ENV === "production") {
      await this.sendToExternalService(report);
    }

    // Store locally for debugging
    this.storeLocallyForDebugging(report);
  }

  /**
   * Create comprehensive error report
   */
  private createErrorReport(error: Error, errorInfo: ErrorInfo): ErrorReport {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack || "",
      },
      context: {
        ...this.context,
        buildVersion: process.env.VITE_BUILD_VERSION || "unknown",
        environment: process.env.NODE_ENV,
      },
    };
  }

  /**
   * Log error details to console with formatting
   */
  private logToConsole(report: ErrorReport): void {
    console.error("🚨 Application Error Report:");
    console.error("Error:", report.error);
    console.error("Component Stack:", report.errorInfo.componentStack);
    console.error("Context:", report.context);
    console.error("Full Report:", report);
  }

  /**
   * Send error report to external monitoring service
   */
  private async sendToExternalService(_report: ErrorReport): Promise<void> {
    try {
      // In a real app, this would send to Sentry, LogRocket, etc.
      // For now, we'll just simulate the call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (sendError) {
      console.error("❌ Failed to send error report:", sendError);
      // Don't throw here to avoid secondary errors
    }
  }

  /**
   * Store error report locally for debugging
   */
  private storeLocallyForDebugging(report: ErrorReport): void {
    try {
      const key = `error-report-${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(report));

      // Keep only last 10 reports to avoid storage bloat
      this.cleanupOldReports();
    } catch (storageError) {
      console.warn("Could not store error report locally:", storageError);
    }
  }

  /**
   * Clean up old error reports from localStorage
   */
  private cleanupOldReports(): void {
    try {
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith("error-report-"))
        .sort()
        .reverse();

      // Keep only the 10 most recent reports
      keys.slice(10).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn("Could not clean up old error reports:", error);
    }
  }

  /**
   * Get stored error reports for debugging
   */
  getStoredReports(): ErrorReport[] {
    try {
      const keys = Object.keys(localStorage)
        .filter((key) => key.startsWith("error-report-"))
        .sort()
        .reverse();

      return keys
        .map((key) => {
          const report = localStorage.getItem(key);
          return report ? JSON.parse(report) : null;
        })
        .filter(Boolean);
    } catch (error) {
      console.warn("Could not retrieve stored error reports:", error);
      return [];
    }
  }

  /**
   * Clear all stored error reports
   */
  clearStoredReports(): void {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("error-report-"),
      );

      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Could not clear stored error reports:", error);
    }
  }

  /**
   * Generate downloadable error report
   */
  generateDownloadableReport(error: Error, errorInfo: ErrorInfo): void {
    const report = this.createErrorReport(error, errorInfo);

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atomiton-error-report-${Date.now()}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const errorReporter = ErrorReporter.getInstance();
