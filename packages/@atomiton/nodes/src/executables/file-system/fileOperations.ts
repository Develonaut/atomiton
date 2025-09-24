/**
 * File Operations
 * Read, write, and file-specific operations
 */

import type { NodeExecutionContext } from "#core/types/executable";
import * as fs from "fs/promises";
import * as path from "path";
import { getPathStats } from "#executables/file-system/utils";

/**
 * Read file operation
 */
export async function readFileOperation(
  filePath: string,
  encoding: string,
  context: NodeExecutionContext,
): Promise<{
  result: unknown;
  content?: string;
  success: boolean;
  path: string;
  size?: number;
  modified?: string;
}> {
  try {
    const stats = await getPathStats(filePath);

    if (!stats.exists) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    if (!stats.isFile) {
      throw new Error(`Path is not a file: ${filePath}`);
    }

    const content = await fs.readFile(filePath, encoding as BufferEncoding);

    context.log?.info?.(`Read file: ${filePath}`, {
      size: stats.size,
      encoding,
    });

    return {
      result: content,
      content,
      success: true,
      path: filePath,
      size: stats.size,
      modified: stats.modified,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to read file: ${filePath}`, {
      error: errorMessage,
    });
    throw new Error(`Read operation failed: ${errorMessage}`);
  }
}

/**
 * Write file operation
 */
export async function writeFileOperation(
  filePath: string,
  content: string,
  encoding: string,
  createDirs: boolean,
  context: NodeExecutionContext,
): Promise<{
  result: unknown;
  success: boolean;
  path: string;
  size?: number;
}> {
  try {
    // Create directory if needed
    if (createDirs) {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(filePath, content, encoding as BufferEncoding);

    const stats = await fs.stat(filePath);

    context.log?.info?.(`Wrote file: ${filePath}`, {
      size: stats.size,
      encoding,
      createDirs,
    });

    return {
      result: `File written: ${filePath}`,
      success: true,
      path: filePath,
      size: stats.size,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to write file: ${filePath}`, {
      error: errorMessage,
    });
    throw new Error(`Write operation failed: ${errorMessage}`);
  }
}

/**
 * Copy file operation
 */
export async function copyFileOperation(
  sourcePath: string,
  destPath: string,
  overwrite: boolean,
  context: NodeExecutionContext,
): Promise<{
  result: unknown;
  success: boolean;
  path: string;
  sourcePath: string;
  destPath: string;
}> {
  try {
    const sourceStats = await getPathStats(sourcePath);

    if (!sourceStats.exists) {
      throw new Error(`Source does not exist: ${sourcePath}`);
    }

    if (!sourceStats.isFile) {
      throw new Error(`Source is not a file: ${sourcePath}`);
    }

    // Check if destination exists
    const destStats = await getPathStats(destPath);
    if (destStats.exists && !overwrite) {
      throw new Error(`Destination already exists: ${destPath}`);
    }

    // Create destination directory if needed
    const destDir = path.dirname(destPath);
    await fs.mkdir(destDir, { recursive: true });

    // Copy the file
    await fs.copyFile(sourcePath, destPath);

    context.log?.info?.(`Copied file from ${sourcePath} to ${destPath}`);

    return {
      result: `File copied from ${sourcePath} to ${destPath}`,
      success: true,
      path: destPath,
      sourcePath,
      destPath,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to copy from ${sourcePath} to ${destPath}`, {
      error: errorMessage,
    });
    throw new Error(`Copy operation failed: ${errorMessage}`);
  }
}
