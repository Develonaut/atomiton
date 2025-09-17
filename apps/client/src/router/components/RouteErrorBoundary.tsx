import { useEffect } from "react";
import { logError } from "@/utils/globalErrorHandler";

export function RouteErrorBoundary({
  error,
  reset,
}: {
  error?: Error;
  reset?: () => void;
}) {
  useEffect(() => {
    // Log route errors to global error handler
    if (error) {
      logError(error, "RouteErrorBoundary");
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">Oops!</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-700">
          Something went wrong
        </h2>
        <p className="mt-4 text-gray-600">
          An unexpected error occurred. Please try again.
        </p>
        {import.meta.env.DEV && error && (
          <details className="mt-4 text-left max-w-2xl mx-auto">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
              {"\n"}
              {error.stack}
            </pre>
          </details>
        )}
        <div className="mt-6 space-x-4">
          {reset ? (
            <button
              onClick={reset}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reload Page
            </button>
          )}
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
