/**
 * File System Operations
 * Main operations module that re-exports all file system operations
 */

// Re-export all operations
export * from "#executables/file-system/directoryOperations";
export * from "#executables/file-system/fileOperations";
export * from "#executables/file-system/utils";

import type { NodeExecutionContext } from "#core/types/executable";
import { copyDirectoryOperation } from "#executables/file-system/directoryOperations";
import { copyFileOperation } from "#executables/file-system/fileOperations";
import {
  deleteOperation as deleteUtil,
  existsOperation as existsUtil,
  getPathStats,
  moveOperation as moveUtil,
} from "#executables/file-system/utils";

/**
 * Delete operation wrapper
 */
export async function deleteOperation(
  targetPath: string,
  recursive: boolean,
  context: NodeExecutionContext,
): Promise<{
  result: unknown;
  success: boolean;
  path: string;
  deleted: boolean;
}> {
  try {
    const stats = await getPathStats(targetPath);

    if (!stats.exists) {
      context.log?.warn?.(`Path does not exist: ${targetPath}`);
      return {
        result: `Path does not exist: ${targetPath}`,
        success: true,
        path: targetPath,
        deleted: false,
      };
    }

    await deleteUtil(targetPath, recursive);

    context.log?.info?.(`Deleted: ${targetPath}`, {
      wasDirectory: stats.isDirectory,
      recursive,
    });

    return {
      result: `Deleted: ${targetPath}`,
      success: true,
      path: targetPath,
      deleted: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to delete: ${targetPath}`, {
      error: errorMessage,
    });
    throw new Error(`Delete operation failed: ${errorMessage}`);
  }
}

/**
 * Move operation wrapper
 */
export async function moveOperation(
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
    await moveUtil(sourcePath, destPath, overwrite);

    context.log?.info?.(`Moved from ${sourcePath} to ${destPath}`);

    return {
      result: `Moved from ${sourcePath} to ${destPath}`,
      success: true,
      path: destPath,
      sourcePath,
      destPath,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to move from ${sourcePath} to ${destPath}`, {
      error: errorMessage,
    });
    throw new Error(`Move operation failed: ${errorMessage}`);
  }
}

/**
 * Exists operation wrapper
 */
export async function existsOperation(
  targetPath: string,
  context: NodeExecutionContext,
): Promise<{
  result: unknown;
  exists: boolean;
  success: boolean;
  path: string;
}> {
  try {
    const exists = await existsUtil(targetPath);
    const stats = exists ? await getPathStats(targetPath) : null;

    context.log?.info?.(`Checked existence: ${targetPath}`, {
      exists,
      isDirectory: stats?.isDirectory,
      isFile: stats?.isFile,
    });

    return {
      result: exists,
      exists,
      success: true,
      path: targetPath,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    context.log?.error?.(`Failed to check existence: ${targetPath}`, {
      error: errorMessage,
    });
    throw new Error(`Exists operation failed: ${errorMessage}`);
  }
}

/**
 * Copy operation wrapper (delegates to file or directory copy)
 */
export async function copyOperation(
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
  // Use the statically imported functions

  const sourceStats = await getPathStats(sourcePath);

  if (!sourceStats.exists) {
    throw new Error(`Source does not exist: ${sourcePath}`);
  }

  if (sourceStats.isDirectory) {
    return copyDirectoryOperation(sourcePath, destPath, overwrite, context);
  } else {
    return copyFileOperation(sourcePath, destPath, overwrite, context);
  }
}
