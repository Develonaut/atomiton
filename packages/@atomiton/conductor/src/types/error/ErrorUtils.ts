/**
 * Error utility functions for the conductor execution system
 */

import { ErrorCode } from "#types/error/ErrorCodes";
import type {
  ExecutionError,
  ErrorRecoveryStrategy,
} from "#types/error/ErrorTypes";

/**
 * Factory function to create an ExecutionError
 */
export function createExecutionError(
  code: ErrorCode,
  message: string,
  options?: Partial<Omit<ExecutionError, "code" | "message" | "timestamp">>,
): ExecutionError {
  return {
    code,
    message,
    timestamp: new Date(),
    ...options,
  };
}

/**
 * Type guard to check if an error is an ExecutionError
 */
export function isExecutionError(error: unknown): error is ExecutionError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "timestamp" in error &&
    Object.values(ErrorCode).includes((error as ExecutionError).code)
  );
}

/**
 * Convert any error to an ExecutionError
 */
export function toExecutionError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  nodeId?: string,
  executionId?: string,
): ExecutionError {
  // Already an ExecutionError
  if (isExecutionError(error)) {
    return error;
  }

  // Standard Error object
  if (error instanceof Error) {
    return createExecutionError(defaultCode, error.message, {
      nodeId,
      executionId,
      stack: error.stack,
      cause: error.cause,
    });
  }

  // String error
  if (typeof error === "string") {
    return createExecutionError(defaultCode, error, {
      nodeId,
      executionId,
    });
  }

  // Unknown error
  return createExecutionError(
    ErrorCode.UNKNOWN_ERROR,
    "An unknown error occurred",
    {
      nodeId,
      executionId,
      cause: error,
      context: {
        originalError: String(error),
      },
    },
  );
}

/**
 * Get recovery strategy for a specific error code
 */
export function getErrorRecoveryStrategy(
  code: ErrorCode,
): ErrorRecoveryStrategy {
  switch (code) {
    case ErrorCode.TIMEOUT:
      return {
        retryable: true,
        retryDelayMs: 1000,
        maxRetries: 3,
        suggestions: [
          "The operation timed out. This might be due to network issues or high load.",
          "Consider increasing the timeout value or retrying the operation.",
        ],
      };

    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return {
        retryable: true,
        retryDelayMs: 5000,
        maxRetries: 5,
        suggestions: [
          "Rate limit exceeded. Please wait before retrying.",
          "Consider implementing request throttling or batching.",
        ],
      };

    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.INVALID_PARAMETERS:
    case ErrorCode.TYPE_MISMATCH:
      return {
        retryable: false,
        suggestions: [
          "The input data is invalid. Please check the parameters.",
          "Review the node configuration and ensure all required fields are provided.",
        ],
      };

    case ErrorCode.CIRCULAR_DEPENDENCY:
      return {
        retryable: false,
        suggestions: [
          "A circular dependency was detected in the node graph.",
          "Review the node connections and remove any cycles.",
        ],
      };

    case ErrorCode.CANCELLED:
      return {
        retryable: true,
        suggestions: ["The operation was cancelled. You can retry if needed."],
      };

    case ErrorCode.TRANSPORT_ERROR:
    case ErrorCode.IPC_COMMUNICATION_FAILED:
      return {
        retryable: true,
        retryDelayMs: 2000,
        maxRetries: 3,
        suggestions: [
          "Communication error occurred. This might be temporary.",
          "Check your network connection and try again.",
        ],
      };

    default:
      return {
        retryable: false,
        suggestions: [
          "An unexpected error occurred.",
          "Please check the error details and contact support if the issue persists.",
        ],
      };
  }
}
