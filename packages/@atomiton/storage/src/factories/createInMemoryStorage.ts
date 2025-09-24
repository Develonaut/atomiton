import {
  type IStorageEngine,
  type StorageInfo,
  type StorageItem,
  type StorageOptions,
  StorageError,
} from "#types";

export type InMemoryStorageConfig = {
  initialData?: Map<string, unknown>;
};

export function createInMemoryStorage(
  config: InMemoryStorageConfig = {},
): IStorageEngine {
  const data = config.initialData || new Map<string, unknown>();
  const metadata = new Map<string, { created: string; updated: string }>();

  return {
    async save(
      key: string,
      value: unknown,
      _options?: StorageOptions,
    ): Promise<void> {
      const now = new Date().toISOString();
      data.set(key, value);
      metadata.set(key, {
        created: metadata.get(key)?.created || now,
        updated: now,
      });
    },

    async load(key: string): Promise<unknown> {
      if (!data.has(key)) {
        throw new StorageError(
          `Data not found: ${key}`,
          "NOT_FOUND",
          undefined,
          { key, operation: "load" },
        );
      }
      return data.get(key);
    },

    async list(prefix?: string): Promise<StorageItem[]> {
      const items: StorageItem[] = [];

      for (const [key, value] of data.entries()) {
        if (prefix && !key.startsWith(prefix)) continue;

        const meta = metadata.get(key);
        items.push({
          key,
          name: key,
          size: JSON.stringify(value).length,
          created: meta?.created || new Date().toISOString(),
          updated: meta?.updated || new Date().toISOString(),
        });
      }

      return items.sort((a, b) => b.updated.localeCompare(a.updated));
    },

    async delete(key: string): Promise<void> {
      if (!data.has(key)) {
        throw new StorageError(
          `Data not found: ${key}`,
          "NOT_FOUND",
          undefined,
          { key, operation: "delete" },
        );
      }
      data.delete(key);
      metadata.delete(key);
    },

    async exists(key: string): Promise<boolean> {
      return data.has(key);
    },

    getInfo(): StorageInfo {
      return {
        type: "memory",
        platform: "desktop",
        connected: true,
      };
    },
  };
}
