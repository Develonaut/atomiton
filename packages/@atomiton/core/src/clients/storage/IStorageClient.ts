/**
 * Low-level storage client interface
 * Handles raw buffer operations for platform-specific storage
 */
export interface IStorageClient {
  /**
   * Read raw data from storage
   */
  read(key: string): Promise<Buffer | null>;

  /**
   * Write raw data to storage
   */
  write(key: string, data: Buffer): Promise<void>;

  /**
   * Delete data from storage
   */
  delete(key: string): Promise<void>;

  /**
   * Check if key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * List keys with optional prefix
   */
  list(prefix?: string): Promise<string[]>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Initialize the storage client
   */
  initialize(): Promise<void>;

  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;
  /**
   * Batch write multiple key-value pairs
   * @param entries Array of key-value pairs to write
   */
  writeBatch(entries: Array<{ key: string; data: Buffer }>): Promise<void>;
  /**
   * Batch read multiple keys
   * @param keys Array of keys to read
   * @returns Array of buffers or null for each key
   */
  readBatch(keys: string[]): Promise<Array<Buffer | null>>;
  /**
   * Batch delete multiple keys
   * @param keys Array of keys to delete
   */
  deleteBatch(keys: string[]): Promise<void>;

  /**
   * Get storage size for a key (in bytes)
   */
  getSize(key: string): Promise<number>;

  /**
   * Get total storage size (in bytes)
   */
  getTotalSize(): Promise<number>;
}

/**
 * Base abstract class for storage clients
 */
export abstract class BaseStorageClient implements IStorageClient {
  protected initialized = false;

  abstract read(key: string): Promise<Buffer | null>;
  abstract write(key: string, data: Buffer): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract list(prefix?: string): Promise<string[]>;
  abstract clear(): Promise<void>;
  abstract getSize(key: string): Promise<number>;
  abstract getTotalSize(): Promise<number>;

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
    await this.onCleanup();
    this.initialized = false;
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onCleanup(): Promise<void>;

  protected validateKey(key: string): void {
    if (!key || typeof key !== "string") {
      throw new Error("Storage key must be a non-empty string");
    }
    if (key.length > 255) {
      throw new Error("Storage key must not exceed 255 characters");
    }
  }

  protected validateData(data: Buffer): void {
    if (!Buffer.isBuffer(data)) {
      throw new Error("Data must be a Buffer");
    }
  }

  /**
   * Default batch implementations - can be overridden for performance
   */
  async writeBatch(
    entries: Array<{ key: string; data: Buffer }>,
  ): Promise<void> {
    await Promise.all(entries.map(({ key, data }) => this.write(key, data)));
  }

  async readBatch(keys: string[]): Promise<Array<Buffer | null>> {
    return Promise.all(keys.map((key) => this.read(key)));
  }

  async deleteBatch(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.delete(key)));
  }
}
