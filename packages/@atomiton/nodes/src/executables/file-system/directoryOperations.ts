/**
 * Directory Operations
 * Directory creation, listing, and management
 */

import type { NodeExecutionContext } from "#core/types/executable";
import * as fs from "fs/promises";
import * as path from "path";
import { getPathStats } from "./utils";

/**
 * Create directory operation
 */
export async function createDirectoryOperation(
  dirPath: string,
  recursive: boolean,
  context: NodeExecutionContext
): Promise<{
  result: unknown;
  success: boolean;
  path: string;
  created: boolean;
}> {
  try {
    const stats = await getPathStats(dirPath);

    if (stats.exists && stats.isDirectory) {
      context.log?.info?.(`Directory already exists: ${dirPath}`);
      return {
        result : `Directory already exists: ${dirPath}`,
        success: true,
        path   : dirPath,
        created: false,
      };
    }

    await fs.mkdir(dirPath, { recursive });

    context.log?.info?.(`Created directory: ${dirPath}`, { recursive });

    return {
      result : `Directory created: ${dirPath}`,
      success: true,
      path   : dirPath,
      created: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to create directory: ${dirPath}`, {
      error: errorMessage,
    });
    throw new Error(`Create directory failed: ${errorMessage}`);
  }
}

/**
 * List directory operation
 */
export async function listDirectoryOperation(
  dirPath: string,
  recursive: boolean,
  includeHidden: boolean,
  context: NodeExecutionContext
): Promise<{
  result: unknown;
  files?: string[];
  success: boolean;
  path: string;
  count?: number;
}> {
  try {
    const stats = await getPathStats(dirPath);

    if (!stats.exists) {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }

    if (!stats.isDirectory) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }

    let files: string[] = [];

    if (recursive) {
      // Recursive directory listing
      async function* walkDir(dir: string): AsyncGenerator<string> {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          if (!includeHidden && item.name.startsWith(".")) continue;

          const fullPath = path.join(dir, item.name);
          yield fullPath;

          if (item.isDirectory()) {
            yield* walkDir(fullPath);
          }
        }
      }

      for await (const file of walkDir(dirPath)) {
        files.push(file);
      }
    } else {
      // Non-recursive listing
      const items = await fs.readdir(dirPath);
      files = includeHidden
        ? items.map((item) => path.join(dirPath, item))
        : items
            .filter((item) => !item.startsWith("."))
            .map((item) => path.join(dirPath, item));
    }

    context.log?.info?.(`Listed directory: ${dirPath}`, {
      fileCount: files.length,
      recursive,
      includeHidden,
    });

    return {
      result : files,
      files,
      success: true,
      path   : dirPath,
      count  : files.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to list directory: ${dirPath}`, {
      error: errorMessage,
    });
    throw new Error(`List directory failed: ${errorMessage}`);
  }
}

/**
 * Copy directory operation
 */
export async function copyDirectoryOperation(
  sourcePath: string,
  destPath: string,
  overwrite: boolean,
  context: NodeExecutionContext
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

    if (!sourceStats.isDirectory) {
      throw new Error(`Source is not a directory: ${sourcePath}`);
    }

    // Recursive directory copy
    async function copyDir(src: string, dest: string): Promise<void> {
      await fs.mkdir(dest, { recursive: true });

      const items = await fs.readdir(src, { withFileTypes: true });

      for (const item of items) {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);

        if (item.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else {
          const destExists = await getPathStats(destPath);
          if (!destExists.exists || overwrite) {
            await fs.copyFile(srcPath, destPath);
          }
        }
      }
    }

    await copyDir(sourcePath, destPath);

    context.log?.info?.(`Copied directory from ${sourcePath} to ${destPath}`);

    return {
      result : `Directory copied from ${sourcePath} to ${destPath}`,
      success: true,
      path   : destPath,
      sourcePath,
      destPath,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(
      `Failed to copy directory from ${sourcePath} to ${destPath}`,
      { error: errorMessage }
    );
    throw new Error(`Copy directory failed: ${errorMessage}`);
  }
}
