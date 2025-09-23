/**
 * Shell Command Node Executable
 * Node.js implementation with shell command execution logic
 */

import { spawn } from "child_process";
import { createNodeExecutable } from "../../core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../core/types/executable";
import type { ShellCommandParameters } from "../../definitions/shell-command";

// Types for shell command execution
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
 * Get input value safely
 */
function getInputValue<T>(
  context: NodeExecutionContext,
  key: string
): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Execute shell command with timeout support
 */
function executeCommand(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    shell?: string | boolean;
    stdio?: "pipe" | "inherit";
    timeout?: number;
    killSignal?: string;
  }
): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  timedOut: boolean;
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      shell: options.shell || true,
      stdio: options.stdio || "pipe",
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    // Set up timeout if specified
    const timeoutId = options.timeout
      ? setTimeout(() => {
          timedOut = true;
          child.kill((options.killSignal as NodeJS.Signals) || "SIGTERM");
        }, options.timeout)
      : null;

    // Capture output if stdio is 'pipe'
    if (options.stdio === "pipe" || !options.stdio) {
      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
    }

    child.on("close", (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
        command: `${command} ${args.join(" ")}`,
        timedOut,
      });
    });

    child.on("error", (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Parse JSON safely
 */
function parseJSON<T>(value: unknown, fallback: T): T {
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
 * Shell Command node executable
 */
export const shellCommandExecutable: NodeExecutable<ShellCommandParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: ShellCommandParameters
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
          "environment"
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
        const success = result.exitCode === 0 && !result.timedOut;

        const output: ShellCommandOutput = {
          result: {
            stdout: config.captureOutput ? result.stdout : "",
            stderr: config.captureOutput ? result.stderr : "",
            exitCode: result.exitCode,
            command: result.command,
            duration,
            success,
            timedOut: result.timedOut,
          },
          stdout: config.captureOutput ? result.stdout : "",
          stderr: config.captureOutput ? result.stderr : "",
          exitCode: result.exitCode,
          command: result.command,
          duration,
          success,
        };

        const logLevel = success ? "info" : "warn";
        const message = result.timedOut
          ? `Command timed out after ${config.timeout}ms`
          : `Command completed with exit code ${result.exitCode}`;

        context.log?.[logLevel]?.(message, {
          exitCode: result.exitCode,
          duration,
          stdoutLength: result.stdout.length,
          stderrLength: result.stderr.length,
          timedOut: result.timedOut,
        });

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
          outputs: {
            result: {
              stdout: "",
              stderr: "",
              exitCode: -1,
              command: config.command,
              duration,
              success: false,
              timedOut: false,
            },
            stdout: "",
            stderr: "",
            exitCode: -1,
            command: config.command,
            duration,
            success: false,
          },
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
