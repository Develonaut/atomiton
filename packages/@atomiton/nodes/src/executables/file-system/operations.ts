/**
 * File System Operations
 * Extracted operations for file system executable
 */

import type { NodeExecutionContext } from "#core/types/executable";
import type { FileSystemParameters } from "#definitions/file-system";
import * as fs from "fs/promises";
import * as path from "path";

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

type PathStats = {
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
 * Read file operation
 */
export async function readFileOperation(
  filePath: string,
  encoding: string,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    const stats = await getPathStats(filePath);

    if (!stats.exists) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    if (!stats.isFile) {
      throw new Error(`Path is not a file: ${filePath}`);
    }

    const content = await fs.readFile(filePath, encoding as BufferEncoding);

    context.log?.info?.(`Successfully read file: ${filePath}`, {
      size: stats.size,
      encoding,
    });

    return {
      result: content,
      content,
      path: filePath,
      success: true,
      ...stats,
    };
  } catch (error) {
    throw new Error(
      `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Write file operation
 */
export async function writeFileOperation(
  filePath: string,
  content: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    // Create directory if needed
    if (config.createDirectories) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
    }

    // Write the file
    const encoding = (config.encoding || "utf8") as BufferEncoding;
    await fs.writeFile(filePath, content, { encoding });

    const stats = await getPathStats(filePath);

    context.log?.info?.(`Successfully wrote file: ${filePath}`, {
      size: stats.size,
      encoding,
    });

    return {
      result: filePath,
      path: filePath,
      success: true,
      ...stats,
    };
  } catch (error) {
    throw new Error(
      `Failed to write file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Create directory operation
 */
export async function createDirectoryOperation(
  dirPath: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    await fs.mkdir(dirPath, {
      recursive: config.recursive || false,
    });

    const stats = await getPathStats(dirPath);

    context.log?.info?.(`Successfully created directory: ${dirPath}`);

    return {
      result: dirPath,
      path: dirPath,
      success: true,
      ...stats,
    };
  } catch (error) {
    throw new Error(
      `Failed to create directory: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * List directory operation
 */
export async function listDirectoryOperation(
  dirPath: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    const stats = await getPathStats(dirPath);

    if (!stats.exists) {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }

    if (!stats.isDirectory) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }

    const entries = await fs.readdir(dirPath);

    // Apply filters if specified
    let files = entries;

    if (config.fileFilter) {
      const pattern = new RegExp(config.fileFilter as string);
      files = files.filter((file) => pattern.test(file));
    }

    // Get full paths if requested
    if (config.fullPaths) {
      files = files.map((file) => path.join(dirPath, file));
    }

    context.log?.info?.(`Listed directory: ${dirPath}`, {
      fileCount: files.length,
    });

    return {
      result: files,
      files,
      path: dirPath,
      success: true,
      ...stats,
    };
  } catch (error) {
    throw new Error(
      `Failed to list directory: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Delete operation
 */
export async function deleteOperation(
  targetPath: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    const stats = await getPathStats(targetPath);

    if (!stats.exists) {
      throw new Error(`Path does not exist: ${targetPath}`);
    }

    if (stats.isDirectory) {
      await fs.rm(targetPath, { recursive: config.recursive || false });
    } else {
      await fs.unlink(targetPath);
    }

    context.log?.info?.(
      `Deleted ${stats.isDirectory ? "directory" : "file"}: ${targetPath}`
    );

    return {
      result: targetPath,
      path: targetPath,
      success: true,
      exists: false,
    };
  } catch (error) {
    throw new Error(
      `Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Copy operation
 */
export async function copyOperation(
  sourcePath: string,
  targetPath: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    const sourceStats = await getPathStats(sourcePath);

    if (!sourceStats.exists) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    // Create target directory if needed
    if (config.createDirectories) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
    }

    if (sourceStats.isDirectory) {
      if (!config.recursive) {
        throw new Error("Recursive flag required to copy directories");
      }
      await fs.cp(sourcePath, targetPath, { recursive: true });
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }

    const targetStats = await getPathStats(targetPath);

    context.log?.info?.(
      `Copied ${sourceStats.isDirectory ? "directory" : "file"} from ${sourcePath} to ${targetPath}`
    );

    return {
      result: targetPath,
      path: targetPath,
      success: true,
      ...targetStats,
    };
  } catch (error) {
    throw new Error(
      `Failed to copy: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Move operation
 */
export async function moveOperation(
  sourcePath: string,
  targetPath: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    const sourceStats = await getPathStats(sourcePath);

    if (!sourceStats.exists) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }

    // Create target directory if needed
    if (config.createDirectories) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
    }

    await fs.rename(sourcePath, targetPath);

    const targetStats = await getPathStats(targetPath);

    context.log?.info?.(
      `Moved ${sourceStats.isDirectory ? "directory" : "file"} from ${sourcePath} to ${targetPath}`
    );

    return {
      result: targetPath,
      path: targetPath,
      success: true,
      ...targetStats,
    };
  } catch (error) {
    throw new Error(
      `Failed to move: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Check existence operation
 */
export async function existsOperation(
  targetPath: string,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  const stats = await getPathStats(targetPath);

  context.log?.info?.(`Checked existence of: ${targetPath}`, {
    exists: stats.exists,
    type: stats.isDirectory ? "directory" : stats.isFile ? "file" : "unknown",
  });

  return {
    result: stats.exists,
    path: targetPath,
    success: true,
    ...stats,
  };
}