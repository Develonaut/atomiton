import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { StorageError } from "#types";

export function createBaseDir(baseDir?: string): string {
  return baseDir || path.join(os.homedir(), "Atomiton");
}

export function getFilePath(
  baseDir: string,
  key: string,
  format: "yaml" | "json",
): string {
  const extension = format === "yaml" ? ".composite.yaml" : ".composite.json";
  return path.join(baseDir, `${key}${extension}`);
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDirectory(
  filepath: string,
  key: string,
): Promise<void> {
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

export function extractKeyFromPath(baseDir: string, fullPath: string): string {
  const relativePath = path.relative(baseDir, fullPath);
  return relativePath
    .replace(/\.composite\.(yaml|json)$/, "")
    .replace(/\\/g, "/");
}
