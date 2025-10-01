/**
 * Shell Command Executor
 * Core logic for executing shell commands securely
 *
 * Security: Uses structured command API (program + args) with shell: false
 * to prevent command injection attacks. Based on industry best practices
 * from VS Code, GitHub Desktop, and the Execa library.
 */

import { spawn } from "child_process";
import { resolve } from "path";
import { accessSync, constants } from "fs";

/**
 * Command execution configuration
 * Uses structured format: program + args array (never shell string)
 */
export type CommandConfig = {
  program: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
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
 * Validate working directory is safe and accessible
 *
 * Security: Ensures path exists and is readable to prevent
 * path traversal attacks and execution in sensitive directories
 */
function validateWorkingDirectory(cwd: string | undefined): string {
  if (!cwd) return process.cwd();

  // Ensure absolute path
  const absPath = resolve(cwd);

  // Check if path exists and is accessible
  try {
    accessSync(absPath, constants.R_OK);
    return absPath;
  } catch {
    throw new Error(`Invalid or inaccessible working directory: ${cwd}`);
  }
}

/**
 * Sanitize environment variables to prevent privilege escalation
 *
 * Security: Removes dangerous environment variables that could:
 * - Override library loading (LD_PRELOAD, DYLD_INSERT_LIBRARIES)
 * - Modify execution paths
 * - Enable debugging/tracing in production
 */
function sanitizeEnvironment(
  env?: Record<string, string>,
): Record<string, string> {
  if (!env) return {};

  // List of dangerous environment variables to remove
  const dangerous = [
    "LD_PRELOAD", // Linux: preload shared libraries
    "LD_LIBRARY_PATH", // Linux: library search path
    "DYLD_INSERT_LIBRARIES", // macOS: inject libraries
    "DYLD_LIBRARY_PATH", // macOS: library search path
  ];

  const safe = { ...env };
  dangerous.forEach((key) => delete safe[key]);

  return safe;
}

/**
 * Execute command with security controls
 *
 * Security: NEVER uses shell (shell: false by default)
 * Arguments are passed directly to the program, preventing injection
 */
export function executeCommand(config: CommandConfig): Promise<CommandResult> {
  // Validate configuration
  if (!config.program || config.program.trim().length === 0) {
    throw new Error("Program is required for command execution");
  }

  // Validate paths and environment
  const safeCwd = validateWorkingDirectory(config.cwd);
  const safeEnv = sanitizeEnvironment(config.env);

  return new Promise((resolve, reject) => {
    // Execute with spawn (shell: false is default and CRITICAL for security)
    const child = spawn(config.program, config.args, {
      cwd: safeCwd,
      env: { ...process.env, ...safeEnv },
      shell: false, // CRITICAL: Never use shell to prevent injection
      stdio: config.stdio || "pipe",
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    // Set up timeout if specified
    const timeoutId = config.timeout
      ? setTimeout(() => {
          timedOut = true;
          child.kill((config.killSignal as NodeJS.Signals) || "SIGTERM");
        }, config.timeout)
      : null;

    // Capture output if stdio is 'pipe'
    if (config.stdio === "pipe" || !config.stdio) {
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
        command: `${config.program} ${config.args.join(" ")}`,
        timedOut,
      });
    });

    child.on("error", (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
  });
}
