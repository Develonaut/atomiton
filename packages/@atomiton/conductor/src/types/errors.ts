/**
 * Re-export all error types from the error module
 *
 * This file exists for backward compatibility.
 * New code should import from '#types/error' instead.
 */

export {
  ErrorCode,
  createExecutionError,
  isExecutionError,
  toExecutionError,
  getErrorRecoveryStrategy,
} from "#types/error";

export type { ExecutionError, ErrorRecoveryStrategy } from "#types/error";
