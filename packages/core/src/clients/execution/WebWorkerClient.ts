import type {
  ProcessHandle,
  ProcessResult,
  SpawnOptions,
} from "./IExecutionClient";
import { BaseExecutionClient } from "./IExecutionClient";

/**
 * Web Worker execution client for browser environments
 */
export class WebWorkerClient extends BaseExecutionClient {
  private workers: Map<string, Worker> = new Map();
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
      type: "worker",
      startTime: Date.now(),
      script,
      args,
    };

    try {
      let worker: Worker;

      if (script.startsWith("http") || script.startsWith("/")) {
        worker = new Worker(script);
      } else {
        const blob = new Blob([this.wrapScript(script)], {
          type: "application/javascript",
        });
        const url = URL.createObjectURL(blob);
        worker = new Worker(url);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      this.outputBuffers.set(id, { stdout: [], stderr: [] });

      worker.onmessage = (event): void => {
        const { type, data } = event.data;
        const buffer = this.outputBuffers.get(id);

        if (buffer) {
          switch (type) {
            case "stdout":
              buffer.stdout.push(data);
              break;
            case "stderr":
              buffer.stderr.push(data);
              break;
            case "exit":
              this.handleWorkerExit(id, data);
              break;
          }
        }
      };

      worker.onerror = (error): void => {
        const buffer = this.outputBuffers.get(id);
        if (buffer) {
          buffer.stderr.push(error.message);
        }
        this.handleWorkerExit(id, 1);
      };

      worker.postMessage({ type: "start", args, env: options?.env || {} });

      handle.internal = worker;
      this.workers.set(id, worker);
      this.registerHandle(handle);

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
        `Failed to spawn worker: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async kill(handle: ProcessHandle): Promise<void> {
    const worker = this.workers.get(handle.id);
    if (worker) {
      worker.terminate();
      this.workers.delete(handle.id);
      this.unregisterHandle(handle.id);

      if (!this.results.has(handle.id)) {
        const buffer = this.outputBuffers.get(handle.id) || {
          stdout: [],
          stderr: [],
        };
        this.results.set(handle.id, {
          exitCode: -1,
          stdout: buffer.stdout.join("\n"),
          stderr: buffer.stderr.join("\n"),
          duration: Date.now() - handle.startTime,
        });
      }
    }
  }

  async sendInput(handle: ProcessHandle, data: string): Promise<void> {
    const worker = this.workers.get(handle.id);
    if (!worker) {
      throw new Error(`Worker ${handle.id} not found`);
    }

    worker.postMessage({ type: "input", data });
  }

  async wait(handle: ProcessHandle): Promise<ProcessResult> {
    if (this.results.has(handle.id)) {
      return this.results.get(handle.id)!;
    }

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.results.has(handle.id)) {
          clearInterval(checkInterval);
          resolve(this.results.get(handle.id)!);
        }
      }, 100);
    });
  }

  protected async onInitialize(): Promise<void> {
    if (typeof Worker === "undefined") {
      throw new Error("Web Workers are not available in this environment");
    }
  }

  protected async onCleanup(): Promise<void> {
    for (const worker of this.workers.values()) {
      worker.terminate();
    }
    this.workers.clear();
    this.results.clear();
    this.outputBuffers.clear();
  }

  private handleWorkerExit(id: string, exitCode: number): void {
    const handle = this.handles.get(id);
    if (!handle) return;

    const buffer = this.outputBuffers.get(id) || { stdout: [], stderr: [] };

    this.results.set(id, {
      exitCode,
      stdout: buffer.stdout.join("\n"),
      stderr: buffer.stderr.join("\n"),
      duration: Date.now() - handle.startTime,
    });

    this.workers.delete(id);
    this.unregisterHandle(id);
  }

  private wrapScript(script: string): string {
    return `
      let stdout = [];
      let stderr = [];
      
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args) => {
        const message = args.map(arg => String(arg)).join(' ');
        stdout.push(message);
        self.postMessage({ type: 'stdout', data: message });
        originalLog.apply(console, args);
      };
      
      console.error = (...args) => {
        const message = args.map(arg => String(arg)).join(' ');
        stderr.push(message);
        self.postMessage({ type: 'stderr', data: message });
        originalError.apply(console, args);
      };
      
      self.onmessage = async (event) => {
        const { type, args, env, data } = event.data;
        
        if (type === 'start') {
          try {
            self.env = env;
            self.args = args;
            
            ${script}
            
            self.postMessage({ type: 'exit', data: 0 });
          } catch (error) {
            console.error(error.message);
            self.postMessage({ type: 'exit', data: 1 });
          }
        } else if (type === 'input') {
          if (self.onInput) {
            self.onInput(data);
          }
        }
      };
    `;
  }
}
