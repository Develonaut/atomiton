import { BaseStorageClient } from "./IStorageClient";

/**
 * In-memory storage client for testing and development
 */
export class MemoryClient extends BaseStorageClient {
  private storage: Map<string, Buffer>;
  private metadata: Map<
    string,
    { size: number; created: number; modified: number }
  >;

  constructor() {
    super();
    this.storage = new Map();
    this.metadata = new Map();
  }

  async read(key: string): Promise<Buffer | null> {
    this.validateKey(key);
    const data = this.storage.get(key);
    return data ? Buffer.from(data) : null;
  }

  async write(key: string, data: Buffer): Promise<void> {
    this.validateKey(key);
    this.validateData(data);

    const now = Date.now();
    const exists = this.storage.has(key);

    this.storage.set(key, Buffer.from(data));
    this.metadata.set(key, {
      size: data.length,
      created: exists ? this.metadata.get(key)!.created : now,
      modified: now,
    });
  }

  async delete(key: string): Promise<void> {
    this.validateKey(key);
    this.storage.delete(key);
    this.metadata.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    this.validateKey(key);
    return this.storage.has(key);
  }

  async list(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.storage.keys());
    if (!prefix) {
      return keys;
    }
    return keys.filter((key) => key.startsWith(prefix));
  }

  async clear(): Promise<void> {
    this.storage.clear();
    this.metadata.clear();
  }

  async getSize(key: string): Promise<number> {
    this.validateKey(key);
    const meta = this.metadata.get(key);
    return meta ? meta.size : 0;
  }

  async getTotalSize(): Promise<number> {
    let total = 0;
    for (const meta of this.metadata.values()) {
      total += meta.size;
    }
    return total;
  }

  protected async onInitialize(): Promise<void> {
    // Memory client doesn't need initialization
  }

  protected async onCleanup(): Promise<void> {
    this.clear();
  }

  // Testing utilities
  getStats(): { entries: number; totalSize: number; keys: string[] } {
    return {
      entries: this.storage.size,
      totalSize: Array.from(this.metadata.values()).reduce(
        (sum, m) => sum + m.size,
        0,
      ),
      keys: Array.from(this.storage.keys()),
    };
  }
}
