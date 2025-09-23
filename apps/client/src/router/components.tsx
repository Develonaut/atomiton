import React from "react";
import { Link } from "#router";

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  );
}

export function RouteErrorBoundary() {
  return <UnknownError />;
}

function UnknownError() {
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
        <div className="mt-6 space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
