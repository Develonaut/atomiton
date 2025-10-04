/**
 * File System Node Executable
 * Node.js implementation with file system operations
 */

import { createExecutable } from "#core/utils/executable";
import type { FileSystemParameters } from "#schemas/file-system";
import {
  copyOperation,
  createDirectoryOperation,
  deleteOperation,
  existsOperation,
  listDirectoryOperation,
  moveOperation,
  readFileOperation,
  writeFileOperation,
} from "#executables/file-system/operations";

export type { FileSystemOutput } from "#executables/file-system/operations";

/**
 * MVP defaults for file system operations
 * These values are hardcoded for the MVP and not exposed in the schema
 */
const MVP_DEFAULTS = {
  encoding: "utf8" as const,
  createDirectories: true,
  overwrite: true,
} as const;

/**
 * File System node executable
 */
export const fileSystemExecutable = createExecutable<FileSystemParameters>(
  "file-system",
  async ({ getInput, config, context }) => {
    // Debug: Log what we received
    context.log.info("File-system executable called", {
      configKeys: Object.keys(config),
      configPath: config.path,
      configOperation: config.operation,
      configContent: config.content,
    });

    // Get parameters - path comes from config, content from config or input
    const operation = config.operation;
    const filePath = config.path;
    const content = config.content || getInput<string>("input"); // Content can be in config or from input
    const targetPath = getInput<string>("targetPath"); // For copy/move operations

    if (!filePath) {
      context.log.error("File path is missing!", {
        config,
        configKeys: Object.keys(config),
      });
      throw new Error("File path is required");
    }

    context.log.info(`Executing file system operation: ${operation}`, {
      path: filePath,
      operation,
    });

    let result;

    switch (operation) {
      case "read":
        result = await readFileOperation(
          filePath,
          MVP_DEFAULTS.encoding,
          context,
        );
        break;

      case "write":
        result = await writeFileOperation(
          filePath,
          content as string,
          MVP_DEFAULTS.encoding,
          MVP_DEFAULTS.createDirectories,
          context,
        );
        break;

      case "create":
        result = await createDirectoryOperation(
          filePath as string,
          config.recursive || false,
          context,
        );
        break;

      case "list":
        result = await listDirectoryOperation(
          filePath as string,
          config.recursive || false,
          false, // includeHidden - not in current schema, default to false
          context,
        );
        break;

      case "delete":
        result = await deleteOperation(
          filePath as string,
          config.recursive || false,
          context,
        );
        break;

      case "copy":
        if (!targetPath) {
          throw new Error("Target path is required for copy operation");
        }
        result = await copyOperation(
          filePath as string,
          targetPath,
          MVP_DEFAULTS.overwrite,
          context,
        );
        break;

      case "move":
        if (!targetPath) {
          throw new Error("Target path is required for move operation");
        }
        result = await moveOperation(
          filePath as string,
          targetPath,
          MVP_DEFAULTS.overwrite,
          context,
        );
        break;

      case "exists":
        result = await existsOperation(filePath as string, context);
        break;

      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    return result;
  },
);

export default fileSystemExecutable;
