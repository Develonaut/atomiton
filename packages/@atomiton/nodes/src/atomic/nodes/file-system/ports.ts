/**
 * File System Node Ports
 *
 * Input and output port definitions for the File System node
 */

import { createAtomicPorts } from "../../createAtomicPorts";

export const fileSystemPorts = createAtomicPorts({
  input: [
    {
      id: "path",
      name: "Path",
      dataType: "string",
      required: false,
      multiple: false,
      description: "File or directory path",
    },
    {
      id: "content",
      name: "Content",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Content to write to file",
    },
  ],
  output: [
    {
      id: "content",
      name: "Content",
      dataType: "string",
      required: false,
      multiple: false,
      description: "File content",
    },
    {
      id: "files",
      name: "Files",
      dataType: "array",
      required: false,
      multiple: false,
      description: "List of files in directory",
    },
    {
      id: "exists",
      name: "Exists",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the file/directory exists",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the operation was successful",
    },
    {
      id: "path",
      name: "Path",
      dataType: "string",
      required: false,
      multiple: false,
      description: "The file or directory path that was processed",
    },
  ],
});
