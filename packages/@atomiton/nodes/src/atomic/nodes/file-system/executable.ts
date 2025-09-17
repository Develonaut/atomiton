/**
 * File System Node Logic
 *
 * Business logic for file system operations
 */

import { createAtomicExecutable } from "../../createAtomicExecutable";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../../exports/executable/execution-types";
import type { FileSystemParameters } from "./parameters";
import {
  createSuccessResult,
  createErrorResult,
  logNodeExecution,
  getInputValue,
} from "../../../utils";

export type FileSystemOutput = {
  content?: string;
  files?: string[];
  exists?: boolean;
  success: boolean;
  path: string;
  size?: number;
};

export const fileSystemExecutable =
  createAtomicExecutable<FileSystemParameters>({
    async execute(
      context: NodeExecutionContext,
      config: FileSystemParameters,
    ): Promise<NodeExecutionResult> {
      try {
        const operation =
          getInputValue(context, "operation") || config.operation;
        const path = getInputValue(context, "path") || config.path;
        const content =
          getInputValue(context, "content") || config.content || "";

        if (!path) {
          logNodeExecution(
            context,
            "error",
            "Path is required for file system operations",
          );
          return createErrorResult(
            "Path is required for file system operations",
          );
        }

        logNodeExecution(
          context,
          "info",
          `Performing ${operation} operation on ${path}`,
        );

        switch (operation) {
          case "read":
            return await readFile(context, path as string, config);
          case "write":
            return await writeFile(
              context,
              path as string,
              content as string,
              config,
            );
          case "create":
            return await createFile(
              context,
              path as string,
              content as string,
              config,
            );
          case "list":
            return await listDirectory(context, path as string);
          default:
            return createErrorResult(`Unsupported operation: ${operation}`);
        }
      } catch (error) {
        logNodeExecution(context, "error", "File system operation failed", {
          error,
        });
        return createErrorResult(
          error instanceof Error ? error : new Error("Unknown error"),
        );
      }
    },
  });

async function readFile(
  context: NodeExecutionContext,
  path: string,
  config: FileSystemParameters,
): Promise<NodeExecutionResult> {
  try {
    const { readFile, stat } = await import("fs/promises");

    const [content, stats] = await Promise.all([
      readFile(path, config.encoding),
      stat(path),
    ]);

    logNodeExecution(context, "info", `Read ${stats.size} bytes from ${path}`);

    const result: FileSystemOutput = {
      content: content.toString(),
      path,
      success: true,
      size: stats.size,
      exists: true,
    };

    return createSuccessResult(result);
  } catch (error) {
    throw new Error(
      `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function writeFile(
  context: NodeExecutionContext,
  path: string,
  content: string,
  config: FileSystemParameters,
): Promise<NodeExecutionResult> {
  try {
    const { writeFile, mkdir } = await import("fs/promises");
    const { dirname } = await import("path");

    if (config.createDirectories) {
      await mkdir(dirname(path), { recursive: true });
    }

    await writeFile(path, content, config.encoding);

    logNodeExecution(
      context,
      "info",
      `Wrote ${content.length} bytes to ${path}`,
    );

    const result: FileSystemOutput = {
      content,
      path,
      success: true,
      size: content.length,
    };

    return createSuccessResult(result);
  } catch (error) {
    throw new Error(
      `Failed to write file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function createFile(
  context: NodeExecutionContext,
  path: string,
  content: string,
  config: FileSystemParameters,
): Promise<NodeExecutionResult> {
  try {
    const { mkdir } = await import("fs/promises");

    await mkdir(path, { recursive: config.createDirectories });

    logNodeExecution(context, "info", `Created directory at ${path}`);

    const result: FileSystemOutput = {
      path,
      success: true,
    };

    return createSuccessResult(result);
  } catch (error) {
    throw new Error(
      `Failed to create directory: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function listDirectory(
  context: NodeExecutionContext,
  path: string,
): Promise<NodeExecutionResult> {
  try {
    const { readdir } = await import("fs/promises");

    const files = await readdir(path);

    logNodeExecution(context, "info", `Found ${files.length} files in ${path}`);

    const result: FileSystemOutput = {
      files,
      path,
      success: true,
    };

    return createSuccessResult(result);
  } catch (error) {
    throw new Error(
      `Failed to list directory: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
