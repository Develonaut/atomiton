/**
 * Shell Command Node Executable
 * Node.js implementation with shell command execution logic
 */

import { createExecutable } from "#core/utils/executable";
import type { ShellCommandParameters } from "#schemas/shell-command";
import { executeCommand } from "#executables/shell-command/executor";
import {
  createCommandOutput,
  type ShellCommandOutput,
} from "#executables/shell-command/output";
import {
  logExecutionResult,
  parseJSON,
} from "#executables/shell-command/utils";

export type { ShellCommandOutput };

/**
 * Shell Command node executable
 */
export const shellCommandExecutable = createExecutable<ShellCommandParameters>(
  "shell-command",
  async ({ getInput, config, context, getDuration }) => {
    // Get parameters using enhanced helper
    const command = getInput<string>("command");
    const inputArgs = getInput<string[] | string>("args");
    const workingDirectory = getInput<string>("workingDirectory");
    const inputEnvironment = getInput<Record<string, string>>("environment");

    // Parse arguments
    let args: string[];
    if (inputArgs) {
      args = Array.isArray(inputArgs)
        ? inputArgs
        : parseJSON(inputArgs, config.args as string[]);
    } else {
      args = config.args as string[];
    }

    // Merge environment variables
    const environment = {
      ...(config.environment as Record<string, string>),
      ...inputEnvironment,
    };

    if (!command) {
      throw new Error("Command is required for shell execution");
    }

    context.log.info(`Executing shell command: ${command}`, {
      args,
      workingDirectory,
      shell: config.shell,
      timeout: config.timeout,
    });

    // Execute the command
    const result = await executeCommand(command, args, {
      cwd: workingDirectory as string,
      env: environment,
      shell: config.shell,
      stdio: config.inheritStdio ? "inherit" : "pipe",
      timeout: config.timeout,
      killSignal: config.killSignal,
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
