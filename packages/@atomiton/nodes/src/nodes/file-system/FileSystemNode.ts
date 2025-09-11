/**
 * File System Node
 *
 * Node for file system operations (read, write, manage directories)
 */

import { Node, NodeMetadata } from "../../base";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  fileSystemConfig,
  type FileSystemConfig,
} from "./FileSystemNodeConfig";
import { FileSystemLogic } from "./FileSystemNodeLogic";

/**
 * File System Node Class
 */
class FileSystemNode extends Node<FileSystemConfig> {
  readonly metadata = new NodeMetadata({
    id: "file-system",
    name: "File System",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Read, write files and manage directories",
    category: "io",
    type: "file-system",
    keywords: ["file", "io", "disk", "directory", "storage"],
    icon: "folder",
    experimental: false,
    deprecated: false,
  });

  readonly config = fileSystemConfig;

  readonly logic = new FileSystemLogic();

  readonly definition: NodeDefinition = {
    id: "file-system",
    name: "File System",
    description: "Read, write files and manage directories",
    category: "io",
    type: "file-system",
    version: "1.0.0",

    inputPorts: [
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
    ] as NodePortDefinition[],

    outputPorts: [
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
    ] as NodePortDefinition[],

    configSchema: fileSystemConfig.getShape() as unknown as Record<
      string,
      unknown
    >,
    defaultConfig: fileSystemConfig.defaults,

    metadata: {
      executionSettings: {
        timeout: 30000,
        retries: 1,
        sandbox: false,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["file", "io", "disk", "directory", "storage"],
      icon: "folder",
    },

    execute: async (context) => {
      return fileSystem.execute(context);
    },
  };
}

export const fileSystem = new FileSystemNode();
export default fileSystem;
