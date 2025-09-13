import { NodeLogic } from "../../base/NodeLogic.js";
import type {
  FileSystemConfig,
  FileSystemOutput,
} from "./FileSystemNodeConfig.js";
import type { NodeExecutionContext, NodeExecutionResult } from "../../types.js";

export class FileSystemLogic extends NodeLogic<FileSystemConfig> {
  async execute(
    context: NodeExecutionContext,
    config: FileSystemConfig,
  ): Promise<NodeExecutionResult> {
    try {
      const operation = this.getInput(context, "operation") || config.operation;
      const path = this.getInput(context, "path") || config.path;
      const content = this.getInput(context, "content") || config.content || "";

      if (!path) {
        return this.createErrorResult(
          "Path is required for file system operations",
        );
      }

      this.log(context, "info", `Performing ${operation} operation on ${path}`);

      switch (operation) {
        case "read":
          return await this.readFile(context, path as string, config);
        case "write":
          return await this.writeFile(
            context,
            path as string,
            content as string,
            config,
          );
        case "create":
          return await this.createFile(
            context,
            path as string,
            content as string,
            config,
          );
        case "list":
          return await this.listDirectory(context, path as string);
        default:
          return this.createErrorResult(`Unsupported operation: ${operation}`);
      }
    } catch (error) {
      this.log(context, "error", "File system operation failed", { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error("Unknown error"),
      );
    }
  }

  private async readFile(
    context: NodeExecutionContext,
    path: string,
    config: FileSystemConfig,
  ): Promise<NodeExecutionResult> {
    try {
      // Note: fs operations are externalized for browser compatibility
      // In a real implementation, this would use fs.promises.readFile
      const { readFile, stat } = await import("fs/promises");

      const [content, stats] = await Promise.all([
        readFile(path, config.encoding),
        stat(path),
      ]);

      this.log(context, "info", `Read ${stats.size} bytes from ${path}`);

      const result: FileSystemOutput = {
        content: content.toString(),
        path,
        success: true,
        size: stats.size,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      throw new Error(
        `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async writeFile(
    context: NodeExecutionContext,
    path: string,
    content: string,
    config: FileSystemConfig,
  ): Promise<NodeExecutionResult> {
    try {
      const { writeFile, mkdir } = await import("fs/promises");
      const { dirname } = await import("path");

      if (config.createDirectories) {
        await mkdir(dirname(path), { recursive: true });
      }

      await writeFile(path, content, config.encoding);

      this.log(context, "info", `Wrote ${content.length} bytes to ${path}`);

      const result: FileSystemOutput = {
        content,
        path,
        success: true,
        size: content.length,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      throw new Error(
        `Failed to write file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async createFile(
    context: NodeExecutionContext,
    path: string,
    content: string,
    config: FileSystemConfig,
  ): Promise<NodeExecutionResult> {
    try {
      const { mkdir } = await import("fs/promises");

      await mkdir(path, { recursive: config.createDirectories });

      this.log(context, "info", `Created directory at ${path}`);

      const result: FileSystemOutput = {
        path,
        success: true,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      throw new Error(
        `Failed to create directory: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async listDirectory(
    context: NodeExecutionContext,
    path: string,
  ): Promise<NodeExecutionResult> {
    try {
      const { readdir } = await import("fs/promises");

      const files = await readdir(path);

      this.log(context, "info", `Found ${files.length} files in ${path}`);

      const result: FileSystemOutput = {
        files,
        path,
        success: true,
      };

      return this.createSuccessResult(result);
    } catch (error) {
      throw new Error(
        `Failed to list directory: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
