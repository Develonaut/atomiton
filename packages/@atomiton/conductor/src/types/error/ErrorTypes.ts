/**
 * Error type definitions for the conductor execution system
 */

import type { ErrorCode } from "#types/error/ErrorCodes";

/**
 * Error recovery strategy suggestions
 */
export type ErrorRecoveryStrategy = {
  /**
   * Whether this error is retryable
   */
  retryable: boolean;

  /**
   * Suggested delay before retry (in ms)
   */
  retryDelayMs?: number;

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;

  /**
   * Alternative actions that could be taken
   */
  alternatives?: string[];

  /**
   * Human-readable recovery suggestions
   */
  suggestions?: string[];
};

/**
 * Structured execution error with full context
 */
export type ExecutionError = {
  /**
   * Standard error code for categorization
   */
  code: ErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * ID of the node where the error occurred
   */
  nodeId?: string;

  /**
   * ID of the execution context
   */
  executionId?: string;

  /**
   * Timestamp when the error occurred
   */
  timestamp: Date;

  /**
   * Stack trace for debugging (if available)
   */
  stack?: string;

  /**
   * Original error that caused this error (for error chains)
   */
  cause?: unknown;

  /**
   * Additional context data
   */
  context?: Record<string, unknown>;

  /**
   * Suggested recovery actions
   */
  recovery?: ErrorRecoveryStrategy;
};
