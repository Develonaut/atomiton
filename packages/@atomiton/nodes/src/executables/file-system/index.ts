/**
 * File System Node Executable
 * Node.js implementation with file system operations
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { FileSystemParameters } from "#definitions/file-system";
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
 * Get input value safely
 */
function getInputValue<T>(
  context: NodeExecutionContext,
  key: string,
): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * File System node executable
 */
export const fileSystemExecutable: NodeExecutable<FileSystemParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: FileSystemParameters,
    ): Promise<NodeExecutionResult> {
      try {
        // Get parameters from inputs or config
        const operation = config.operation;
        const filePath = getInputValue<string>(context, "path") || config.path;
        const content =
          getInputValue<string>(context, "content") || config.content;
        const targetPath =
          getInputValue<string>(context, "targetPath") || config.targetPath;

        if (!filePath) {
          throw new Error("File path is required");
        }

        context.log?.info?.(`Executing file system operation: ${operation}`, {
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

        return {
          success: true,
          outputs: result,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("File system operation failed", {
          error: errorMessage,
          operation: config.operation,
          path: config.path,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: {
            result: null,
            success: false,
            path: config.path || "",
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
