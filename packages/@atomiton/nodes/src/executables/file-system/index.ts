/**
 * File System Node Executable
 * Node.js implementation with file system operations
 */

import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult
} from '../../core/types/executable';
import { createNodeExecutable } from '../../core/factories/createNodeExecutable';
import type { FileSystemParameters } from '../../definitions/file-system';
import * as fs from 'fs/promises';
import * as path from 'path';

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

/**
 * Get input value safely
 */
function getInputValue<T>(context: NodeExecutionContext, key: string): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Check if path exists
 */
async function pathExists(filePath: string): Promise<boolean> {
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
async function getPathStats(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      modified: stats.mtime.toISOString(),
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      exists: true,
    };
  } catch {
    return {
      size: 0,
      modified: '',
      isDirectory: false,
      isFile: false,
      exists: false,
    };
  }
}

/**
 * Read file operation
 */
async function readFileOperation(
  filePath: string,
  encoding: string,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    const content = await fs.readFile(filePath, encoding as BufferEncoding);
    const stats = await getPathStats(filePath);

    context.log?.info?.(`Read ${stats.size} bytes from ${filePath}`);

    return {
      result: content,
      content: content.toString(),
      path: filePath,
      success: true,
      ...stats,
      exists: true,
    };
  } catch (error) {
    throw new Error(
      `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Write file operation
 */
async function writeFileOperation(
  filePath: string,
  content: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    // Check if file exists and overwrite setting
    if (!config.overwrite && await pathExists(filePath)) {
      throw new Error(`File already exists and overwrite is disabled: ${filePath}`);
    }

    // Create parent directories if requested
    if (config.createDirectories) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
    }

    await fs.writeFile(filePath, content, config.encoding as BufferEncoding);
    const stats = await getPathStats(filePath);

    context.log?.info?.(`Wrote ${content.length} bytes to ${filePath}`);

    return {
      result: filePath,
      content,
      path: filePath,
      success: true,
      ...stats,
      exists: true,
    };
  } catch (error) {
    throw new Error(
      `Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create directory operation
 */
async function createDirectoryOperation(
  dirPath: string,
  config: FileSystemParameters,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    await fs.mkdir(dirPath, { recursive: config.recursive as boolean });
    const stats = await getPathStats(dirPath);

    context.log?.info?.(`Created directory at ${dirPath}`);

    return {
      result: dirPath,
      path: dirPath,
      success: true,
      ...stats,
      exists: true,
    };
  } catch (error) {
    throw new Error(
      `Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * List directory operation
 */
async function listDirectoryOperation(
  dirPath: string,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  try {
    const files = await fs.readdir(dirPath);
    const stats = await getPathStats(dirPath);

    context.log?.info?.(`Found ${files.length} items in ${dirPath}`);

    return {
      result: files,
      files,
      path: dirPath,
      success: true,
      exists: true,
      ...stats,
    };
  } catch (error) {
    throw new Error(
      `Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete file/directory operation
 */
async function deleteOperation(
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
      await fs.rmdir(targetPath, { recursive: config.recursive });
    } else {
      await fs.unlink(targetPath);
    }

    context.log?.info?.(`Deleted ${stats.isDirectory ? 'directory' : 'file'}: ${targetPath}`);

    return {
      result: targetPath,
      path: targetPath,
      success: true,
      exists: false,
      isDirectory: stats.isDirectory,
      isFile: stats.isFile,
    };
  } catch (error) {
    throw new Error(
      `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Copy file/directory operation
 */
async function copyOperation(
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
        throw new Error('Recursive flag required to copy directories');
      }
      await fs.cp(sourcePath, targetPath, { recursive: true });
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }

    const targetStats = await getPathStats(targetPath);

    context.log?.info?.(`Copied ${sourceStats.isDirectory ? 'directory' : 'file'} from ${sourcePath} to ${targetPath}`);

    return {
      result: targetPath,
      path: targetPath,
      success: true,
      exists: true,
      ...targetStats,
    };
  } catch (error) {
    throw new Error(
      `Failed to copy: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Move file/directory operation
 */
async function moveOperation(
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

    context.log?.info?.(`Moved ${sourceStats.isDirectory ? 'directory' : 'file'} from ${sourcePath} to ${targetPath}`);

    return {
      result: targetPath,
      path: targetPath,
      success: true,
      exists: true,
      ...targetStats,
    };
  } catch (error) {
    throw new Error(
      `Failed to move: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check exists operation
 */
async function existsOperation(
  checkPath: string,
  context: NodeExecutionContext
): Promise<FileSystemOutput> {
  const stats = await getPathStats(checkPath);

  context.log?.info?.(`Path ${checkPath} ${stats.exists ? 'exists' : 'does not exist'}`);

  return {
    result: stats.exists,
    path: checkPath,
    success: true,
    ...stats,
  };
}

/**
 * File System node executable
 */
export const fileSystemExecutable: NodeExecutable<FileSystemParameters> = createNodeExecutable({
  async execute(
    context: NodeExecutionContext,
    config: FileSystemParameters,
  ): Promise<NodeExecutionResult> {
    try {
      // Get parameters from inputs or config
      const operation = config.operation;
      const filePath = getInputValue<string>(context, "path") || config.path;
      const content = getInputValue<string>(context, "content") || config.content || "";
      const targetPath = getInputValue<string>(context, "targetPath");

      if (!filePath) {
        throw new Error("Path is required for file system operations");
      }

      context.log?.info?.(`Performing ${operation} operation on ${filePath}`, {
        operation,
        path: filePath,
        hasContent: !!content,
        hasTargetPath: !!targetPath,
      });

      let result: FileSystemOutput;

      switch (operation) {
        case "read":
          result = await readFileOperation(filePath, config.encoding, context);
          break;

        case "write":
          result = await writeFileOperation(filePath, content, config, context);
          break;

        case "create":
          result = await createDirectoryOperation(filePath, config, context);
          break;

        case "list":
          result = await listDirectoryOperation(filePath, context);
          break;

        case "delete":
          result = await deleteOperation(filePath, config, context);
          break;

        case "copy":
          if (!targetPath) {
            throw new Error("Target path is required for copy operations");
          }
          result = await copyOperation(filePath, targetPath, config, context);
          break;

        case "move":
          if (!targetPath) {
            throw new Error("Target path is required for move operations");
          }
          result = await moveOperation(filePath, targetPath, config, context);
          break;

        case "exists":
          result = await existsOperation(filePath, context);
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      return {
        success: true,
        outputs: result,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      context.log?.error?.('File system operation failed', {
        error: errorMessage,
        operation: config.operation,
        path: config.path,
      });

      return {
        success: false,
        error: errorMessage,
        outputs: {
          result: null,
          path: config.path,
          success: false,
          exists: false,
        },
      };
    }
  },

  validateConfig(config: unknown): FileSystemParameters {
    // In a real implementation, this would validate using the schema
    // For now, just cast it
    return config as FileSystemParameters;
  },
});

export default fileSystemExecutable;