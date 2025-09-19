import {
  type IStorageEngine,
  type StorageInfo,
  type StorageItem,
  type StorageOptions,
  StorageError,
} from "../types";

export class InMemoryStorage implements IStorageEngine {
  private data = new Map<string, unknown>();
  private metadata = new Map<string, { created: string; updated: string }>();

  async save(
    key: string,
    data: unknown,
    _options?: StorageOptions,
  ): Promise<void> {
    const now = new Date().toISOString();
    this.data.set(key, data);
    this.metadata.set(key, {
      created: this.metadata.get(key)?.created || now,
      updated: now,
    });
  }

  async load(key: string): Promise<unknown> {
    if (!this.data.has(key)) {
      throw new StorageError(`Data not found: ${key}`, "NOT_FOUND", undefined, {
        key,
        operation: "load",
      });
    }
    return this.data.get(key);
  }

  async list(prefix?: string): Promise<StorageItem[]> {
    const items: StorageItem[] = [];

    for (const [key, data] of this.data.entries()) {
      if (prefix && !key.startsWith(prefix)) continue;

      const meta = this.metadata.get(key);
      items.push({
        key,
        name: key,
        size: JSON.stringify(data).length,
        created: meta?.created || new Date().toISOString(),
        updated: meta?.updated || new Date().toISOString(),
      });
    }

    return items.sort((a, b) => b.updated.localeCompare(a.updated));
  }

  async delete(key: string): Promise<void> {
    if (!this.data.has(key)) {
      throw new StorageError(`Data not found: ${key}`, "NOT_FOUND", undefined, {
        key,
        operation: "delete",
      });
    }
    this.data.delete(key);
    this.metadata.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.data.has(key);
  }

  getInfo(): StorageInfo {
    return {
      type: "memory",
      platform: "desktop",
      connected: true,
    };
  }
}
