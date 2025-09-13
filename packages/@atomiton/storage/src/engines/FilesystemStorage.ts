import type { CompositeNodeDefinition } from "@atomiton/nodes";
import { nodes } from "@atomiton/nodes";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import {
  StorageError,
  type IStorageEngine,
  type Platform,
  type StorageInfo,
  type StorageItem,
  type StorageOptions,
} from "../types";

/**
 * Filesystem storage engine for desktop environments
 * Stores data as YAML files in local filesystem
 */
export class FileSystemStorage implements IStorageEngine {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(os.homedir(), "Atomiton");
  }

  /**
   * Save data to filesystem
   */
  async save(
    key: string,
    data: unknown,
    options?: StorageOptions,
  ): Promise<void> {
    try {
      await this.ensureDirectory(key);

      // Add/update metadata if it's a Composite
      if (this.isCompositeData(data)) {
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
      let content: string;

      if (format === "yaml") {
        content = nodes.composite.toYaml(data as CompositeNodeDefinition);
      } else {
        const jsonData = nodes.composite.toJson(
          data as CompositeNodeDefinition,
        );
        content = JSON.stringify(jsonData, null, 2);
      }

      const filepath = this.getFilePath(key, format);
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

  /**
   * Load data from filesystem
   */
  async load(key: string): Promise<unknown> {
    try {
      // Try YAML first, then JSON
      const yamlPath = this.getFilePath(key, "yaml");
      const jsonPath = this.getFilePath(key, "json");

      let filepath: string;
      let format: "yaml" | "json";

      if (await this.fileExists(yamlPath)) {
        filepath = yamlPath;
        format = "yaml";
      } else if (await this.fileExists(jsonPath)) {
        filepath = jsonPath;
        format = "json";
      } else {
        throw new StorageError(
          `Data not found: ${key}`,
          "NOT_FOUND",
          undefined,
          { key, operation: "load" },
        );
      }

      const content = await fs.readFile(filepath, "utf-8");
      if (format === "yaml") {
        return await nodes.composite.fromYaml(content);
      } else {
        const jsonData = JSON.parse(content);
        return nodes.composite.fromJson(jsonData);
      }
    } catch (error) {
      if (error instanceof StorageError) throw error;

      throw new StorageError(
        `Failed to load data: ${key}`,
        "SERIALIZATION_ERROR",
        error instanceof Error ? error : new Error(String(error)),
        { key, operation: "load" },
      );
    }
  }

  /**
   * List all stored items with metadata
   */
  async list(prefix?: string): Promise<StorageItem[]> {
    try {
      const searchDir = prefix ? path.join(this.baseDir, prefix) : this.baseDir;

      if (!(await this.fileExists(searchDir))) {
        return [];
      }

      const items: StorageItem[] = [];
      await this.walkDirectory(searchDir, items, prefix);

      return items.sort((a, b) => b.updated.localeCompare(a.updated));
    } catch (error) {
      throw new StorageError(
        "Failed to list data",
        "ACCESS_DENIED",
        error instanceof Error ? error : new Error(String(error)),
        { operation: "list", prefix },
      );
    }
  }

  /**
   * Delete data from filesystem
   */
  async delete(key: string): Promise<void> {
    try {
      const yamlPath = this.getFilePath(key, "yaml");
      const jsonPath = this.getFilePath(key, "json");

      const yamlExists = await this.fileExists(yamlPath);
      const jsonExists = await this.fileExists(jsonPath);

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
  }

  /**
   * Check if data exists
   */
  async exists(key: string): Promise<boolean> {
    const yamlPath = this.getFilePath(key, "yaml");
    const jsonPath = this.getFilePath(key, "json");

    return (
      (await this.fileExists(yamlPath)) || (await this.fileExists(jsonPath))
    );
  }

  /**
   * Get storage engine info
   */
  getInfo(): StorageInfo {
    return {
      type: "filesystem",
      platform: "desktop" as Platform,
      connected: true,
      limits: {
        // No specific limits for filesystem storage
      },
    };
  }

  /**
   * Get full file path for key and format
   */
  private getFilePath(key: string, format: "yaml" | "json"): string {
    const extension = format === "yaml" ? ".composite.yaml" : ".composite.json";
    return path.join(this.baseDir, `${key}${extension}`);
  }

  /**
   * Check if file exists
   */
  private async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure directory exists for the given key
   */
  private async ensureDirectory(key: string): Promise<void> {
    const filepath = this.getFilePath(key, "yaml");
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
  }

  /**
   * Recursively walk directory to find all storage items
   */
  private async walkDirectory(
    dir: string,
    items: StorageItem[],
    prefix?: string,
  ): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.walkDirectory(fullPath, items, prefix);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".composite.yaml") ||
          entry.name.endsWith(".composite.json"))
      ) {
        try {
          const stats = await fs.stat(fullPath);
          const relativePath = path.relative(this.baseDir, fullPath);
          const key = this.extractKeyFromPath(relativePath);

          // Try to extract metadata from file
          let name = key;
          let metadata: Record<string, unknown> = {};

          try {
            const content = await fs.readFile(fullPath, "utf-8");
            const data = entry.name.endsWith(".yaml")
              ? await nodes.composite.fromYaml(content)
              : nodes.composite.fromJson(JSON.parse(content));

            if (this.isCompositeData(data)) {
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

  /**
   * Extract key from file path
   */
  private extractKeyFromPath(relativePath: string): string {
    return relativePath
      .replace(/\.composite\.(yaml|json)$/, "")
      .replace(/\\/g, "/"); // Normalize path separators
  }

  /**
   * Check if data looks like Composite data
   */
  private isCompositeData(data: unknown): data is CompositeNodeDefinition {
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
  }
}
