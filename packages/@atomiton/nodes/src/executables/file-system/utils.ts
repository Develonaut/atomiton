/**
 * File System Utilities
 * Common utilities for file system operations
 */

import * as fs from "fs/promises";

// Types for file system operations
export type FileSystemOutput = {
  result: unknown;
  content?: string;
  files?: string[];
  exists?: boolean;
  success: boolean;
  path: string;
  size?: number;
  modified?: string;
  isDirectory?: boolean;
  isFile?: boolean;
};

export type PathStats = {
  exists: boolean;
  isDirectory?: boolean;
  isFile?: boolean;
  size?: number;
  modified?: string;
};

/**
 * Check if path exists
 */
export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file/directory stats
 */
export async function getPathStats(filePath: string): Promise<PathStats> {
  try {
    const stats = await fs.stat(filePath);
    return {
      exists: true,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      size: stats.size,
      modified: stats.mtime.toISOString(),
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Delete operation (file or directory)
 */
export async function deleteOperation(
  targetPath: string,
  recursive: boolean,
): Promise<void> {
  const stats = await getPathStats(targetPath);

  if (!stats.exists) {
    throw new Error(`Path does not exist: ${targetPath}`);
  }

  if (stats.isDirectory) {
    await fs.rm(targetPath, { recursive, force: true });
  } else {
    await fs.unlink(targetPath);
  }
}

/**
 * Move/rename operation
 */
export async function moveOperation(
  sourcePath: string,
  destPath: string,
  overwrite: boolean,
): Promise<void> {
  const sourceStats = await getPathStats(sourcePath);

  if (!sourceStats.exists) {
    throw new Error(`Source does not exist: ${sourcePath}`);
  }

  // Check destination
  const destStats = await getPathStats(destPath);
  if (destStats.exists && !overwrite) {
    throw new Error(`Destination already exists: ${destPath}`);
  }

  await fs.rename(sourcePath, destPath);
}

/**
 * Check if path exists
 */
export async function existsOperation(targetPath: string): Promise<boolean> {
  return pathExists(targetPath);
}
