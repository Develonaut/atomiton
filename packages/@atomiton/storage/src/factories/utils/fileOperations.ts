import * as fs from "fs/promises";
import * as path from "path";
import { StorageError, type StorageItem } from "../../types";
import { fileExists, extractKeyFromPath } from "./fileUtils";
import { isCompositeData } from "./dataValidation";

export async function writeDataToFile(
  filepath: string,
  data: unknown,
  key: string,
): Promise<void> {
  try {
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filepath, content, "utf-8");
  } catch (error) {
    throw new StorageError(
      `Failed to save data: ${key}`,
      "SERIALIZATION_ERROR",
      error instanceof Error ? error : new Error(String(error)),
      { key, operation: "save" },
    );
  }
}

export async function readDataFromFile(
  filepath: string,
  key: string,
): Promise<unknown> {
  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new StorageError(
      `Failed to load data: ${key}`,
      "SERIALIZATION_ERROR",
      error instanceof Error ? error : new Error(String(error)),
      { key, operation: "load" },
    );
  }
}

export async function findExistingFile(
  key: string,
  yamlPath: string,
  jsonPath: string,
): Promise<string> {
  if (await fileExists(yamlPath)) {
    return yamlPath;
  } else if (await fileExists(jsonPath)) {
    return jsonPath;
  } else {
    throw new StorageError(`Data not found: ${key}`, "NOT_FOUND", undefined, {
      key,
      operation: "load",
    });
  }
}

export async function deleteExistingFiles(
  key: string,
  yamlPath: string,
  jsonPath: string,
): Promise<void> {
  const yamlExists = await fileExists(yamlPath);
  const jsonExists = await fileExists(jsonPath);

  if (!yamlExists && !jsonExists) {
    throw new StorageError(`Data not found: ${key}`, "NOT_FOUND", undefined, {
      key,
      operation: "delete",
    });
  }

  try {
    if (yamlExists) await fs.unlink(yamlPath);
    if (jsonExists) await fs.unlink(jsonPath);
  } catch (error) {
    throw new StorageError(
      `Failed to delete data: ${key}`,
      "ACCESS_DENIED",
      error instanceof Error ? error : new Error(String(error)),
      { key, operation: "delete" },
    );
  }
}

export async function walkDirectory(
  baseDir: string,
  dir: string,
  items: StorageItem[],
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(baseDir, fullPath, items);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".composite.yaml") ||
        entry.name.endsWith(".composite.json"))
    ) {
      try {
        const stats = await fs.stat(fullPath);
        const key = extractKeyFromPath(baseDir, fullPath);

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
}
