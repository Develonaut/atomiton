import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Box, Button } from "@atomiton/ui";
import Icon from "@/components/Icon";

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ErrorDisplayProps = {
  error: Error;
  onRetry: () => void;
  onDownloadReport: () => void;
};

function ErrorDisplay({ error, onRetry, onDownloadReport }: ErrorDisplayProps) {
  return (
    <Box className="min-h-screen flex items-center justify-center bg-surface-02 p-8">
      <Box className="max-w-2xl w-full bg-surface-01 rounded-2xl border border-s-01 shadow-popover p-8">
        <Box className="flex items-center gap-4 mb-6">
          <Box className="flex items-center justify-center size-12 bg-red-50 rounded-xl">
            <Icon className="!size-6 fill-red-500" name="alert-triangle" />
          </Box>
          <Box>
            <h1 className="text-title-lg text-primary font-semibold">
              Something went wrong
            </h1>
            <p className="text-body-md text-secondary">
              We&apos;ve encountered an unexpected error. Don&apos;t worry -
              your work hasn&apos;t been lost.
            </p>
          </Box>
        </Box>

        <Box className="bg-surface-03 rounded-xl p-4 mb-6">
          <h2 className="text-heading text-primary font-medium mb-2">
            Error Details
          </h2>
          <p className="text-body-sm text-secondary font-mono break-all">
            {error.message}
          </p>
        </Box>

        <Box className="flex gap-3">
          <Button onClick={onRetry} variant="default" className="flex-1">
            Try Again
          </Button>
          <Button onClick={onDownloadReport} variant="ghost">
            <Icon className="!size-4 fill-inherit mr-2" name="download" />
            Download Report
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: 0,
    };
  }

  private errorDisplayTimer: NodeJS.Timeout | null = null;
  private autoRecoveryTimer: NodeJS.Timeout | null = null;

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // In development, check if this is a recoverable error
    if (import.meta.env.DEV) {
      // HMR errors or React Fast Refresh errors often contain these patterns
      const isHMRError =
        error.message?.includes('Failed to fetch dynamically imported module') ||
        error.message?.includes('Unable to preload CSS') ||
        error.stack?.includes('__vite') ||
        error.stack?.includes('hot-update');

      if (isHMRError) {
        console.warn('Caught HMR/dev error, will attempt auto-recovery:', error.message);
        return {
          hasError: false, // Don't show error UI for HMR errors
          error,
          lastErrorTime: Date.now(),
        };
      }
    }

    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // In development, implement auto-recovery for transient errors
    if (import.meta.env.DEV) {
      // Store on window for debugging access
      const extWindow = window as Window & {
        __lastError?: { error: Error; errorInfo: ErrorInfo; timestamp: Date };
      };
      extWindow.__lastError = { error, errorInfo, timestamp: new Date() };

      // If we're getting repeated errors, it's likely a real issue
      if (this.state.errorCount > 3) {
        console.error('Multiple errors detected, showing error UI');
        return;
      }

      // For first few errors, try auto-recovery after a delay
      if (this.state.hasError && !this.autoRecoveryTimer) {
        console.warn('Will attempt auto-recovery in 3 seconds...');
        this.autoRecoveryTimer = setTimeout(() => {
          this.handleRetry();
          this.autoRecoveryTimer = null;
        }, 3000);
      }
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    // Clear any pending timers
    if (this.errorDisplayTimer) {
      clearTimeout(this.errorDisplayTimer);
      this.errorDisplayTimer = null;
    }
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer);
      this.autoRecoveryTimer = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  handleDownloadReport = async () => {
    const { error, errorInfo } = this.state;
    if (!error || !errorInfo) return;

    // Use the centralized error reporting system with dynamic import
    const { errorReporter } = await import("../../utils/errorReporting");
    errorReporter.generateDownloadableReport(error, errorInfo);
  };

  componentWillUnmount() {
    // Clean up timers
    if (this.errorDisplayTimer) {
      clearTimeout(this.errorDisplayTimer);
    }
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer);
    }
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // In development, show a banner about auto-recovery if it's pending
      const showAutoRecoveryBanner = import.meta.env.DEV &&
                                     this.state.errorCount <= 3 &&
                                     this.autoRecoveryTimer !== null;

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default error display with auto-recovery banner
      return (
        <>
          {showAutoRecoveryBanner && (
            <Box className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 z-50">
              <p className="text-sm text-yellow-800">
                🔄 Development error detected. Auto-recovery in progress...
              </p>
            </Box>
          )}
          <ErrorDisplay
            error={this.state.error}
            onRetry={this.handleRetry}
            onDownloadReport={this.handleDownloadReport}
          />
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
