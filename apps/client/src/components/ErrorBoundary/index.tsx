import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Box, Button } from "@atomiton/ui";
import Icon from "@/components/Icon";

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
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
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to console for development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleDownloadReport = async () => {
    const { error, errorInfo } = this.state;
    if (!error || !errorInfo) return;

    // Use the centralized error reporting system with dynamic import
    const { errorReporter } = await import("../../utils/errorReporting");
    errorReporter.generateDownloadableReport(error, errorInfo);
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default error display
      return (
        <ErrorDisplay
          error={this.state.error}
          onRetry={this.handleRetry}
          onDownloadReport={this.handleDownloadReport}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
