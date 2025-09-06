/**
 * Storage client wrapper with event monitoring capabilities
 */

import { EventEmitter } from "events";

import type { IStorageClient } from "./IStorageClient";

export interface StorageEvent {
  operation: "read" | "write" | "delete" | "clear";
  key?: string;
  size?: number;
  success: boolean;
  duration: number;
  error?: Error;
}

export class MonitoredStorageClient implements IStorageClient {
  private client: IStorageClient;
  private emitter: EventEmitter;

  constructor(client: IStorageClient) {
    this.client = client;
    this.emitter = new EventEmitter();
  }

  /**
   * Subscribe to storage events
   */
  on(event: "operation", listener: (data: StorageEvent) => void): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
  // Implementation signature must match overloads
  on(
    event: string,
    listener: ((data: StorageEvent) => void) | ((...args: unknown[]) => void),
  ): void {
    this.emitter.on(event, listener);
  }

  /**
   * Unsubscribe from storage events
   */
  off(event: string, listener: (...args: unknown[]) => void): void {
    this.emitter.off(event, listener);
  }

  private async monitored<T>(
    operation: StorageEvent["operation"],
    key: string | undefined,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;

      // Calculate size for write operations
      let size: number | undefined;
      if (operation === "write" && Buffer.isBuffer(result)) {
        size = result.length;
      }

      this.emitter.emit("operation", {
        operation,
        key,
        size,
        success: true,
        duration,
      } as StorageEvent);

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.emitter.emit("operation", {
        operation,
        key,
        success: false,
        duration,
        error: error as Error,
      } as StorageEvent);
      throw error;
    }
  }

  async read(key: string): Promise<Buffer | null> {
    return this.monitored("read", key, () => this.client.read(key));
  }

  async write(key: string, data: Buffer): Promise<void> {
    return this.monitored("write", key, async () => {
      await this.client.write(key, data);
      return data; // Return data for size calculation
    }).then(() => undefined);
  }

  async delete(key: string): Promise<void> {
    return this.monitored("delete", key, () => this.client.delete(key));
  }

  async exists(key: string): Promise<boolean> {
    return this.client.exists(key);
  }

  async list(prefix?: string): Promise<string[]> {
    return this.client.list(prefix);
  }

  async clear(): Promise<void> {
    return this.monitored("clear", undefined, () => this.client.clear());
  }

  async getSize(key: string): Promise<number> {
    return this.client.getSize(key);
  }

  async getTotalSize(): Promise<number> {
    return this.client.getTotalSize();
  }

  async initialize(): Promise<void> {
    return this.client.initialize();
  }

  async cleanup(): Promise<void> {
    return this.client.cleanup();
  }

  async writeBatch(
    entries: Array<{ key: string; data: Buffer }>,
  ): Promise<void> {
    return this.client.writeBatch(entries);
  }

  async readBatch(keys: string[]): Promise<Array<Buffer | null>> {
    return this.client.readBatch(keys);
  }

  async deleteBatch(keys: string[]): Promise<void> {
    return this.client.deleteBatch(keys);
  }
}

/**
 * Helper function to add monitoring to any storage client
 */
export function withMonitoring(client: IStorageClient): MonitoredStorageClient {
  return new MonitoredStorageClient(client);
}
