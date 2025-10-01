/**
 * Shell Command Node Executable
 * Node.js implementation with secure shell command execution
 *
 * Security: Uses structured command API (program + args) with shell: false
 * to prevent command injection attacks
 */

import { createExecutable } from "#core/utils/executable";
import type { ShellCommandParameters } from "#schemas/shell-command";
import { executeCommand } from "#executables/shell-command/executor";
import {
  createCommandOutput,
  type ShellCommandOutput,
} from "#executables/shell-command/output";
import { logExecutionResult } from "#executables/shell-command/utils";

export type { ShellCommandOutput };

/**
 * MVP defaults for shell command execution
 * These values are hardcoded for the MVP and not exposed in the schema
 */
const MVP_DEFAULTS = {
  stdio: "pipe" as const,
  killSignal: "SIGTERM" as const,
} as const;

/**
 * Shell Command node executable
 * Security: Uses structured command format to prevent injection
 */
export const shellCommandExecutable = createExecutable<ShellCommandParameters>(
  "shell-command",
  async ({ getInput, config, context, getDuration }) => {
    // Get parameters using enhanced helper
    const program = getInput<string>("program");
    const args = getInput<string[]>("args") || (config.args as string[]);
    const workingDirectory = getInput<string>("workingDirectory");
    const inputEnvironment = getInput<Record<string, string>>("environment");

    // Merge environment variables
    const environment = {
      ...inputEnvironment,
    };

    if (!program) {
      throw new Error("Program is required for command execution");
    }

    context.log.info(`Executing command: ${program}`, {
      args,
      workingDirectory,
      timeout: config.timeout,
    });

    // Execute the command with structured API
    const result = await executeCommand({
      program,
      args,
      cwd: workingDirectory as string,
      env: environment,
      stdio: MVP_DEFAULTS.stdio,
      timeout: config.timeout,
      killSignal: MVP_DEFAULTS.killSignal,
    });

    const duration = getDuration();
    const output = createCommandOutput(
      result,
      duration,
      config.captureOutput as boolean,
    );

    logExecutionResult(context, result, duration, config.timeout as number);

    return output;
  },
);

export default shellCommandExecutable;
