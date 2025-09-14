import { Worker } from "worker_threads";

/**
 * Worker pool manager for efficient worker reuse
 */
export class WorkerPoolManager {
  private readonly workers: Worker[] = [];
  private readonly available: Worker[] = [];
  private readonly maxWorkers: number;

  constructor(maxWorkers: number) {
    this.maxWorkers = maxWorkers;
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(
        new URL("../workers/NodeWorker.ts", import.meta.url),
      );

      this.workers.push(worker);
      this.available.push(worker);
    }
  }

  async getWorker(): Promise<Worker> {
    // Wait for available worker
    while (this.available.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return this.available.pop()!;
  }

  releaseWorker(worker: Worker): void {
    this.available.push(worker);
  }

  destroy(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}
