/**
 * Shell Command Output
 * Output formatting and result handling
 */

import type { CommandResult } from "#executables/shell-command/executor";

/**
 * Shell command output structure
 * Follows the same flat pattern as http-request for consistency
 */
export type ShellCommandOutput = {
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  duration: number;
  success: boolean;
  timedOut: boolean;
};

/**
 * Create shell command output from execution result
 */
export function createCommandOutput(
  result: CommandResult,
  duration: number,
  captureOutput: boolean,
): ShellCommandOutput {
  const success = result.exitCode === 0 && !result.timedOut;

  return {
    stdout: captureOutput ? result.stdout : "",
    stderr: captureOutput ? result.stderr : "",
    exitCode: result.exitCode,
    command: result.command,
    duration,
    success,
    timedOut: result.timedOut,
  };
}

/**
 * Create error output when command fails
 */
export function createErrorOutput(
  command: string,
  duration: number,
): ShellCommandOutput {
  return {
    stdout: "",
    stderr: "",
    exitCode: -1,
    command,
    duration,
    success: false,
    timedOut: false,
  };
}
