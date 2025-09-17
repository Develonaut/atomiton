import { useCallback } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Providers from "./components/Providers";
import { RouterProvider } from "./router";
import { errorReporter } from "./utils/errorReporting";
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
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    errorReporter.handleError(error, errorInfo);
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
