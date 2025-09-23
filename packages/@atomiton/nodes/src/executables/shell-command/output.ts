/**
 * Shell Command Output
 * Output formatting and result handling
 */

import type { CommandResult } from "./executor";

/**
 * Shell command output structure
 */
export type ShellCommandOutput = {
  result: {
    stdout: string;
    stderr: string;
    exitCode: number;
    command: string;
    duration: number;
    success: boolean;
    timedOut: boolean;
  };
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  duration: number;
  success: boolean;
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
    result: {
      stdout  : captureOutput ? result.stdout : "",
      stderr  : captureOutput ? result.stderr : "",
      exitCode: result.exitCode,
      command : result.command,
      duration,
      success,
      timedOut: result.timedOut,
    },
    stdout  : captureOutput ? result.stdout : "",
    stderr  : captureOutput ? result.stderr : "",
    exitCode: result.exitCode,
    command : result.command,
    duration,
    success,
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
    result: {
      stdout  : "",
      stderr  : "",
      exitCode: -1,
      command,
      duration,
      success : false,
      timedOut: false,
    },
    stdout  : "",
    stderr  : "",
    exitCode: -1,
    command,
    duration,
    success : false,
  };
}
