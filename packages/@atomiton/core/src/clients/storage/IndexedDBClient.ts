import { BaseStorageClient } from "./IStorageClient";

/**
 * IndexedDB storage client for browser environments
 */
export class IndexedDBClient extends BaseStorageClient {
  private db: IDBDatabase | null = null;
  private readonly dbName = "AtomitonStorage";
  private readonly dbVersion = 1;
  private readonly storeName = "keyValueStore";

  async read(key: string): Promise<Buffer | null> {
    this.validateKey(key);
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = (): void => {
        const result = request.result;
        if (result && result.data) {
          // Convert ArrayBuffer to Buffer
          resolve(Buffer.from(result.data));
        } else {
          resolve(null);
        }
      };

      request.onerror = (): void => {
        reject(new Error(`Failed to read key: ${key}`));
      };
    });
  }

  async write(key: string, data: Buffer): Promise<void> {
    this.validateKey(key);
    this.validateData(data);
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      // Convert Buffer to ArrayBuffer for IndexedDB
      const arrayBuffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
      );

      const request = store.put({
        key,
        data: arrayBuffer,
        size: data.length,
        modified: Date.now(),
      });

      request.onsuccess = (): void => resolve();
      request.onerror = (): void => {
        reject(new Error(`Failed to write key: ${key}`));
      };
    });
  }

  async delete(key: string): Promise<void> {
    this.validateKey(key);
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = (): void => resolve();
      request.onerror = (): void => {
        reject(new Error(`Failed to delete key: ${key}`));
      };
    });
  }

  async exists(key: string): Promise<boolean> {
    this.validateKey(key);
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.count(key);

      request.onsuccess = (): void => resolve(request.result > 0);
      request.onerror = (): void => {
        reject(new Error(`Failed to check existence of key: ${key}`));
      };
    });
  }

  async list(prefix?: string): Promise<string[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onsuccess = (): void => {
        let keys = request.result as string[];
        if (prefix) {
          keys = keys.filter((key) => key.startsWith(prefix));
        }
        resolve(keys);
      };

      request.onerror = (): void => {
        reject(new Error("Failed to list keys"));
      };
    });
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = (): void => resolve();
      request.onerror = (): void => {
        reject(new Error("Failed to clear storage"));
      };
    });
  }

  async getSize(key: string): Promise<number> {
    this.validateKey(key);
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = (): void => {
        const result = request.result;
        resolve(result && result.size ? result.size : 0);
      };

      request.onerror = (): void => {
        reject(new Error(`Failed to get size for key: ${key}`));
      };
    });
  }

  async getTotalSize(): Promise<number> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = (): void => {
        const results = request.result;
        const totalSize = results.reduce(
          (sum: number, item: { size?: number }) => {
            return sum + (item.size || 0);
          },
          0,
        );
        resolve(totalSize);
      };

      request.onerror = (): void => {
        reject(new Error("Failed to calculate total size"));
      };
    });
  }

  protected async onInitialize(): Promise<void> {
    if (typeof indexedDB === "undefined") {
      throw new Error("IndexedDB is not available in this environment");
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "key",
          });
          store.createIndex("modified", "modified", { unique: false });
        }
      };

      request.onsuccess = (event: Event): void => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (): void => {
        reject(new Error("Failed to open IndexedDB"));
      };
    });
  }

  protected async onCleanup(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Get quota information (browser-specific)
   */
  async getQuotaInfo(): Promise<{ usage: number; quota: number }> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }
}
