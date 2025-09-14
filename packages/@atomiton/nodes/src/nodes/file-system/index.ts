/**
 * File System Node
 *
 * Node for file system operations (read, write, manage directories)
 */

import { createNode } from "../../base/createNode";
import { fileSystemParameters } from "./parameters";
import { fileSystemLogic } from "./logic";
import { fileSystemMetadata } from "./metadata";
import { fileSystemPorts } from "./ports";

export const fileSystem = createNode({
  metadata: fileSystemMetadata,
  parameters: fileSystemParameters,
  logic: fileSystemLogic,
  ports: fileSystemPorts,
});

export default fileSystem;
