/**
 * Shell Command Node
 *
 * Node for executing shell commands and capturing output
 */

import { createAtomicNode } from "../../createAtomicNode";
import { shellCommandParameters } from "./parameters";
import { shellCommandExecutable } from "./executable";
import { shellCommandMetadata } from "./metadata";
import { shellCommandPorts } from "./ports";

export const shellCommand = createAtomicNode({
  metadata: shellCommandMetadata,
  parameters: shellCommandParameters,
  executable: shellCommandExecutable,
  ports: shellCommandPorts,
});

export default shellCommand;
