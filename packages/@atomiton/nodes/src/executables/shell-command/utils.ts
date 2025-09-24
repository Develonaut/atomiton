/**
 * Shell Command Utilities
 * Helper functions for shell command execution
 */

import type { NodeExecutionContext } from "#core/types/executable";

/**
 * Get input value safely
 */
export function getInputValue<T>(
  context: NodeExecutionContext,
  key: string,
): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Parse JSON safely with fallback
 */
export function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return (value as T) || fallback;
}

/**
 * Log command execution result
 */
export function logExecutionResult(
  context: NodeExecutionContext,
  result: {
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
  },
  duration: number,
  timeout: number,
): void {
  const success = result.exitCode === 0 && !result.timedOut;
  const logLevel = success ? "info" : "warn";
  const message = result.timedOut
    ? `Command timed out after ${timeout}ms`
    : `Command completed with exit code ${result.exitCode}`;

  context.log?.[logLevel]?.(message, {
    exitCode: result.exitCode,
    duration,
    stdoutLength: result.stdout.length,
    stderrLength: result.stderr.length,
    timedOut: result.timedOut,
  });
}
