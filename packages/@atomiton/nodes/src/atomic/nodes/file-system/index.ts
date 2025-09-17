/**
 * File System Node
 *
 * Node for file system operations (read, write, manage directories)
 */

import { createAtomicNode } from "../../createAtomicNode";
import { fileSystemParameters } from "./parameters";
import { fileSystemExecutable } from "./executable";
import { fileSystemMetadata } from "./metadata";
import { fileSystemPorts } from "./ports";

export const fileSystem = createAtomicNode({
  metadata: fileSystemMetadata,
  parameters: fileSystemParameters,
  executable: fileSystemExecutable,
  ports: fileSystemPorts,
});

export default fileSystem;
