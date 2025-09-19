import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  StorageError,
  type IStorageEngine,
  type StorageInfo,
  type StorageItem,
  type StorageOptions,
} from "../types";

export type FileSystemStorageConfig = {
  baseDir?: string;
};

export function createFileSystemStorage(
  config: FileSystemStorageConfig = {},
): IStorageEngine {
  const baseDir = config.baseDir || path.join(os.homedir(), "Atomiton");

  const getFilePath = (key: string, format: "yaml" | "json"): string => {
    const extension = format === "yaml" ? ".composite.yaml" : ".composite.json";
    return path.join(baseDir, `${key}${extension}`);
  };

  const fileExists = async (filepath: string): Promise<boolean> => {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  };

  const ensureDirectory = async (key: string): Promise<void> => {
    const filepath = getFilePath(key, "yaml");
    const dir = path.dirname(filepath);

    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new StorageError(
        `Failed to create directory for: ${key}`,
        "ACCESS_DENIED",
        error instanceof Error ? error : new Error(String(error)),
        { key, directory: dir },
      );
    }
  };

  const isCompositeData = (
    data: unknown,
  ): data is {
    id: string;
    name: string;
    version: string;
    description?: string;
    metadata?: Record<string, unknown>;
  } => {
    return (
      typeof data === "object" &&
      data !== null &&
      "id" in data &&
      "name" in data &&
      "version" in data &&
      typeof (data as Record<string, unknown>).id === "string" &&
      typeof (data as Record<string, unknown>).name === "string" &&
      typeof (data as Record<string, unknown>).version === "string"
    );
  };

  const extractKeyFromPath = (relativePath: string): string => {
    return relativePath
      .replace(/\.composite\.(yaml|json)$/, "")
      .replace(/\\/g, "/");
  };

  const walkDirectory = async (
    dir: string,
    items: StorageItem[],
    prefix?: string,
  ): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walkDirectory(fullPath, items, prefix);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".composite.yaml") ||
          entry.name.endsWith(".composite.json"))
      ) {
        try {
          const stats = await fs.stat(fullPath);
          const relativePath = path.relative(baseDir, fullPath);
          const key = extractKeyFromPath(relativePath);

          let name = key;
          let metadata: Record<string, unknown> = {};

          try {
            const content = await fs.readFile(fullPath, "utf-8");
            const data = JSON.parse(content);

            if (isCompositeData(data)) {
              name = data.name || key;
              metadata = {
                version: data.version,
                description: data.description,
                ...data.metadata,
              };
            }
          } catch {
            // Skip metadata extraction if file can't be parsed
          }

          items.push({
            key,
            name,
            size: stats.size,
            created: stats.birthtime.toISOString(),
            updated: stats.mtime.toISOString(),
            metadata,
          });
        } catch {
          // Skip files that can't be processed
        }
      }
    }
  };

  return {
    async save(
      key: string,
      data: unknown,
      options?: StorageOptions,
    ): Promise<void> {
      try {
        await ensureDirectory(key);

        if (isCompositeData(data)) {
          const now = new Date().toISOString();
          data = {
            ...data,
            metadata: {
              ...data.metadata,
              updated: now,
              created: data.metadata?.created || now,
              ...options?.metadata,
            },
          };
        }

        const format = options?.format || "yaml";
        const content = JSON.stringify(data, null, 2);
        const filepath = getFilePath(key, format);
        await fs.writeFile(filepath, content, "utf-8");
      } catch (error) {
        throw new StorageError(
          `Failed to save data: ${key}`,
          "SERIALIZATION_ERROR",
          error instanceof Error ? error : new Error(String(error)),
          { key, operation: "save" },
        );
      }
    },

    async load(key: string): Promise<unknown> {
      try {
        const yamlPath = getFilePath(key, "yaml");
        const jsonPath = getFilePath(key, "json");

        let filepath: string;

        if (await fileExists(yamlPath)) {
          filepath = yamlPath;
        } else if (await fileExists(jsonPath)) {
          filepath = jsonPath;
        } else {
          throw new StorageError(
            `Data not found: ${key}`,
            "NOT_FOUND",
            undefined,
            { key, operation: "load" },
          );
        }

        const content = await fs.readFile(filepath, "utf-8");
        return JSON.parse(content);
      } catch (error) {
        if (error instanceof StorageError) throw error;

        throw new StorageError(
          `Failed to load data: ${key}`,
          "SERIALIZATION_ERROR",
          error instanceof Error ? error : new Error(String(error)),
          { key, operation: "load" },
        );
      }
    },

    async list(prefix?: string): Promise<StorageItem[]> {
      try {
        const searchDir = prefix ? path.join(baseDir, prefix) : baseDir;

        if (!(await fileExists(searchDir))) {
          return [];
        }

        const items: StorageItem[] = [];
        await walkDirectory(searchDir, items, prefix);

        return items.sort((a, b) => b.updated.localeCompare(a.updated));
      } catch (error) {
        throw new StorageError(
          "Failed to list data",
          "ACCESS_DENIED",
          error instanceof Error ? error : new Error(String(error)),
          { operation: "list", prefix },
        );
      }
    },

    async delete(key: string): Promise<void> {
      try {
        const yamlPath = getFilePath(key, "yaml");
        const jsonPath = getFilePath(key, "json");

        const yamlExists = await fileExists(yamlPath);
        const jsonExists = await fileExists(jsonPath);

        if (!yamlExists && !jsonExists) {
          throw new StorageError(
            `Data not found: ${key}`,
            "NOT_FOUND",
            undefined,
            { key, operation: "delete" },
          );
        }

        if (yamlExists) await fs.unlink(yamlPath);
        if (jsonExists) await fs.unlink(jsonPath);
      } catch (error) {
        if (error instanceof StorageError) throw error;

        throw new StorageError(
          `Failed to delete data: ${key}`,
          "ACCESS_DENIED",
          error instanceof Error ? error : new Error(String(error)),
          { key, operation: "delete" },
        );
      }
    },

    async exists(key: string): Promise<boolean> {
      const yamlPath = getFilePath(key, "yaml");
      const jsonPath = getFilePath(key, "json");

      return (await fileExists(yamlPath)) || (await fileExists(jsonPath));
    },

    getInfo(): StorageInfo {
      return {
        type: "filesystem",
        platform: "desktop",
        connected: true,
        limits: {},
      };
    },
  };
}
