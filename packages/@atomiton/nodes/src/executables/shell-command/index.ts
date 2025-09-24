/**
 * Shell Command Node Executable
 * Node.js implementation with shell command execution logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { ShellCommandParameters } from "#schemas/shell-command";
import { executeCommand } from "#executables/shell-command/executor";
import {
  createCommandOutput,
  createErrorOutput,
  type ShellCommandOutput,
} from "#executables/shell-command/output";
import {
  getInputValue,
  logExecutionResult,
  parseJSON,
} from "#executables/shell-command/utils";

export type { ShellCommandOutput };

/**
 * Shell Command node executable
 */
export const shellCommandExecutable: NodeExecutable<ShellCommandParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: ShellCommandParameters,
    ): Promise<NodeExecutionResult> {
      const startTime = Date.now();

      try {
        // Get parameters from inputs or config
        const command =
          getInputValue<string>(context, "command") || config.command;
        const inputArgs = getInputValue<string[] | string>(context, "args");
        const workingDirectory =
          getInputValue<string>(context, "workingDirectory") ||
          (config.workingDirectory as string);
        const inputEnvironment = getInputValue<Record<string, string>>(
          context,
          "environment",
        );

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

        context.log?.info?.(`Executing shell command: ${command}`, {
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

        const duration = Date.now() - startTime;
        const output = createCommandOutput(
          result,
          duration,
          config.captureOutput as boolean,
        );

        logExecutionResult(context, result, duration, config.timeout as number);

        return {
          success: true, // Always return success:true since we captured the execution result
          outputs: output,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("Shell command execution failed", {
          error: errorMessage,
          duration,
          command: config.command,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: createErrorOutput(config.command, duration),
        };
      }
    },

    validateConfig(config: unknown): ShellCommandParameters {
      // In a real implementation, this would validate using the schema
      // For now, just cast it
      return config as ShellCommandParameters;
    },
  });

export default shellCommandExecutable;
