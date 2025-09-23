/**
 * Shell Command Executor
 * Core logic for executing shell commands
 */

import { spawn } from "child_process";

/**
 * Command execution options
 */
export type CommandOptions = {
  cwd?: string;
  env?: Record<string, string>;
  shell?: string | boolean;
  stdio?: "pipe" | "inherit";
  timeout?: number;
  killSignal?: string;
};

/**
 * Command execution result
 */
export type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  timedOut: boolean;
};

/**
 * Execute shell command with timeout support
 */
export function executeCommand(
  command: string,
  args: string[],
  options: CommandOptions,
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd  : options.cwd,
      env  : { ...process.env, ...options.env },
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
        command : `${command} ${args.join(" ")}`,
        timedOut,
      });
    });

    child.on("error", (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
  });
}
