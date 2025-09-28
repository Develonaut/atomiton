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
 * File System node executable
 */
export const fileSystemExecutable = createExecutable<FileSystemParameters>(
  "file-system",
  async ({ getInput, config, context }) => {
    // Get parameters using enhanced helper
    const operation = config.operation;
    const filePath = getInput<string>("path");
    const content = getInput<string>("content");
    const targetPath = getInput<string>("targetPath");

    if (!filePath) {
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
          (config.encoding || "utf8") as string,
          context,
        );
        break;

      case "write":
        result = await writeFileOperation(
          filePath,
          content as string,
          config.encoding || "utf8",
          config.createDirectories || false,
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
          config.overwrite || false,
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
          config.overwrite || false,
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
