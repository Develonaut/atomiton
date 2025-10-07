import { useCallback } from "react";
import ErrorBoundary from "#components/ErrorBoundary";
import Providers from "#components/Providers";
import { RouterProvider } from "#router";
import type { ErrorInfo } from "react";

function AppContent() {
  return (
    <div className="bg-surface-01 font-inter text-body-md text-primary antialiased">
      <Providers>
        <RouterProvider />
      </Providers>
    </div>
  );
}

function App() {
  const handleError = useCallback(
    async (error: Error, errorInfo: ErrorInfo) => {
      const { errorReporter } = await import("#utils/errorReporting");
      errorReporter.handleError(error, errorInfo);
    },
    [],
  );

  return (
    <ErrorBoundary onError={handleError}>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
