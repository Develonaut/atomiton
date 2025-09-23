/**
 * File System Port Definitions
 * Input and output ports for file system operations node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for file system node
 */
export const fileSystemInputPorts: NodePort[] = [
  createNodePort("input", {
    id         : "path",
    name       : "Path",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "File or directory path (overrides parameter)",
  }),
  createNodePort("input", {
    id         : "content",
    name       : "Content",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Content to write to file (overrides parameter)",
  }),
  createNodePort("input", {
    id         : "targetPath",
    name       : "Target Path",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Target path for copy/move operations",
  }),
];

/**
 * Output ports for file system node
 */
export const fileSystemOutputPorts: NodePort[] = [
  createNodePort("output", {
    id         : "result",
    name       : "Result",
    dataType   : "any",
    required   : true,
    multiple   : false,
    description: "Operation result data",
  }),
  createNodePort("output", {
    id         : "content",
    name       : "Content",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "File content (for read operations)",
  }),
  createNodePort("output", {
    id         : "files",
    name       : "Files",
    dataType   : "array",
    required   : false,
    multiple   : false,
    description: "List of files in directory (for list operations)",
  }),
  createNodePort("output", {
    id         : "exists",
    name       : "Exists",
    dataType   : "boolean",
    required   : false,
    multiple   : false,
    description: "Whether the file/directory exists",
  }),
  createNodePort("output", {
    id         : "success",
    name       : "Success",
    dataType   : "boolean",
    required   : false,
    multiple   : false,
    description: "Whether the operation was successful",
  }),
  createNodePort("output", {
    id         : "path",
    name       : "Path",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "The processed file or directory path",
  }),
  createNodePort("output", {
    id         : "size",
    name       : "Size",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "File size in bytes",
  }),
  createNodePort("output", {
    id         : "modified",
    name       : "Modified",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Last modified timestamp",
  }),
];