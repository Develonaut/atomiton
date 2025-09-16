import React from "react";

// Temporary Link component to avoid circular imports
const Link = ({
  to,
  className,
  children,
  ...props
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <a href={to} className={className} {...props}>
    {children}
  </a>
);

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

function NotFoundError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-700">
          Page Not Found
        </h2>
        <p className="mt-4 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

function UnauthorizedError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">401</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-700">
          Unauthorized
        </h2>
        <p className="mt-4 text-gray-600">
          You need to be logged in to access this page.
        </p>
        <div className="mt-6 space-x-4">
          <Link
            to="/sign-in"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
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

function ServiceUnavailableError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">503</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-700">
          Service Unavailable
        </h2>
        <p className="mt-4 text-gray-600">
          We&apos;re temporarily unable to service your request. Please try
          again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function GenericRouteError({
  status,
  statusText,
}: {
  status: number;
  statusText: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">{status}</h1>
        <h2 className="mt-2 text-2xl font-semibold text-gray-700">
          {statusText}
        </h2>
        <p className="mt-4 text-gray-600">
          An error occurred while processing your request.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

function ApplicationError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
          Application Error
        </h2>

        <p className="mt-2 text-sm text-center text-gray-600">
          Something went wrong in the application.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 p-4 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer font-medium text-gray-700">
              Error Details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap text-red-600">
              {error.message}
              {error.stack && (
                <>
                  {"\n\nStack:\n"}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
          <Link
            to="/"
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
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
