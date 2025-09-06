import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";

import { BaseStorageClient } from "./IStorageClient";

export class FileSystemClient extends BaseStorageClient {
  private basePath: string;

  constructor(basePath?: string) {
    super();
    this.basePath = basePath || this.getDefaultBasePath();
  }

  private getDefaultBasePath(): string {
    const platform = process.platform;
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";

    switch (platform) {
      case "darwin":
        return path.join(
          homeDir,
          "Library",
          "Application Support",
          "Atomiton",
          "storage",
        );
      case "win32":
        return path.join(process.env.APPDATA || homeDir, "Atomiton", "storage");
      default:
        return path.join(homeDir, ".config", "atomiton", "storage");
    }
  }

  private getFilePath(key: string): string {
    const safeKey = this.sanitizeKey(key);
    return path.join(this.basePath, safeKey);
  }

  private sanitizeKey(key: string): string {
    let safe = key.replace(/[<>:"|?*/\\]/g, "_");

    if (safe.length > 200) {
      const hash = crypto.createHash("sha256").update(key).digest("hex");
      safe = `${safe.substring(0, 150)}_${hash.substring(0, 8)}`;
    }

    return safe + ".dat";
  }

  async read(key: string): Promise<Buffer | null> {
    this.validateKey(key);
    const filePath = this.getFilePath(key);

    try {
      const data = await fs.readFile(filePath);
      return Buffer.from(data);
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return null;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read key ${key}: ${message}`);
    }
  }

  async write(key: string, data: Buffer): Promise<void> {
    this.validateKey(key);
    this.validateData(data);

    const filePath = this.getFilePath(key);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });

    const tempPath = `${filePath}.tmp`;
    try {
      await fs.writeFile(tempPath, data);
      await fs.rename(tempPath, filePath);
    } catch (error) {
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore temp file cleanup errors
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to write key ${key}: ${message}`);
    }
  }

  async delete(key: string): Promise<void> {
    this.validateKey(key);
    const filePath = this.getFilePath(key);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code !== "ENOENT"
      ) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to delete key ${key}: ${message}`);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    this.validateKey(key);
    const filePath = this.getFilePath(key);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      // File doesn't exist or not accessible
      return false;
    }
  }

  async list(prefix?: string): Promise<string[]> {
    try {
      const files = await fs.readdir(this.basePath);
      const keys: string[] = [];

      for (const file of files) {
        if (file.endsWith(".dat")) {
          const key = file.slice(0, -4);

          const originalKey = key.replace(/_/g, "/");

          if (!prefix || originalKey.startsWith(prefix)) {
            keys.push(originalKey);
          }
        }
      }

      return keys;
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return [];
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list keys: ${message}`);
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.basePath);

      for (const file of files) {
        if (file.endsWith(".dat")) {
          const filePath = path.join(this.basePath, file);
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code !== "ENOENT"
      ) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to clear storage: ${message}`);
      }
    }
  }

  async getSize(key: string): Promise<number> {
    this.validateKey(key);
    const filePath = this.getFilePath(key);

    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return 0;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get size for key ${key}: ${message}`);
    }
  }

  async getTotalSize(): Promise<number> {
    try {
      const files = await fs.readdir(this.basePath);
      let totalSize = 0;

      for (const file of files) {
        if (file.endsWith(".dat")) {
          const filePath = path.join(this.basePath, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return 0;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to calculate total size: ${message}`);
    }
  }

  protected async onInitialize(): Promise<void> {
    // Ensure base directory exists
    await fs.mkdir(this.basePath, { recursive: true });
  }

  protected async onCleanup(): Promise<void> {
    // No cleanup needed for FileSystemClient
  }

  async getMetadata(
    key: string,
  ): Promise<{ created: Date; modified: Date; size: number } | null> {
    this.validateKey(key);
    const filePath = this.getFilePath(key);

    try {
      const stats = await fs.stat(filePath);
      return {
        created: stats.birthtime,
        modified: stats.mtime,
        size: stats.size,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return null;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get metadata for key ${key}: ${message}`);
    }
  }

  async backup(backupPath: string): Promise<void> {
    const files = await fs.readdir(this.basePath);
    await fs.mkdir(backupPath, { recursive: true });

    for (const file of files) {
      if (file.endsWith(".dat")) {
        const sourcePath = path.join(this.basePath, file);
        const destPath = path.join(backupPath, file);
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }

  async restore(backupPath: string): Promise<void> {
    const files = await fs.readdir(backupPath);
    await fs.mkdir(this.basePath, { recursive: true });

    for (const file of files) {
      if (file.endsWith(".dat")) {
        const sourcePath = path.join(backupPath, file);
        const destPath = path.join(this.basePath, file);
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }
}
