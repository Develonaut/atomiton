/**
 * Low-level execution client interface
 * Handles process/worker spawning and management
 */
export interface IExecutionClient {
  /**
   * Spawn a new process/worker
   */
  spawn(
    script: string,
    args: string[],
    options?: SpawnOptions,
  ): Promise<ProcessHandle>;

  /**
   * Kill a process/worker
   */
  kill(handle: ProcessHandle): Promise<void>;

  /**
   * Send input to process
   */
  sendInput(handle: ProcessHandle, data: string): Promise<void>;

  /**
   * Check if process is running
   */
  isRunning(handle: ProcessHandle): boolean;

  /**
   * Wait for process to complete
   */
  wait(handle: ProcessHandle): Promise<ProcessResult>;

  /**
   * Get all active handles
   */
  getActiveHandles(): ProcessHandle[];

  /**
   * Initialize the execution client
   */
  initialize(): Promise<void>;

  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;
}

export interface ProcessHandle {
  id: string;
  type: "worker" | "process";
  startTime: number;
  script: string;
  args: string[];
  internal?: unknown; // Platform-specific handle (Worker or ChildProcess)
}

export interface SpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  shell?: boolean;
}

export interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

/**
 * Base abstract class for execution clients
 */
export abstract class BaseExecutionClient implements IExecutionClient {
  protected handles: Map<string, ProcessHandle> = new Map();
  protected initialized = false;
  private idCounter = 0;

  abstract spawn(
    script: string,
    args: string[],
    options?: SpawnOptions,
  ): Promise<ProcessHandle>;
  abstract kill(handle: ProcessHandle): Promise<void>;
  abstract sendInput(handle: ProcessHandle, data: string): Promise<void>;
  abstract wait(handle: ProcessHandle): Promise<ProcessResult>;

  isRunning(handle: ProcessHandle): boolean {
    return this.handles.has(handle.id);
  }

  getActiveHandles(): ProcessHandle[] {
    return Array.from(this.handles.values());
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await this.onInitialize();
    this.initialized = true;
  }

  async cleanup(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Kill all active processes
    const handles = Array.from(this.handles.values());
    await Promise.all(
      handles.map((handle) => this.kill(handle).catch(() => {})),
    );

    this.handles.clear();
    await this.onCleanup();
    this.initialized = false;
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onCleanup(): Promise<void>;

  protected generateId(): string {
    return `${Date.now()}_${++this.idCounter}`;
  }

  protected registerHandle(handle: ProcessHandle): void {
    this.handles.set(handle.id, handle);
  }

  protected unregisterHandle(handleId: string): void {
    this.handles.delete(handleId);
  }

  protected validateScript(script: string): void {
    if (!script || typeof script !== "string") {
      throw new Error("Script must be a non-empty string");
    }
  }

  protected validateArgs(args: string[]): void {
    if (!Array.isArray(args)) {
      throw new Error("Arguments must be an array");
    }
    for (const arg of args) {
      if (typeof arg !== "string") {
        throw new Error("All arguments must be strings");
      }
    }
  }
}
