import type { ChildProcess } from "child_process";
import { spawn } from "child_process";

import type {
  ProcessHandle,
  ProcessResult,
  SpawnOptions,
} from "./IExecutionClient";
import { BaseExecutionClient } from "./IExecutionClient";

/**
 * Node.js process execution client for desktop environments
 */
export class NodeProcessClient extends BaseExecutionClient {
  private processes: Map<string, ChildProcess> = new Map();
  private results: Map<string, ProcessResult> = new Map();
  private outputBuffers: Map<string, { stdout: string[]; stderr: string[] }> =
    new Map();

  async spawn(
    script: string,
    args: string[],
    options?: SpawnOptions,
  ): Promise<ProcessHandle> {
    this.validateScript(script);
    this.validateArgs(args);

    const id = this.generateId();
    const handle: ProcessHandle = {
      id,
      type: "process",
      startTime: Date.now(),
      script,
      args,
    };

    try {
      // Spawn the process
      const childProcess = spawn(script, args, {
        cwd: options?.cwd,
        env: { ...process.env, ...options?.env },
        shell: options?.shell || false,
      });

      this.outputBuffers.set(id, { stdout: [], stderr: [] });
      const buffer = this.outputBuffers.get(id)!;

      if (childProcess.stdout) {
        childProcess.stdout.on("data", (data) => {
          buffer.stdout.push(data.toString());
        });
      }

      if (childProcess.stderr) {
        childProcess.stderr.on("data", (data) => {
          buffer.stderr.push(data.toString());
        });
      }

      // Handle process exit
      childProcess.on("exit", (code, signal) => {
        const exitCode = code ?? (signal ? -1 : 0);
        this.handleProcessExit(id, exitCode);
      });

      // Handle process error
      childProcess.on("error", (error) => {
        buffer.stderr.push(error.message);
        this.handleProcessExit(id, 1);
      });

      handle.internal = childProcess;
      this.processes.set(id, childProcess);
      this.registerHandle(handle);

      // Handle timeout if specified
      if (options?.timeout) {
        setTimeout(() => {
          if (this.isRunning(handle)) {
            this.kill(handle);
          }
        }, options.timeout);
      }

      return handle;
    } catch (error: unknown) {
      throw new Error(
        `Failed to spawn process: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async kill(handle: ProcessHandle): Promise<void> {
    const process = this.processes.get(handle.id);
    if (process && !process.killed) {
      // Try graceful shutdown first
      process.kill("SIGTERM");

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (process && !process.killed) {
          process.kill("SIGKILL");
        }
      }, 5000);

      this.processes.delete(handle.id);
      this.unregisterHandle(handle.id);

      // Create a killed result if not already completed
      if (!this.results.has(handle.id)) {
        const buffer = this.outputBuffers.get(handle.id) || {
          stdout: [],
          stderr: [],
        };
        this.results.set(handle.id, {
          exitCode: -1,
          stdout: buffer.stdout.join(""),
          stderr: buffer.stderr.join(""),
          duration: Date.now() - handle.startTime,
        });
      }
    }
  }

  async sendInput(handle: ProcessHandle, data: string): Promise<void> {
    const process = this.processes.get(handle.id);
    if (!process) {
      throw new Error(`Process ${handle.id} not found`);
    }

    if (!process.stdin) {
      throw new Error(`Process ${handle.id} does not have stdin`);
    }

    return new Promise((resolve, reject) => {
      process.stdin!.write(data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async wait(handle: ProcessHandle): Promise<ProcessResult> {
    // If already completed, return the result
    if (this.results.has(handle.id)) {
      return this.results.get(handle.id)!;
    }

    const process = this.processes.get(handle.id);
    if (!process) {
      throw new Error(`Process ${handle.id} not found`);
    }

    // Wait for process to complete
    return new Promise((resolve) => {
      const checkResult = (): void => {
        if (this.results.has(handle.id)) {
          resolve(this.results.get(handle.id)!);
        }
      };

      // Check if already completed
      checkResult();

      // Wait for exit event
      process.on("exit", () => {
        // Give a small delay for buffers to flush
        setTimeout(checkResult, 100);
      });
    });
  }

  isRunning(handle: ProcessHandle): boolean {
    const process = this.processes.get(handle.id);
    return process ? !process.killed : false;
  }

  protected async onInitialize(): Promise<void> {
    // Check if we're in a Node.js environment
    if (typeof process === "undefined" || !process.versions?.node) {
      throw new Error(
        "Node.js process spawning is not available in this environment",
      );
    }
  }

  protected async onCleanup(): Promise<void> {
    // Kill all processes
    for (const [, process] of this.processes.entries()) {
      if (!process.killed) {
        process.kill("SIGKILL");
      }
    }
    this.processes.clear();
    this.results.clear();
    this.outputBuffers.clear();
  }

  private handleProcessExit(id: string, exitCode: number): void {
    const handle = this.handles.get(id);
    if (!handle) return;

    const buffer = this.outputBuffers.get(id) || { stdout: [], stderr: [] };

    this.results.set(id, {
      exitCode,
      stdout: buffer.stdout.join(""),
      stderr: buffer.stderr.join(""),
      duration: Date.now() - handle.startTime,
    });

    this.processes.delete(id);
    this.unregisterHandle(id);
    this.outputBuffers.delete(id);
  }

  /**
   * Execute a command and return the result
   * Convenience method for simple command execution
   */
  async exec(
    command: string,
    args: string[] = [],
    options?: SpawnOptions,
  ): Promise<ProcessResult> {
    const handle = await this.spawn(command, args, options);
    return this.wait(handle);
  }

  /**
   * Get process info
   */
  getProcessInfo(
    handle: ProcessHandle,
  ): { pid?: number; killed?: boolean } | null {
    const process = this.processes.get(handle.id);
    if (!process) return null;

    return {
      pid: process.pid,
      killed: process.killed,
    };
  }
}
