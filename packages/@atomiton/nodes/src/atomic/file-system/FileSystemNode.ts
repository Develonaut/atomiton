/**
 * File System Node
 *
 * Node for file system operations (read, write, manage directories)
 */

import { Node } from "../../base/Node";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
  NodePortDefinition,
} from "../../types";
import { FileSystemLogic } from "./FileSystemNodeLogic";

/**
 * File System Node Class
 */
class FileSystemNode extends Node {
  readonly id = "file-system";
  readonly name = "File System";
  readonly type = "file-system";

  private logic = new FileSystemLogic();

  /**
   * Execute the file system node
   */
  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    try {
      this.log(context, "info", "Executing File System node", {
        nodeId: this.id,
        inputs: Object.keys(context.inputs),
      });

      // Get validated configuration from context
      const config = this.logic.getValidatedConfig(context);

      // Execute the file system logic
      const result = await this.logic.execute(context, config);

      this.log(context, "info", "File System execution completed", { result });
      return result;
    } catch (error) {
      this.log(context, "error", "File System execution failed", { error });
      return this.createErrorResult(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Input ports for this node
   */
  get inputPorts(): NodePortDefinition[] {
    return [
      {
        id: "path",
        name: "Path",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "File or directory path",
      },
      {
        id: "content",
        name: "Content",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Content to write to file",
      },
    ];
  }

  /**
   * Output ports for this node
   */
  get outputPorts(): NodePortDefinition[] {
    return [
      {
        id: "content",
        name: "Content",
        type: "output",
        dataType: "string",
        required: false,
        multiple: false,
        description: "File content",
      },
      {
        id: "files",
        name: "Files",
        type: "output",
        dataType: "array",
        required: false,
        multiple: false,
        description: "List of files in directory",
      },
      {
        id: "exists",
        name: "Exists",
        type: "output",
        dataType: "boolean",
        required: false,
        multiple: false,
        description: "Whether the file/directory exists",
      },
    ];
  }

  /**
   * Get metadata for this node
   */
  get metadata() {
    return {
      ...super.metadata,
      category: "io",
      description: "Read, write files and manage directories",
      version: "1.0.0",
      author: "Atomiton Core Team",
      tags: ["file", "io", "disk", "directory", "storage"],
      icon: "folder",
    };
  }
}

export const fileSystem = new FileSystemNode();
