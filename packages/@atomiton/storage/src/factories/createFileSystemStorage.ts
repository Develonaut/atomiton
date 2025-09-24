import * as path from "path";
import {
  StorageError,
  type IStorageEngine,
  type StorageInfo,
  type StorageItem,
  type StorageOptions,
} from "#types";
import {
  createBaseDir,
  getFilePath,
  fileExists,
  ensureDirectory,
} from "#factories/utils/fileUtils";
import { isCompositeData, addTimestampMetadata } from "#factories/utils/dataValidation";
import {
  writeDataToFile,
  readDataFromFile,
  findExistingFile,
  deleteExistingFiles,
  walkDirectory,
} from "#factories/utils/fileOperations";

export type FileSystemStorageConfig = {
  baseDir?: string;
};

export function createFileSystemStorage(
  config: FileSystemStorageConfig = {},
): IStorageEngine {
  const baseDir = createBaseDir(config.baseDir);

  return {
    async save(
      key: string,
      data: unknown,
      options?: StorageOptions,
    ): Promise<void> {
      const format = options?.format || "yaml";
      const filepath = getFilePath(baseDir, key, format);

      await ensureDirectory(filepath, key);

      let processedData = data;
      if (isCompositeData(data)) {
        processedData = addTimestampMetadata(data, options?.metadata);
      }

      await writeDataToFile(filepath, processedData, key);
    },

    async load(key: string): Promise<unknown> {
      const yamlPath = getFilePath(baseDir, key, "yaml");
      const jsonPath = getFilePath(baseDir, key, "json");

      const filepath = await findExistingFile(key, yamlPath, jsonPath);
      return readDataFromFile(filepath, key);
    },

    async list(prefix?: string): Promise<StorageItem[]> {
      try {
        const searchDir = prefix ? path.join(baseDir, prefix) : baseDir;

        if (!(await fileExists(searchDir))) {
          return [];
        }

        const items: StorageItem[] = [];
        await walkDirectory(baseDir, searchDir, items);

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
      const yamlPath = getFilePath(baseDir, key, "yaml");
      const jsonPath = getFilePath(baseDir, key, "json");

      await deleteExistingFiles(key, yamlPath, jsonPath);
    },

    async exists(key: string): Promise<boolean> {
      const yamlPath = getFilePath(baseDir, key, "yaml");
      const jsonPath = getFilePath(baseDir, key, "json");

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
