export type ErrorContext = {
  service: string;
  operation: string;
  input?: unknown;
};

export type AppError = {
  code: string;
  message: string;
  context: ErrorContext;
  timestamp: Date;
  stack?: string;
};

export type ErrorBoundaryService = {
  logError(error: unknown, context: ErrorContext): AppError;
  getRecentErrors(limit?: number): AppError[];
  clearErrors(): void;
};

export const createErrorBoundaryService = (): ErrorBoundaryService => {
  let errorLog: AppError[] = [];

  const getErrorCode = (error: unknown): string => {
    if (error instanceof Error) {
      if ("code" in error && typeof error.code === "string") {
        return error.code;
      }
    }

    if (typeof error === "object" && error !== null && "code" in error) {
      return String(error.code);
    }

    return "UNKNOWN_ERROR";
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "An unknown error occurred";
  };

  const logError = (error: unknown, context: ErrorContext): AppError => {
    const appError: AppError = {
      code: getErrorCode(error),
      message: getErrorMessage(error),
      context,
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
    };

    errorLog.push(appError);

    console.error("[ERROR BOUNDARY]", {
      service: context.service,
      operation: context.operation,
      error: appError.message,
      code: appError.code,
    });

    return appError;
  };

  const getRecentErrors = (limit = 50): AppError[] => {
    return errorLog.slice(-limit);
  };

  const clearErrors = (): void => {
    errorLog = [];
  };

  return {
    logError,
    getRecentErrors,
    clearErrors,
  };
};
